/**
 * @param {pdf_isbn13} : pdf_isbn13 of book
 * @param {oid} : oid of Record in unlock_image_upload table
 * @param {reject_reason} : Reason For Rejection (optional)
 * @param {isApproved} : Is pdf_isbn13 Approved or not
 **/

const ensure = require("#tvf-ensure");
const tvfUtil = require("#tvf-util");
const unlockByISBNImage = require("../../common/unlockByISBNImage");

const { notificationCategories } = require(`../../common/staticValues`);
const REJECTED_STATUS = "Rejected";

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 400, "Unauthorize");

	const notificationValues = Object.create(null);
	const unlockImageUpdateFields = [];
	const unlockImageUpadateValues = [];

	if (!params.isApproved) {
		ensure.nonEmptyStr(ctx, params.reject_reason, `Reject reason`);
	} else {
		ensure.validAssetIdentifier(ctx, params.pdf_isbn13, ` ISBN `);
	}

	/* --- Get Updating Record from unlock image --- */

	try {
		const getUnlockImageRecord = await ctx.appDbQuery(
			`
			SELECT
					unlock_image_upload.id,
					unlock_image_upload.user_id,
					unlock_image_upload.user_email_log,
					unlock_image_upload.school_name_log,
					cla_user.school_id
				FROM
					unlock_image_upload
				INNER JOIN cla_user ON
					unlock_image_upload.user_id = cla_user.id
				WHERE
					unlock_image_upload.oid = $1
			`,
			[params.oid]
		);

		/* --- Get Notification Category --- */

		const notification_category = await ctx.appDbQuery(
			`
				SELECT
					id,
					name
				FROM notification_category
				WHERE code = $1
			`,
			[notificationCategories.unlock_book_by_image.code]
		);

		if (!params.isApproved && getUnlockImageRecord && getUnlockImageRecord.rowCount) {
			/* --- Set notification Object to update rejected status --- */

			notificationValues.oid = await tvfUtil.generateObjectIdentifier();
			notificationValues.user_id = getUnlockImageRecord.rows[0].user_id;
			notificationValues.has_read = false;
			notificationValues.category_id = notification_category.rows[0].id;
			notificationValues.category_name = notification_category.rows[0].name;
			notificationValues.title = "Book Unlock";
			notificationValues.description = `Rejected: due to ${params.reject_reason}`;
			notificationValues.link = {
				static: true,
				type: notificationCategories.unlock_book_by_image.code,
				value: false,
			};

			/* --- Set notification Object to update rejected status end--- */

			/* --- Update fields to update in unlock image --- */

			unlockImageUpadateValues.push(REJECTED_STATUS);
			unlockImageUpdateFields.push(`status = $${unlockImageUpadateValues.length}`);
			unlockImageUpdateFields.push(`date_closed = NOW()`);
			unlockImageUpadateValues.push(params.reject_reason);
			unlockImageUpdateFields.push(`rejection_reason = $${unlockImageUpadateValues.length}`);

			/* --- Update fields to update in unlock image end--- */
		} else if (params.isApproved && getUnlockImageRecord && getUnlockImageRecord.rowCount) {
			/* --- Find if isbn provided exists on platform --- */

			const pool = ctx.getAppDbPool();
			const client = await pool.connect();

			const result = await unlockByISBNImage(client, getUnlockImageRecord.rows[0].id, sessionData.user_id, params.pdf_isbn13, true);
			return result;
			/* --- Here goes Unlock Attempt and Notification Data Update --- */

			/* --- Insert Unlock Attempt END --- */
		}
	} catch (error) {
		ctx.throw(400, error.message);
	}
};
