const sendEmail = require("../../../common/sendEmail");
const sendEmailList = require("../../../common/sendEmailList");
const insertTempUnlockAlertLog = require("./insertTempUnlockAlertLog");
const TEMP_UNLOCKED_COUNT = 20;
/**
 * sendSchoolAlertTempUnlockedEmailToEP
 * Send alert email to EP when school attempt temp unlock count is 20
 * @param {*} querier
 * @param {*} schoolId
 * @param {*} schoolName
 */
module.exports = async function (querier, schoolId, schoolName) {
	const result = await querier.query(
		`
			SELECT
				COUNT(*) AS count
			FROM
				asset_school_info
			LEFT JOIN school_temp_unlock_attempt_email_alert_log
				ON asset_school_info.school_id = school_temp_unlock_attempt_email_alert_log.school_id
			WHERE
				asset_school_info.expiration_date IS NOT NULL
				AND asset_school_info.school_id = $1
				AND school_temp_unlock_attempt_email_alert_log.school_id IS NULL
		`,
		[schoolId]
	);

	if (result.rows[0].count >= TEMP_UNLOCKED_COUNT) {
		await querier.query(
			`
				INSERT INTO
					school_temp_unlock_attempt_email_alert_log
					(school_id)
				VALUES
					($1)
					`,
			[schoolId]
		);

		await insertTempUnlockAlertLog(querier, schoolName, schoolId, null, TEMP_UNLOCKED_COUNT);

		return sendEmail.sendTemplate(
			null,
			sendEmailList.supportEP,
			`Temporary unlock alert`,
			{
				title: null,
				content: `The institution, ${schoolName}, has temporarily unlocked ${TEMP_UNLOCKED_COUNT} titles without unlocking them with the physical copy.`,
				cta: null,
				secondary_content: null,
			},
			null,
			"temp-unlock-school-alert"
		);
	}
};
