const ensure = require("#tvf-ensure");
/**
 * Deletes a extract_note for a particular note
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an Notes");
	ensure.validIdentifier(ctx, params.oid, "oid");
	const userId = sessionData.user_id;

	/** Delete the extract_note row from the database and return the id of the deleted extract_note */
	const result = await ctx.appDbQuery(
		`
			DELETE FROM
				extract_note
			USING
				extract, cla_user
			WHERE
				extract_note.extract_id = extract.id
				AND extract.user_id = cla_user.id
				AND extract_note.oid = $1
				AND extract.user_id = $2
				AND extract.archive_date IS NULL
 		`,
		[params.oid, userId]
	);

	/** Return the id of the targeted extract_note and whether or not it has been deleted */
	return {
		result: result.rowCount > 0,
	};
};
