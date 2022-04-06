const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx, sendEmail) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	let schoolId = sessionData.school_id;
	if (userRole === "school-admin") {
		ensure.nonNegativeInteger(ctx, schoolId, "Institution");
	}

	ensure.isEmail(ctx, params.email, "Email");

	const whereClauses = [];
	const values = [];

	values.push(params.email.toLowerCase());
	whereClauses.push(`(email = $${values.length})`);

	if (userRole === "school-admin") {
		values.push(schoolId);
		whereClauses.push(`(school_id = $${values.length})`);
	}

	whereClauses.push(`(is_pending_approval = TRUE)`);
	whereClauses.push(`(hwb_user_identifier IS NULL)`);

	let query = `
		DELETE FROM
			cla_user
		WHERE
			${whereClauses.join(` AND `)}
		RETURNING
			cla_user.activation_token IS NULL AS was_activated
	`;

	let didDelete = false;
	let result;
	try {
		result = await ctx.appDbQuery(query, values);
		didDelete = result.rowCount > 0;
	} catch (e) {
		ctx.throw(400, `Could not reject user [1]`);
	}

	ctx.assert(didDelete, 400, `Cannot reject already approved user`);

	const wasActivated = result.rows[0].was_activated;

	if (wasActivated) {
		try {
			await sendEmail.sendTemplate(
				null,
				params.email.toLowerCase(),
				`Education Platform: Request Rejected`,
				`Your request to join the Education Platform was rejected.<br/>The institution administrator did not recognise this address.`,
				null,
				"user-reject"
			);
		} catch (e) {
			ctx.throw(400, `Could not send delete user [2]`);
		}
	}

	return {
		result: true,
	};
};
