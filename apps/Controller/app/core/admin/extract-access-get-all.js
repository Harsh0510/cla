/**
 * Get all extract access on the plaform for cla admins only
 */
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	try {
		const query = `
				SELECT
					asset_id,
					extract_id,
					extract_oid,
					extract_share_oid,
					date_created,
					title_of_work,
					title_of_copy,
					ip_address,
					user_agent,
					referrer,
					user_id
				FROM 
					extract_access
				ORDER BY date_created DESC
		`;

		const result = await ctx.appDbQuery(query);

		return {
			result: result.rows,
		};
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}
};
