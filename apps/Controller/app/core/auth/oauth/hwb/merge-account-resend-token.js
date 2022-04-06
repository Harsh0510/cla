const ensure = require("#tvf-ensure");

const sendMergeVerifyEmail = require("./common/sendMergeVerifyEmail");

module.exports = async (app, asyncRunner) => {
	app.route("/auth/oauth/hwb/merge-account-resend-token", async (params, ctx) => {
		let subSelectWhereClause;
		const binds = [];
		const updateFields = [
			"hwb_merge_token = encode(gen_random_bytes(18), 'hex')",
			"hwb_merge_token_expiry = NOW() + interval '3 days'",
			"date_last_registration_activity = NOW()",
			"date_edited = NOW()",
		];
		if (params.activation_token) {
			ensure.validIdentifier(ctx, params.activation_token, "Token");
			subSelectWhereClause = `hwb_merge_token = $${binds.push(params.activation_token)}`;
		} else {
			const sessionData = await ctx.getSessionData();
			ctx.assert(sessionData && sessionData.user_id > 0, 401, "Unauthorized");
			const idx = binds.push(sessionData.user_id);
			subSelectWhereClause = `id = $${idx}`;
			updateFields.push(`modified_by_user_id = $${idx}`);
		}
		const db = await ctx.getAppDbPool().connect();
		let targetEmail;
		let token;
		try {
			await db.query("BEGIN");
			const result = await db.query(
				`
					UPDATE
						cla_user
					SET
						${updateFields.join(", ")}
					WHERE
						${subSelectWhereClause}
					RETURNING
						hwb_chosen_merge_user_id,
						hwb_merge_token
				`,
				binds
			);
			if (!result.rowCount) {
				await db.query("ROLLBACK");
				return {};
			}
			const targetUser = await db.query(
				`
					SELECT
						email
					FROM
						cla_user
					WHERE
						id = $1
				`,
				[result.rows[0].hwb_chosen_merge_user_id]
			);

			if (!targetUser.rowCount) {
				await db.query("ROLLBACK");
				return {};
			}
			await db.query("COMMIT");
			token = result.rows[0].hwb_merge_token;
			targetEmail = targetUser.rows[0].email;
		} catch (e) {
			await db.query("ROLLBACK");
			throw e;
		} finally {
			db.release();
		}
		await sendMergeVerifyEmail(targetEmail, token);
		return {};
	});
};
