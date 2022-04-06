const util = require("util");
const crypto = require("crypto");

const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");

/** Creates a new course for a particular institution
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	/** Throw an error if any user inputs are an empty string */
	ensure.nonEmptyStr(ctx, params.title, "Course Name");
	ensure.nonEmptyStr(ctx, params.identifier, "Course Identifier");
	ensure.nonEmptyStr(ctx, params.year_group, "Year Group");

	const sessionData = await ctx.getSessionData();

	/** Throw an error if non institution admins attempt to access this endpoint */
	if (sessionData.user_role !== "school-admin") {
		ctx.throw(401, "Unauthorized");
	}

	const generatedOid = await tvfUtil.generateObjectIdentifier();

	try {
		/** Insert new course information in to the database and the return the id */
		const result = await ctx.appDbQuery(
			`
				INSERT INTO
					course
					(
						title,
						identifier,
						year_group,
						school_id,
						oid
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4,
						$5
					)
				RETURNING
					id
			`,
			[params.title, params.identifier, params.year_group, sessionData.school_id, generatedOid]
		);

		/** Return the generated oid and whether the course has been created or not */
		return {
			result: {
				oid: result.rowCount > 0 ? generatedOid : null,
				created: result.rowCount > 0 ? true : false,
			},
		};
	} catch (e) {
		if (e.message.indexOf(" violates unique constraint ") !== -1) {
			ctx.throw(400, `You cannot create an identical course, please ensure that your course is unique.`);
		} else {
			/** Throw an error some unknown sql error has occured */
			ctx.throw(400, `Unknown Error [1]`);
		}
	}
};
