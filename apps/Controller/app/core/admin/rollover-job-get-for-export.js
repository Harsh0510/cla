const ensure = require("#tvf-ensure");
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.positiveInteger(ctx, params.id, "Rollover Job ID");
	const rolloverResult = await ctx.appDbQuery(
		`
			SELECT
				id,
				name AS job_name,
				target_execution_date AS rollover_date,
				status
			FROM
				rollover_job
			WHERE
				id = $1
		`,
		[params.id]
	);
	ctx.assert(rolloverResult.rowCount > 0, 400, "Rollover Job not found");

	const rolloverSchoolResult = await ctx.appDbQuery(
		`
			SELECT
				id,
				name,
				school_level,
				school_type,
				territory
			FROM
				school
			WHERE
				rollover_job_id = $1
			ORDER BY
				id ASC
		`,
		[params.id]
	);
	return {
		rollover: rolloverResult.rows[0],
		schools: rolloverSchoolResult.rows,
	};
};
