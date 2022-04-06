const ensure = require("#tvf-ensure");
const { statusById } = require("../../common/getAllStatuses");
const addDefaultClass = require("./common/addDefaultClass");
const validatePassword = require("../../common/validatePassword");
const getUrl = require("../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../common/sendEmailData");

const secondaryContent =
	`If it wasn't you who reset the password, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a>.` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = async function (params, ctx, genPasswordHash, sendEmail) {
	ensure.validIdentifier(ctx, params.token, "Token");
	let isTokenExpired = false;
	let tokenDoesExist = false;

	//Check token is expired or not
	const userDetails = await ctx.appDbQuery(
		`
			SELECT
				id,
				password_reset_token IS NOT NULL AS token_exists,
				password_reset_expiry <= NOW() AS is_token_expired,
				title,
				last_name,
				default_class_year_group,
				default_class_exam_board,
				school_id,
				status,
				password_hash
			FROM
				cla_user
			WHERE
				password_reset_token = $1
		`,
		[params.token]
	);

	if (userDetails.rows && userDetails.rows.length) {
		isTokenExpired = userDetails.rows[0].is_token_expired;
		tokenDoesExist = !!userDetails.rows[0].token_exists;
	}

	//check token is expired than throw message
	if (isTokenExpired || !tokenDoesExist) {
		ctx.throw(400, "Token Expired");
	}

	/* Check if the call is to validate token? if token is valid, then return */
	if (params.validateToken) {
		return true;
	}
	// Password Validation Check
	let passwordCheck = validatePassword(params.password);
	if (passwordCheck !== null) {
		ctx.throw(400, passwordCheck);
	}
	if (params.password !== params.password_confirm) {
		ctx.throw(400, "Passwords don't match");
	}

	const passwordHashDeets = await genPasswordHash(params.password);

	const updateFields = [];
	const values = [];
	const whereClauses = [];

	updateFields.push(`password_hash = $${values.push(passwordHashDeets.hash)}`);
	updateFields.push(`password_salt = $${values.push(passwordHashDeets.salt)}`);
	updateFields.push(`password_algo = $${values.push(passwordHashDeets.algo)}`);

	updateFields.push(`password_reset_token = NULL`);
	updateFields.push(`date_edited = NOW()`);
	updateFields.push(`modified_by_user_id = $${values.push(userDetails.rows[0].id)}`);

	// If User is changing password using forgot password do not update date_status_changed,status and date_transitioned_to_registered
	const isFinishingLegacyRegistrationProcess = Array.isArray(userDetails.rows) && userDetails.rows.length && !userDetails.rows[0].password_hash;

	if (isFinishingLegacyRegistrationProcess) {
		// User is setting their password for the first time.
		updateFields.push(`status = '${statusById.registered}'`);
		updateFields.push(`date_status_changed = NOW()`);
		updateFields.push(`date_transitioned_to_registered = NOW()`);
		updateFields.push(`date_created_initial_password = NOW()`);
		updateFields.push(`activation_token = NULL`);
	}

	whereClauses.push(`cla_user.id = $${values.push(userDetails.rows[0].id)}`);

	const updateResults = await ctx.appDbQuery(
		`
			UPDATE
				cla_user
			SET
				${updateFields.join(", ")}
			WHERE
				${whereClauses.join(" AND ")}
			RETURNING
				email
		`,
		values
	);

	const didUpdate = updateResults.rowCount > 0;
	if (didUpdate) {
		if (isFinishingLegacyRegistrationProcess) {
			// created default class when user set to registered status
			await addDefaultClass(ctx, userDetails.rows[0]);
		} else {
			// Only send this notification email if the user can access the website already - i.e. they're *not* setting their password for the first time.
			const email = updateResults.rows[0].email;
			await sendEmail.sendTemplate(
				null,
				email,
				`Education Platform: Your Password Has Been Reset`,
				{
					content: `Login using your new password now to continue using the Education Platform.`,
					cta: {
						title: "Log in now",
						url: getUrl("/sign-in"),
					},
					secondary_content: secondaryContent,
				},
				null,
				"user-complete-password-reset"
			);
		}
	}

	return {
		result: didUpdate,
	};
};
