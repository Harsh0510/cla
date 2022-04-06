/**
 * Allow School admins to create new users on the frontend
 */
const ensure = require("#tvf-ensure");

const byId = require("../../common/byId");

const territoriesById = byId(require("../../common/territories"));
const levelsById = byId(require("../../common/school-levels"));
const typesById = byId(require("../../common/school-types"));
const inputStringIsValid = require("../../common/inputStringIsValid");
const RegExPatterns = require("../../common/RegExPatterns");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	// validate inputs
	//ensure.nonEmptyStr(ctx, params.identifier, 'Identifier');
	//ensure.nonEmptyStr(ctx, params.name, 'Name');
	//ensure.nonEmptyStr(ctx, params.address1, 'Address (1)');
	//ensure.nonEmptyStr(ctx, params.address2, 'Address (2)');
	//ensure.nonEmptyStr(ctx, params.city, 'Town/City');
	//regex
	inputStringIsValid.nameIsValid(ctx, params.name, "Name", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.identifier, "Identifier", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.address1, "Address (1)", RegExPatterns.common);
	if (params.address2) {
		inputStringIsValid.nameIsValid(ctx, params.address2, "Address (2)", RegExPatterns.common);
		inputStringIsValid.lengthIsValid(ctx, params.address2, "Address (2)", 1, 200);
	}
	inputStringIsValid.nameIsValid(ctx, params.city, "Town/City", RegExPatterns.common);

	//Length
	inputStringIsValid.lengthIsValid(ctx, params.name, "Name", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.identifier, "Identifier", 1, 100);
	inputStringIsValid.lengthIsValid(ctx, params.address1, "Address (1)", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.city, "Town/City", 1, 200);

	if (params.county) {
		ensure.nonEmptyStr(ctx, params.county, "County");
	}
	//ensure.nonEmptyStr(ctx, params.post_code, 'Post Code');
	inputStringIsValid.isAlphaNumeric(ctx, params.post_code, "Post Code");
	inputStringIsValid.lengthIsValid(ctx, params.post_code, "Post Code", 1, 255);
	ensure.nonEmptyStr(ctx, params.territory, "Territory");
	ctx.assert(territoriesById[params.territory], 400, "Territory not found");
	if (params.local_authority) {
		//ensure.nonEmptyStr(ctx, params.local_authority, 'Local Authority');
		inputStringIsValid.nameIsValid(ctx, params.local_authority, "Local Authority", RegExPatterns.name);
		inputStringIsValid.lengthIsValid(ctx, params.local_authority, "Local Authority", 1, 100);
	}
	ensure.nonEmptyStr(ctx, params.school_level, "Institution Level");
	ctx.assert(levelsById[params.school_level], 400, "Institution level not found");
	if (params.school_type) {
		ensure.nonEmptyStr(ctx, params.school_type, "Institution Type");
		ctx.assert(typesById[params.school_type], 400, "Institution type not found");
	}
	if (params.school_home_page) {
		ensure.nonEmptyStr(ctx, params.school_home_page, "Institution Home Page");
	}
	if (params.number_of_students) {
		//ensure.nonNegativeInteger(ctx, params.number_of_students, 'Number of Students');
		inputStringIsValid.nonNegativeIntegerWithMinMax(ctx, params.number_of_students, "Number of Students", 1, 10000);
	}

	let result;

	try {
		// Perform only a single query so we don't have to worry about transactions.
		result = await ctx.appDbQuery(
			`
				INSERT INTO
					school
					(
						identifier,
						name,
						address1,
						address2,
						city,
						county,
						post_code,
						territory,
						local_authority,
						school_level,
						school_type,
						school_home_page,
						number_of_students
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4,
						$5,
						$6,
						$7,
						$8,
						$9,
						$10,
						$11,
						$12,
						$13
					)
				RETURNING
					id
			`,
			[
				params.identifier,
				params.name,
				params.address1,
				params.address2,
				params.city,
				params.county || null,
				params.post_code,
				params.territory,
				params.local_authority || null,
				params.school_level,
				params.school_type || null,
				params.school_home_page || null,
				params.number_of_students || null,
			]
		);
		// only one result should be returned
		ctx.assert(result.rowCount > 0, 500, "Unknown error [2]");
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
			ctx.throw(500, "Error creating institution [2]");
		}
	}

	return {
		success: true,
		school_id: parseInt(result.rows[0].id, 10),
	};
};
