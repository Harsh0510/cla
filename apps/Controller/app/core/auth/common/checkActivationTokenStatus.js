async function checkActivationTokenStatus(dbQuerier, token) {
	const result = await dbQuerier(
		`
		SELECT
			id,
			activation_token IS NOT NULL AS token_exists,
			activation_token_expiry <= NOW() AS is_token_expired
		FROM
			cla_user
		WHERE
			activation_token = $1
		`,
		[token]
	);
	if (result.rows && result.rows.length) {
		const r = result.rows[0];
		return {
			expired: !!r.is_token_expired,
			exists: !!r.token_exists,
			okay: r.token_exists && !r.is_token_expired,
		};
	}
	return {
		expired: false,
		exists: false,
		okay: false,
	};
}

module.exports = checkActivationTokenStatus;
