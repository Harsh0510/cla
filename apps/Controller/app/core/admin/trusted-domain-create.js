const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	// validate inputs
	ensure.nonEmptyStr(ctx, params.domain, `Domain`);
	const domain = params.domain.toLowerCase();
	ensure.isEmail(ctx, `example@${domain}`, `Domain`);

	let result;
	try {
		result = await ctx.appDbQuery(
			`
				INSERT INTO
					trusted_domain
					(domain)
				VALUES
					($1)
				RETURNING
					id
			`,
			[domain]
		);
		return {
			success: true,
			id: parseInt(result.rows[0].id, 10),
		};
	} catch (e) {
		if (e.message.indexOf("unique") !== -1) {
			ctx.throw(400, `That domain already exists`);
		} else {
			ctx.throw(400, "Unknown Error [1]");
		}
	}
};
