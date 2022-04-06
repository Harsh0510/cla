const getQueryForAssetProcessingLogGetAll = require("../../common/getQueryForAssetProcessingLogGetAll");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non cla-admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	//final where Clauses
	const query = getQueryForAssetProcessingLogGetAll(ctx, params.filter, params.query);

	// Get all processing log item information
	const result = await ctx.appDbQuery(
		`
			SELECT
				id,
				date_created,
				stage,
				sub_stage,
				asset_identifier,
				success,
				content,
				session_identifier,
				session_index,
				high_priority,
				category
			FROM
			asset_processing_log
			${query.whereClauses}
			ORDER BY
				id ASC
		`,
		query.queryBinds
	);

	return {
		data: result.rows,
	};
};
