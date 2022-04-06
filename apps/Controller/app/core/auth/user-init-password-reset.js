const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");

const getUrl = require("../../common/getUrl");
const isEmailLocked = require("./common/isEmailLocked");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../common/sendEmailData");
const sendActivateEmail = require("./common/sendActivateEmail");
const { userRoles, userStatus, activationTokenExpiryLimitInDays } = require("../../common/staticValues");
// wait for a random period between 100ms and 250ms
const waitRandom = () => new Promise((resolve) => setTimeout(resolve, Math.floor(100 + Math.random() * 150)));

const secondaryContent =
	`For your security, this link will expire in 24 hours.<br/>If you didn't request a change of password, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a>.` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = async function (params, ctx, sendEmail) {
	ensure.isEmail(ctx, params.email, "Email");

	/**
	 * Wait for a random period between 100 and 250ms.
	 * Makes it harder for a malicious person to check whether a user exists by checking how long it takes the API to respond to requests.
	 **/

	await waitRandom();

	const email = params.email.toLowerCase();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData ? sessionData.user_role : null;
	const currUserId = sessionData ? parseInt(sessionData.user_id, 10) || 0 : 0;

	if (await isEmailLocked(ctx.appDbQuery.bind(ctx), email)) {
		return {
			result: userRole !== userRoles.claAdmin && userRole !== userRoles.schoolAdmin,
			message: "Email account temporarily locked",
		};
	}

	const token = await tvfUtil.generateObjectIdentifier();

	const query = `
		UPDATE
			cla_user
		SET
			password_reset_token = $1,
			password_reset_expiry = NOW() + interval '1 day',
			date_edited = NOW(),
			modified_by_user_id = ${currUserId ? currUserId : "id"},
			date_last_registration_activity = NOW()
		WHERE
			email = $2
			AND password_hash IS NOT NULL
			AND status <> $3
		RETURNING
			school_id
		`;
	const values = [token, email, userStatus.unverified];

	let didUpdateRegisteredUser = false;
	let didUpdateUnregisteredUser;
	let unregisteredUser;
	{
		const registeredUser = await ctx.appDbQuery(query, values);
		unregisteredUser = await ctx.appDbQuery(
			`
				UPDATE
					cla_user
				SET
					activation_token = encode(gen_random_bytes(18), 'hex'),
					activation_token_expiry = NOW() + INTERVAL '${activationTokenExpiryLimitInDays} day',
					date_edited = NOW(),
					modified_by_user_id = ${currUserId ? currUserId : "id"},
					date_status_changed = NOW(),
					date_last_registration_activity = NOW()
				WHERE
					email = $1
					AND status = $2
					AND password_hash IS NULL
				RETURNING
					title,
					last_name,
					school_id,
					id,
					activation_token
			`,
			[email, userStatus.approved]
		);
		didUpdateRegisteredUser = registeredUser.rowCount > 0;
		didUpdateUnregisteredUser = unregisteredUser.rowCount > 0;
	}

	{
		if (didUpdateRegisteredUser) {
			const pwUrl = getUrl(`/auth/reset-password/${token}`);
			await sendEmail.sendTemplate(
				null,
				email,
				`Education Platform: Reset Your Password`,
				{
					title: "Reset Your Password",
					content: `You have received this message because you chose to reset your password on The Education Platform.<br/>Please click the link below to reset your password.`,
					cta: {
						title: `Reset Your Password`,
						url: pwUrl,
					},
					secondary_content: secondaryContent,
				},
				null,
				"user-init-password-reset"
			);
		} else if (didUpdateUnregisteredUser) {
			const schoolResults = (
				await ctx.appDbQuery(
					`
					SELECT
						name
					FROM
						school
					WHERE
						id = $1
				`,
					[unregisteredUser.rows[0].school_id]
				)
			).rows;
			await sendActivateEmail(
				sendEmail,
				email,
				unregisteredUser.rows[0].activation_token,
				unregisteredUser.rows[0].title,
				unregisteredUser.rows[0].last_name,
				schoolResults.length ? schoolResults[0].name : null
			);
		}
	}

	let ret;
	if (userRole === userRoles.claAdmin) {
		// If the current user is a CLA admin, then genuinely return whether a password reset or activation reminder was sent...
		ret = didUpdateRegisteredUser || didUpdateUnregisteredUser;
	} else if (userRole === userRoles.schoolAdmin) {
		// If current user is a school admin, then only return whether a password reset or activation reminder was genuinely sent if the target user is in the same school.
		if (didUpdateRegisteredUser || didUpdateUnregisteredUser) {
			// Email sent - return TRUE
			ret = true;
		} else {
			// Email NOT sent - *only* return FALSE if the target user is in the same school
			const result = await ctx.appDbQuery(`SELECT school_id FROM cla_user WHERE email = $1`, [email]);
			if (result.rowCount === 0) {
				// No user found - just return TRUE.
				ret = true;
			} else {
				const sessionData = await ctx.getSessionData();
				if (result.rows[0].school_id == sessionData.school_id) {
					// Target user is in the same school, so we can safely return FALSE.
					ret = false;
				} else {
					// Target user is NOT in the same school, so we return TRUE.
					ret = true;
				}
			}
		}
	} else {
		// Otherwise (non-logged in or teacher accounts), always return TRUE.
		ret = true;
	}

	return {
		result: ret,
	};
};
