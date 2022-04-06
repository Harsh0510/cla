const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const inputStringIsValid = require("../../common/inputStringIsValid");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an Notes");

	ensure.validIdentifier(ctx, params.extract_oid, "Extract oid");
	ensure.nonNegativeInteger(ctx, params.page, "page");
	//ensure.nonEmptyStr(ctx, params.content, "Content");
	ensure.nonEmptyStr(ctx, params.colour, "Colour");
	inputStringIsValid.lengthIsValid(ctx, params.colour, "Colour", 1, 10);
	ctx.assert(typeof params.width == "number" || params.width < 0, 400, "Width should be the real type");
	ctx.assert(typeof params.height == "number" || params.height < 0, 400, "Height should be the real type");
	ctx.assert(typeof params.position_x == "number" || params.position_x < 0, 400, "Position x should be the real type");
	ctx.assert(typeof params.position_y == "number" || params.position_y < 0, 400, "Position y should be the real type");
	ensure.nonNegativeInteger(ctx, params.zindex, "zindex");
	const sessionUserId = sessionData.user_id;
	// ensure the extract oid exists within the extract
	let extractId = 0;
	let extractCreatorUserId = 0;
	const extractResult = await ctx.appDbQuery(
		`
			SELECT
				extract.id AS extract_id,
				extract.user_id AS user_id
			FROM
				extract
			WHERE
				extract.oid = $1
				AND extract.archive_date IS NULL
		`,
		[params.extract_oid]
	);

	if (extractResult.rows.length) {
		extractId = parseInt(extractResult.rows[0].extract_id, 10);
		extractCreatorUserId = parseInt(extractResult.rows[0].user_id, 10);
	} else {
		ctx.throw(400, "Extract not found");
	}
	if (sessionUserId != extractCreatorUserId) {
		ctx.throw(400, "You don't have rights to create the note for this extract.");
	}

	// create extract note
	const extractNoteResult = await ctx.appDbQuery(
		`
			INSERT INTO
				extract_note
				(extract_id, colour, position_x, position_y, width, height, content, page, zindex)
			VALUES
				($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING
				oid, colour, position_x, position_y, width, height, content, page, zindex, date_created
		`,
		[extractId, params.colour, params.position_x, params.position_y, params.width, params.height, params.content, params.page, params.zindex]
	);
	return {
		result: extractNoteResult.rows,
	};
};
