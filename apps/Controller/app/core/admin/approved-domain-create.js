const ensure = require("#tvf-ensure");

const disallowedApprovedDomains = require("../../common/disallowedApprovedDomains");

const disallowedApprovedDomainsMap = Object.create(null);
disallowedApprovedDomains.forEach((domain) => {
	disallowedApprovedDomainsMap[domain] = true;
});

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	// validate inputs
	ensure.nonNegativeInteger(ctx, params.school_id, `Institution`);
	ensure.nonEmptyStr(ctx, params.domain, `Domain`);
	const domain = params.domain.toLowerCase();
	ctx.assert(!disallowedApprovedDomainsMap[domain], 400, `Domain not allowed`);
	ensure.isEmail(ctx, `example@${domain}`, `Domain`);

	let result;
	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		result = await client.query(`SELECT COUNT(*) AS _count_ FROM school WHERE id = ${params.school_id}`);
		if (!(result && Array.isArray(result.rows) && result.rows.length > 0 && result.rows[0]._count_ > 0)) {
			throw `Institution does not exist`;
		}

		result = await client.query(
			`
				INSERT INTO
					approved_domain
					(school_id, domain)
				VALUES
					(${params.school_id}, $1)
				RETURNING
					id
			`,
			[domain]
		);

		await client.query("COMMIT");

		return {
			success: true,
			id: parseInt(result.rows[0].id, 10),
		};
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
};
