const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const inputStringIsValid = require("../../common/inputStringIsValid");
const nameDisplayPreference = require("../../common/nameDisplayPreference/sql");
const { now } = require("moment");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an Highlight");

	ensure.validIdentifier(ctx, params.extract_oid, "Extract OId");
	ensure.nonNegativeInteger(ctx, params.page, "page");
	ensure.nonEmptyStr(ctx, params.colour, "Colour");

	inputStringIsValid.lengthIsValid(ctx, params.colour, "Colour", 1, 10);
	ctx.assert(typeof params.width == "number" || params.width < 0, 400, "Width should be the real type");
	ctx.assert(typeof params.height == "number" || params.height < 0, 400, "Height should be the real type");

	ctx.assert(typeof params.position_x == "number" || params.position_x < 0, 400, "Position x should be the real type");
	ctx.assert(typeof params.position_y == "number" || params.position_y < 0, 400, "Position y should be the real type");
	const sessionUserId = sessionData.user_id;

	// ensure the extract oid exists within the extract
	let extractId = 0;
	let extractCreatorUserId = 0;
	let extractOID = "";
	let isNeedToAddPageFirstDate = false;

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
		extractOID = extractResult.rows[0].oid;
	} else {
		ctx.throw(400, "Extract not found");
	}
	if (sessionUserId != extractCreatorUserId) {
		ctx.throw(400, "You don't have rights to create the highlight for this extract.");
	}

	const isHighlightFirst = await ctx.appDbQuery(
		`
			SELECT
				page,
				first_highlight_name,
				first_highlight_date
			FROM
				extract_page_join
			WHERE
				extract_id = $1
				AND page = $2
		`,
		[extractId, params.page]
	);

	if (isHighlightFirst.rowCount === 0) {
		isNeedToAddPageFirstDate = true;
	} else if (!isHighlightFirst.rows[0].first_highlight_name) {
		isNeedToAddPageFirstDate = true;
	}

	//getting the updated highlight page join data
	let extract_page_join = [];

	if (isNeedToAddPageFirstDate) {
		const userData = await ctx.appDbQuery(
			`
			SELECT
				concat_ws('', cla_user.title, '. ', cla_user.last_name) AS name_display_preference
			FROM
				cla_user
			WHERE
				cla_user.id = $1
			`,
			[sessionUserId]
		);

		let first_highlight_name = null;

		if (userData.rows.length) {
			first_highlight_name = userData.rows[0].name_display_preference;
		}

		const extractHighlight = await ctx.appDbQuery(
			`
				INSERT INTO
					extract_page_join
						(extract_id, first_highlight_name, first_highlight_date, page)
				VALUES
					($1, $2, now(), $3)
				ON CONFLICT (extract_id, page) DO UPDATE SET first_highlight_name = EXCLUDED.first_highlight_name, first_highlight_date = EXCLUDED.first_highlight_date
				RETURNING
					page, first_highlight_name, first_highlight_date
			`,
			[extractId, first_highlight_name, params.page]
		);
		extract_page_join = extractHighlight.rows;
	}

	// create extract highlight
	const extractHighlightResult = await ctx.appDbQuery(
		`
			INSERT INTO
				extract_highlight
					(extract_id, colour, position_x, position_y, width, height, page)
			VALUES
				($1, $2, $3, $4, $5, $6, $7)
			RETURNING
				oid, extract_id, colour, position_x, position_y, width, height, page
		`,
		[extractId, params.colour, params.position_x, params.position_y, params.width, params.height, params.page]
	);
	return {
		result: extractHighlightResult.rows,
		result_extract_page_join: extract_page_join,
	};
};
