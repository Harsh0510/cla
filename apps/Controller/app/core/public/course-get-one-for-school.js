/**
 * Get one course for a particular school
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	const result = await ctx.appDbQuery(`
		SELECT
			oid
		FROM
			course
		WHERE
			school_id = ${sessionData.school_id}
			AND archive_date IS NULL
		ORDER BY
			id ASC
		LIMIT 1
	`);

	return {
		courseOid: result.rowCount > 0 ? result.rows[0].oid : null,
	};
};
