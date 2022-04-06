const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	// validate inputs
	ensure.nonNegativeInteger(ctx, params.id, `ID`);

	const updateFields = [];
	const values = [];
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("domain")) {
		ensure.nonEmptyStr(ctx, params.domain, `Domain`);
		const domain = params.domain.toLowerCase();
		ensure.isEmail(ctx, `example@${domain}`, `Domain`);
		numFieldsChanged++;
		values.push(domain);
		updateFields.push(`domain = $${values.length}`);
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	let result;
	try {
		result = await ctx.appDbQuery(
			`
				UPDATE
					trusted_domain
				SET
					${updateFields.join(", ")}
				WHERE
					id = ${params.id}
			`,
			values
		);
	} catch (e) {
		if (e.message.indexOf("unique") !== -1) {
			ctx.throw(400, `That domain already exists`);
		} else {
			ctx.throw(400, "Unknown Error [1]");
		}
	}

	return {
		result: result.rowCount > 0,
	};
};
