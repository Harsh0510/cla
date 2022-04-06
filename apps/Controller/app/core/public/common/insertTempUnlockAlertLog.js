module.exports = async function (querier, schoolName, schoolId, userId, numberOfTempUnlocked) {
	await querier.query(
		`
			INSERT INTO
				temp_unlock_alert_log
				(school_name, school_id, user_id, number_of_temp_unlocked)
			VALUES
				($1, $2, $3, $4)
				`,
		[schoolName, schoolId, userId, numberOfTempUnlocked]
	);
};
