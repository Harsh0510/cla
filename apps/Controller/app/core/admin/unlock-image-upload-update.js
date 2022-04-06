/**
 * @param {pdf_isbn13} : pdf_isbn13 of book
 * @param {oid} : oid of Record in unlock_image_upload table
 * @param {reject_reason} : Reason For Rejection (optional)
 * @param {isApproved} : Is pdf_isbn13 Approved or not
 **/

const ensure = require("#tvf-ensure");
const tvfUtil = require("#tvf-util");
const getUnlockAttemptFormattedObject = require("../../common/getUnlockAttemptFormattedObject");
const getInsertQueryObject = require(`../../common/getInsertQueryObject`);
const getInsertQueryObject2 = require(`../../common/getInsertQueryObject2`);
const unlockImageUploadStatus = require("../../common/unlockImageUploadStatus");
const isUnlockedSql = require("../../common/isUnlockedSql");
const STATUS_BYID = unlockImageUploadStatus.statusById;

const { notificationCategories, notification, unlockEvents, unlockAttemptStatus } = require(`../../common/staticValues`);
const APPROVED_STATUS = STATUS_BYID.approved;
const REJECTED_STATUS = STATUS_BYID.rejected;

const NOTIFICATION_TITLE_ASSET_NOT_FOUND = "Book Unlock";
const NOTIFICATION_TITLE_REJECTED = "Book unlock failed";
const NOTIFICATION_TITLE_APPROVED = "Book Unlock";
const EVENT_NAME = unlockEvents.userCla;

const { generateObjectIdentifier } = tvfUtil;

