const ensure = require("#tvf-ensure");

/**
 * Edits a single class for a particular school
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to update an Notes");

	// Validate inputs
	ensure.validIdentifier(ctx, params.oid, "oid");

	const extractNoteUpdateFields = [];
	const extractNoteUpdateBinds = [];
	const extractUpdateWhereClauses = [];
	let bindIdx;
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("content")) {
		ctx.assert(typeof params.content == "string", 400, "Content should be string type");
		numFieldsChanged++;
		bindIdx = extractNoteUpdateBinds.push(params.content);
		extractNoteUpdateFields.push(`content = $${bindIdx}`);
	}
	if (params.hasOwnProperty("page")) {
		ensure.nonNegativeInteger(ctx, params.page);
		numFieldsChanged++;
		bindIdx = extractNoteUpdateBinds.push(params.page);
		extractNoteUpdateFields.push(`page = $${bindIdx}`);
	}
	if (params.hasOwnProperty("zindex")) {
		ensure.nonNegativeInteger(ctx, params.zindex, "zindex");
		bindIdx = extractNoteUpdateBinds.push(params.zindex);
		extractNoteUpdateFields.push(`zindex = $${bindIdx}`);
		numFieldsChanged++;
	}
	if (params.hasOwnProperty("width")) {
		ctx.assert(typeof params.width == "number" || params.width < 0, 400, "Width should be the real type");
		numFieldsChanged++;
		bindIdx = extractNoteUpdateBinds.push(params.width);
		extractNoteUpdateFields.push(`width = $${bindIdx}`);
	}
	if (params.hasOwnProperty("height")) {
		ctx.assert(typeof params.height == "number" || params.height < 0, 400, "Height should be the real type");
		numFieldsChanged++;
		bindIdx = extractNoteUpdateBinds.push(params.height);
		extractNoteUpdateFields.push(`height = $${bindIdx}`);
	}
	if (params.hasOwnProperty("position_x")) {
		ctx.assert(typeof params.position_x == "number" || params.position_x < 0, 400, "Position x should be the real type");
		numFieldsChanged++;
		bindIdx = extractNoteUpdateBinds.push(params.position_x);
		extractNoteUpdateFields.push(`position_x = $${bindIdx}`);
	}
	if (params.hasOwnProperty("position_y")) {
		ctx.assert(typeof params.position_y == "number" || params.position_y < 0, 400, "Position y should be the real type");
		numFieldsChanged++;
		bindIdx = extractNoteUpdateBinds.push(params.position_y);
		extractNoteUpdateFields.push(`position_y = $${bindIdx}`);
	}

	ctx.assert(numFieldsChanged > 0, 400, "No fields changed");

	bindIdx = extractNoteUpdateBinds.push(params.oid);
	extractUpdateWhereClauses.push(`(extract_note.oid = $${bindIdx})`);

	//extract note right for update
	const userId = sessionData.user_id;
	let extractId = 0;
	let extractCreatorUserId = 0;
	const extractResult = await ctx.appDbQuery(
		`
			SELECT
				extract_note.extract_id AS extract_id,
				extract.user_id AS user_id
			FROM
				extract_note
				INNER JOIN extract ON extract_note.extract_id = extract.id
				INNER JOIN cla_user ON extract.user_id = cla_user.id
			WHERE
				extract_note.oid = $1
				AND extract.archive_date IS NULL
		`,
		[params.oid]
	);
	if (extractResult.rows.length) {
		extractId = extractResult.rows[0].extract_id;
		extractCreatorUserId = extractResult.rows[0].user_id;
	} else {
		ctx.throw(400, "Extract not found");
	}

	if (userId != extractCreatorUserId) {
		ctx.throw(400, "You don't have rights to update the note for this extract.");
	}

	const resultData = await (async () => {
		const result = await ctx.appDbQuery(
			`
				UPDATE
					extract_note
				SET
					${extractNoteUpdateFields.join(",")}
				WHERE
					${extractUpdateWhereClauses.join(` AND `)}
				RETURNING
					oid,
					colour,
					position_x,
					position_y,
					width,
					height,
					content,
					page,
					zindex
			`,
			extractNoteUpdateBinds
		);
		return result.rows;
	})();

	return {
		result: resultData,
	};
};
