const tvfUtil = require("#tvf-util");

const sendEmail = require("../../../common/sendEmail");

const sendVerifyEmail = require("../common/sendVerifyEmail");
const sendNewVerifyEmail = require("../common/sendNewVerifyEmail");
const sendActivateEmail = require("../common/sendActivateEmail");
const sendTrustedVerifyEmail = require("../common/sendTrustedVerifyEmail");

module.exports = async (querier, dbFieldName, dbFieldValue, schoolId, currUserId) => {
	let field;
	if (dbFieldName === "id") {
		field = "id";
	} else if (dbFieldName === "email") {
		field = "email";
	} else if (dbFieldName === "activation_token") {
		field = "activation_token";
	} else {
		return {
			success: false,
			error: "invalid_params",
		};
	}
	const binds = [];
	const whereClauses = [`(cla_user.${field} = $${binds.push(dbFieldValue)})`];
	if (schoolId) {
		whereClauses.push(`(school.id = $${binds.push(schoolId)})`);
	}
	const result = await querier(
		`
			SELECT
				cla_user.id AS id,
				cla_user.title AS title,
				cla_user.first_name AS first_name,
				cla_user.last_name AS last_name,
				cla_user.email AS email,
				cla_user.status AS status,
				cla_user.trusted_domain_registered_with AS trusted_domain_registered_with,
				cla_user.password_hash IS NOT NULL AS has_password,
				cla_user.registered_with_approved_domain AS registered_with_approved_domain,
				school.name AS school,
				cla_user.source AS source
			FROM
				cla_user
			LEFT JOIN school
				ON school.id = cla_user.school_id
			WHERE
				${whereClauses.join(" AND ")}
		`,
		binds
	);
	if (!result.rowCount) {
		return {
			success: false,
			error: "no_user",
		};
	}
	const user = result.rows[0];
	if (!user.school) {
		return {
			success: false,
			error: "no_school_found",
			user: user,
		};
	}
	if (user.status === "registered") {
		return {
			success: false,
			error: "already_registered",
			user: user,
		};
	}
	if (user.status !== "unverified" && user.status !== "approved") {
		return {
			success: false,
			error: "user_has_incorrect_status",
			user: user,
		};
	}
	const token = await tvfUtil.generateObjectIdentifier();
	const updateResult = await querier(
		`
			UPDATE
				cla_user
			SET
				activation_token = $1,
				activation_token_expiry = NOW() + interval '3 days',
				date_last_registration_activity = NOW(),
				date_edited = NOW(),
				modified_by_user_id = ${currUserId ? currUserId : "id"}
			WHERE
				id = $2
				AND status <> 'registered'
		`,
		[token, user.id]
	);
	if (!updateResult.rowCount) {
		return {
			success: false,
			error: "no_user",
			user: user,
		};
	}
	if (user.status === "unverified") {
		// unverified - registered with a unknown email domain OR a trusted domain (but not an approved domain) OR a HWB user that hasn't completed the merge process yet
		if (user.source === "hwb") {
			// TODO
			return {
				success: false,
				error: "not_yet_implemented",
				user: user,
			};
		} else if (user.has_password) {
			// send NEW verify email
			if (user.trusted_domain_registered_with) {
				// resgistered with trusted domain
				await sendTrustedVerifyEmail(sendEmail, user.email, token, user.first_name, user.school);
			} else {
				// registered with unknown domain (not trusted, not approved)
				await sendNewVerifyEmail(sendEmail, user.email, token, user.first_name);
			}
		} else {
			if (user.registered_with_approved_domain) {
				await sendActivateEmail(sendEmail, user.email, token, user.title, user.last_name);
			} else {
				// send OLD/original 'verify' email
				await sendVerifyEmail(sendEmail, user.email, token);
			}
		}
	} else {
		// status=approved - registered with an approved email domain, OR
		// this is a user that was created in the admin section
		if (user.has_password) {
			// send NEW approved email (approved domain)
			await sendTrustedVerifyEmail(sendEmail, user.email, token, user.first_name, user.school);
		} else {
			/**
			 * User has no password set, so they were either created in the admin section or
			 * they registered with an approved domain before the 'immediate password creation' epic.
			 * Send OLD/original 'activate' email
			 */
			await sendActivateEmail(sendEmail, user.email, token, user.title, user.last_name);
		}
	}
	return {
		success: true,
	};
};
