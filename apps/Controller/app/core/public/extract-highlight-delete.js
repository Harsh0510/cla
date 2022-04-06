const ensure = require("#tvf-ensure");
/**
 * Deletes a extract_highlight for a particular note
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to Delete an Highlight");
	ensure.validIdentifier(ctx, params.oid, "Hightlight OID");
	const userId = sessionData.user_id;

	/** Delete the extract_highlight row from the database and return the id of the deleted extract_highlight */
	const result = await ctx.appDbQuery(
		`
			DELETE FROM 
				extract_highlight
			USING
				extract,
				cla_user
			WHERE
				extract_highlight.extract_id = extract.id 
				AND extract.user_id = cla_user.id
				AND extract_highlight.oid = $1
				AND extract.user_id = $2
				AND extract.archive_date IS NULL
			RETURNING 
				extract_highlight.extract_id
 		`,
		[params.oid, userId]
	);

	if (result.rowCount > 0) {
		const extractId = result.rows[0].extract_id;
		const isHighlightExist = await ctx.appDbQuery(
			`
				SELECT
					extract_highlight.id AS extract_highlight_id,
					extract_highlight.oid AS oid
				FROM
					extract_highlight
				WHERE
					extract_highlight.extract_id = $1
			`,
			[extractId]
		);

		if (!isHighlightExist.rows.length) {
			await ctx.appDbQuery(
				`
					UPDATE
						extract_page_join
					SET
						first_highlight_name = NULL
					WHERE
						extract_id = $1
				`,
				[extractId]
			);
		}
	}

	/** Return the id of the targeted extract_highlight and whether or not it has been deleted */
	return {
		result: result.rowCount > 0,
	};
};
