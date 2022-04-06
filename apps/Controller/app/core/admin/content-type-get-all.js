const { userRoles } = require("../../common/staticValues");
/**
 * Get all content type on the platform
 */
module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(sessionData.user_role === userRoles.schoolAdmin || sessionData.user_role === userRoles.teacher, 401, "Unauthorized");

	const result = await ctx.appDbQuery(
		`
			SELECT
				id AS id,
				title AS title
			FROM
				content_type
			ORDER BY
				id ASC
		`
	);

	return {
		data: result.rows,
	};
};
