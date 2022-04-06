module.exports = (querier, assetId, schoolId, unlockerUserId) => {
	return querier(
		`
			INSERT INTO
				asset_school_info
				(
					school_id,
					asset_id,
					is_unlocked,
					user_id
				)
			VALUES
				(
					$1,
					$2,
					TRUE,
					$3
				)
			ON CONFLICT
				(school_id, asset_id)
			DO UPDATE SET
				is_unlocked = TRUE,
				expiration_date = NULL,
				date_edited = NOW(),
				modified_by_user_id = $3
		`,
		[schoolId, assetId, unlockerUserId]
	);
};
