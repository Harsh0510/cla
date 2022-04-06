const sendEmail = require("../../../common/sendEmail");
const sendEmailList = require("../../../common/sendEmailList");
const insertTempUnlockAlertLog = require("./insertTempUnlockAlertLog");
const TEMP_UNLOCKED_COUNT = 3;

/**
 * sendUserAlertTempUnlockedEmailToEP
 * Send alert email to EP when user attempt temp unlock count is 3
 * @param {*} querier
 * @param {*} userId
 * @param {*} schoolId
 * @param {*} schoolName
 */
module.exports = async function (querier, userId, schoolId, schoolName) {
	const result = await querier.query(
		`
			SELECT
				COUNT(*) AS count
			FROM
				asset_school_info
			LEFT JOIN user_temp_unlock_attempt_email_alert_log
				ON asset_school_info.user_id = user_temp_unlock_attempt_email_alert_log.user_id
			WHERE
				asset_school_info.expiration_date IS NOT NULL
				AND asset_school_info.user_id = $1
				AND asset_school_info.school_id = $2
				AND user_temp_unlock_attempt_email_alert_log.user_id IS NULL
		`,
		[userId, schoolId]
	);

	if (result.rows[0].count >= TEMP_UNLOCKED_COUNT) {
		await querier.query(
			`
				INSERT INTO
					user_temp_unlock_attempt_email_alert_log
					(user_id)
				VALUES
					($1)
			`,
			[userId]
		);

		await insertTempUnlockAlertLog(querier, schoolName, schoolId, userId, TEMP_UNLOCKED_COUNT);

		return sendEmail.sendTemplate(
			null,
			sendEmailList.supportEP,
			`Temporary unlock alert`,
			{
				title: null,
				content: `The user, ${userId}, from ${schoolName} has temporarily unlocked ${TEMP_UNLOCKED_COUNT} titles without unlocking them with the physical copy.`,
				cta: null,
				secondary_content: null,
			},
			null,
			"temp-unlock-user-alert"
		);
	}
};
