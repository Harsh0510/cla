const { generateObjectIdentifier } = require("#tvf-util");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	let numUpdated = 0;
	while (true) {
		// Batch the updates
		const result = await ctx.appDbQuery(`
			SELECT
				id
			FROM
				unlock_attempt
			WHERE
				oid IS NULL
			LIMIT 1000
		`);
		if (result.rowCount == 0) {
			break;
		}
		numUpdated += result.rowCount;

		const values = [];
		const binds = [];
		for (const row of result.rows) {
			const oid = await generateObjectIdentifier();
			values.push(`($${binds.push(row.id)}::integer, $${binds.push(oid)}::text)`);
		}

		await ctx.appDbQuery(
			`
				UPDATE
					unlock_attempt
				SET
					oid = v.oid,
					date_edited = NOW(),
					modified_by_user_id = $${binds.push(sessionData.user_id)}
				FROM
					(VALUES ${values.join(", ")})
					AS v(id, oid)
				WHERE
					unlock_attempt.id = v.id
					AND unlock_attempt.oid IS NULL
			`,
			binds
		);
	}

	return {
		updated: numUpdated,
	};
};
