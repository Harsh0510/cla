const ensure = require("#tvf-ensure");
const { userRoles } = require("../../../common/staticValues");

module.exports = async function (ctx, extractOid) {
	const sessionData = await ctx.getSessionData();
	let schoolId = 0;
	if (sessionData && sessionData.user_role === userRoles.claAdmin) {
		ensure.validIdentifier(ctx, extractOid, "Extract OId");
		const result = await ctx.appDbQuery(
			`
				SELECT
					school_id
				FROM
					extract
				WHERE
					oid = '${extractOid}'
					AND archive_date IS NULL
			`
		);
		if (result.rowCount) {
			schoolId = result.rows[0].school_id;
		}
	} else if (sessionData.school_id) {
		schoolId = sessionData.school_id;
	}
	ctx.assert(schoolId, 401, "You must be associated with an institution");
	return schoolId;
};
