/**
 * If the system detects that a user logs in from a different country from the country they previously logged in from, they're sent a warning email by default.
 * Users may not want these warning emails. They can be disabled via this endpoint.
 */

const ensure = require("#tvf-ensure");

const { emailNotificationCategory } = require("../../common/staticValues");

module.exports = async function (params, ctx) {
	ensure.nonEmptyStr(ctx, params.hashed, "hashed");
	ctx.assert(params.hashed.length === 32 || params.hashed.length === 36, 400, "invalid param");

	if (params.hashed.length === 36) {
		// new style - 'hashed' is a 36-character oid
		const tokenResult = await ctx.appDbQuery(
			`
				DELETE FROM
					login_security_token
				WHERE
					oid = $1
					AND date_created + INTERVAL '7 days' > NOW()
				RETURNING
					user_id
			`,
			[params.hashed]
		);

		if (tokenResult.rowCount === 0) {
			return {
				result: false,
			};
		}

		const sessionData = await ctx.getSessionData();

		const result = await ctx.appDbQuery(
			`
				UPDATE
					cla_user
				SET
					email_opt_out = ARRAY(SELECT DISTINCT UNNEST(email_opt_out || '{${emailNotificationCategory.multipleLoginsDetected}}'::TEXT[])),
					date_edited = NOW(),
					modified_by_user_id = ${sessionData && sessionData.user_id ? parseInt(sessionData.user_id, 10) : "id"}
				WHERE
					id = $1
			`,
			[tokenResult.rows[0].user_id]
		);

		return {
			result: result.rowCount > 0,
		};
	} else {
		/**
		 * Old style - 'hashed' is a 32-character md5 hex digest
		 * This 'else' block should be completely deleted after 1st March 2022.
		 */
		const sessionData = await ctx.getSessionData();

		const secret = "wrft5g6ynu";
		const result = await ctx.appDbQuery(
			`
				UPDATE
					cla_user
				SET
					email_opt_out = ARRAY(SELECT DISTINCT UNNEST(email_opt_out || '{${emailNotificationCategory.multipleLoginsDetected}}'::TEXT[])),
					is_security_email_enabled = false,
					date_edited = NOW(),
					modified_by_user_id = ${sessionData && sessionData.user_id ? parseInt(sessionData.user_id, 10) : "id"}
				WHERE
					MD5(CONCAT('${secret}',email)) = $1
				RETURNING
					id
			`,
			[params.hashed]
		);

		return {
			result: result.rowCount > 0,
		};
	}
};
