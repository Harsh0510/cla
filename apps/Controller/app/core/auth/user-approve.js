const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");

const sendSetPasswordEmail = require("./common/sendSetPasswordEmail");
const sendNewPostApprovalEmail = require("./common/sendNewPostApprovalEmail");

module.exports = async function (params, ctx, sendEmail) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	const schoolId = sessionData.school_id;

	// validate school_id
	if (userRole === "school-admin") {
		ensure.nonNegativeInteger(ctx, schoolId, "Institution");
	}

	ensure.isEmail(ctx, params.email, "Email");
	ensure.nonEmptyStr(ctx, params.role, "Role");

	// ensure role exists
	ctx.assert(params.role === "teacher" || params.role === "school-admin", 400, "Role not found");

	const email = params.email.toLowerCase().trim();

	const user = await (async () => {
		const binds = [];
		const whereClauses = [];
		whereClauses.push(`(cla_user.email = $${binds.push(email)})`);
		if (userRole === "school-admin") {
			whereClauses.push(`(cla_user.school_id = $${binds.push(schoolId)})`);
		}
		whereClauses.push(`(cla_user.is_pending_approval = TRUE)`);
		const u = (
			await ctx.appDbQuery(
				`
				SELECT
					cla_user.id AS id,
					cla_user.password_hash IS NOT NULL AS has_password,
					school.name AS school,
					cla_user.hwb_user_identifier IS NOT NULL AS is_external
				FROM
					cla_user
				INNER JOIN school
					ON school.id = cla_user.school_id
				WHERE
					${whereClauses.join(`AND`)}
			`,
				binds
			)
		).rows[0];
		ctx.assert(u, 400, `User is already approved`);
		ctx.assert(!u.is_external, 400, `External users may not be approved`);
		return u;
	})();

	const binds = [];
	const updateFields = [
		`is_pending_approval = FALSE`,
		`date_status_changed = NOW()`,
		`date_last_registration_activity = NOW()`,
		`role = $${binds.push(params.role)}`,
		`date_edited = NOW()`,
		`modified_by_user_id = $${binds.push(sessionData.user_id)}`,
	];
	let token;
	if (user.has_password) {
		updateFields.push(`status = 'registered'`, `date_transitioned_to_registered = NOW()`);
	} else {
		token = await tvfUtil.generateObjectIdentifier();
		updateFields.push(
			`status = 'approved'`,
			`date_transitioned_to_approved = NOW()`,
			`password_reset_token = $${binds.push(token)}`,
			`password_reset_expiry = NOW() + interval '1 day'`
		);
	}

	const result = await ctx.appDbQuery(
		`
			UPDATE
				cla_user
			SET
				${updateFields.join(",")}
			WHERE
				id = ${user.id}
				AND is_pending_approval = TRUE
				AND hwb_user_identifier IS NULL
			RETURNING
				title,
				first_name,
				last_name,
				email,
				trusted_domain_registered_with,
				school_id
		`,
		binds
	);
	const didUpdate = result.rowCount > 0;

	ctx.assert(didUpdate, 400, `User is already approved`);

	const userDetails = result.rows[0];

	if (userDetails.trusted_domain_registered_with) {
		const userEmailDomain = userDetails.email.split("@").pop();
		if (userEmailDomain !== userDetails.trusted_domain_registered_with) {
			await ctx.appDbQuery(
				`
					INSERT INTO
						approved_domain
						(domain, school_id)
					VALUES
						($1, $2)
					ON CONFLICT DO NOTHING
				`,
				[userEmailDomain, userDetails.school_id]
			);
		}
	}

	if (user.has_password) {
		// User registered with the new flow (after immediate password epic)
		// Send new mail.
		await sendNewPostApprovalEmail(sendEmail, userDetails.email, userDetails.first_name, user.school);
	} else {
		// User registered with the old flow (before immediate password epic)
		// Send old 'set password' mail.
		await sendSetPasswordEmail(sendEmail, userDetails.email, token, userDetails.title, userDetails.last_name);
	}

	return {
		result: true,
	};
};
