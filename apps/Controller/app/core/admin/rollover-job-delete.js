const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	ensure.nonNegativeInteger(ctx, params.id, "ID");

	const results = await ctx.appDbQuery(
		`
			DELETE FROM
				rollover_job
			WHERE
				id = $1
				AND status = 'scheduled'
				AND (
					next_execution_date > (NOW() + INTERVAL '15 minutes')
					OR next_execution_date IS NULL
				)
		`,
		[params.id]
	);

	if (results.rowCount > 0) {
		//update institution rollover_job_id as 0 which are associated with the deleted rollover_job
		await ctx.appDbQuery(
			`
				UPDATE 
					school
				SET
					rollover_job_id = 0,
					academic_year_end_month = DEFAULT,
					academic_year_end_day = DEFAULT,
					date_edited = NOW(),
					modified_by_user_id = $2
				WHERE
					rollover_job_id = $1
			`,
			[params.id, sessionData.user_id]
		);
	}

	return {
		result: results.rowCount > 0,
	};
};
