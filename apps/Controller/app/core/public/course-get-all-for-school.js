const ensure = require("#tvf-ensure");
const getSchoolIdFromExtract = require("./common/getSchoolIdFromExtract");

/**
 * Get all courses for a particular school
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const columns = ["course.title AS title", "course.year_group AS year_group", "course.oid AS oid"];

	const binds = [];
	const schoolId = await getSchoolIdFromExtract(ctx, params.extractOid);
	let idx = binds.push(schoolId);
	const whereClauses = [`WHERE course.school_id = $${idx}`];

	if (params.include_extra_data) {
		ctx.assert(typeof params.include_extra_data === "boolean", 400, "Include extra data is not valid");
		columns.push("course.number_of_students AS number_of_students");
		columns.push("course.exam_board AS exam_board");
	}

	if (params.oid) {
		ensure.validIdentifier(ctx, params.oid, "Class oid");
		idx = binds.push(params.oid);
		whereClauses.push(`course.oid = $${idx}`);
	}

	whereClauses.push(`(course.archive_date IS NULL)`);

	try {
		const queryColumns = columns.join(", ");
		const whereClausesSql = whereClauses.join(" AND ");
		/** Select all courses with a given school ID */
		const result = await ctx.appDbQuery(
			`
				SELECT
					${queryColumns}
				FROM
					course AS course
					${whereClausesSql}
				ORDER BY
					course.title ASC
			`,
			binds
		);

		/** Return an array of the course or null if there are no courses */
		return {
			result: result.rowCount > 0 ? result.rows : null,
		};
	} catch (e) {
		/** Throw an error some unknown sql error has occured */
		ctx.throw(400, "Unknown Error [1]");
	}
};
