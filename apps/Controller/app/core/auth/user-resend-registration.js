const ensure = require("#tvf-ensure");

const resendRegistrationEmail = require("./common/resendRegistrationEmail");

module.exports = async function (params, ctx, sendEmail) {
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData ? sessionData.user_role : null;
	const userId = sessionData ? parseInt(sessionData.user_id, 10) || 0 : 0;

	let dbFieldName;
	let dbFieldValue;
	let schoolId;
	let verboseErrorReporting = false;

	if (!params.email && !params.token) {
		/**
		 * No email or token supplied, so that means the user is requesting a
		 * resend for themselves, so the user must be logged in.
		 */
		ctx.assert(userId > 0, 401, "Unauthorized");
		dbFieldName = "id";
		dbFieldValue = userId;
	} else if (params.token) {
		/**
		 * Otherwise the user is passing an (old) activation token.
		 * Teachers and non-logged-in users are most likely to do this
		 */
		ensure.validIdentifier(ctx, params.token, "Activation token");
		dbFieldName = "activation_token";
		dbFieldValue = params.token;
	} else if (userRole === "cla-admin" || userRole === "school-admin") {
		// Otherwise admins only have to provide an email address of the user they want to resend to.
		ensure.isEmail(ctx, params.email, "Email");
		dbFieldName = "email";
		dbFieldValue = params.email;
		if (userRole === "school-admin") {
			schoolId = sessionData.school_id;
		}
		verboseErrorReporting = true;
	} else {
		ctx.throw(400, "Bad parameters");
	}
	const result = await resendRegistrationEmail(ctx.appDbQuery.bind(ctx), dbFieldName, dbFieldValue, schoolId, userId);

	if (!result.success) {
		return {
			result: false,
			user: verboseErrorReporting ? result.user : null,
		};
	}
	return {
		result: true,
	};
};
