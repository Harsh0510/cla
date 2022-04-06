const nameDisplayPreference = require("../../../common/nameDisplayPreference/sql");

module.exports = async function (ctx, userId) {
	// get teacher name

	const results = await ctx.appDbQuery(
		`
			SELECT
				${nameDisplayPreference.getFinal()} AS teacher_name
			FROM
				cla_user
			WHERE
				id = $1
			`,
		[userId]
	);
	ctx.assert(results.rowCount > 0, 400, "Could not fetch user");
	return results.rows[0].teacher_name;
};
