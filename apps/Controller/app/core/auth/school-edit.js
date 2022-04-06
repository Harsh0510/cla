const ensure = require("#tvf-ensure");

const inputStringIsValid = require("../../common/inputStringIsValid");
const RegExPatterns = require("../../common/RegExPatterns");

const byId = require("../../common/byId");
const levelsById = byId(require("../../common/school-levels"));

const wondeSchoolUpdatableFields = new Set(require("../../common/wonde/schoolUpdatableFields"));

/**
 * Get all Institution details for a particular admin
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	// Validate inputs
	const updateFields = [];
	const values = [];
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("name")) {
		inputStringIsValid.nameIsValid(ctx, params.name, "Name", RegExPatterns.common);
		inputStringIsValid.lengthIsValid(ctx, params.name, "Name", 1, 200);
		numFieldsChanged++;
		updateFields.push(`name = $${values.push(params.name)}`);
	}
	if (params.hasOwnProperty("address1")) {
		inputStringIsValid.nameIsValid(ctx, params.address1, "Address (1)", RegExPatterns.common);
		inputStringIsValid.lengthIsValid(ctx, params.address1, "Address (1)", 1, 200);
		numFieldsChanged++;
		updateFields.push(`address1 = $${values.push(params.address1)}`);
	}
	if (params.hasOwnProperty("address2")) {
		if (params.address2) {
			inputStringIsValid.nameIsValid(ctx, params.address2, "Address (2)", RegExPatterns.common);
			inputStringIsValid.lengthIsValid(ctx, params.address2, "Address (2)", 1, 200);
		}
		numFieldsChanged++;
		updateFields.push(`address2 = $${values.push(params.address2)}`);
	}
	if (params.hasOwnProperty("city")) {
		inputStringIsValid.nameIsValid(ctx, params.city, "Town/City", RegExPatterns.common);
		inputStringIsValid.lengthIsValid(ctx, params.city, "Town/City", 1, 200);
		numFieldsChanged++;
		updateFields.push(`city = $${values.push(params.city)}`);
	}
	if (params.hasOwnProperty("post_code")) {
		inputStringIsValid.isAlphaNumeric(ctx, params.post_code, "Post Code");
		inputStringIsValid.lengthIsValid(ctx, params.post_code, "Post Code", 1, 8);
		numFieldsChanged++;
		updateFields.push(`post_code = $${values.push(params.post_code.slice(0, 15))}`);
	}
	if (params.hasOwnProperty("country")) {
		ensure.nonEmptyStr(ctx, params.country, "Country");
		numFieldsChanged++;
		updateFields.push(`country_iso2 = $${values.push(params.country)}`);
	}
	if (params.hasOwnProperty("local_authority")) {
		numFieldsChanged++;
		if (params.local_authority) {
			inputStringIsValid.nameIsValid(ctx, params.local_authority, "Local Authority", RegExPatterns.name);
			inputStringIsValid.lengthIsValid(ctx, params.local_authority, "Local Authority", 1, 100);
			updateFields.push(`local_authority = $${values.push(params.local_authority)}`);
		} else {
			updateFields.push(`local_authority = NULL`);
		}
	}
	if (params.hasOwnProperty("school_level")) {
		ensure.nonEmptyStr(ctx, params.school_level, "Institution Level");
		ctx.assert(levelsById[params.school_level], 400, "Institution level not found");
		numFieldsChanged++;
		updateFields.push(`school_level = $${values.push(params.school_level)}`);
	}
	if (params.hasOwnProperty("school_home_page")) {
		numFieldsChanged++;
		if (params.school_home_page) {
			ensure.nonEmptyStr(ctx, params.school_home_page, "Institution Homepage");
			updateFields.push(`school_home_page = $${values.push(params.school_home_page)}`);
		} else {
			updateFields.push(`school_home_page = NULL`);
		}
	}
	if (params.hasOwnProperty("number_of_students")) {
		numFieldsChanged++;
		if (params.number_of_students) {
			inputStringIsValid.nonNegativeIntegerWithMinMax(ctx, params.number_of_students, "Number of Students", 1, 10000);
			updateFields.push(`number_of_students = $${values.push(params.number_of_students)}`);
		} else {
			updateFields.push(`number_of_students = NULL`);
		}
	}

	updateFields.push(`modified_by_user_id = $${values.push(sessionData.user_id)}`);
	updateFields.push(`date_edited = NOW()`);

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}
	{
		let tryingToEditBlockedFields = false;
		for (const key in params) {
			if (params.hasOwnProperty(key) && wondeSchoolUpdatableFields.has(key)) {
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
						school
					WHERE
						id = $1
				`,
				[sessionData.school_id]
			);
			ctx.assert(canEdit.rows[0].can_edit, 400, "Cannot edit record");
		}
	}

	// Add school ID from session data to the values for the query
	values.push(sessionData.school_id);
	const schoolIdIndex = values.length;

	await ctx.appDbQuery(
		`
		UPDATE
			school
		SET
			${updateFields.join(",")}
		WHERE
			id = $${schoolIdIndex}
	`,
		values
	);

	return { result: true };
};
