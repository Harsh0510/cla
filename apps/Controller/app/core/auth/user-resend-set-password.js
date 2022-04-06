const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const sendSetPasswordEmail = require("./common/sendSetPasswordEmail");

module.exports = async function (params, ctx, sendEmail) {
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData ? sessionData.user_role : null;
	const currUserId = sessionData ? parseInt(sessionData.user_id, 10) || 0 : 0;
	const updateFields = [];
	const whereClauses = [];
	const whereClausesIdentifier = [];
	const values = [];
	const valuesIdentifier = [];

	if (!params.setPasswordPage && (userRole === "cla-admin" || userRole === "school-admin")) {
		// Admins just supply the user's email address (so they can edit other users' accounts).
		ensure.isEmail(ctx, params.email, "Email");
		const email = params.email.toLowerCase();
		values.push(email);
		valuesIdentifier.push(email);
		whereClauses.push(`(email = $${values.length})`);
		whereClausesIdentifier.push(`(email = $${valuesIdentifier.length})`);
	} else {
		// But teachers and non-logged-in users have to provide the token (so they can only edit their own account).
		ensure.validIdentifier(ctx, params.token, "Activation token");
		values.push(params.token);
		valuesIdentifier.push(params.token);
		whereClauses.push(`(password_reset_token = $${values.length})`);
		whereClausesIdentifier.push(`(password_reset_token = $${valuesIdentifier.length})`);
	}

	const token = await tvfUtil.generateObjectIdentifier();

	values.push(token);
	updateFields.push(`password_reset_token = $${values.length}`);
	updateFields.push(`password_reset_expiry = NOW() + interval '1 day'`);
	//Setting date_last_registration_activity to NOW() as after the query is executed email for setting password will be sent to user
	updateFields.push(`date_last_registration_activity = NOW()`);
	updateFields.push(`date_edited = NOW()`);
	updateFields.push(`modified_by_user_id = ${currUserId ? currUserId : "id"}`);

	if (userRole === "school-admin") {
		// School Admins must provide their school ID.
		// CLA Admins don't need to provide a school ID because they can administate any account.
		// Teachers also don't have to provide their school ID because they have to supply a token, which only allows editing one account (theirs).
		let schoolId = sessionData.school_id;
		ensure.nonNegativeInteger(ctx, schoolId, "Institution");
		values.push(schoolId);
		valuesIdentifier.push(schoolId);
		whereClauses.push(`(school_id = $${values.length})`);
		whereClausesIdentifier.push(`(school_id = $${valuesIdentifier.length})`);
	}

	whereClauses.push(`(activation_token IS NULL)`, `(is_pending_approval = FALSE)`);

	let query = `
		UPDATE
			cla_user
		SET
			${updateFields.join(", ")}
		WHERE
			${whereClauses.join(" AND ")}
		RETURNING
			title,
			last_name,
			email
	`;

	let didUpdate = false;
	let result;
	try {
		result = await ctx.appDbQuery(query, values);
		didUpdate = result.rowCount > 0;
	} catch (e) {
		ctx.throw(400, `Could not resend email [1]`);
	}

	if (!didUpdate) {
		const q = `
			SELECT
				cla_user.first_name AS first_name,
				cla_user.last_name AS last_name,
				cla_user.title AS title,
				cla_user.email AS email,
				school.name AS school
			FROM
				cla_user
				LEFT JOIN school
					ON cla_user.school_id = school.id
			WHERE
				${whereClausesIdentifier.join(" AND ")}
		`;
		const userDataResults = await ctx.appDbQuery(q, valuesIdentifier);
		return {
			result: false,
			user: userDataResults.rowCount > 0 ? userDataResults.rows[0] : null,
		};
	}

	const userDetails = result.rows[0];

	try {
		await sendSetPasswordEmail(sendEmail, userDetails.email, token, userDetails.title, userDetails.last_name);
	} catch (e) {
		ctx.throw(400, `Could not resend email [2]`);
	}

	return {
		result: true,
	};
};
