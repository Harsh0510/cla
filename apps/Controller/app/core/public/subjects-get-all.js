/**
 * Get all subjects on the plaform
 */
module.exports = async function (params, ctx) {
	try {
		const result = await ctx.appDbQuery(
			`
				SELECT 
					code,
					name
				FROM 
					subject
				`
		);

		return {
			result: result.rows,
		};
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}
};
