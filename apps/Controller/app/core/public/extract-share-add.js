const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const generate_access_code = require("../../common/generate_access_code");
const { userRoles } = require("../../common/staticValues");
const { ensureCanCopy } = require("../auth/common/canCopy");

module.exports = async function (params, ctx) {
	ensure.validIdentifier(ctx, params.extract_oid, "Extract");
	ensure.nonEmptyStr(ctx, params.title, "Title");

	await ctx.ensureLoggedIn();
	await ensureCanCopy(ctx);
	const sessionData = await ctx.getSessionData();
	const currentUserRole = sessionData.user_role;

	let extractId;
	let date_expired = new Date();
	let enable_extract_share_access_code = false;
	{
		let idx = 1;
		const whereClause = ["(extract.archive_date IS NULL)", `(extract.oid = $${idx++})`];
		const values = [params.extract_oid];
		if (currentUserRole !== userRoles.claAdmin) {
			ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an extract");
			whereClause.push(`(extract.school_id=$${idx++})`);
			values.push(sessionData.school_id);
		}
		const results = await ctx.appDbQuery(
			`
				SELECT
					extract.id,
					extract.date_expired,
					publisher.enable_extract_share_access_code
				FROM
					extract
					INNER JOIN asset on extract.asset_id = asset.id
					INNER JOIN publisher on asset.publisher_id = publisher.id
				WHERE
					${whereClause.join(" AND ")}
			`,
			values
		);
		ctx.assert(Array.isArray(results.rows) && results.rows.length, 400, "Extract not found");
		extractId = parseInt(results.rows[0].id, 10);
		date_expired = new Date(results.rows[0].date_expired);
		enable_extract_share_access_code = results.rows[0].enable_extract_share_access_code;
		const currentDate = new Date();
		ctx.assert(date_expired.getTime() > currentDate.getTime(), 401, "Your extract licensed date is expired");
	}

	const oid = await tvfUtil.generateObjectIdentifier();
	try {
		let access_code = null;
		if (enable_extract_share_access_code) {
			access_code = generate_access_code();
		}
		await ctx.appDbQuery(
			`
				INSERT INTO
					extract_share
					(oid, user_id, extract_id, title, date_expired, access_code, enable_extract_share_access_code)
				VALUES
					($1, $2, $3, $4, $5, $6, $7)
			`,
			[oid, sessionData.user_id, extractId, params.title, date_expired, access_code, enable_extract_share_access_code]
		);

		return {
			extract_share_oid: oid,
			extract_share_title: params.title,
		};
	} catch (e) {
		return ctx.throw(400, e.message);
	}
};
