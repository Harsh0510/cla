const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const sessionData = await ctx.getSessionData();

	ctx.assert(sessionData && sessionData.user_id > 0, 401, "Unauthorized");

	ensure.validIdentifier(ctx, params.token, "Token");

	let result;
	try {
		result = await ctx.appDbQuery(
			`
				UPDATE
					cla_user
				SET
					email = pending_email,
					pending_email = NULL,
					pending_email_token = NULL,
					pending_email_expiry = NULL,
					date_edited = NOW(),
					modified_by_user_id = $2
				WHERE
					(pending_email_expiry > NOW())
					AND (pending_email_token = $1)
					AND (id = $2)
			`,
			[params.token, sessionData.user_id]
		);
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}

	return {
		result: result.rowCount > 0,
	};
};
