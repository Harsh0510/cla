module.exports = async function (ctx, params) {
	try {
		let approvedDomain = false;
		const domain = params.email.split("@").pop();
		result = await ctx.appDbQuery(
			`
				SELECT COUNT(*) AS _count_ FROM approved_domain WHERE school_id = $1 AND domain = $2
			`,
			[params.schoolID, domain]
		);
		approvedDomain = parseInt(result.rows[0]._count_, 10) > 0;
		return approvedDomain;
	} catch (e) {
		ctx.throw(400, "Unexpected error [2]");
	}
};
