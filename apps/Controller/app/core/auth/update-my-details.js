const ensure = require("#tvf-ensure");
const titles = require("./common/getTitles")();
const inputStringIsValid = require("../../common/inputStringIsValid");
const RegExPatterns = require("../../common/RegExPatterns");
const { emailNotificationCategory } = require("../../common/staticValues");

const wondeUserUpdatableFields = new Set(require("../../common/wonde/userUpdatableFields"));

const emailNotificationCategoryByName = Object.create(null);
for (const key in emailNotificationCategory) {
	if (emailNotificationCategory.hasOwnProperty(key)) {
		emailNotificationCategoryByName[emailNotificationCategory[key]] = true;
	}
}

async function updateUserDetails(userId, params, ctx) {
	const updateFields = [];
	const values = [];
	const whereClauses = [];
	let isResetFlyoutSeen = false;

	if (params.hasOwnProperty("title")) {
		updateFields.push(`title = $${values.push(params.title)}`);
	}

	if (params.hasOwnProperty("first_name")) {
		updateFields.push(`first_name = $${values.push(params.first_name)}`);
	}

	if (params.hasOwnProperty("last_name")) {
		updateFields.push(`last_name = $${values.push(params.last_name)}`);
	}

	if (params.hasOwnProperty("job_title")) {
		updateFields.push(`job_title = $${values.push(params.job_title)}`);
	}

	if (params.hasOwnProperty("name_display_preference")) {
		updateFields.push(`name_display_preference = $${values.push(params.name_display_preference ? params.name_display_preference : null)}`);
	}

	if (params.hasOwnProperty("receive_marketing_emails")) {
		updateFields.push(`receive_marketing_emails = $${values.push(!!params.receive_marketing_emails)}`);
	}

	if (params.hasOwnProperty("flyout_enabled")) {
		updateFields.push(`is_first_time_flyout_enabled = $${values.push(params.flyout_enabled)}`);
		isResetFlyoutSeen = true;
	}

	if (params.hasOwnProperty("email_opt_out")) {
		updateFields.push(`email_opt_out = $${values.push(`{${params.email_opt_out}}`)}`);
	}

	updateFields.push(`date_edited = NOW()`);
	updateFields.push(`modified_by_user_id = $${values.push(userId)}`);

	{
		whereClauses.push(`(id = $${values.push(userId)})`);
	}

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
						id = $1
				`,
				[userId]
			);
			ctx.assert(canEdit.rows[0].can_edit, 400, "Cannot edit record");
		}
	}

	const client = await ctx.getAppDbPool().connect();
	try {
		await client.query("BEGIN");

		await client.query(
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

		//remove user's flyout seen from user_flyout_seen
		if (isResetFlyoutSeen === true) {
			await ctx.appDbQuery(
				`
					DELETE FROM
						user_flyout_seen
					WHERE
						user_id = $1
				`,
				[userId]
			);
		}

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

async function updateNotificationCategories(userId, params, ctx) {
	// We're not actually checking whether the supplied category IDs exist.
	// That's okay though because we've already ensured that (a) IDs are numeric and positive (i.e. syntactically valid), (b) there are no more than 10 of them.
	// So the only person a malicious user can screw is themselves.
	const binds = [];
	const values = [];

	const nonHideableCategoryResults = await ctx.appDbQuery(
		`
			SELECT
				id
			FROM
				notification_category
			WHERE
				hideable = FALSE
		`
	);
	const nonHideableCategoryMap = Object.create(null);
	for (const nonHideableCategory of nonHideableCategoryResults.rows) {
		nonHideableCategoryMap[nonHideableCategory.id] = true;
	}

	for (const catId of params.disabled_categories) {
		if (!nonHideableCategoryMap[catId]) {
			const idx = binds.push(userId, catId);
			values.push(`($${idx - 1}, $${idx})`);
		}
	}

	const client = await ctx.getAppDbPool().connect();
	try {
		await client.query("BEGIN");

		await client.query(
			`
				DELETE FROM
					user_disabled_notification_categories
				WHERE
					user_id = ${userId}
			`
		);

		if (binds.length > 0) {
			await client.query(
				`
					INSERT INTO
						user_disabled_notification_categories
						(user_id, category_id)
					VALUES
						${values}
				`,
				binds
			);
		}

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.user_id > 0, 401, "Unauthorized");

	let numFieldsChanged = 0;
	let userTableChanged = false;
	let notificationCategoriesChanged = false;
	ensure.isEmail(ctx, params.email, "Email");

	if (params.hasOwnProperty("title")) {
		ensure.nonEmptyStr(ctx, params.title, "Title");
		ctx.assert(titles[params.title], 400, "Title not found");
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty("first_name")) {
		inputStringIsValid.nameIsValid(ctx, params.first_name, "First name", RegExPatterns.name);
		inputStringIsValid.lengthIsValid(ctx, params.first_name, "First name", null, 100);
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty("last_name")) {
		inputStringIsValid.nameIsValid(ctx, params.last_name, "Last name", RegExPatterns.name);
		inputStringIsValid.lengthIsValid(ctx, params.last_name, "Last name", null, 100);
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty("job_title")) {
		if (params.job_title) {
			ensure.nonEmptyStr(ctx, params.job_title, "Job title");
			ctx.assert(params.job_title.length <= 64, 400, `A job title must not exceed 64 characters.`);
		} else {
			params.job_title = null;
		}
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty("name_display_preference")) {
		ctx.assert(typeof params.name_display_preference === "string", 400, `Copy name invalid`);
		ctx.assert(params.name_display_preference.length <= 100, 400, `Your copy name must not exceed 100 characters.`);
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty("receive_marketing_emails")) {
		ctx.assert(typeof params.receive_marketing_emails === "boolean", 400, "Receive Marketing Emails should be a boolean");
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty(`disabled_categories`)) {
		ctx.assert(Array.isArray(params.disabled_categories), 400, `Disabled notification categories invalid`);
		ctx.assert(
			params.disabled_categories.filter((v) => !Number.isInteger(v) || v <= 0).length == 0,
			400,
			`Disabled notification categories must all be positive integers`
		);
		ctx.assert(params.disabled_categories.length <= 10, 400, `Too many disabled notification categories provided`);
		numFieldsChanged++;
		notificationCategoriesChanged = true;
	}

	if (params.hasOwnProperty("flyout_enabled")) {
		ctx.assert(typeof params.flyout_enabled === "boolean", 400, "Flyout enabled should be a boolean");
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (params.hasOwnProperty(`email_opt_out`)) {
		ctx.assert(Array.isArray(params.email_opt_out), 400, `Disabled email notification invalid`);
		ctx.assert(params.email_opt_out.length <= 10, 400, `Too many disabled email notification provided`);
		for (item of params.email_opt_out) {
			ctx.assert(emailNotificationCategoryByName[item], 400, `Disabled email notification has invalid values`);
		}
		const uniqueEmailOptOut = [...new Set(params.email_opt_out)];
		ctx.assert(uniqueEmailOptOut.length === params.email_opt_out.length, 400, `Disabled email notification has duplicate values`);
		numFieldsChanged++;
		userTableChanged = true;
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	if (userTableChanged) {
		await updateUserDetails(sessionData.user_id, params, ctx);
	}
	if (notificationCategoriesChanged) {
		await updateNotificationCategories(sessionData.user_id, params, ctx);
	}

	return {
		result: true,
	};
};
