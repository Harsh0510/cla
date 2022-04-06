/**
 * Log in an existing, activated user given an email and password.
 */
const crypto = require("crypto");

const ensure = require("#tvf-ensure");

const loginAttempt = require("./login-attempt");
const insertSessionData = require("./common/insertSessionData");
const { canCopySql } = require("./common/canCopy");
const isEmailLocked = require("./common/isEmailLocked");
const { emailNotificationCategory } = require("../../common/staticValues");

const INCORRECT_CREDENTIALS_MSG = `The email address or password is incorrect.`;
const INCORRECT_ATTEMPT_LIMIT_EXIST_MSG = `You have reached the maximum number of incorrect login attempts permitted. If there is an account on the Education Platform linked to this email address, this has now been locked. Please try again in 5 minutes.`;

module.exports = async function login(params, ctx, allowedPasswordAlgorithms, sendEmail) {
	ensure.isEmail(ctx, params.email, "Email");
	ensure.nonEmptyStr(ctx, params.password, "Password");
	const suppliedPassword = params.password.trim();

	let email = params.email.toLowerCase();

	// limit login attempts
	if (await isEmailLocked(ctx.appDbQuery.bind(ctx), email)) {
		ctx.throw(429, INCORRECT_ATTEMPT_LIMIT_EXIST_MSG);
	}

	const result = await ctx.appDbQuery(
		`
			SELECT
				cla_user.id AS id,
				cla_user.oid AS oid,
				cla_user.title AS title,
				cla_user.first_name AS first_name,
				cla_user.last_name AS last_name,
				cla_user.role AS role,
				cla_user.email AS email,
				cla_user.job_title AS job_title,
				cla_user.name_display_preference AS name_display_preference,
				cla_user.password_hash AS password_hash,
				cla_user.password_salt AS password_salt,
				cla_user.password_algo AS password_algo,
				school.id AS school_id,
				(NOT ('{${emailNotificationCategory.multipleLoginsDetected}}'::TEXT[] <@ cla_user.email_opt_out)) AS is_security_email_enabled,
				school.name AS school,
				school.academic_year_end_month AS academic_year_end_month,
				school.academic_year_end_day AS academic_year_end_day,
				cla_user.receive_marketing_emails AS receive_marketing_emails,
				cla_user.is_first_time_flyout_enabled AS flyout_enabled,
				${canCopySql()} AS can_copy,
				cla_user.activation_token IS NULL AS has_verified,
				cla_user.date_created_initial_password AS date_created,
				(cla_user.trusted_domain_registered_with IS NOT NULL OR cla_user.registered_with_approved_domain) AS has_trial_extract_access,
				CASE WHEN (cla_user.source = 'hwb' AND cla_user.status <> 'registered') THEN jsonb_build_object(
					'type', cla_user.hwb_match_type,
					'target_value', cla_user.hwb_match_email,
					'verification_sent', cla_user.hwb_merge_token IS NOT NULL
				) ELSE NULL END AS requires_merge_confirmation,
				school.school_level = 'post-16' AS is_fe_user,
				cla_user.email_opt_out AS email_opt_out
			FROM
				cla_user
				LEFT JOIN school
					ON cla_user.school_id = school.id
			WHERE
				cla_user.email = $1
				AND cla_user.password_hash IS NOT NULL
		`,
		[email]
	);

	// recording a login attempt if the user doesn't exist
	if (!result.rowCount) {
		await loginAttempt(ctx, null, email, null, false, false, sendEmail, "User doesn't exist");
		ctx.throw(400, INCORRECT_CREDENTIALS_MSG);
	}

	const userDetails = result.rows[0];
	ctx.assert(allowedPasswordAlgorithms[userDetails.password_algo], 500, "Error logging in [2]");

	const saltRandomBytes = Buffer.from(userDetails.password_salt, "hex");
	const hash = crypto.createHmac(userDetails.password_algo, saltRandomBytes);
	hash.update(suppliedPassword);
	const passwordHashHex = hash.digest("hex");

	const isSuccessfullLogin = passwordHashHex === userDetails.password_hash;
	const additionalInfo = isSuccessfullLogin ? "" : "Incorrect password";
	const isSecurityEmailEnabled = userDetails.is_security_email_enabled;

	// recording a login attempt if the user exists but the password is incorrect
	await loginAttempt(ctx, userDetails.id, email, userDetails.first_name, isSuccessfullLogin, isSecurityEmailEnabled, sendEmail, additionalInfo);

	/**
	 * Must give the exact same message for user not existing and for incorrect password credentials.
	 * This prevents leaking information about which users exist in the system.
	 */
	ctx.assert(passwordHashHex === userDetails.password_hash, 400, INCORRECT_CREDENTIALS_MSG);

	if (isSuccessfullLogin && userDetails.role !== "cla-admin" && !userDetails.school_id) {
		ctx.throw(400, INCORRECT_CREDENTIALS_MSG);
	}

	/**
	 * Communicate with Session Controller to initialize a session.
	 */
	const sessionToken = await insertSessionData(ctx, userDetails.id, {
		user_id: userDetails.id,
		user_role: userDetails.role,
		user_email: userDetails.email,
		school_id: userDetails.school_id,
		academic_year_end: [userDetails.academic_year_end_month, userDetails.academic_year_end_day],
		is_first_time_flyout_enabled: userDetails.is_first_time_flyout_enabled,
	});

	await ctx.addSessIdToResponse(sessionToken);

	return {
		oid: userDetails.oid,
		my_details: {
			title: userDetails.title,
			first_name: userDetails.first_name,
			last_name: userDetails.last_name,
			role: userDetails.role,
			school_id: userDetails.school_id,
			school: userDetails.school,
			email: userDetails.email,
			job_title: userDetails.job_title,
			name_display_preference: userDetails.name_display_preference,
			receive_marketing_emails: userDetails.receive_marketing_emails,
			flyout_enabled: userDetails.flyout_enabled,
			can_copy: userDetails.can_copy,
			has_verified: userDetails.has_verified,
			date_created: userDetails.date_created,
			is_fe_user: userDetails.is_fe_user,
			email_opt_out: userDetails.email_opt_out,

			// true if the user originally registered with a trusted or approved domain
			// and hence has trial extract access
			has_trial_extract_access: userDetails.has_trial_extract_access,

			requires_merge_confirmation: userDetails.requires_merge_confirmation,
		},
	};
};
