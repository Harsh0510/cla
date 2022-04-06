const ensure = require("#tvf-ensure");
const { generateObjectIdentifier } = require("#tvf-util");
const getValidIsbn = require("../../common/getValidIsbn");
const { unlockEvents, unlockAttemptStatus } = require("../../common/staticValues");
const isUnlockedSql = require("../../common/isUnlockedSql");
const USER_BULK_SCHOOL = unlockEvents.userBulkSchool;
const USER_BULK_CLA = unlockEvents.userBulkCla;
const updateExtractExpiryDate = require(`../../common/updateExtractExpiryDate`);

const buildStatementUnlockAttempt = function (rows) {
	const insert =
		"INSERT INTO unlock_attempt (user_id, user_email, school_id, school_name, isbn, status, asset_id, event, oid, asset_title, publisher_name) VALUES ";
	const fields = ["user_id", "user_email", "school_id", "school_name", "isbn", "status", "asset_id", "event", "oid", "asset_title", "publisher_name"];

	const params = [];
	const chunks = [];
	for (const row of rows) {
		const valueClause = [];
		for (const field of fields) {
			if (Object.prototype.hasOwnProperty.call(row, field) && row[field] !== undefined) {
				const idx = params.push(row[field]);
				valueClause.push(`$${idx}`);
			} else {
				valueClause.push("DEFAULT");
			}
		}
		chunks.push(`(${valueClause.join(", ")})`);
	}
	return {
		text: insert + chunks.join(", "),
		values: params,
	};
};

const buildStatementAssetSchoolInfo = function (rows, modifiedByUserId) {
	const insert = "INSERT INTO asset_school_info (school_id, asset_id, is_unlocked, user_id) VALUES ";
	const onConflict = ` ON CONFLICT (school_id, asset_id) DO UPDATE SET is_unlocked = EXCLUDED.is_unlocked, expiration_date = NULL, date_edited = NOW(), modified_by_user_id = ${modifiedByUserId}`;
	const fields = ["school_id", "asset_id", "is_unlocked", "user_id"];

	const params = [];
	const chunks = [];

	for (const row of rows) {
		const valueClause = [];
		for (const field of fields) {
			const idx = params.push(row[field]);
			valueClause.push(`$${idx}`);
		}
		chunks.push(`(${valueClause.join(", ")})`);
	}

	return {
		text: insert + chunks.join(", ") + onConflict,
		values: params,
	};
};

const bindUnlockAttemptArray = (userId, userEmail, schoolId, schoolName, isbn, status, assetId, eventName, oid, assetTitle, publisherName) => {
	/** this squence must be match with the Insert query values fields for unlock_attempt */
	const obj = Object.create(null);
	obj.user_id = userId;
	obj.user_email = userEmail;
	obj.school_id = schoolId;
	obj.school_name = schoolName;
	obj.isbn = isbn;
	obj.status = status;
	obj.asset_id = assetId;
	obj.event = eventName;
	obj.oid = oid;
	obj.asset_title = assetTitle;
	obj.publisher_name = publisherName;
	return obj;
};

