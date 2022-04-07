const ensure = require("#tvf-ensure");

const byId = require("../../common/byId");

const citiesById = byId(require("../../common/cities"));
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
	inputStringIsValid.nameIsValid(ctx, params.first_name, "first_name", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.last_name, "last_name", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.enroll_number, "enroll_number", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.department, "department", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.class, "class", RegExPatterns.common);
	inputStringIsValid.nameIsValid(ctx, params.address, "addresss", RegExPatterns.common);

	//Length
	inputStringIsValid.lengthIsValid(ctx, params.first_name, "first_name", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.last_name, "last_name", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.enroll_number, "enroll_number", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.department, "department", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.class, "class", 1, 200);
	inputStringIsValid.lengthIsValid(ctx, params.address, "addresss", 1, 200);

	ensure.nonEmptyStr(ctx, params.city, "city");
	ctx.assert(citiesById[params.city], 400, "City not found");

	let result;

	try {
		// Perform only a single query so we don't have to worry about transactions.
		result = await ctx.appDbQuery(
			`
				INSERT INTO
					student
					(
						first_name,
						last_name,
						enroll_number,
						email,
						school_id,
						department,
						class,
						city,
						mobile_number,
						address
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
						$10
					)
				RETURNING
					id
			`,
			[
				params.first_name,
				params.last_name,
				params.enroll_number,
				params.email,
				params.school_id,
				params.department,
				params.class,
				params.city,
				params.mobile_number,
				params.address,
			]
		);
		// only one result should be returned
		ctx.assert(result.rowCount > 0, 500, "Unknown error [2]");
	} catch (e) {
		// if (e.message.indexOf("violates unique constraint") >= 0) {
		// 	if (e.message.indexOf(`"school_identifier_key"`) >= 0) {
		// 		ctx.throw(400, "An institution with that identifier already exists");
		// 	} else if (e.message.indexOf(`"school_name_key"`) >= 0) {
		// 		ctx.throw(400, "An institution with that name already exists");
		// 	} else {
		// 		ctx.throw(400, "An institution with those details already exists");
		// 	}
		// } else {
		// ctx.throw(500, "Error creating institution [2]");
		// }
		ctx.throw(500, "Error creating student");
		console.log(e);
	}

	return {
		success: true,
		id: parseInt(result.rows[0].id, 10),
	};
};
