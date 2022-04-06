/**
 * Fetch assets matching a query string using full-text search.
 *
 * This is an intentionally simple and fast no-frills endpoint that's
 * used by the Weblogging application.
 */
const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	ensure.nonEmptyStr(ctx, params.query, "Query");
	ensure.positiveInteger(ctx, params.limit, "Limit");

	const binds = [];
	const results = (
		await ctx.appDbQuery(
			`
			SELECT
				title,
				publisher_name_log AS publisher,
				authors_log AS authors,
				pdf_isbn13,
				publication_date,
				edition
			FROM
				asset
			WHERE
				weighted_tsv @@ plainto_tsquery($${binds.push(params.query)})
				AND active
				AND is_ep
				AND date_system_created IS NOT NULL
			ORDER BY
				ts_rank_cd(weighted_tsv, plainto_tsquery($${binds.push(params.query)})) DESC,
				id DESC
			LIMIT
				$${binds.push(params.limit)}
		`,
			binds
		)
	).rows;

	return {
		results: results,
	};
};
