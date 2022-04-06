const ensure = require("#tvf-ensure");

const promoteToRealAccount = require("./common/promoteToRealAccount");
const sendMergeVerifyEmail = require("./common/sendMergeVerifyEmail");

module.exports = (app) => {
	app.route("/auth/oauth/hwb/merge-account-init", async (params, ctx) => {
		const sessionData = await ctx.getSessionData();
		ctx.assert(sessionData && sessionData.user_id > 0, 401, "Unauthorized");
		let user;
		if (params.email) {
			ensure.isEmail(ctx, params.email, "Email");
			user = (
				await ctx.appDbQuery(
					`
						SELECT
							id,
							email
						FROM
							cla_user
						WHERE
							status = 'registered'
							AND hwb_user_identifier IS NULL
							AND email = $1
					`,
					[params.email]
				)
			).rows[0];
		} else {
			user = (
				await ctx.appDbQuery(
					`
						SELECT
							id,
							email
						FROM
							cla_user
						WHERE
							status = 'registered'
							AND hwb_user_identifier IS NULL
							AND id IN (
								SELECT
									hwb_default_merge_user_id
								FROM
									cla_user
								WHERE
									id = $1
							)
					`,
					[sessionData.user_id]
				)
			).rows[0];
		}
		if (!user) {
			if (params.email) {
				await promoteToRealAccount(ctx.appDbQuery.bind(ctx), sessionData.user_id);
			}
			return {};
		}
		const chosenMergeUserId = user.id;
		const targetEmail = user.email;
		const binds = [];
		const deets = (
			await ctx.appDbQuery(
				`
					UPDATE
						cla_user
					SET
						hwb_merge_token = encode(gen_random_bytes(18), 'hex'),
						hwb_merge_token_expiry = NOW() + INTERVAL '3 days',
						hwb_chosen_merge_user_id = $${binds.push(chosenMergeUserId)},
						date_edited = NOW(),
						modified_by_user_id = $${binds.push(sessionData.user_id)}
					WHERE
						id = $${binds.push(sessionData.user_id)}
					RETURNING
						hwb_merge_token
				`,
				binds
			)
		).rows[0];
		ctx.assert(deets, 400, "Cannot merge with this account");
		await sendMergeVerifyEmail(targetEmail, deets.hwb_merge_token);
		return {};
	});
};
