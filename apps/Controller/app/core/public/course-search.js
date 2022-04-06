const ensure = require("#tvf-ensure");
const getSchoolIdFromExtract = require("./common/getSchoolIdFromExtract");
const { userRoles } = require("../../common/staticValues");

/**
 * Get a  course for a particular school based on the query
 * @param {object} params The request body
 * @param {object} ctx The context object
 */

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	let limit = 25; //Default limit

	if (params.hasOwnProperty("query")) {
		ensure.nonEmptyStr(ctx, params.query, "Query");
	}

	if (params.hasOwnProperty("oid")) {
		ensure.validIdentifier(ctx, params.oid, "Identifier");
	}

	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "limit");
		ctx.assert(params.limit <= 100, 400, "Invalid limit");
		limit = params.limit;
	}

	const whereClauses = [];
	const values = [];
	const orderByClause = [];
	const schoolId = await getSchoolIdFromExtract(ctx, params.extractOid);

	whereClauses.push(`(course.archive_date IS NULL)`);

	if (schoolId) {
		const idx = values.push(schoolId);
		whereClauses.push(`(course.school_id = $${idx})`);
	}

	if (params.oid) {
		const idx = values.push(params.oid);
		whereClauses.push(`(course.oid = $${idx})`);
	}

	if (params.query) {
		const idx = values.push(params.query);
		whereClauses.push(`(course.keywords @@ plainto_tsquery($${idx}))`);
		orderByClause.push(`ts_rank_cd(keywords, plainto_tsquery($${idx})) DESC`);
	} else {
		orderByClause.push(`(creator_id = ${sessionData.user_id}) DESC`);
		orderByClause.push(`title ASC`);
	}

	orderByClause.push("course.id ASC");

	let result = await ctx.appDbQuery(
		`
		SELECT
			course.oid AS id,
			course.title AS name
		FROM
			course
		WHERE
			${whereClauses.join(" AND ")}
		ORDER BY
			${orderByClause.join(", ")}
		LIMIT
			${limit}
	`,
		values
	);

	if (!result.rowCount && params.query) {
		const newWhereClauses = [];
		const newValues = [];
		const query = params.query.toLowerCase();
		const newIdx = newValues.push(query + "%");
		newWhereClauses.push(`(course.archive_date IS NULL)`);
		newWhereClauses.push(`(course.title_lower LIKE $${newIdx})`);
		if (sessionData.school_id) {
			const newIdx = newValues.push(sessionData.school_id);
			newWhereClauses.push(`(course.school_id = $${newIdx})`);
		}

		result = await ctx.appDbQuery(
			`
				SELECT
					oid AS id,
					title AS name
				FROM
					course
				WHERE
					${newWhereClauses.join(" AND ")}
				ORDER BY
					title ASC,
					id ASC
				LIMIT
					${limit}
			`,
			newValues
		);
	}
	return {
		result: result.rows,
	};
};
