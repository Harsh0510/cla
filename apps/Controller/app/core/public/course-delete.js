/**
 * Deletes a course for a particular institution
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();

	/** Throw an error if non institution admins attempt to access this endpoint */
	if (sessionData.user_role !== "school-admin") {
		ctx.throw(401, "Unauthorized");
	}

	try {
		/** Delete the course row from the database and return the oid of the deleted course */
		const result = await ctx.appDbQuery(
			`
				DELETE FROM
					course
				WHERE
					course.oid = $1
					AND archive_date IS NULL
				RETURNING
					id
			`,
			[params.oid]
		);

		/** Return the oid of the targeted course and whether or not it has been deleted */
		return {
			result: {
				oid: params.oid,
				deleted: result.rowCount > 0 ? true : false,
			},
		};
	} catch (e) {
		/** Throw an error if some unknown sql error has occured */
		// ctx.throw(400, e.message);
		ctx.throw(400, "Unknown Error [1]");
	}
};
