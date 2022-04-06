const getInsertQueryObject = require(`../../../../common/getInsertQueryObject`);
const emailSender = require(`./emailSender`);
const tvfUtil = require("#tvf-util");

const getUsersWithUpdatedToken = async function (taskDetails, userData) {
	const usersById = Object.create(null);
	for (const row of userData) {
		usersById[row.id] = row;
	}

	//generate new token
	const usersWithUpdatedActivationToken = await Promise.all(
		userData.map(async (user) => {
			const userWithUpdatedActivationToken = {
				id: user.id,
				activation_token: await tvfUtil.generateObjectIdentifier(), //used new_activation_token
			};
			return userWithUpdatedActivationToken;
		})
	);

	const caseStatement = [];
	for (const user of usersWithUpdatedActivationToken) {
		const string = `WHEN ${user.id} THEN '${user.activation_token}'`;
		caseStatement.push(string);
	}

	if (usersWithUpdatedActivationToken.length > 0) {
		const userIdsToUpdate = userData.map((user) => user.id);
		const updateQuery = `
			UPDATE
				cla_user
			SET
				activation_token = CASE id ${caseStatement.join(" ")} END,
				activation_token_expiry = now() + interval '3 days',
				date_last_registration_activity = NOW(),
				date_edited = NOW()
			WHERE
				cla_user.id IN (${userIdsToUpdate.join(",")})
		`;
		await taskDetails.query(updateQuery);
		//Now update the activation_token in the user data list
		for (const user of usersWithUpdatedActivationToken) {
			usersById[user.id].activation_token = user.activation_token;
		}
	}
	return usersById;
};

module.exports = async function (taskDetails, hours) {
	const status = "unverified";
	//Get users list by days
	const result = await taskDetails.query(
		`
			SELECT
				cla_user.id,
				cla_user.email,
				cla_user.school_id,
				cla_user.first_name,
				cla_user.password_hash IS NOT NULL AS has_password
			FROM
				cla_user
			LEFT JOIN user_not_verified_email_send_log
				ON cla_user.id = user_not_verified_email_send_log.user_id
				AND user_not_verified_email_send_log.hours >= ${hours}
			WHERE
				cla_user.status = '${status}'
				AND (cla_user.date_status_changed + interval '${hours} hours' <= NOW())
				AND user_not_verified_email_send_log.user_id IS NULL
				AND cla_user.activation_token_expiry + interval '1 days' < now() 
		`
	);
	if (result && result.rowCount > 0) {
		const userData = result.rows;
		const usersById = await getUsersWithUpdatedToken(taskDetails, userData);
		const usersWithUpdatedToken = [];
		const logUserIds = [];
		for (const key in usersById) {
			const data = usersById[key];
			const user_object = Object.create(null);
			user_object.user_id = key;
			user_object.hours = hours;
			logUserIds.push(user_object);
			usersWithUpdatedToken.push(data);
		}
		const tableName = "user_not_verified_email_send_log";
		const fields = ["user_id", "hours"];
		const onConflict = `ON CONFLICT (user_id) DO UPDATE SET hours = EXCLUDED.hours`;
		const queryObject = getInsertQueryObject(tableName, fields, logUserIds, onConflict);
		await taskDetails.query(queryObject.text, queryObject.values);
		await emailSender(usersWithUpdatedToken, hours);
	}
};
