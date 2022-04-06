const ensure = require("#tvf-ensure");
const rolloverIntervalForFirstEmail = require("./lib/rolloverIntervalForFirstEmail");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	// validate inputs
	ensure.nonNegativeInteger(ctx, params.id, `ID`);

	const updateFields = [];
	const values = [];
	const bindSchools = [];
	const schoolIdBindIndexes = [];
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("rollover_job_selected_schools")) {
		const schoolIds = params.rollover_job_selected_schools;
		if (!schoolIds.length) {
			ctx.throw(400, "Select at-least one institution from the list");
		} else {
			for (const schoolId of schoolIds) {
				schoolIdBindIndexes.push("$" + bindSchools.push(schoolId));
			}
			numFieldsChanged++;
		}
	}

	if (params.hasOwnProperty("name")) {
		ensure.nonEmptyStr(ctx, params.name, `name`);
		numFieldsChanged++;
		updateFields.push(`name = $${values.push(params.name)}`);
	}

	if (params.hasOwnProperty("target_execution_date")) {
		ensure.nonNegativeInteger(ctx, params.target_execution_date, "Target execution date");

		const millisecondsInFuture = params.target_execution_date * 1000 - Date.now();
		const daysInFuture = millisecondsInFuture / (1000 * 3600 * 24);

		if (daysInFuture < rolloverIntervalForFirstEmail) {
			ctx.throw(400, "Please select valid date");
		}

		numFieldsChanged++;
		const targetExecutionDateBindIdx = values.push(params.target_execution_date);
		updateFields.push(
			`target_execution_date = TO_TIMESTAMP($${targetExecutionDateBindIdx})`,
			`next_execution_date = TO_TIMESTAMP($${targetExecutionDateBindIdx})::timestamptz - INTERVAL '${rolloverIntervalForFirstEmail} days'`
		);
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	let result = false;
	if (bindSchools && bindSchools.length) {
		//update rollover_job_id as 0 from institution for previously selected institutions
		await ctx.appDbQuery(
			`
				UPDATE
					school
				SET
					rollover_job_id = 0,
					date_edited = NOW(),
					modified_by_user_id = ${sessionData.user_id}
				WHERE
					rollover_job_id = ${params.id}
					AND id NOT IN (${schoolIdBindIndexes.join(",")})
			`,
			bindSchools
		);

		//update rollover_job_id as current job id from institution for selected institutions
		const updateClauses = [`rollover_job_id = ${params.id}`];
		if (params.target_execution_date) {
			const dt = new Date(params.target_execution_date * 1000);
			const academicMonthEnd = dt.getUTCMonth() + 1;
			const academicDayEnd = dt.getUTCDate();
			updateClauses.push(`academic_year_end_month = ${academicMonthEnd}`, `academic_year_end_day = ${academicDayEnd}`);
		}
		updateClauses.push(`date_edited = NOW()`);
		updateClauses.push(`modified_by_user_id = ${sessionData.user_id}`);
		await ctx.appDbQuery(
			`
				UPDATE
					school
				SET
					${updateClauses.join(", ")}
				WHERE
					id IN (${schoolIdBindIndexes.join(",")})
					AND rollover_job_id <> ${params.id}
			`,
			bindSchools
		);
		result = true;
	}

	if (updateFields.length) {
		const updateRolloverJob = await ctx.appDbQuery(
			`
				UPDATE
					rollover_job
				SET
					${updateFields.join(", ")}
				WHERE
					id = ${params.id}
					AND status = 'scheduled'
					AND (next_execution_date > NOW() OR next_execution_date IS NULL)
			`,
			values
		);
		result = updateRolloverJob.rowCount > 0;
	}
	return { result: result };
};
