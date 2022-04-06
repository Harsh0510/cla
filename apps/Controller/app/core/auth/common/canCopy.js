const trialPeriodHours = (() => {
	const DEFAULT_TRIAL_PERIOD_HOURS = 10 * 24;
	if (process.env.CLA_TRIAL_PERIOD_HOURS) {
		const hours = parseFloat(process.env.CLA_TRIAL_PERIOD_HOURS);
		if (hours <= 0) {
			return DEFAULT_TRIAL_PERIOD_HOURS;
		}
		if (hours > 50000) {
			return DEFAULT_TRIAL_PERIOD_HOURS;
		}
		return hours;
	}
	return DEFAULT_TRIAL_PERIOD_HOURS;
})();

const rawCanCopySql = `(
	cla_user.status = 'registered'
	OR (
		<<< User has a password >>>
		cla_user.password_hash IS NOT NULL
		
		<<< User registered with an approved or trusted domain >>>
		AND (
			cla_user.registered_with_approved_domain 
			OR cla_user.trusted_domain_registered_with IS NOT NULL
		)

		<<< User registered no more than 10 days ago >>>
		AND cla_user.date_created_initial_password + interval '${trialPeriodHours} hours' > NOW()
	)
)`
	.replace(/<<<[^>]+>>>/g, "")
	.replace(/\s+/g, " ");

const canCopySql = () => rawCanCopySql;

const sql = `SELECT ${rawCanCopySql} AS can_copy FROM cla_user WHERE id = $1`;

const ensureCanCopy = async (ctx) => {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const result = await ctx.appDbQuery(sql, [sessionData.user_id]);
	ctx.assert(result.rowCount && result.rows[0].can_copy, 400, "_ERROR_ :: cannot copy");
};

module.exports = {
	canCopySql,
	ensureCanCopy,
};
