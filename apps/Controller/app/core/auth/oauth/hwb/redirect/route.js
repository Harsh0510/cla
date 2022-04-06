const insertSessionData = require("../../../common/insertSessionData");

const validateRequestAndFetchChallengeOid = require("./validateRequestAndFetchChallengeOid");
const fetchAndDeleteChallengeFromOid = require("./fetchAndDeleteChallengeFromOid");
const fetchAzureIdToken = require("./fetchAzureIdToken");
const fetchUserDetails = require("./fetchUserDetails");
const insertNewHwbUser = require("./insertNewHwbUser");
const { fetchUserByHwbId, fetchUserById, fetchMatchingUser } = require("./fetchUser");

const doError = (ctx, msg) => {
	console.error("Hwb login error:", msg);
	ctx._koaCtx.redirect(process.env.CLA_BASE_URL + "/sign-in?oauth_login_error=1");
	return {};
};

const upsertHwbUser = async (querier, azureUserDetails) => {
	const userDetails = await fetchUserByHwbId(querier, azureUserDetails.identifier);
	if (userDetails) {
		return userDetails;
	}
	const [matchedUser, matchType] = await fetchMatchingUser(querier, azureUserDetails);
	const insertedUserId = await insertNewHwbUser(querier, azureUserDetails, matchedUser, matchType);
	return await fetchUserById(querier, insertedUserId);
};

module.exports = async (app) => {
	app.route(
		"/federated-auth/hwb/redirect",
		async (params, ctx) => {
			ctx._koaCtx.set("Content-Type", "text/html");
			const [error, challengeOid] = validateRequestAndFetchChallengeOid(params);
			if (error) {
				return doError(ctx, error);
			}
			const querier = ctx.appDbQuery.bind(ctx);
			const challenge = await fetchAndDeleteChallengeFromOid(querier, challengeOid);
			if (!challenge) {
				// error
				return doError(ctx, "fetchAndDeleteChallengeFromOid");
			}
			const idToken = await fetchAzureIdToken(challenge, params.code);
			if (!idToken) {
				return doError(ctx, "fetchAzureIdToken");
			}
			const azureUserDetails = await fetchUserDetails(querier, idToken);
			if (!azureUserDetails) {
				return doError(ctx, "fetchUserDetails");
			}
			// const azureUserDetails = {
			// 	identifier: "AAAXXX",
			// 	title: "Ms",
			// 	first_name: "Alan",
			// 	last_name: "Last",
			// 	email: "coombesj5@hwbstaging.cymru",
			// 	school_id: 192869,
			// };
			const userDetails = await upsertHwbUser(querier, azureUserDetails);
			if (!userDetails) {
				return doError(ctx, "upsertHwbUser");
			}

			const sessionToken = await insertSessionData(ctx, userDetails.id, {
				user_id: userDetails.id,
				user_role: userDetails.role,
				user_email: userDetails.email,
				school_id: userDetails.school_id,
				academic_year_end: [userDetails.academic_year_end_month, userDetails.academic_year_end_day],
				is_first_time_flyout_enabled: userDetails.is_first_time_flyout_enabled,
				logged_in_with_hwb: true,
			});

			await ctx.addSessIdToResponse(sessionToken);

			const redirectSegment = userDetails.status === "registered" ? "" : "/auth/merge-confirmation";

			ctx._koaCtx.redirect(process.env.CLA_BASE_URL + redirectSegment);
			return {};
		},
		{
			require_csrf_token: false,
			http_method: "get",
		}
	);
};
