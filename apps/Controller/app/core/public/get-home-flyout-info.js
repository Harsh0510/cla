const staticValues = require("../../common/staticValues");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const homeScreenBox = staticValues.homeScreenBox;
	const searchScreens = [homeScreenBox.search, homeScreenBox.unlock, homeScreenBox.reviewCopies, homeScreenBox.reviewRollover];

	const result = await ctx.appDbQuery(
		`
			SELECT
				screen,
				index
			FROM
				user_flyout_seen
			WHERE
				user_id = $1
				AND screen IN ('${searchScreens.join(`', '`)}')
		`,
		[sessionData.user_id]
	);

	const flyoutsScreenSeenIndex = {};
	for (const row of result.rows) {
		flyoutsScreenSeenIndex[row.screen] = row.index;
	}

	const extractExpiryCount = (
		await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					extract
				WHERE
					date_expired < NOW()
					AND user_id = $1
					AND archive_date IS NULL
			`,
			[sessionData.user_id]
		)
	).rows[0]._count_;

	const rolloverData = await ctx.appDbQuery(
		`
			SELECT
				rollover_job.status IN ('rolled-over', 'completed') AS rollover_completed,
				rollover_job.target_execution_date AS target_execution_date
			FROM
				rollover_job
			INNER JOIN school
				ON school.rollover_job_id = rollover_job.id
			WHERE
				school.id = $1
		`,
		[sessionData.school_id]
	);

	return {
		flyout_seen_data: flyoutsScreenSeenIndex,
		rollover_data: {
			extract_expiry_count: extractExpiryCount,
			rollover_completed: rolloverData.rowCount && rolloverData.rows[0].rollover_completed,
			target_execution_date: rolloverData.rowCount ? rolloverData.rows[0].target_execution_date : null,
		},
	};
};
