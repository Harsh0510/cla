const ensure = require("#tvf-ensure");
const { unlockEvents, unlockAttemptStatus } = require("../../common/staticValues");
const { generateObjectIdentifier } = require("#tvf-util");
const isUnlockedSql = require("../../common/isUnlockedSql");
const UNLOCK_EVENT_USER_CAMERA = unlockEvents.userCamera;
const UNLOCK_EVENT_USER_TEMP_UNLOCK = unlockEvents.userTempUnlock;
const TEMP_UNLOCK_EXPIRATION_PERIOD = `14 day`;
const sendTempUnlockedEmailToUser = require("./common/sendTempUnlockedEmailToUser");
const sendTempUnlockedEmailToEP = require("./common/sendTempUnlockedEmailToEP");
const updateExtractExpiryDate = require(`../../common/updateExtractExpiryDate`);
const sendUserAlertTempUnlockedEmailToEP = require(`./common/sendUserAlertTempUnlockedEmailToEP`);
const sendSchoolAlertTempUnlockedEmailToEP = require(`./common/sendSchoolAlertTempUnlockedEmailToEP`);

const insertIntoUnlockAttempt = async function (
	querier,
	sessionData,
	userEmail,
	schoolName,
	isbn13,
	status,
	assetId,
	eventName,
	unlockAttemptOid,
	expiration_date,
	unlockedTitle
) {
	await querier.query(
		`
			INSERT INTO
				unlock_attempt
				(user_id, user_email, school_id, school_name, isbn, status, asset_id, event, oid, expiration_date, asset_title, publisher_name)
			VALUES
				($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		`,
		[
			sessionData.user_id,
			userEmail,
			sessionData.school_id,
			schoolName,
			isbn13,
			status,
			assetId,
			eventName,
			unlockAttemptOid,
			expiration_date,
			unlockedTitle ? unlockedTitle.title : null,
			unlockedTitle ? unlockedTitle.publisher_name : null,
		]
	);
};

