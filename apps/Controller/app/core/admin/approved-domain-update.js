const ensure = require("#tvf-ensure");

const disallowedApprovedDomains = require("../../common/disallowedApprovedDomains");

const disallowedApprovedDomainsMap = Object.create(null);
disallowedApprovedDomains.forEach((domain) => {
	disallowedApprovedDomainsMap[domain] = true;
});

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
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("school_id")) {
		ensure.nonNegativeInteger(ctx, params.school_id, `Institution`);
		numFieldsChanged++;
		updateFields.push(`school_id = $${values.push(params.school_id)}`);
	}

	if (params.hasOwnProperty("domain")) {
		ensure.nonEmptyStr(ctx, params.domain, `Domain`);
		const domain = params.domain.toLowerCase();
		ensure.isEmail(ctx, `example@${domain}`, `Domain`);
		ctx.assert(!disallowedApprovedDomainsMap[domain], 400, `Domain not allowed`);
		numFieldsChanged++;
		updateFields.push(`domain = $${values.push(domain)}`);
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	updateFields.push(`date_edited = NOW()`);
	updateFields.push(`modified_by_user_id = $${values.push(sessionData.user_id)}`);

	let result;
	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		result = await client.query(
			`
			UPDATE
				approved_domain
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${params.id}
			`,
			values
		);

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		if (typeof e === "string") {
			ctx.throw(400, e);
		} else {
			if (e.message.indexOf("unique") !== -1) {
				ctx.throw(400, `That domain already exists for the provided institution`);
			} else {
				ctx.throw(400, "Unknown Error [1]");
			}
		}
	} finally {
		client.release();
	}

	return {
		result: result.rowCount > 0,
	};
};
