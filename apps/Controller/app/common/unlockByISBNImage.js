const tvfUtil = require("#tvf-util");
const isUnlockedSql = require("./isUnlockedSql");
const { notificationCategories, unlockEvents, unlockAttemptStatus } = require(`./staticValues`);
const EVENT_NAME = unlockEvents.userImage;
const { generateObjectIdentifier } = tvfUtil;

const fetchBookUnlockNotificationCategory = async (querier) => {
	const result = await querier.query(
		`
			SELECT
				id,
				name,
				hideable
			FROM notification_category
			WHERE code = $1
		`,
		[notificationCategories.unlock_book_by_image.code]
	);
	return result.rowCount > 0 ? result.rows[0] : null;
};

const fetchActiveAssetAndUnlockData = async (querier, pdfIsbn13, schoolId, isLoggedIn) => {
	const result = await querier.query(
		`
			SELECT
				asset.id AS id,
				asset.title AS title,
				asset.publisher_name_log AS publisher_name,
				${isUnlockedSql(isLoggedIn)} AS is_unlocked
			FROM
				asset
			LEFT JOIN asset_school_info
				ON asset_school_info.asset_id = asset.id
				AND asset_school_info.school_id = $2
			WHERE
				(asset.isbn13 = $1 OR asset.alternate_isbn13 = $1 OR asset.pdf_isbn13 = $1)
				AND asset.active
				AND asset.is_ep
		`,
		[pdfIsbn13, schoolId]
	);
	return result.rowCount > 0 ? result.rows[0] : null;
};

const unlockAssetForSchool = (querier, assetId, schoolId, unlockerUserId, modifiedByUserId) => {
	return querier.query(
		`
			INSERT INTO
				asset_school_info
				(school_id,asset_id,is_unlocked,user_id)
			VALUES
				($1, $2, TRUE, $3)
			ON CONFLICT
				(school_id, asset_id)
			DO UPDATE SET
				is_unlocked = EXCLUDED.is_unlocked,
				date_edited = NOW(),
				modified_by_user_id = $4
		`,
		[schoolId, assetId, unlockerUserId, modifiedByUserId]
	);
};

const insertRow = (querier, table, data, returningFields) => {
	const fields = [];
	const binds = [];
	const values = [];
	for (const field in data) {
		if (!data.hasOwnProperty(field)) {
			continue;
		}
		fields.push(field);
		if (data[field].__raw !== undefined) {
			values.push(data[field].__raw);
		} else {
			const idx = binds.push(data[field]);
			values.push(`$${idx}`);
		}
	}
	return querier.query(
		`
			INSERT INTO
				${table}
				(${fields.join(", ")})
			VALUES
				(${values.join(", ")})
			${Array.isArray(returningFields) ? `RETURNING ${returningFields.join(", ")}` : ""}
		`,
		binds
	);
};

const insertUnlockAttemptRow = (querier, data) => {
	return insertRow(querier, "unlock_attempt", data, ["oid"]);
};

const insertNotification = (querier, data) => {
	if (data.subtitle && !data.description) {
		data.description = data.subtitle;
	}
	return insertRow(querier, "notification", data);
};

const getUserData = async (querier, userDbId) => {
	const result = await querier.query(
		`
			SELECT
				cla_user.email AS email,
				school.id AS school_id,
				school.name AS school_name
			FROM
				cla_user
			INNER JOIN school
				ON cla_user.school_id = school.id
			WHERE
				cla_user.id = $1
		`,
		[userDbId]
	);
	return result.rowCount > 0 ? result.rows[0] : null;
};

/**
 * @param {object} databaseObject A pg.Pool instance.
 * @param {number} userDbId The database ID of the user
 * @param {string} isbnFound Either a syntactically valid ISBN string, or a falsy value if no ISBN is found.
 * @returns {number} Database ID of the newly-inserted unlock_image_upload row.
 **/
module.exports = async (appDbPool, userDbId, modifiedByUserId, isbnFound, isLoggedIn) => {
	const myData = await getUserData(appDbPool, userDbId);
	if (!myData) {
		throw new Error("Could not fetch user data");
	}
	const unlockImageUploadOid = await generateObjectIdentifier();
	let unlockImageUploadRows;
	if (isbnFound) {
		let db = await appDbPool.connect();
		try {
			await db.query("BEGIN");
			const notificationCategory = await fetchBookUnlockNotificationCategory(db);
			if (!notificationCategory) {
				throw new Error("Could not fetch notification category");
			}
			const asset = await fetchActiveAssetAndUnlockData(db, isbnFound, myData.school_id, isLoggedIn);

			const unlockAttemptData = {
				user_id: userDbId,
				user_email: myData.email,
				school_id: myData.school_id,
				school_name: myData.school_name,
				isbn: isbnFound,
				event: EVENT_NAME,
				oid: await generateObjectIdentifier(),
			};
			const notificationData = {
				oid: await generateObjectIdentifier(),
				user_id: userDbId,
				category_id: notificationCategory.id,
				hideable_log: notificationCategory.hideable,
				title: "Book Unlock",
				high_priority: false,
				link: {
					static: true,
					type: notificationCategories.unlock_book_by_image.code,
				},
			};
			const unlockImageUploadData = {
				user_id: userDbId,
				status: "approved",
				date_closed: { __raw: `NOW()` },
				pdf_isbn13: isbnFound,
				closed_by: "ai",
				user_email_log: myData.email,
				school_name_log: myData.school_name,
				oid: unlockImageUploadOid,
			};

			if (asset) {
				unlockAttemptData.status = asset.is_unlocked ? unlockAttemptStatus.alreadyUnlocked : unlockAttemptStatus.successfullyUnlocked;
				unlockAttemptData.asset_id = asset.id;
				unlockAttemptData.asset_title = asset.title;
				unlockAttemptData.publisher_name = asset.publisher_name;

				notificationData.subtitle = `${isbnFound} has been unlocked for you to copy.`;
				notificationData.link.value = "/works/" + isbnFound + "-" + asset.title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();

				unlockImageUploadData.asset_id = asset.id;
				await unlockAssetForSchool(db, asset.id, myData.school_id, userDbId, modifiedByUserId);
			} else {
				unlockAttemptData.status = unlockAttemptStatus.doesNotExist;

				notificationData.subtitle = `${isbnFound} is valid but not on the Platform, we will notify you if it becomes available.`;
				notificationData.link.value = false;
				notificationData.high_priority = true;
			}
			const result_unlock_attempt = await insertUnlockAttemptRow(db, unlockAttemptData);
			const unlock_attempt_oid = result_unlock_attempt.rows.length && result_unlock_attempt.rows[0].oid ? result_unlock_attempt.rows[0].oid : null;
			notificationData.link.has_replied = false;

			if (unlockAttemptData.status === unlockAttemptStatus.doesNotExist) {
				notificationData.link.isbn = isbnFound;
				notificationData.link.unlock_attempt_oid = unlock_attempt_oid;
			}

			await insertNotification(db, notificationData);
			unlockImageUploadRows = await insertRow(appDbPool, "unlock_image_upload", unlockImageUploadData, ["id"]);
			await db.query("COMMIT");
		} catch (e) {
			await db.query("ROLLBACK");
			throw e;
		} finally {
			db.release();
		}
	} else {
		unlockImageUploadRows = await insertRow(
			appDbPool,
			"unlock_image_upload",
			{
				user_id: userDbId,
				status: "awaiting",
				user_email_log: myData.email,
				school_name_log: myData.school_name,
				oid: unlockImageUploadOid,
			},
			["id"]
		);
	}
	return unlockImageUploadRows.rows[0].id;
};