const unlockAttemptField = getUnlockAttemptFormattedObject.fields;

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	let isNotificationCreated = false,
		isUnlockAttemptCreated = false,
		isUnlockImageUpdated = false;
	let asset_id = null;
	let unlockImageRecord_User_Id = null;
	let unlockImageRecord_School_Id;
	let notification_Category_Id = null;
	let notification_Category_hideable_log = null;
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	ensure.validIdentifier(ctx, params.oid, "Identifier");

	let unlockAttemptValues;
	const notificationValues = Object.create(null);
	notificationValues.high_priority = false;
	const unlockImageUpdateFields = [];
	const unlockImageUpdateValues = [];

	if (!params.isApproved) {
		ensure.nonEmptyStr(ctx, params.reject_reason, `Reject reason`);
		ctx.assert(params.reject_reason.length <= 100, 400, "Reject reason can't be greater then 100 characters");
	} else {
		ensure.validAssetIdentifier(ctx, params.pdf_isbn13, `ISBN`);
	}

	/* --- Get Updating Record from unlock image --- */
	const pool = ctx.getAppDbPool();
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const getUnlockImageRecord = await client.query(
			`
				SELECT
					unlock_image_upload.user_id,
					unlock_image_upload.user_email_log as user_email,
					unlock_image_upload.school_name_log as school_name,
					cla_user.school_id
				FROM
					unlock_image_upload
				INNER JOIN cla_user ON
					unlock_image_upload.user_id = cla_user.id
				WHERE
					unlock_image_upload.oid = $1
					AND unlock_image_upload.status = 'awaiting'
			`,
			[params.oid]
		);

		ctx.assert(getUnlockImageRecord.rowCount > 0, 400, "Record not found or no longer in 'awaiting' state.");

		/* --- Get Notification Category --- */
		const notification_category = await client.query(
			`
				SELECT
					id,
					hideable
				FROM notification_category
				WHERE code = $1
			`,
			[notificationCategories.unlock_book_by_image.code]
		);

		unlockImageRecord_User_Id = getUnlockImageRecord.rows[0].user_id;
		unlockImageRecord_School_Id = getUnlockImageRecord.rows[0].school_id;
		notification_Category_Id = notification_category.rows[0].id;
		notification_Category_hideable_log = notification_category.rows[0].hideable;

		if (!params.isApproved && getUnlockImageRecord && getUnlockImageRecord.rowCount) {
			/* --- Set notification Object to update rejected status --- */

			notificationValues.oid = await tvfUtil.generateObjectIdentifier();
			notificationValues.user_id = unlockImageRecord_User_Id;
			notificationValues.has_read = false;
			notificationValues.category_id = notification_Category_Id;
			notificationValues.hideable_log = notification_Category_hideable_log;
			notificationValues.title = NOTIFICATION_TITLE_REJECTED;
			notificationValues.subtitle = `Reason: ${params.reject_reason}`;
			notificationValues.description = `Reason: ${params.reject_reason}`;
			notificationValues.link = {
				static: true,
				type: notificationCategories.unlock_book_by_image.code,
				value: false,
			};

			/* --- Set notification Object to update rejected status end--- */

			/* --- Update fields to update in unlock image --- */

			unlockImageUpdateFields.push(`status = $${unlockImageUpdateValues.push(REJECTED_STATUS)}`);
			unlockImageUpdateFields.push(`date_closed = NOW()`);
			unlockImageUpdateFields.push(`rejection_reason = $${unlockImageUpdateValues.push(params.reject_reason)}`);
			unlockImageUpdateFields.push(`closed_by = 'admin'`);

			/* --- Update fields to update in unlock image end--- */
		} else if (params.isApproved && getUnlockImageRecord && getUnlockImageRecord.rowCount) {
			/* --- Find if isbn provided exists on platform --- */
			const getAssetDetailByISBN = await client.query(
				`
					SELECT
						id,
						title,
						publisher_name_log AS publisher_name
					FROM
						asset
					WHERE
						(
							isbn13 = $1
							OR alternate_isbn13 = $1
							OR pdf_isbn13 = $1
						)
						AND active
						AND is_ep
				`,
				[params.pdf_isbn13]
			);

			if (getAssetDetailByISBN && getAssetDetailByISBN.rowCount) {
				asset_id = getAssetDetailByISBN.rows[0].id;
				/* ---ISBN approved by admin and book is available on platform --- */
				/* --- 1) Unlock it  --- */
				const createUnlockRecord = await client.query(
					`
						INSERT INTO
							asset_school_info
						(school_id,asset_id,is_unlocked,user_id)
							VALUES
						($1,$2,$3,$4)
						ON CONFLICT
						(school_id, asset_id)
						DO UPDATE SET
							is_unlocked = EXCLUDED.is_unlocked,
							date_edited = NOW(),
							modified_by_user_id = $5
					`,
					[unlockImageRecord_School_Id, asset_id, true, unlockImageRecord_User_Id, sessionData.user_id]
				);
				if (createUnlockRecord && createUnlockRecord.rows) {
					const checkUnlockRecord = await ctx.appDbQuery(
						`
							SELECT
								${isUnlockedSql(true)} AS is_unlocked
							FROM
								asset
							LEFT JOIN asset_school_info
								ON asset.id = asset_school_info.asset_id
								AND asset_school_info.school_id = $1
							WHERE
								asset.id = $2
						`,
						[unlockImageRecord_School_Id, asset_id]
					);

					if (checkUnlockRecord.rowCount && checkUnlockRecord.rows[0].is_unlocked) {
						// if already unlocked

						/* --- 2) Create Unlock Attempt Record --- */
						const newUnlockAttemptData = Object.assign(getUnlockImageRecord.rows[0], {
							status: unlockAttemptStatus.alreadyUnlocked,
							isbn: params.pdf_isbn13,
							asset_id: asset_id,
							event: EVENT_NAME,
							asset_title: getAssetDetailByISBN.rows[0].title,
							publisher_name: getAssetDetailByISBN.rows[0].publisher_name,
							oid: await generateObjectIdentifier(),
						});
						unlockAttemptValues = getUnlockAttemptFormattedObject.getObj(newUnlockAttemptData);
					} else {
						// if not unlocked yet

						/* --- 2) Create Unlock Attempt Record --- */
						const newUnlockAttemptData = Object.assign(getUnlockImageRecord.rows[0] || {}, {
							status: unlockAttemptStatus.successfullyUnlocked,
							isbn: params.pdf_isbn13,
							asset_id: asset_id,
							event: EVENT_NAME,
							asset_title: getAssetDetailByISBN.rows[0].title,
							publisher_name: getAssetDetailByISBN.rows[0].publisher_name,
							oid: await generateObjectIdentifier(),
						});
						unlockAttemptValues = getUnlockAttemptFormattedObject.getObj(newUnlockAttemptData);
					}

					/* --- 3) Create Notification --- */
					notificationValues.oid = await tvfUtil.generateObjectIdentifier();
					notificationValues.user_id = unlockImageRecord_User_Id;
					notificationValues.has_read = false;
					notificationValues.category_id = notification_Category_Id;
					notificationValues.hideable_log = notification_Category_hideable_log;
					notificationValues.title = NOTIFICATION_TITLE_APPROVED;
					notificationValues.subtitle = `${params.pdf_isbn13} has been unlocked for you to copy.`;
					notificationValues.description = notificationValues.subtitle;
					notificationValues.link = {
						static: true,
						type: notificationCategories.unlock_book_by_image.code,
						value: "/works/" + params.pdf_isbn13 + "-" + getAssetDetailByISBN.rows[0].title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase(),
					};

					/* --- 4) Update Unlock Image record --- */

					unlockImageUpdateFields.push(`status = $${unlockImageUpdateValues.push(APPROVED_STATUS)}`);
					unlockImageUpdateFields.push(`pdf_isbn13 = $${unlockImageUpdateValues.push(params.pdf_isbn13)}`);
					unlockImageUpdateFields.push(`asset_id = $${unlockImageUpdateValues.push(asset_id)}`);
					unlockImageUpdateFields.push(`date_closed = NOW()`);
					unlockImageUpdateFields.push(`closed_by = 'admin'`);
				} else {
					ctx.throw(400, "Error occured while creating unlock record");
				}
			} else {
				/* --- ISBN Approved by admin but book is not available on platform --- */

				/* --- 1) Create Unlock Attempt Failed Record --- */

				const newUnlockAttemptData = Object.assign(getUnlockImageRecord.rows[0], {
					status: unlockAttemptStatus.doesNotExist,
					isbn: params.pdf_isbn13,
					asset_id: 0,
					event: EVENT_NAME,
					oid: await generateObjectIdentifier(),
				});
				unlockAttemptValues = getUnlockAttemptFormattedObject.getObj(newUnlockAttemptData);

				/* --- 2) Add Notification For failed unlock --- */

				notificationValues.oid = await tvfUtil.generateObjectIdentifier();
				notificationValues.user_id = unlockImageRecord_User_Id;
				notificationValues.has_read = false;
				notificationValues.category_id = notification_Category_Id;
				notificationValues.hideable_log = notification_Category_hideable_log;
				notificationValues.title = NOTIFICATION_TITLE_ASSET_NOT_FOUND;
				notificationValues.subtitle = `${params.pdf_isbn13} is valid but not on the Platform, we will notify you if it becomes available.`;
				notificationValues.description = notificationValues.subtitle;
				notificationValues.link = {
					static: true,
					type: notificationCategories.unlock_book_by_image.code,
					value: false,
					isbn: params.pdf_isbn13,
					unlock_attempt_oid: newUnlockAttemptData.oid,
				};
				notificationValues.high_priority = true;

				/* --- 3) Update Unlock Image --- */

				unlockImageUpdateFields.push(`status = $${unlockImageUpdateValues.push(APPROVED_STATUS)}`);
				unlockImageUpdateFields.push(`pdf_isbn13 = $${unlockImageUpdateValues.push(params.pdf_isbn13)}`);
				unlockImageUpdateFields.push(`date_closed = NOW()`);
				unlockImageUpdateFields.push(`closed_by = 'admin'`);
			}

			/* --- Here goes Unlock Attempt and Notification Data Update --- */

			/* --- Insert to Unlock Attempt --- */
			const generateUnlockAttemptQuery = getInsertQueryObject2("unlock_attempt", unlockAttemptField, [unlockAttemptValues]);
			if (generateUnlockAttemptQuery && generateUnlockAttemptQuery.text && generateUnlockAttemptQuery.values) {
				const insertUnlockAttempt = await client.query(generateUnlockAttemptQuery.text, generateUnlockAttemptQuery.values);
				if (insertUnlockAttempt && insertUnlockAttempt.rows) {
					isUnlockAttemptCreated = true;
				}
			}
			/* --- Insert Unlock Attempt END --- */
		}

		/* --- Insert Notification --- */
		const generateNotificationQuery = getInsertQueryObject("notification", notification.fields, [notificationValues]);

		if (generateNotificationQuery && generateNotificationQuery.text && generateNotificationQuery.values) {
			const insertNotification = await client.query(generateNotificationQuery.text, generateNotificationQuery.values);
			if (insertNotification && insertNotification.rows) {
				isNotificationCreated = true;
			}
		}

		/* --- Insert Notification END--- */
		const updateUnlockImage = await client.query(
			`
				UPDATE
					unlock_image_upload
				SET
					${unlockImageUpdateFields.join(", ")}
				WHERE
					oid = $${unlockImageUpdateValues.push(params.oid)}
			`,
			unlockImageUpdateValues
		);

		if (updateUnlockImage && updateUnlockImage.rows) {
			isUnlockImageUpdated = true;
		}
		await client.query("COMMIT");
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
	return {
		result: {
			isNotificationCreated,
			isUnlockAttemptCreated,
			isUnlockImageUpdated,
		},
	};
};
