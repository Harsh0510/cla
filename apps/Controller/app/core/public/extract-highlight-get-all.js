const ensure = require("#tvf-ensure");

/**
 * Get an array of share links for a particular extract
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	//await ctx.ensureLoggedIn();

	/** Throw an error if user inputs for extract_oid is an empty string */
	ensure.validIdentifier(ctx, params.extract_oid, "Extract oid");
	const bindData = [];
	const whereClauses = [];
	let bindIdx = 0;
	if (params.hasOwnProperty("page")) {
		ensure.nonNegativeInteger(ctx, params.page);
		bindIdx = bindData.push(params.page);
		whereClauses.push(`(extract_highlight.page = $${bindIdx})`);
	}

	bindIdx = bindData.push(params.extract_oid);
	whereClauses.push(`(extract.oid = $${bindIdx})`);
	whereClauses.push(`(extract.archive_date IS NULL)`);

	/**
	 * Query the extract_highlight table get all highlight from extract oid
	 */
	const result = await ctx.appDbQuery(
		`
			SELECT
				extract_highlight.oid AS oid,
				extract_highlight.colour AS colour,
				extract_highlight.position_x AS position_x,
				extract_highlight.position_y AS position_y,
				extract_highlight.width AS Width,
				extract_highlight.height AS Height,
				extract_highlight.date_created AS date_created,
				extract_highlight.page AS page
			FROM
				extract_highlight
				INNER JOIN extract
					ON extract.id = extract_highlight.extract_id
			WHERE
				${whereClauses.join(` AND `)}
			ORDER BY
				extract_highlight.id DESC
		`,
		bindData
	);

	return {
		result: result.rows,
	};
};
