const getInsertQueryObject = require(`../../../../common/getInsertQueryObject`);
const emailSender = require(`./emailSender`);
const { emailNotificationCategory } = require(`../../../../common/staticValues`);

module.exports = async function (taskDetails, days = 7) {
	//Get users list by days
	const result = await taskDetails.query(`
		SELECT
			cla_user.id,
			cla_user.email,
			(NOT ('{${emailNotificationCategory.userNotCreatedCopies}}'::TEXT[] <@ cla_user.email_opt_out)) AS should_receive_email
		FROM cla_user
		LEFT JOIN extract
			ON cla_user.id = extract.user_id
		LEFT JOIN user_not_created_copies_email_send_log
			ON cla_user.id = user_not_created_copies_email_send_log.user_id
			AND user_not_created_copies_email_send_log.days >= ${days}
		WHERE (cla_user.date_created_initial_password + interval '${days} days' <= NOW())
			AND extract.user_id IS NULL
			AND user_not_created_copies_email_send_log.user_id IS NULL
			AND cla_user.password_hash IS NOT NULL
	`);

	if (result && result.rowCount > 0) {
		const emailRecipients = [];
		const logUserIds = [];
		for (const user of result.rows) {
			const userObject = Object.create(null);
			userObject.user_id = user.id;
			userObject.days = days;
			logUserIds.push(userObject);
			if (user.should_receive_email) {
				emailRecipients.push(user);
			}
		}
		//insert or update into the log table
		const tableName = "user_not_created_copies_email_send_log";
		const fields = ["user_id", "days"];
		const onConflict = `ON CONFLICT (user_id) DO UPDATE SET days = EXCLUDED.days`;
		const queryObject = getInsertQueryObject(tableName, fields, logUserIds, onConflict);
		await taskDetails.query(queryObject.text, queryObject.values);
		if (emailRecipients.length) {
			await emailSender(emailRecipients, days);
		}
	}
};
