const { userRoles } = require("../../common/staticValues");

/**
 * Get content request
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	ctx.assert(sessionData.user_role === userRoles.claAdmin, 401, "Unauthorized");

	/**
	 * Query for get all content requests
	 */
	const result = await ctx.appDbQuery(
		`
			SELECT
				content_request.id AS id,
				content_request.date_created AS date_created,
				content_request.date_edited AS date_edited,
				content_request.user_id AS user_id,
				content_request.school_id AS school_id,
				content_request.school_name_log As school_name_log,
				to_json(content_request.request_type) AS request_type,
				content_request.isbn AS isbn,
				content_request.book_title AS book_title,
				content_request.authors AS authors,
				content_request.book_request_author AS book_request_author,
				content_request.publishers AS publishers,
				content_request.book_request_publisher AS book_request_publisher,
				content_request.publication_year AS publication_year,
				content_request.url AS url,
				content_request.content_type_note AS content_type_note,
				content_request.other_note AS other_note,
				ARRAY_AGG(content_type.title) AS content_types
			FROM
				content_request
			LEFT JOIN content_request_content_type_join
				ON content_request.id =  content_request_content_type_join.content_request_id
			LEFT JOIN content_type
				ON content_request_content_type_join.content_type_id = content_type.id
			GROUP BY
				content_request.id
			ORDER BY
				id ASC
		`
	);

	return {
		result: result.rows,
	};
};
