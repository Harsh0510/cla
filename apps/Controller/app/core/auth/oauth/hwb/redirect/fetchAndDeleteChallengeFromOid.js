module.exports = async (querier, oid) => {
	const rows = (
		await querier(
			`
				DELETE FROM
					oauth_challenge
				WHERE
					oid = $1
					AND date_created >= NOW() - INTERVAL '2 hour'
				RETURNING
					challenge
			`,
			[oid]
		)
	).rows;
	if (rows.length !== 1) {
		// error
		return null;
	}
	return rows[0].challenge;
};
