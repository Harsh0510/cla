const ensure = require("#tvf-ensure");

/**
 * Get all Home Screen Blog Categories on the plaform for cla admins only
 */
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	// Throw an error if non cla-admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	try {
		let getBlogCategoryRecord = await ctx.appDbQuery(
			`
				SELECT
					id,
					home_screen_blog_category_names AS blog_category_names
				FROM
					settings
				ORDER BY 
					id DESC
				LIMIT 1
			`
		);

		if (
			getBlogCategoryRecord &&
			Array.isArray(getBlogCategoryRecord.rows) &&
			getBlogCategoryRecord.rows.length > 0 &&
			getBlogCategoryRecord.rows[0]._count_ > 0
		) {
			throw "Can not find the home screen category row.";
		}

		return {
			data: getBlogCategoryRecord.rows,
		};
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}
};
