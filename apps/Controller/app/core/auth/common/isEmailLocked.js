module.exports = async (querier, email) => {
	const result = await querier(
		`
			SELECT
				(COUNT(id) >= 5) AS is_locked
			FROM
				login_attempt
			WHERE
				email = $1
				AND date_created >= NOW() - INTERVAL '5 minutes'
				AND is_successful = FALSE
				AND used_for_rate_limiting = TRUE
		`,
		[email]
	);
	return result.rowCount && result.rows[0].is_locked;
};
