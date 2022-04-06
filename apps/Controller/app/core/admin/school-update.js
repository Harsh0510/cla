const ensure = require("#tvf-ensure");
const byId = require("../../common/byId");

const territoriesById = byId(require("../../common/territories"));
const levelsById = byId(require("../../common/school-levels"));
const typesById = byId(require("../../common/school-types"));
const inputStringIsValid = require("../../common/inputStringIsValid");
const RegExPatterns = require("../../common/RegExPatterns");

const wondeSchoolUpdatableFields = new Set(require("../../common/wonde/schoolUpdatableFields"));

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	ensure.nonNegativeInteger(ctx, params.id, "ID");

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
	if (params.hasOwnProperty("county")) {
		numFieldsChanged++;
		if (params.county) {
			ensure.nonEmptyStr(ctx, params.county, "County");
			updateFields.push(`county = $${values.push(params.county)}`);
		} else {
			updateFields.push(`county = NULL`);
		}
	}
	if (params.hasOwnProperty("post_code")) {
		inputStringIsValid.isAlphaNumeric(ctx, params.post_code, "Post Code");
		inputStringIsValid.lengthIsValid(ctx, params.post_code, "Post Code", 1, 8);
		numFieldsChanged++;
		updateFields.push(`post_code = $${values.push(params.post_code.slice(0, 15))}`);
	}
	if (params.hasOwnProperty("territory")) {
		ensure.nonEmptyStr(ctx, params.territory, "Territory");
		ctx.assert(territoriesById[params.territory], 400, "Territory not found");
		numFieldsChanged++;
		updateFields.push(`territory = $${values.push(params.territory)}`);
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
	if (params.hasOwnProperty("school_type")) {
		numFieldsChanged++;
		if (params.school_type) {
			ensure.nonEmptyStr(ctx, params.school_type, "Institution Type");
			ctx.assert(typesById[params.school_type], 400, "Institution type not found");
			updateFields.push(`school_type = $${values.push(params.school_type)}`);
		} else {
			updateFields.push(`school_type = NULL`);
		}
	}
	if (params.hasOwnProperty("school_home_page")) {
		numFieldsChanged++;
		if (params.school_home_page) {
			ensure.nonEmptyStr(ctx, params.school_home_page, "Institution Home Page");
			updateFields.push(`school_home_page = $${values.push(params.school_home_page)}`);
		} else {
			updateFields.push(`school_home_page = NULL`);
		}
	}
	if (params.hasOwnProperty("number_of_students")) {
		numFieldsChanged++;
		if (params.number_of_students !== null && params.number_of_students !== "") {
			inputStringIsValid.nonNegativeIntegerWithMinMax(ctx, params.number_of_students, "Number of Students", 1, 10000);
			updateFields.push(`number_of_students = $${values.push(params.number_of_students)}`);
		} else {
			updateFields.push(`number_of_students = NULL`);
		}
	}
	if (params.hasOwnProperty("enable_wonde_user_sync")) {
		ctx.assert(typeof params.enable_wonde_user_sync === "boolean", 400, "enable_wonde_user_sync should be a boolean");
		numFieldsChanged++;
		updateFields.push(`enable_wonde_user_sync = $${values.push(params.enable_wonde_user_sync)}`);
	}
	if (params.hasOwnProperty("enable_wonde_class_sync")) {
		ctx.assert(typeof params.enable_wonde_class_sync === "boolean", 400, "enable_wonde_class_sync should be a boolean");
		numFieldsChanged++;
		updateFields.push(`enable_wonde_class_sync = $${values.push(params.enable_wonde_class_sync)}`);
	}
	if (params.hasOwnProperty("gsg")) {
		ctx.assert(typeof params.gsg === "string" || params.gsg == null, 400, "Institution gsg identifier invalid");
	}
	if (params.hasOwnProperty("dfe")) {
		ctx.assert(typeof params.dfe === "string" || params.dfe == null, 400, "Institution dfe identifier invalid");
	}
	if (params.hasOwnProperty("seed")) {
		ctx.assert(typeof params.seed === "string" || params.seed == null, 400, "Institution seed identifier invalid");
	}
	if (params.hasOwnProperty("nide")) {
		numFieldsChanged++;
		ctx.assert(typeof params.nide === "string" || params.nide == null, 400, "Institution nide identifier invalid");
		updateFields.push(`nide = $${values.push(params.nide)}`);
	}
	if (params.hasOwnProperty("hwb_identifier")) {
		numFieldsChanged++;
		ctx.assert(typeof params.hwb_identifier === "string" || params.hwb_identifier == null, 400, "Institution hwb identifier invalid");
		updateFields.push(`hwb_identifier = $${values.push(params.hwb_identifier)}`);
	}

	updateFields.push(`modified_by_user_id = $${values.push(sessionData.user_id)}`);
	updateFields.push(`date_edited = NOW()`);

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
			[params.id]
		);
		ctx.assert(canEdit.rows[0].can_edit, 400, "Cannot edit record");
	}

	if (params.hasOwnProperty("gsg") || params.hasOwnProperty("dfe") || params.hasOwnProperty("seed")) {
		const schoolResult = await ctx.appDbQuery(
			`
				SELECT
					identifier AS school_identifier
				FROM
					school
				WHERE
					id = $1
			`,
			[params.id]
		);
		ctx.assert(schoolResult.rowCount > 0, 400, "Institution not found");
		const origSchoolIdentifier = schoolResult.rows[0].school_identifier;
		const identifierParts = (origSchoolIdentifier || "").split("/");
		const gsg = (params.hasOwnProperty("gsg") ? params.gsg : identifierParts[0]) || "";
		const dfe = (params.hasOwnProperty("dfe") ? params.dfe : identifierParts[1]) || "";
		const seed = (params.hasOwnProperty("seed") ? params.seed : identifierParts[2]) || "";
		let updatedSchoolIdentifier = gsg + "/" + dfe + "/" + seed;
		if (updatedSchoolIdentifier === "//") {
			updatedSchoolIdentifier = null;
		}
		if (origSchoolIdentifier !== updatedSchoolIdentifier) {
			numFieldsChanged++;
			updateFields.push(`identifier = $${values.push(updatedSchoolIdentifier)}`);
		}
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	let result;
	try {
		result = await ctx.appDbQuery(
			`
				UPDATE
					school
				SET
					${updateFields.join(", ")}
				WHERE
					id = ${params.id}
			`,
			values
		);
	} catch (e) {
		if (e.message.indexOf("violates unique constraint") >= 0) {
			if (e.message.indexOf(`"school_identifier_key"`) >= 0) {
				ctx.throw(400, "An institution with that identifier already exists");
			} else if (e.message.indexOf(`"school_name_key"`) >= 0) {
				ctx.throw(400, "An institution with that name already exists");
			} else {
				ctx.throw(400, "An institution with those details already exists");
			}
		} else {
			ctx.throw(500, "Error updating institution [2]");
		}
	}

	if (result.rowCount === 0) {
		ctx.throw(400, "Institution not found");
	}

	return {
		result: true,
	};
};