const bindAssetSchoolInfo = (assetId, schoolId, isUnlocked, userId) => {
	/** this squence must be match with the Insert query values fields for asset_school_info */
	const obj = Object.create(null);
	obj.school_id = schoolId;
	obj.asset_id = assetId;
	obj.is_unlocked = isUnlocked;
	obj.user_id = userId;
	return obj;
};

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");
	ctx.assert(Array.isArray(params.isbns) && params.isbns.length > 0, 400, "No ISBNs found");

	for (const isbn of params.isbns) {
		ctx.assert(typeof isbn === "string", 400, "Invalid ISBN provided");
	}

	if (params.locations) {
		ctx.assert(Array.isArray(params.locations) && params.locations.length == params.isbns.length, 400, "Invalid locations provided");
	}

	const validIsbns = [],
		insertAssetSchoolInfo = [],
		insertUnlockAttempt = [],
		assetsToTryUnlocking = [];
	const updateAssetExtractInfo = [];
	const errorMessages = [];
	const originalIsbns = [];
	const locationsForValidIsbns = [];

	let schoolId, userEmail, schoolName, eventName;
	let academicYearEndMonth;
	let academicYearEndDay;
	const userId = sessionData.user_id;

	if (userRole == "cla-admin") {
		ctx.assert(params.school_id, 400, "school_id not provided");
		ensure.nonNegativeInteger(ctx, params.school_id, `School`);
		schoolId = params.school_id;
		eventName = USER_BULK_CLA;
	} else {
		schoolId = sessionData.school_id;
		eventName = USER_BULK_SCHOOL;
	}

	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		/** Get userEmail and schoolName*/
		const userInformation = await client.query(
			`
				SELECT
					cla_user.email AS user_email,
					(SELECT name FROM school WHERE id = $2) AS school_name
				FROM cla_user
				WHERE cla_user.id = $1;
			`,
			[userId, schoolId]
		);
		if (
			!(
				userInformation &&
				Array.isArray(userInformation.rows) &&
				userInformation.rows.length &&
				userInformation.rows[0].user_email &&
				userInformation.rows[0].school_name
			)
		) {
			// FIXME: check that the FINALLY block is called.
			ctx.throw(401, `Not logged in`);
		}
		userEmail = userInformation.rows[0].user_email;

		/** Get school information*/
		const schoolInformation = await client.query(
			`
				SELECT
					name,
					academic_year_end_month,
					academic_year_end_day
				FROM school
				WHERE id = $1;
			`,
			[schoolId]
		);
		if (!(schoolInformation && Array.isArray(schoolInformation.rows) && schoolInformation.rows.length)) {
			ctx.throw(401, `Institution not found`);
		}

		schoolName = schoolInformation.rows[0].name;
		academicYearEndMonth = schoolInformation.rows[0].academic_year_end_month;
		academicYearEndDay = schoolInformation.rows[0].academic_year_end_day;
		/* list-out validdate isbn and find available asset */
		for (let i = 0, len = params.isbns.length; i < len; ++i) {
			const val = params.isbns[i];
			//Validate ISBN
			const isbn = getValidIsbn(val);
			if (isbn) {
				validIsbns.push(isbn);
				originalIsbns.push(val);
				if (params.locations) {
					locationsForValidIsbns.push(params.locations[i]);
				}
			} else {
				/** isbn invalidIsbn  */
				const obj = bindUnlockAttemptArray(
					userId,
					userEmail,
					schoolId,
					schoolName,
					val.slice(0, 32),
					unlockAttemptStatus.invalidIsbn,
					0,
					eventName,
					await generateObjectIdentifier()
				);
				insertUnlockAttempt.push(obj);
				errorMessages.push({
					value: val,
					message: "Invalid ISBN",
					location: params.locations ? params.locations[i] : "(Unknown)",
				});
			}
		}

		const assetIdToProvidedIsbnMap = Object.create(null);
		if (validIsbns.length > 0) {
			const whereClausesAsset = [];
			// check the isbn13, alternate_isbn13 and pdf_isbn13 values.
			whereClausesAsset.push(`(
				asset.isbn13 IN ('${validIsbns.join(`', '`)}')
				OR asset.alternate_isbn13 IN ('${validIsbns.join(`', '`)}')
				OR asset.pdf_isbn13 IN ('${validIsbns.join(`', '`)}')
			)`);
			whereClausesAsset.push("asset.active", "asset.is_ep");

			const assetResult = await client.query(
				`
					SELECT
						id,
						isbn13,
						alternate_isbn13,
						pdf_isbn13,
						title,
						publisher_name_log AS publisher_name
					FROM
						asset
					WHERE
						${whereClausesAsset.join(" AND ")}
				`
			);

			const isbnToAssetMap = Object.create(null);
			for (const row of assetResult.rows) {
				isbnToAssetMap[row.isbn13] = row;
				isbnToAssetMap[row.alternate_isbn13] = row;
				isbnToAssetMap[row.pdf_isbn13] = row;
			}
			for (let i = 0, len = validIsbns.length; i < len; ++i) {
				const item = validIsbns[i];
				let res = isbnToAssetMap[item];
				if (res) {
					/** asset exist */
					assetIdToProvidedIsbnMap[res.id] = item;
					if (res.isbn13 === item) {
						res._providedIsbn = res.isbn13;
					} else if (res.pdf_isbn13 === item) {
						res._providedIsbn = res.pdf_isbn13;
					} else {
						res._providedIsbn = res.alternate_isbn13;
					}
					assetsToTryUnlocking.push(res);
				} else {
					/** asset does not exist */
					const obj = bindUnlockAttemptArray(
						userId,
						userEmail,
						schoolId,
						schoolName,
						item,
						unlockAttemptStatus.doesNotExist,
						0,
						eventName,
						await generateObjectIdentifier()
					);
					insertUnlockAttempt.push(obj);
					errorMessages.push({
						value: originalIsbns[i],
						message: "Does not exist",
						location: params.locations ? locationsForValidIsbns[i] : "(Unknown)",
					});
				}
			}
		}

		/* select asset_school_info */
		if (assetsToTryUnlocking.length > 0) {
			const results = await client.query(
				`
					SELECT
						asset.id AS asset_id,
						${isUnlockedSql(true)} AS is_unlocked,
						asset_school_info.expiration_date AS expiration_date
					FROM
						asset
					LEFT JOIN asset_school_info
						ON asset.id = asset_school_info.asset_id
						AND asset_school_info.school_id = ${schoolId}
					WHERE
						asset_id IN (${assetsToTryUnlocking.map((d) => d.id).join(", ")})
				`
			);

			const assetIdToAssetSchoolInfoMap = Object.create(null);
			for (const row of results.rows) {
				assetIdToAssetSchoolInfoMap[row.asset_id] = row;
			}
			const assetUnlock = [...new Set(assetsToTryUnlocking)];
			for (const asset of assetUnlock) {
				res = assetIdToAssetSchoolInfoMap[asset.id];

				if (res && res.is_unlocked && !res.expiration_date) {
					/** already-unlocked */
					const obj = bindUnlockAttemptArray(
						userId,
						userEmail,
						schoolId,
						schoolName,
						asset._providedIsbn,
						unlockAttemptStatus.alreadyUnlocked,
						asset.id,
						eventName,
						await generateObjectIdentifier(),
						asset.title,
						asset.publisher_name
					);
					insertUnlockAttempt.push(obj);
				} else {
					/** successfully-unlocked */
					let obj;
					obj = bindUnlockAttemptArray(
						userId,
						userEmail,
						schoolId,
						schoolName,
						asset._providedIsbn,
						unlockAttemptStatus.successfullyUnlocked,
						asset.id,
						eventName,
						await generateObjectIdentifier(),
						asset.title,
						asset.publisher_name
					);
					insertUnlockAttempt.push(obj);

					/** Need to be add in asset_school_Info  */
					obj = bindAssetSchoolInfo(asset.id, schoolId, true, userId);
					insertAssetSchoolInfo.push(obj);

					/** Need to be update asset extract exipry date */
					if (res && res.expiration_date) {
						updateAssetExtractInfo.push({
							asset_id: asset.id,
							school_id: schoolId,
						});
					}
				}
			}
		}

		/* Bulk insert into unlock_attempt */
		if (insertUnlockAttempt.length > 0) {
			const insertQueryUnlockAttempt = buildStatementUnlockAttempt(insertUnlockAttempt);
			await client.query(insertQueryUnlockAttempt.text, insertQueryUnlockAttempt.values);
		}

		/** with const we are getting the  Assignment to constant variable. */
		let unlockedTitles = [];
		if (insertAssetSchoolInfo.length > 0) {
			/* bulk insert into asset_school_info */
			const insertQueryAssetSchoolInfo = buildStatementAssetSchoolInfo(insertAssetSchoolInfo, userId);
			await client.query(insertQueryAssetSchoolInfo.text, insertQueryAssetSchoolInfo.values);

			/* update asset extract expiry date for temporarily unlocked */
			for (const extract of updateAssetExtractInfo) {
				await updateExtractExpiryDate(client, extract.asset_id, extract.school_id, academicYearEndMonth, academicYearEndDay, userId);
			}

			/*Return unlockedTitles details bases on updated asset into the asset_school_info table */
			const updatedAssetIds = insertAssetSchoolInfo.map((p) => p.asset_id);
			const unlockAssetResult = await client.query(
				`
					SELECT
						id,
						title,
						authors_log AS authors,
						description,
						isbn13 AS isbn13,
						alternate_isbn13 AS alternate_isbn13,
						pdf_isbn13 AS pdf_isbn13
					FROM
						asset
					WHERE
						(id IN (${updatedAssetIds.join(" , ")}))
				`
			);

			unlockedTitles = unlockAssetResult.rows;
		}

		await client.query("COMMIT");
		return {
			result: {
				unlocked: unlockedTitles,
				errors: errorMessages,
			},
		};
	} catch (e) {
		await client.query("ROLLBACK");
		ctx.throw(500, "An unexpected error has occurred");
	} finally {
		client.release();
	}
};
