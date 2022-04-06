module.exports = (querier, userId) => {
	return querier(
		`
			UPDATE
				cla_user
			SET
				status = 'registered',
				date_status_changed = NOW(),
				date_last_registration_activity = NOW(),
				date_transitioned_to_registered = NOW(),
				date_edited = NOW(),
				modified_by_user_id = $1
			WHERE
				id = $1
				AND hwb_user_identifier IS NOT NULL
				AND status = 'unverified'
		`,
		[userId]
	);
};
