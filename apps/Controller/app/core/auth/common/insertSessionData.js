module.exports = async function insertSessionData(ctx, userId, data) {
	/**
	 * Inserting a new session for the logged in user.
	 */
	const result = await ctx.sessionDbQuery(
		`
			INSERT INTO
				cla_session
				(
					token,
					user_id,
					data,
					expiry_date
				)
			VALUES
				(
					encode(gen_random_bytes(24), 'hex'),
					$1,
					$2,
					NOW() + interval '30 minutes'
				)
			ON CONFLICT
				(user_id)
			DO UPDATE SET
				token = EXCLUDED.token,
				data = EXCLUDED.data,
				expiry_date = EXCLUDED.expiry_date
			RETURNING
				token
		`,
		[userId, data || {}]
	);

	const sessionToken = result.rows[0].token;

	/**
	 * Maybe delete expired sessions...
	 */
	if (sessionToken[0] == "3" && sessionToken[1] == "0") {
		// 1 in 256 chance of deleting old sessions. Why '30'? Because it corresponds to the hex for ascii '0', which makes for easy unit testing.
		await ctx.sessionDbQuery(`
			DELETE FROM
				cla_session
			WHERE
				expiry_date <= NOW()
		`);
	}

	return sessionToken;
};
