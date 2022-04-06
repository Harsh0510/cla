const ensure = require("#tvf-ensure");

const loginUserFields = require("./common/loginUserFields");
const insertSessionData = require("../../common/insertSessionData");

const checkVerificationStatus = async (ctx, querier, token) => {
	const user = (
		await querier(
			`
				SELECT
					hwb_merge_token_expiry < NOW() AS token_expired,
					status = 'registered' AS already_registered
				FROM
					cla_user
				WHERE
					hwb_merge_token = $1
			`,
			[token]
		)
	).rows[0];
	if (!user) {
		ctx.throw(400, "Token NonExistent");
	}
	if (user.token_expired) {
		ctx.throw(400, "Token Expired");
	}
	if (user.already_registered) {
		ctx.throw(400, "Already Registered");
	}
};

module.exports = async (app) => {
	app.route("/auth/oauth/hwb/merge-account-complete", async (params, ctx) => {
		ensure.validIdentifier(ctx, params.activation_token, "Token");

		if (params.check_status_only) {
			await checkVerificationStatus(ctx, ctx.appDbQuery.bind(ctx), params.activation_token);
			return {};
		}

		ctx.assert(params.terms_accepted, 400, "Please accept the terms and conditions");

		const db = await ctx.getAppDbPool().connect();
		let srcUser;
		let destUser;
		try {
			await db.query("BEGIN");
			srcUser = (
				await db.query(
					`
						DELETE FROM
							cla_user
						WHERE
							hwb_merge_token = $1
							AND hwb_merge_token_expiry >= NOW()
							AND status = 'unverified'
							AND hwb_user_identifier IS NOT NULL
							AND hwb_chosen_merge_user_id IS NOT NULL
						RETURNING
							hwb_chosen_merge_user_id,
							hwb_user_identifier,
							hwb_email,
							id
					`,
					[params.activation_token]
				)
			).rows[0];
			if (!srcUser) {
				await checkVerificationStatus(ctx, db.query.bind(db), params.activation_token);
				ctx.throw(400, "User not found");
			}
			destUser = (
				await db.query(
					`
						UPDATE
							cla_user
						SET
							hwb_email = $1,
							hwb_user_identifier = $2,
							date_edited = NOW(),
							modified_by_user_id = id
						WHERE
							id = $3
							AND status = 'registered'
							AND hwb_user_identifier IS NULL
						RETURNING
							id
					`,
					[srcUser.hwb_email, srcUser.hwb_user_identifier, srcUser.hwb_chosen_merge_user_id]
				)
			).rows[0];
			ctx.assert(destUser, 400, "User wasn't found");

			await db.query("COMMIT");
		} catch (e) {
			await db.query("ROLLBACK");
			throw e;
		} finally {
			db.release();
		}
		const sessionData = await ctx.getSessionData();

		let needsReauth = false;
		if (sessionData && sessionData.user_id === srcUser.id) {
			// user was previously logged in as the old hwb user
			// log out old user and log in as new user
			needsReauth = true;
			const userDetails = (
				await ctx.appDbQuery(
					`
						SELECT
							${loginUserFields}
						FROM
							cla_user
						LEFT JOIN school
							ON cla_user.school_id = school.id
						WHERE
							cla_user.id = $1
					`,
					[destUser.id]
				)
			).rows[0];
			const sessionToken = await insertSessionData(ctx, userDetails.id, {
				user_id: userDetails.id,
				user_role: userDetails.role,
				user_email: userDetails.email,
				school_id: userDetails.school_id,
				academic_year_end: [userDetails.academic_year_end_month, userDetails.academic_year_end_day],
				is_first_time_flyout_enabled: userDetails.is_first_time_flyout_enabled,
				logged_in_with_hwb: true,
			});

			ctx.clearSessId();
			await ctx.addSessIdToResponse(sessionToken);
		}
		return {
			success: true,
			needsReauth: needsReauth,
		};
	});
};
