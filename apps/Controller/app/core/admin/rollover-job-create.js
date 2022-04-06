const ensure = require("#tvf-ensure");
const rolloverIntervalForFirstEmail = require("./lib/rolloverIntervalForFirstEmail");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	ensure.nonEmptyStr(ctx, params.name, "Name");
	ensure.nonNegativeInteger(ctx, params.target_execution_date, "Target execution date");

	// Check the given target execution date is after 14 days from NOW
	const millisecondsInFuture = params.target_execution_date * 1000 - Date.now();
	const daysInFuture = millisecondsInFuture / (1000 * 3600 * 24);

	if (daysInFuture < rolloverIntervalForFirstEmail) {
		ctx.throw(400, "Please select valid date");
	}

	if (!params.rollover_job_selected_schools.length && !params.has_selected_all) {
		ctx.throw(400, "Please select at least one institution from the list");
	}

	// Get ids of institutions to update
	const schoolIdBinds = [];
	const schoolIdBindIndexes = [];
	const schoolIds = params.rollover_job_selected_schools;
	for (const schoolId of schoolIds) {
		schoolIdBindIndexes.push("$" + schoolIdBinds.push(schoolId));
	}

	const result = await ctx.appDbQuery(
		`
			INSERT INTO
				rollover_job
				(
					active,
					name,
					target_execution_date,
					next_execution_date
				)
			VALUES
				(
					TRUE,
					$1,
					TO_TIMESTAMP($2),
					TO_TIMESTAMP($2)::timestamptz - INTERVAL '${rolloverIntervalForFirstEmail} days'
				)
			RETURNING
				id
		`,
		[params.name, params.target_execution_date]
	);

	if (result.rows.length && result.rows[0].id) {
		const dt = new Date(params.target_execution_date * 1000);
		const academicMonthEnd = dt.getUTCMonth() + 1;
		const academicDayEnd = dt.getUTCDate();

		await ctx.appDbQuery(
			`
				UPDATE
					school
				SET
					rollover_job_id = ${result.rows[0].id},
					academic_year_end_month = ${academicMonthEnd},
					academic_year_end_day = ${academicDayEnd},
					date_edited = NOW(),
					modified_by_user_id = ${sessionData.user_id}
				WHERE
					id IN (${schoolIdBindIndexes.join(",")})
					AND rollover_job_id = 0
			`,
			schoolIdBinds
		);
	}

	return {
		success: result.rows.length > 0,
		id: result.rows[0].id,
	};
};
