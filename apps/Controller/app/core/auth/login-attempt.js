const sendLoginSecurityEmail = require("./common/sendLoginSecurityEmail");
const getLookup = require("./common/getLookup");
let lookup = null;

// Should we send the "did you just log in with a different device?" email?
const getShouldSendEmail = async (querier, email, location) => {
	/**
	 * Send email if and only if:
	 * 1. The user has successfully logged in at least once.
	 * 2. The user is attempting to log in from a location that they haven't succesfully logged in from before.
	 */
	const result = await querier(
		`
			SELECT
				location,
				BOOL_OR(is_successful) AS did_succeed
			FROM
				login_attempt
			WHERE
				email = $1
			GROUP BY
				location
		`,
		[email]
	);
	let hasSuccessfullyLoggedIn = false;
	for (const row of result.rows) {
		if (row.did_succeed) {
			hasSuccessfullyLoggedIn = true;
			break;
		}
	}
	if (!hasSuccessfullyLoggedIn) {
		// user has not successfully logged in before - do not send
		return false;
	}
	let foundLocation = null;
	for (const row of result.rows) {
		if (row.location === location) {
			foundLocation = row;
			break;
		}
	}
	if (foundLocation && foundLocation.did_succeed) {
		// user has successfully logged in from this location before - do not send
		return false;
	}
	/**
	 * At this point, the user has either not attempted to log in from this
	 * location before, or HAS attempted to log in from this location but not
	 * successfully.
	 * Send the email.
	 */
	return true;
};

module.exports = async (ctx, userId, email, firstName, isSuccessfulLogin, isSecurityEmailEnabled, sendEmail, additionalInfo) => {
	if (!lookup) {
		lookup = await getLookup();
		if (!lookup) {
			ctx.throw(500, "Error logging in [4]");
		}
	}
	const ip = ctx.getClientIp();
	const userAgent = ctx._koaCtx.request.header["user-agent"];
	// let geoData = lookup.get('14.137.0.10'); // Australia
	// let geoData = lookup.get('5.196.125.50'); // Germany
	const geoData = lookup.get(ip);
	let location;

	if (geoData && geoData.country && geoData.country.names) {
		location = geoData.country.names.en;
	} else {
		location = "";
	}

	if (isSecurityEmailEnabled) {
		if (await getShouldSendEmail(ctx.appDbQuery.bind(ctx), email, location)) {
			const token = (
				await ctx.appDbQuery(
					`
					INSERT INTO
						login_security_token
						(user_id)
					VALUES
						($1)
					RETURNING
						oid
				`,
					[userId]
				)
			).rows[0].oid;
			await sendLoginSecurityEmail(sendEmail, email, firstName, token);
		}
	}

	/**
	 * When someone logs in successfully, set 'used_for_rate_limiting' to FALSE for their login attempts (same email)
	 * for the last five minutes so that it effectively 'resets' their login history in terms of rate limiting.
	 * This is how we implement the check for whether the user has *CONSECUTIVELY* signed in incorrectly X times in the
	 * last five minutes. Without this, a user could sign in incorrectly 4 times, then sign in correctly, and then sign
	 * in incorrectly, and then be prevented from signing in because they reached the '5 incorrect attempts in the last
	 * five minutes' limit!
	 */
	if (isSuccessfulLogin) {
		await ctx.appDbQuery(
			`
				UPDATE
					login_attempt
				SET
					used_for_rate_limiting = FALSE
				WHERE
					email = $1
					AND date_created >= NOW() - INTERVAL '5 minutes'
					AND used_for_rate_limiting = TRUE
			`,
			[email]
		);
	}

	await ctx.appDbQuery(
		`
			INSERT INTO
				login_attempt
				(
					email,
					ip_address,
					user_agent,
					location,
					is_successful,
					additional_info,
					date_created
				)
				VALUES
				(
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					NOW()
				)
		`,
		[email, ip, userAgent, location, isSuccessfulLogin, additionalInfo]
	);
};
