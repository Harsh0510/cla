const ensure = require("#tvf-ensure");
const tvfUtil = require("#tvf-util");
const titles = require("../common/getTitles")();
const inputStringIsValid = require("../../../common/inputStringIsValid");
const RegExPatterns = require("../../../common/RegExPatterns");
const sendActivateEmail = require("../common/sendActivateEmail");
const { activationTokenExpiryLimitInDays } = require("../../../common/staticValues");

module.exports = async function (params, ctx, sendEmail) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	// validate inputs
	ensure.isEmail(ctx, params.email, "Email");
	inputStringIsValid.lengthIsValid(ctx, params.email, "Email", null, 255);
	ensure.nonEmptyStr(ctx, params.title, "Title");
	const paramsTitle = (() => {
		const t = params.title.trim();
		if (!t) {
			return t;
		}
		return t[0].toUpperCase() + t.slice(1).toLowerCase();
	})();
	ctx.assert(titles[paramsTitle], 400, "Title not found");
	//ensure.nonEmptyStr(ctx, params.first_name, 'First name');
	inputStringIsValid.nameIsValid(ctx, params.first_name, "First name", RegExPatterns.name);
	inputStringIsValid.lengthIsValid(ctx, params.first_name, "First name", null, 100);
	//ensure.nonEmptyStr(ctx, params.last_name, 'Last name');
	inputStringIsValid.nameIsValid(ctx, params.last_name, "Last name", RegExPatterns.name);
	inputStringIsValid.lengthIsValid(ctx, params.last_name, "Last name", null, 100);
	ensure.nonEmptyStr(ctx, params.role, "Role");
	/**  Error when school-admin try to add the cla-admin user */
	if (userRole === "school-admin") {
		ctx.assert(params.role != "cla-admin", 403, "You do not have the permission for create the user with cla-admin role.");
	}

	let schoolId = 0;

	if (userRole === "school-admin") {
		// school-admins create users for their institution only
		ctx.assert(sessionData.school_id, 400, "school_id not provided");
		schoolId = sessionData.school_id;
	} else {
		// cla-admins can create users under any institution, but they have to provide the school ID
		ctx.assert(params.school_id, 400, "school_id not provided");
		schoolId = params.school_id;
	}
	ensure.nonNegativeInteger(ctx, schoolId, "Institution");

	let jobTitle = null;
	if (params.job_title && typeof params.job_title === "string") {
		ctx.assert(params.job_title.length <= 64, 400, "Job title may not exceed 64 characters");
		jobTitle = params.job_title;
	}

	{
		// ensure that the supplied role exists
		let roleResults = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS count
				FROM
					cla_role
				WHERE
					code = $1
			`,
			[params.role]
		);

		if (!(roleResults && roleResults.rows && roleResults.rows.length === 1 && parseInt(roleResults.rows[0].count, 10) > 0)) {
			ctx.throw(400, "Role not found");
		}
	}

	{
		// ensure the supplied institution exists
		let schoolResults = await ctx.appDbQuery(
			`
				SELECT
					id
				FROM
					school
				WHERE
					id = $1
			`,
			[schoolId]
		);

		// validate school
		if (!(schoolResults && schoolResults.rows && schoolResults.rows.length === 1)) {
			ctx.throw(400, "Institution not found");
		}
	}

	const token = await tvfUtil.generateObjectIdentifier();
	let result;

	try {
		// Perform only a single query so we don't have to worry about transactions.
		// If it's change, You may also need to change into the admin/async_task/wonde/syncSchoolData/route.js
		result = await ctx.appDbQuery(
			`
				INSERT INTO
					cla_user
					(
						email,
						first_name,
						last_name,
						role,
						source,
						school_id,
						activation_token,
						activation_token_expiry,
						title,
						date_status_changed,
						date_last_registration_activity,
						job_title,
						is_pending_approval,
						registered_with_approved_domain,
						status,
						date_transitioned_to_approved
					)
				VALUES
					(

						$1,
						$2,
						$3,
						$4,
						$5,
						$6,
						$7,
						NOW() + interval '${activationTokenExpiryLimitInDays} days',
						$8,
						NOW(),
						NOW(),
						$9,
						$10,
						$11,
						'approved',
						NOW()
					)
				RETURNING
					id
			`,
			[params.email.toLowerCase(), params.first_name, params.last_name, params.role, "local", schoolId, token, paramsTitle, jobTitle, false, true]
		);
		// only one result should be returned
		ctx.assert(result.rows.length === 1, 500, "Unknown error [2]");
	} catch (e) {
		// prevent users from having the same email address
		if (e.message.indexOf("violates unique constraint") >= 0) {
			ctx.throw(400, "A user with that email already exists");
		} else {
			ctx.throw(500, "Error creating user [2]");
		}
	}

	try {
		let schoolResults = await ctx.appDbQuery(
			`
				SELECT
					name
				FROM
					school WHERE id = $1
			`,
			[schoolId]
		);

		if (schoolResults && schoolResults.rows && schoolResults.rows.length && schoolResults.rows[0].name) {
			await sendActivateEmail(sendEmail, params.email.toLowerCase(), token, paramsTitle, params.last_name, schoolResults.rows[0].name);
		} else {
			ctx.throw(400, `Could not reset password [2]`);
		}
	} catch (e) {
		ctx.throw(400, `Could not reset password [3]`);
	}

	return {
		success: true,
	};
};
