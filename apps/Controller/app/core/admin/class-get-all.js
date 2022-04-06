const ensure = require("#tvf-ensure");
const examBoards = require("../../common/examBoards");

/**
 * Fetch all classes created for a particular institution
 */
module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin" || userRole === "teacher", 401, "Unauthorized");

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	let limit;
	let offset;
	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "Limit");
		limit = params.limit;
	} else {
		limit = 10;
	}

	if (params.hasOwnProperty("offset")) {
		ensure.nonNegativeInteger(ctx, params.offset, "Offset");
		offset = params.offset;
	} else {
		offset = 0;
	}

	const sortableColumns = Object.create(null);

	sortableColumns.date_created = `course.date_created`;
	sortableColumns.title = `course.title`;
	sortableColumns.year_group = `course.year_group`;
	sortableColumns.number_of_students = `course.number_of_students`;
	sortableColumns.exam_board = `course.exam_board`;
	sortableColumns.key_stage = `course.key_stage`;

	if (userRole === "cla-admin") {
		sortableColumns.school = `school.name`;
	}

	// Ensure that the sort field is a valid column name
	if (!sortableColumns[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	const sortField = sortableColumns[params.sort_field];

	let sortDirection = "ASC";

	switch (params.sort_direction.toUpperCase()[0]) {
		case "A":
			sortDirection = "ASC";
			break;
		case "D":
			sortDirection = "DESC";
			break;
		default:
			ctx.throw(400, "Invalid sort direction");
	}

	let unfilteredCount;

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");

		if (params.filter.hasOwnProperty("exam_board")) {
			ctx.assert(Array.isArray(params.filter.exam_board), 400, "Invalid Exam board provided");
			activeFilters.exam_board = params.filter.exam_board;
		}

		if (params.filter.hasOwnProperty("key_stage")) {
			ctx.assert(Array.isArray(params.filter.key_stage), 400, "Invalid Key Stage provided");
			activeFilters.key_stage = params.filter.key_stage;
		}

		if (params.filter.hasOwnProperty("schools") && userRole === "cla-admin") {
			ctx.assert(Array.isArray(params.filter.schools), 400, "Invalid schools provided");
			activeFilters.schools = params.filter.schools;
		}

		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length for cla-admin
	if (Object.keys(filterRequest).length > 3 && userRole === "cla-admin") {
		ctx.throw(400, `Too many filters provided`);
	}

	//Check filter request length for school-admin/teacher
	if (Object.keys(filterRequest).length > 2 && userRole === "school-admin") {
		ctx.throw(400, `Too many filters provided`);
	}

	//query parameters
	let queryValues = [];
	let queryWhereClause;
	const leftJoinWhereClauses = [];
	const whereClauses = [];

	//add filter for exam board
	if (activeFilters.exam_board) {
		const examBoardsValues = [];
		for (const examBoard of activeFilters.exam_board) {
			ctx.assert(examBoards.byName[examBoard], 400, "Exam Board not found");
			ensure.nonEmptyStr(ctx, examBoard, "Exam Board");
			examBoardsValues.push(examBoard);
		}
		if (examBoardsValues.length > 0) {
			whereClauses.push(`( course.exam_board IN ('${examBoardsValues.join(`', '`)}'))`);
		}
	}

	//add filter for Key Stage
	if (activeFilters.key_stage) {
		const keyStagesValues = [];
		for (const keyStage of activeFilters.key_stage) {
			ctx.assert(keyStage.indexOf(keyStage) >= 0, 400, "KeyStage not found");
			ensure.nonEmptyStr(ctx, keyStage, "Key Stage");
			keyStagesValues.push(keyStage);
		}
		if (keyStagesValues.length > 0) {
			whereClauses.push(`( course.key_stage IN ('${keyStagesValues.join(`', '`)}'))`);
		}
	}

	//add filter for institutions
	if (activeFilters.schools) {
		const schoolValues = [];
		for (const school of activeFilters.schools) {
			ensure.positiveInteger(ctx, school, "Institution id");
			schoolValues.push(school);
		}
		if (schoolValues.length > 0) {
			whereClauses.push(`(course.school_id IN (${schoolValues.join(", ")}))`);
		}
	}

	//check with UserRole
	if (userRole !== "cla-admin") {
		const bindIdx = queryValues.push(sessionData.school_id);
		whereClauses.push(`(course.school_id = $${bindIdx})`);
		leftJoinWhereClauses.push(`(course.school_id = $${bindIdx})`);
	}

	//add filter query param
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = queryValues.push(params.query);
		whereClauses.push(`(course.keywords @@ plainto_tsquery($${idx}))`);
	}

	whereClauses.push(`(course.archive_date IS NULL)`);
	leftJoinWhereClauses.push(`(extract.archive_date IS NULL AND extract.date_expired > NOW())`);

	//final where Clauses
	queryWhereClause = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

	// Get the unfiltered count of all classes for the specified institution
	const resultUnfilteredCount = await ctx.appDbQuery(
		`
			SELECT
				COUNT(*) AS _count_
			FROM
				course
			${queryWhereClause}
		`,
		queryValues
	);

	if (Array.isArray(resultUnfilteredCount.rows) && resultUnfilteredCount.rows.length) {
		unfilteredCount = parseInt(resultUnfilteredCount.rows[0]._count_, 10);
	} else {
		ctx.throw("400", "Unknown Error [1]");
	}

	// Get all class information for a particular institution
	const limitBindIdx = queryValues.push(limit);
	const offsetBindIdx = queryValues.push(offset);

	const result = await ctx.appDbQuery(
		`
			SELECT
				course.oid AS oid,
				course.date_created AS date_created,
				course.title AS title,
				course.year_group AS year_group,
				course.number_of_students AS number_of_students,
				course.exam_board AS exam_board,
				course.key_stage AS key_stage,
				(course.creator_id = ${parseInt(sessionData.user_id, 10) || 0}) AS is_own,
				school.id AS school_id,
				school.name AS school_name,
				a.count AS extract_count,
				course.wonde_identifier IS NULL AS can_edit_blocked_fields
			FROM
				course
				LEFT JOIN (
					SELECT
						course.id AS id,
						COUNT(extract.id) AS count
					FROM
						course
					INNER JOIN extract
						ON extract.course_id = course.id
					WHERE
						${leftJoinWhereClauses.join(" AND ")}
					GROUP BY
						course.id
				) a
					ON a.id = course.id
				LEFT JOIN school
					ON school.id = course.school_id
			
			${queryWhereClause}

			ORDER BY
				${sortField} ${sortDirection},
				course.id ASC
			LIMIT
				$${limitBindIdx}
			OFFSET
				$${offsetBindIdx}
		`,
		queryValues
	);
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
