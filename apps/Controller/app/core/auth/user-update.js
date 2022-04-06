const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const getUrl = require("../../common/getUrl");
const titles = require("./common/getTitles")();
const inputStringIsValid = require("../../common/inputStringIsValid");
const RegExPatterns = require("../../common/RegExPatterns");

const wondeUserUpdatableFields = new Set(require("../../common/wonde/userUpdatableFields"));

module.exports = async function (params, ctx, sendEmail) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;

	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	/**  Error when school-admin try to add the cla-admin user */
	if (userRole === "school-admin") {
		ctx.assert(params.role != "cla-admin", 403, "You do not have the permission for update the user with cla-admin role.");
	}

	ensure.isEmail(ctx, params.current_email, "Current email");

	let numFieldsChanged = 0;

	if (userRole === "cla-admin") {
		if (params.hasOwnProperty("school_id")) {
			ensure.nonNegativeInteger(ctx, params.school_id, "Institution");
			numFieldsChanged++;
		}
	}
	if (params.hasOwnProperty("email")) {
		ensure.isEmail(ctx, params.email, "Email");
		ctx.assert(params.email != params.current_email, 400, "Email unchanged");
		numFieldsChanged++;
	}
	if (params.hasOwnProperty("first_name")) {
		//ensure.nonEmptyStr(ctx, params.first_name, 'First name');
		inputStringIsValid.nameIsValid(ctx, params.first_name, "First name", RegExPatterns.name);
		inputStringIsValid.lengthIsValid(ctx, params.first_name, "First name", null, 100);
		numFieldsChanged++;
	}
	if (params.hasOwnProperty("last_name")) {
		//ensure.nonEmptyStr(ctx, params.last_name, 'Last name');
		inputStringIsValid.nameIsValid(ctx, params.last_name, "Last name", RegExPatterns.name);
		inputStringIsValid.lengthIsValid(ctx, params.last_name, "Last name", null, 100);
		numFieldsChanged++;
	}
	if (params.hasOwnProperty("role")) {
		ensure.nonEmptyStr(ctx, params.role, "Role");
		numFieldsChanged++;
	}
	if (params.hasOwnProperty("title")) {
		ensure.nonEmptyStr(ctx, params.title, "Title");
		ctx.assert(titles[params.title], 400, "Title not found");
		numFieldsChanged++;
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	let pendingEmailToken;
	const updateFields = [];
	const values = [];
	if (userRole === "cla-admin") {
		if (params.hasOwnProperty("school_id")) {
			updateFields.push(`school_id = $${values.push(params.school_id)}`);
		}
	}
	if (params.hasOwnProperty("email")) {
		updateFields.push(`pending_email = $${values.push(params.email.toLowerCase())}`);
		pendingEmailToken = await tvfUtil.generateObjectIdentifier();
		updateFields.push(`pending_email_token = $${values.push(pendingEmailToken)}`);
		updateFields.push(`pending_email_expiry = NOW() + interval '1 day'`);
	}
	if (params.hasOwnProperty("first_name")) {
		updateFields.push(`first_name = $${values.push(params.first_name)}`);
	}
	if (params.hasOwnProperty("last_name")) {
		updateFields.push(`last_name = $${values.push(params.last_name)}`);
	}
	if (params.hasOwnProperty("role")) {
		updateFields.push(`role = $${values.push(params.role)}`);
	}
	if (params.hasOwnProperty("title")) {
		updateFields.push(`title = $${values.push(params.title)}`);
	}
	updateFields.push(`modified_by_user_id = $${values.push(sessionData.user_id)}`);
	updateFields.push(`date_edited = NOW()`);
	values.push(params.current_email);

	{
		let tryingToEditBlockedFields = false;
		for (const key in params) {
			if (params.hasOwnProperty(key) && wondeUserUpdatableFields.has(key)) {
				tryingToEditBlockedFields = true;
				break;
			}
		}
		if (tryingToEditBlockedFields) {
			const canEdit = await ctx.appDbQuery(
				`
					SELECT
						wonde_identifier IS NULL AS can_edit
					FROM
						cla_user
					WHERE
						email = $1
				`,
				[params.current_email]
			);
			ctx.assert(canEdit.rows[0].can_edit, 400, "Cannot edit record");
		}
	}

	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		if (params.hasOwnProperty("role")) {
			let result = await client.query(
				`
					SELECT
						COUNT(*) AS _count_
					FROM
						cla_role
					WHERE
						code = $1
				`,
				[params.role]
			);
			if (result.rows[0]._count_ === 0) {
				ctx.throw(400, `Role not found`);
			}
		}

		if (userRole === "cla-admin") {
			if (params.hasOwnProperty("school_id")) {
				let result = await client.query(
					`
						SELECT
							COUNT(*) AS _count_
						FROM
							school
						WHERE
							id = $1
					`,
					[params.school_id]
				);
				if (result.rows[0]._count_ === 0) {
					ctx.throw(400, `Institution not found`);
				}
			}
		}

		if (params.hasOwnProperty("email")) {
			// clear out expired pending emails
			// TODO: should probably have this on user-create too?
			let whereClauses = [];

			whereClauses.push(`(pending_email_expiry <= NOW())`);
			let values = [];
			if (userRole === "school-admin") {
				values.push(sessionData.school_id);
				whereClauses.push(`(school_id = $${values.length})`);
			}

			await client.query(
				`
					UPDATE
						cla_user
					SET
						pending_email = NULL,
						pending_email_token = NULL,
						pending_email_expiry = NULL,
						date_edited = NOW(),
						modified_by_user_id = $${values.push(sessionData.user_id)}
					WHERE
						${whereClauses.join(" AND ")}
				`,
				values
			);
			let result;
			result = await client.query(`SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1`, [params.email.toLowerCase()]);
			if (result.rows[0]._count_ > 0) {
				ctx.throw(400, `A user with that email address already exists`);
			}
			result = await client.query(`SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`, [params.email.toLowerCase()]);
			if (result.rows[0]._count_ > 0) {
				ctx.throw(400, `A user with that email address already exists`);
			}
		}

		let whereClauses = [];
		whereClauses.push(`(email = $${values.length})`);
		if (userRole === "school-admin") {
			whereClauses.push(`(school_id = ${parseInt(sessionData.school_id, 10) || 0})`);
		}

		let result;
		try {
			result = await client.query(
				`
					UPDATE
						cla_user
					SET
						${updateFields.join(", ")}
					WHERE
						${whereClauses.join(" AND ")}
				`,
				values
			);
		} catch (e) {
			ctx.throw(400, "Could not update user");
		}
		if (result.rowCount === 0) {
			ctx.throw(400, "User not found");
		}

		if (params.hasOwnProperty("email")) {
			// send email
			const confirmUrl = getUrl(`/auth/confirm-email/${pendingEmailToken}`);
			await sendEmail.sendTemplate(
				null,
				params.current_email,
				`Education Platform: Change Of Email Address`,
				{
					content: `The email address for your account on the Education Platform was recently changed to ${params.email.toLowerCase()}. Please click the link below to confirm the change of address.`,
					cta: {
						title: `Confirm change`,
						url: confirmUrl,
					},
				},
				null,
				"user-email-update"
			);
		}

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
	return {
		result: true,
	};
};
