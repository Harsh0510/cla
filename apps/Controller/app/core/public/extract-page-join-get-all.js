const ensure = require("#tvf-ensure");

/**
 * Get an array of share links for a particular extract
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	const bindData = [];
	const whereClauses = [];
	let bindIdx = 0;
	if (params.hasOwnProperty("page")) {
		ensure.nonNegativeInteger(ctx, params.page);
		bindIdx = bindData.push(params.page);
		whereClauses.push(`(extract_page_join.page = $${bindIdx})`);
	}

	bindIdx = bindData.push(params.extract_oid);
	whereClauses.push(`(extract.oid = $${bindIdx})`);
	whereClauses.push(`(extract.archive_date IS NULL)`);

	/**
	 * Query the extract_page_join table get all notes from extract oid
	 */
	const result = await ctx.appDbQuery(
		`
			SELECT
				extract_page_join.page AS page,
				extract_page_join.first_highlight_name AS first_highlight_name,
				extract_page_join.first_highlight_date AS first_highlight_date
			FROM
				extract_page_join
			INNER JOIN extract
				ON extract.id = extract_page_join.extract_id
			WHERE
				${whereClauses.join(` AND `)}
			ORDER BY
				extract_page_join.extract_id DESC
		`,
		bindData
	);

	return {
		result: result.rows,
	};
};
