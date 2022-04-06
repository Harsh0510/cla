const ensure = require("#tvf-ensure");

/**
 * Get an array of share links for a particular extract
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	//await ctx.ensureLoggedIn();

	/** Throw an error if any user inputs are an empty string */
	//ensure.validIdentifier(ctx, params.extract_oid, "Extract oid");
	const bindData = [];
	const whereClauses = [];
	let bindIdx = 0;
	if (params.hasOwnProperty("page")) {
		ensure.nonNegativeInteger(ctx, params.page);
		bindIdx = bindData.push(params.page);
		whereClauses.push(`(extract_note.page = $${bindIdx})`);
	}

	bindIdx = bindData.push(params.extract_oid);
	whereClauses.push(`(extract.oid = $${bindIdx})`);
	whereClauses.push(`(extract.archive_date IS NULL)`);

	/**
	 * Query the extract_note table get all notes from extract oid
	 */
	const result = await ctx.appDbQuery(
		`
			SELECT
				extract_note.oid AS oid,
				extract_note.colour AS colour,
				extract_note.position_x AS position_x,
				extract_note.position_y AS position_y,
				extract_note.width AS width,
				extract_note.height AS height,
				extract_note.content AS content,
				extract_note.zindex AS zindex,
				extract_note.date_created AS date_created,
				extract_note.page AS page
			FROM
				extract_note
				INNER JOIN extract
					ON extract.id = extract_note.extract_id
			WHERE
				${whereClauses.join(` AND `)}
			ORDER BY
				extract_note.id DESC
		`,
		bindData
	);

	return {
		result: result.rows,
	};
};
