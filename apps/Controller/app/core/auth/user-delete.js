/**
 * Create a new local user, given email/password/name/etc.
 * Not used for users who log in via other means (Google Classroom, Office 365, etc).
 */
const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	ensure.isEmail(ctx, params.email, "Email");
	ctx.assert(sessionData.user_email !== params.email, 403, "You may not delete yourself");

	let results;
	let query;
	let values;
	let user_id; //get user_id for delete the cla_session entry

	if (userRole === "cla-admin") {
		// cla admins can delete any user
		query = "DELETE FROM cla_user WHERE email = $1 RETURNING id";
		values = [params.email.toLowerCase()];
	} else {
		// school admins can only delete users in their school
		query = "DELETE FROM cla_user WHERE email = $1 AND school_id = $2 RETURNING id";
		values = [params.email.toLowerCase(), sessionData.school_id];
	}
	try {
		results = await ctx.appDbQuery(query, values);

		if (results && results.rows[0] && results.rows[0].id) {
			//Get user_id for delete the cla_session data
			user_id = results.rows[0].id;
			//delete the data from session database
			resultsSessionData = await ctx.sessionDbQuery("DELETE FROM cla_session WHERE user_id = $1", [user_id]);
		}

		return {
			result: results.rowCount >= 1,
		};
	} catch (e) {
		ctx.throw(400, "Could not delete account");
	}
};
