const ensure = require("#tvf-ensure");
const inputStringIsValid = require("../../common/inputStringIsValid");

module.exports = async function (params, ctx) {
	ensure.isEmail(ctx, params.email, "Email");
	inputStringIsValid.lengthIsValid(ctx, params.email, "Email", 0, 255);
	const email = params.email.toLowerCase();
	ensure.positiveInteger(ctx, params.school, "Institution");
	let result;
	let approvedDomain = false;
	try {
		const domain = email.split("@").pop();
		result = await ctx.appDbQuery(
			`
				SELECT COUNT(*) AS _count_ FROM approved_domain WHERE school_id = $1 AND domain = $2
			`,
			[params.school, domain]
		);
		approvedDomain = parseInt(result.rows[0]._count_, 10) > 0;
	} catch (e) {
		ctx.throw(400, "Unknown Error");
	}
	return {
		result: approvedDomain,
	};
};
