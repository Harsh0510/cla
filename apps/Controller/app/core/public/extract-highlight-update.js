const ensure = require("#tvf-ensure");

/**
 * Edits a single class for a particular school
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to update an Highlight");

	// Validate inputs
	ensure.validIdentifier(ctx, params.oid, "oid");

	const extractHighlightUpdateFields = [];
	const extractHighlightUpdateBinds = [];
	const extractHighlightUpdateWhereClauses = [];
	let bindIdx = [];
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("page")) {
		ensure.nonNegativeInteger(ctx, params.page, "Page");
		numFieldsChanged++;
		bindIdx = extractHighlightUpdateBinds.push(params.page);
		extractHighlightUpdateFields.push(`page = $${bindIdx}`);
	}
	if (params.hasOwnProperty("width")) {
		ctx.assert(typeof params.width == "number" || params.width < 0, 400, "Width should be the real type");
		numFieldsChanged++;
		bindIdx = extractHighlightUpdateBinds.push(params.width);
		extractHighlightUpdateFields.push(`width = $${bindIdx}`);
	}
	if (params.hasOwnProperty("height")) {
		ctx.assert(typeof params.height == "number" || params.height < 0, 400, "Height should be the real type");
		numFieldsChanged++;
		bindIdx = extractHighlightUpdateBinds.push(params.height);
		extractHighlightUpdateFields.push(`height = $${bindIdx}`);
	}
	if (params.hasOwnProperty("position_x")) {
		ctx.assert(typeof params.position_x == "number" || params.position_x < 0, 400, "Position x should be the real type");
		numFieldsChanged++;
		bindIdx = extractHighlightUpdateBinds.push(params.position_x);
		extractHighlightUpdateFields.push(`position_x = $${bindIdx}`);
	}
	if (params.hasOwnProperty("position_y")) {
		ctx.assert(typeof params.position_y == "number" || params.position_y < 0, 400, "Position y should be the real type");
		numFieldsChanged++;
		bindIdx = extractHighlightUpdateBinds.push(params.position_y);
		extractHighlightUpdateFields.push(`position_y = $${bindIdx}`);
	}

	bindIdx = extractHighlightUpdateBinds.push(params.oid);
	extractHighlightUpdateWhereClauses.push(`(extract_highlight.oid = $${bindIdx})`);

	//extract highlight right for update
	const userId = sessionData.user_id;
	let extractId = 0;
	let extractCreatorUserId = 0;
	const extractResult = await ctx.appDbQuery(
		`
			SELECT
				extract_highlight.id AS extract_highlight_id,
				extract.user_id AS user_id
			FROM
				extract_highlight
				INNER JOIN extract ON extract_highlight.extract_id = extract.id
				INNER JOIN cla_user ON extract.user_id = cla_user.id
			WHERE
				extract_highlight.oid = $1
				AND extract.archive_date IS NULL
		`,
		[params.extract_oid]
	);
	if (extractResult.rows.length) {
		extractId = extractResult.rows[0].extract_id;
		extractCreatorUserId = extractResult.rows[0].user_id;
	} else {
		ctx.throw(400, "Extract not found");
	}

	if (userId != extractCreatorUserId) {
		ctx.throw(400, "You don't have rights to update the highlight for this extract.");
	}

	/** Update the extractHighlight information of a class specified by oid */
	const result = await ctx.appDbQuery(
		`
			UPDATE
				extract_highlight
			SET
				${extractHighlightUpdateFields.join(",")}
			WHERE
				${extractHighlightUpdateWhereClauses.join(` AND `)}
			RETURNING
				oid, position_x, position_y, width, height, page
		`,
		extractHighlightUpdateBinds
	);

	/** Return whether or not it has been edited */
	return {
		result: result.rows,
	};
};
