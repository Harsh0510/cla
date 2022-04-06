const ensure = require("#tvf-ensure");

/**
 * Get a single course for a particular school based on the oid
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();

	try {
		const result = await ctx.appDbQuery(
			`
				SELECT
					course.oid AS oid,
					course.title AS title,
					course.identifier AS identifier,
					course.year_group AS year_group
				FROM
					course
				WHERE
					course.oid = $1
					AND course.school_id = $2
					AND course.archive_date IS NULL
			`,
			[params.oid, sessionData.school_id ? sessionData.school_id : 0]
		);

		return {
			result: result.rows.length !== 0 ? result.rows[0] : null,
		};
	} catch (e) {
		/**
		 * some unknown sql error has occured
		 */
		// ctx.throw(400, e.message);
		ctx.throw(400, "Unknown Error [1]");
	}
};
