/**
 * Get all school details for a particular admin
 */
module.exports = async function (params, ctx) {
	try {
		const result = await ctx.appDbQuery(`
			SELECT
				name,
				iso2 AS id
			FROM
				country
		`);
		return {
			result: result.rows,
		};
	} catch (e) {
		ctx.throw(400, "Unknown Error");
	}
};
