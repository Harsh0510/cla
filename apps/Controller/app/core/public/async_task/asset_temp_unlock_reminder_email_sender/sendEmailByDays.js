const getInsertQueryObject = require(`../../../../common/getInsertQueryObject`);
const emailSender = require(`./emailSender`);

module.exports = async function (taskDetails, days = 7) {
	//get temporarily unlocked assets list by days
	const result = await taskDetails.query(
		`
			SELECT
				asset_school_info.user_id,
				asset_school_info.asset_id,
				asset_school_info.school_id,
				asset.pdf_isbn13,
				asset.title,
				cla_user.id,
				cla_user.first_name,
				cla_user.email,
				CEIL((EXTRACT(EPOCH FROM asset_school_info.expiration_date)  - EXTRACT(EPOCH FROM NOW()))/ 86400) AS date_diff_days
			FROM
				asset_school_info
				LEFT JOIN cla_user
					ON asset_school_info.user_id = cla_user.id
				LEFT JOIN asset
					ON asset_school_info.asset_id = asset.id
				LEFT JOIN user_temp_unlock_email_send_log
					ON  asset_school_info.user_id = user_temp_unlock_email_send_log.user_id
					AND asset_school_info.school_id = user_temp_unlock_email_send_log.school_id
					AND asset_school_info.asset_id = user_temp_unlock_email_send_log.asset_id
					AND user_temp_unlock_email_send_log.days >= ${days}
			WHERE
				(asset_school_info.expiration_date - INTERVAL '${days} days') <= NOW()
				AND asset_school_info.expiration_date IS NOT NULL
				AND asset_school_info.expiration_date >= NOW()
				AND user_temp_unlock_email_send_log.user_id IS NULL
				AND user_temp_unlock_email_send_log.school_id IS NULL
				AND user_temp_unlock_email_send_log.asset_id IS NULL
		`
	);

	if (result && result.rowCount > 0) {
		const userData = result.rows;
		const logUserIds = [];
		for (const user of userData) {
			if (!user.id) {
				continue;
			}
			if (!user.school_id) {
				continue;
			}
			if (!user.asset_id) {
				continue;
			}
			const user_object = Object.create(null);
			user_object.user_id = user.id;
			user_object.school_id = user.school_id;
			user_object.asset_id = user.asset_id;
			user_object.days = days;
			logUserIds.push(user_object);
		}
		if (logUserIds.length) {
			const tableName = "user_temp_unlock_email_send_log";
			const fields = ["user_id", "school_id", "asset_id", "days"];
			const onConflict = `ON CONFLICT (user_id, school_id, asset_id) DO UPDATE SET days = EXCLUDED.days`;
			const queryObject = getInsertQueryObject(tableName, fields, logUserIds, onConflict);
			//insert log into user_temp_unlock_email_send_log
			await taskDetails.query(queryObject.text, queryObject.values);
			await emailSender(userData);
		}
	}
};
