const ensure = require("#tvf-ensure");

/**
 * Edits a single course for a particular school
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	ensure.nonEmptyStr(ctx, params.title, "Course Title");
	ensure.nonEmptyStr(ctx, params.identifier, "Course Identifier");
	ensure.nonEmptyStr(ctx, params.year_group, "Year Group");

	const sessionData = await ctx.getSessionData();

	/** Throw an error if non school admins attempt to access this endpoint */
	if (sessionData.user_role !== "school-admin") {
		ctx.throw(401, "Unauthorized");
	}

	try {
		/** Update the course information of a course specified by oid */
		const result = await ctx.appDbQuery(
			`
				UPDATE
					course
				SET
					title = $2,
					identifier = $3,
					year_group = $4,
					date_edited = NOW(),
					modified_by_user_id = $5
				WHERE
					oid = $1
					AND archive_date IS NULL
			`,
			[params.oid, params.title, params.identifier, params.year_group, sessionData.user_id]
		);

		/** Return the oid of the targeted course and whether or not it has been edited */
		return {
			result: {
				oid: params.oid,
				edited: result.rowCount > 0 ? true : false,
			},
		};
	} catch (e) {
		ctx.throw(400, "Unknown Error [1]");
	}
};
