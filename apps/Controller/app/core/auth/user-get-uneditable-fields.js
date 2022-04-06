const blockedFields = require("../../common/wonde/userUpdatableFields");

/**
 * Get all institution details for a particular admin
 */
module.exports = async function (params, ctx) {
	let fields = blockedFields;
	if (params.edit_self) {
		const sessionData = await ctx.getSessionData();
		ctx.assert(sessionData && sessionData.user_id, 401, "Unauthorized");
		const result = await ctx.appDbQuery("SELECT wonde_identifier IS NULL AS x FROM cla_user WHERE id = $1", [sessionData.user_id]);
		if (result.rows[0].x) {
			fields = [];
		}
	}
	return {
		fields: fields,
	};
};