/**
 * Unlock a particular asset
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	//ensure Logged In
	await ctx.ensureLoggedIn();

	ensure.validAssetIdentifier(ctx, params.isbn13, "ISBN");
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id > 0, 400, "School not provided");

	const unlockAttemptOid = await generateObjectIdentifier();
	const isTempUnlockAttempt = params.is_temp;
	const unlockedTitle = Object.create(null);
	let assetId = 0;
	let publisherTempUnlockOptIn = false;
	let wasAlreadyUnlocked = false;
	let status;
	let eventName = UNLOCK_EVENT_USER_CAMERA;
	let wasTempUnlocked = false;
	let wasTempUnlockExpired = false;
	let academicYearEndMonth;
	let academicYearEndDay;

	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		/** Get userEmail and schoolName*/
		let userEmail = null;
		let schoolName = null;
		let userFirstName = null;
		const userInformation = await client.query(
			`
				SELECT
					cla_user.email AS user_email,
					cla_user.first_name AS first_name,
					school.name AS school_name,
					school.academic_year_end_month AS academic_year_end_month,
					school.academic_year_end_day AS academic_year_end_day
				FROM
					cla_user
				INNER JOIN school
					ON cla_user.school_id = school.id
				WHERE
					cla_user.id = $1;
			`,
			[sessionData.user_id]
		);
		if (userInformation.rowCount) {
			userEmail = userInformation.rows[0].user_email;
			schoolName = userInformation.rows[0].school_name;
			userFirstName = userInformation.rows[0].first_name;
			academicYearEndMonth = parseInt(userInformation.rows[0].academic_year_end_month, 10);
			academicYearEndDay = parseInt(userInformation.rows[0].academic_year_end_day, 10);
		}

		// at least one of isbn13, alternate_isbn13 or pdf_isbn13 must match the ISBN provided.
		const assetResult = await client.query(
			`
				SELECT
					asset.id AS id,
					asset.title AS title,
					asset.isbn13 AS isbn13,
					asset.pdf_isbn13 AS pdf_isbn13,
					publisher.temp_unlock_opt_in AS temp_unlock_opt_in,
					publisher.name AS publisher_name
				FROM
					asset
				LEFT JOIN publisher
					ON asset.publisher_id = publisher.id
				WHERE
					(
						isbn13 = $1
						OR alternate_isbn13 = $1
						OR pdf_isbn13 = $1
					)
					AND asset.active
					AND asset.is_ep
			`,
			[params.isbn13]
		);

		if (assetResult.rows.length > 0) {
			assetId = assetResult.rows[0].id;
			publisherTempUnlockOptIn = assetResult.rows[0].temp_unlock_opt_in;
			//here return the pdfisbn13
			unlockedTitle.isbn = assetResult.rows[0].pdf_isbn13;
			unlockedTitle.title = assetResult.rows[0].title;
			unlockedTitle.publisher_name = assetResult.rows[0].publisher_name;
		}

		if (assetId > 0) {
			const unlockStatus = await client.query(
				`
					SELECT
						${isUnlockedSql(true)} AS is_unlocked,
						asset_school_info.expiration_date AS expiration_date,
						(asset_school_info.expiration_date IS NOT NULL AND asset_school_info.expiration_date < NOW()) AS is_temp_expired
					FROM
						asset
					LEFT JOIN asset_school_info
						ON asset.id = asset_school_info.asset_id
						AND asset_school_info.school_id = $2
					WHERE
						asset.id = $1
				`,
				[assetId, sessionData.school_id]
			);

			if (unlockStatus.rowCount) {
				wasAlreadyUnlocked = unlockStatus.rows[0].is_unlocked;
				wasTempUnlocked = !!unlockStatus.rows[0].expiration_date; // if expiration_date is null than asset is not temporarily unlocked
				wasTempUnlockExpired = unlockStatus.rows[0].is_temp_expired;
			}
		}

		/** set event for insert into unlock_attempt */
		if (isTempUnlockAttempt) {
			eventName = UNLOCK_EVENT_USER_TEMP_UNLOCK;
		}

		/** set status for insert into unlock_attempt */
		if (!assetId) {
			status = unlockAttemptStatus.doesNotExist;
		} else if (isTempUnlockAttempt) {
			if ((wasTempUnlocked && !wasTempUnlockExpired) || (wasAlreadyUnlocked && !wasTempUnlocked)) {
				status = unlockAttemptStatus.alreadyUnlocked;
			} else if (wasTempUnlockExpired) {
				status = unlockAttemptStatus.tempUnlockedExpired;
			} else if (!publisherTempUnlockOptIn) {
				status = unlockAttemptStatus.publisherRestricted;
			} else if (!params.hasOwnProperty("is_temp_confirmed")) {
				status = unlockAttemptStatus.tempUnlockedMustConfirm;
			} else if (params.hasOwnProperty("is_temp_confirmed") && !params.is_temp_confirmed) {
				status = unlockAttemptStatus.notOwnedBySchool;
			} else if (params.hasOwnProperty("is_temp_confirmed") && params.is_temp_confirmed) {
				status = unlockAttemptStatus.tempUnlocked;
			}
		} else if (wasAlreadyUnlocked) {
			if (wasTempUnlocked) {
				status = unlockAttemptStatus.successfullyUnlocked;
			} else {
				status = unlockAttemptStatus.alreadyUnlocked;
			}
		} else {
			status = unlockAttemptStatus.successfullyUnlocked;
		}

		const isSuccessfulUnlock = status === unlockAttemptStatus.successfullyUnlocked || status == unlockAttemptStatus.tempUnlocked;

		if (!isSuccessfulUnlock && status !== unlockAttemptStatus.tempUnlockedMustConfirm) {
			await insertIntoUnlockAttempt(
				client,
				sessionData,
				userEmail,
				schoolName,
				params.isbn13,
				status,
				assetId,
				eventName,
				unlockAttemptOid,
				null,
				assetId ? unlockedTitle : null
			);
		}

		if (isSuccessfulUnlock) {
			const result_AssetSchoolInfo = await client.query(
				`
					INSERT INTO
						asset_school_info
						(school_id, asset_id, is_unlocked, user_id, expiration_date)
					VALUES
						($1, $2, $3, $4, ${isTempUnlockAttempt ? `NOW() + INTERVAL '${TEMP_UNLOCK_EXPIRATION_PERIOD}'` : `NULL`})
					ON CONFLICT
						(school_id, asset_id)
					DO UPDATE SET
						is_unlocked = EXCLUDED.is_unlocked,
						expiration_date = EXCLUDED.expiration_date,
						date_edited = NOW(),
						modified_by_user_id = $4
					RETURNING
						expiration_date
				`,
				[sessionData.school_id, assetId, true, sessionData.user_id]
			);

			const expiration_date = result_AssetSchoolInfo.rows[0].expiration_date;

			await insertIntoUnlockAttempt(
				client,
				sessionData,
				userEmail,
				schoolName,
				params.isbn13,
				status,
				assetId,
				eventName,
				unlockAttemptOid,
				expiration_date,
				unlockedTitle
			);

			//send an email if user temporary unlock any asset
			if (isTempUnlockAttempt && status === unlockAttemptStatus.tempUnlocked) {
				await sendTempUnlockedEmailToUser(userEmail, userFirstName, unlockedTitle.title, unlockedTitle.isbn, expiration_date);
				await sendTempUnlockedEmailToEP(schoolName, unlockedTitle.title, unlockedTitle.isbn, expiration_date);
				await sendUserAlertTempUnlockedEmailToEP(client, sessionData.user_id, sessionData.school_id, schoolName);
				await sendSchoolAlertTempUnlockedEmailToEP(client, sessionData.school_id, schoolName);
			}

			// update the asset extract expiry date if user unlocked the asset phisically of temporarily unlocked asset
			if (wasTempUnlocked) {
				await updateExtractExpiryDate(client, assetId, sessionData.school_id, academicYearEndMonth, academicYearEndDay, sessionData.user_id);
			}
		}
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		ctx.throw(500, "An unexpected error has occurred");
	} finally {
		client.release();
	}

	if (wasAlreadyUnlocked) {
		unlockedTitle.message = "Asset already unlocked";
	}

	return {
		result: unlockedTitle,
		unlock_attempt_oid: unlockAttemptOid,
		status: status,
	};
};
