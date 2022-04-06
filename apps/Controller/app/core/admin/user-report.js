const ensure = require("#tvf-ensure");

const allowedContentItemSortFields = {
	number_of_copies: "COUNT(DISTINCT extract.id)",
	number_of_student_views: "COUNT(extract_access.id)",
	title: "asset.title",
};

const allowedCopiesSortFields = {
	number_of_student_views: "COUNT(extract_access.id)",
	date_created: "extract.date_created",
	copy_title: "extract.title",
	title: "MIN(asset.title)",
};

const fetchSortSqlInner = (ctx, defaultSort, params, allowedSortFieldMap) => {
	if (!params) {
		return defaultSort;
	}
	if (!params.hasOwnProperty("sort")) {
		return defaultSort;
	}
	const sort = params.sort;
	if (!sort) {
		return defaultSort;
	}
	if (typeof sort.field !== "string") {
		return defaultSort;
	}
	ctx.assert(!!allowedSortFieldMap[sort.field], 400, "Sort field not found");
	let dir = "ASC";
	if (typeof sort.direction !== "undefined") {
		ctx.assert(typeof sort.direction === "string", 400, "Sort direction must be a string");
		ctx.assert(sort.direction, 400, "Sort direction not provided");
		const first = sort.direction[0].toUpperCase();
		ctx.assert(first === "A" || first === "D", 400, "Invalid sort direction");
		dir = first === "A" ? "ASC" : "DESC";
	}
	return allowedSortFieldMap[sort.field] + " " + dir;
};

const defaultLimitAndOffset = {
	offset: 0,
	limit: 10,
};
Object.freeze(defaultLimitAndOffset);

const fetchLimitAndOffsetInner = (params, ctx) => {
	if (!params) {
		return defaultLimitAndOffset;
	}
	let offset = 0;
	if (params.hasOwnProperty("offset")) {
		ensure.nonNegativeInteger(ctx, params.offset, "Offset");
		offset = params.offset;
	}
	let limit = 10;
	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "Limit");
		ctx.assert(params.limit <= 100, 400, "Limit too high");
		limit = params.limit;
	}
	return { offset, limit };
};

/**
 * @typedef {object} ISort
 * @property {string} field
 * @property {string=} direction
 */

/**
 * @typedef {object} ISortAndOffsetLimit
 * @property {number=} offset
 * @property {number=} limit
 * @property {ISort=} sort
 */

/**
 * @typedef {object} IParams
 * @property {number=} school_id School ID (for CLA admins only)
 * @property {string[]=} class Optional array of course OIDs to filter by
 * @property {ISortAndOffsetLimit=} content_item Optional sorting/offset/limit for content item table
 * @property {ISortAndOffsetLimit=} copy Optional sorting/offset/limit for copies table
 */

/**
 * @typedef {object} IContentItem
 * @property {string} title
 * @property {string} isbn
 * @property {number} number_of_copies
 * @property {number} number_of_student_views
 */

/**
 * @typedef {object} ICopy
 * @property {string} copy_title
 * @property {string} title
 * @property {string} isbn
 * @property {number} number_of_student_views
 * @property {string} date_created
 */

/**
 * @typedef {object} IFilter
 * @property {string} id
 * @property {string} title
 * @property {{id: string | number, title: string | number}[]} data
 */

/**
 * @typedef {object} IGetAllReturnData
 * @property {number} unlockedTitles
 * @property {number} copiedTitles
 * @property {number} copiesTotal
 * @property {number} studentViews
 * @property {{data: IContentItem[], unfiltered_count: number}} contentItems
 * @property {{data: ICopy[], unfiltered_count: number}} copies
 * @property {IFilter[]} filters
 */

/**
 *
 * @param {object} params
 * @param {number=} params.school_id
 * @returns {Promise<number>}
 */
const validateRouteAndGetSchoolId = async (params, ctx) => {
	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;

	if (userRole === "cla-admin") {
		ensure.nonNegativeInteger(ctx, params.school_id, "Institution");
	}

	return userRole === "cla-admin" ? params.school_id : sessionData.school_id;
};

/**
 * @param {object} params
 * @param {number=} params.school_id School ID (for CLA admins only)
 * @param {string[]=} params.class Optional array of course OIDs to filter by
 * @returns {Promise<[number, string]>} A tuple consisting of the school ID and an SQL query for the WHERE clause
 */
const validateRouteAndGetParams = async (params, ctx) => {
	const schoolId = await validateRouteAndGetSchoolId(params, ctx);

	const courseOidsFilterSql = (() => {
		if (!params.hasOwnProperty("class")) {
			return "TRUE";
		}
		ctx.assert(Array.isArray(params.class), 400, "Invalid class filter");
		ctx.assert(params.class.length <= 100, 400, "Too many classes");
		if (!params.class.length) {
			return "TRUE";
		}
		for (const oid of params.class) {
			ensure.validIdentifier(ctx, oid, "Invalid class filter item");
		}
		// no need to escape because we've ensured it's a valid identifier, which only contains alphanumeric characters
		return "course.oid IN ('" + params.class.join("', '") + "')";
	})();

	return [schoolId, courseOidsFilterSql];
};

const fetchContentItemOrderByInner = (params, ctx) => fetchSortSqlInner(ctx, "asset.title ASC", params, allowedContentItemSortFields);
const fetchCopyOrderByInner = (params, ctx) => fetchSortSqlInner(ctx, "extract.date_created DESC", params, allowedCopiesSortFields);

/**
 * @param {string} courseOidsFilterSql
 * @param {string} orderBy
 * @returns {Promise<{data: IContentItem[], unfiltered_count: number}>}
 */
const getContentItems = async (querier, schoolId, courseOidsFilterSql, orderBy, limitAndOffset) => {
	const getSql = (selectFields, limit, offset) => {
		return `
			SELECT
				${selectFields}
			FROM
				asset
			INNER JOIN extract
				ON extract.asset_id = asset.id
			LEFT JOIN extract_access
				ON extract_access.extract_id = extract.id
			LEFT JOIN course
				ON course.id = extract.course_id
			WHERE
				extract.school_id = $1
				AND extract.archive_date IS NULL
				AND ${courseOidsFilterSql}
			GROUP BY
				asset.id
			ORDER BY
				${orderBy}
			${typeof limit !== "undefined" ? "LIMIT " + limit : ""}
			${typeof offset !== "undefined" ? "OFFSET " + offset : ""}
		`;
	};
	const data = (
		await querier(
			getSql(
				`
				asset.title AS title,
				asset.pdf_isbn13 AS isbn,
				COUNT(DISTINCT extract.id) AS number_of_copies,
				COUNT(extract_access.id) AS number_of_student_views
			`,
				limitAndOffset.limit,
				limitAndOffset.offset
			),
			[schoolId]
		)
	).rows;
	const count = parseInt((await querier(`SELECT COUNT(*) AS _count_ FROM (${getSql("asset.id")}) v`, [schoolId])).rows[0]._count_, 10);
	return { data, unfiltered_count: count };
};

/**
 * @param {string} courseOidsFilterSql
 * @param {string} orderBy
 * @returns {Promise<{data: ICopy[], unfiltered_count: number}>}
 */
const getCopies = async (querier, schoolId, courseOidsFilterSql, orderBy, limitAndOffset) => {
	const getSql = (selectFields, limit, offset) => {
		return `
			SELECT
				${selectFields}
			FROM
				extract
			LEFT JOIN extract_access
				ON extract_access.extract_id = extract.id
			INNER JOIN asset
				ON asset.id = extract.asset_id
			LEFT JOIN course
				ON course.id = extract.course_id
			WHERE
				extract.school_id = $1
				AND extract.archive_date IS NULL
				AND ${courseOidsFilterSql}
			GROUP BY
				extract.id
			ORDER BY
				${orderBy}
			${typeof limit !== "undefined" ? "LIMIT " + limit : ""}
			${typeof offset !== "undefined" ? "OFFSET " + offset : ""}
		`;
	};
	const data = (
		await querier(
			getSql(
				`
				extract.title AS copy_title,
				MIN(asset.title) AS title,
				MIN(asset.pdf_isbn13) AS isbn,
				COUNT(extract_access.id) AS number_of_student_views,
				extract.date_created AS date_created
			`,
				limitAndOffset.limit,
				limitAndOffset.offset
			),
			[schoolId]
		)
	).rows;
	const count = parseInt((await querier(`SELECT COUNT(*) AS _count_ FROM (${getSql("extract.id")}) v`, [schoolId])).rows[0]._count_, 10);
	return { data, unfiltered_count: count };
};

/**
 * @param {object} params
 * @param {number=} params.school_id
 * @param {string[]=} params.class
 * @param {number=} params.offset
 * @param {number=} params.limit
 * @param {ISort=} params.sort
 * @returns {Promise<{data: IContentItem[], unfiltered_count: number}>}
 */
const getContentItemsRoute = async function (params, ctx) {
	const [schoolId, courseOidsFilterSql] = await validateRouteAndGetParams(params, ctx);
	const orderBy = fetchContentItemOrderByInner(params, ctx);
	const offsetAndLimit = fetchLimitAndOffsetInner(params, ctx);
	const querier = ctx.appDbQuery.bind(ctx);
	return await getContentItems(querier, schoolId, courseOidsFilterSql, orderBy, offsetAndLimit);
};

/**
 * @param {object} params
 * @param {number=} params.school_id
 * @param {string[]=} params.class
 * @param {number=} params.offset
 * @param {number=} params.limit
 * @param {ISort=} params.sort
 * @returns {Promise<{data: ICopy[], unfiltered_count: number}>}
 */
const getCopiesRoute = async function (params, ctx) {
	const [schoolId, courseOidsFilterSql] = await validateRouteAndGetParams(params, ctx);
	const orderBy = fetchCopyOrderByInner(params, ctx);
	const offsetAndLimit = fetchLimitAndOffsetInner(params, ctx);
	const querier = ctx.appDbQuery.bind(ctx);
	return await getCopies(querier, schoolId, courseOidsFilterSql, orderBy, offsetAndLimit);
};

const getAllCourses = async (querier, schoolId) => {
	return (
		await querier(
			`
			SELECT
				oid AS id,
				title AS title
			FROM
				course
			WHERE
				school_id = $1
				AND archive_date IS NULL
			ORDER BY
				title ASC,
				id ASC
		`,
			[schoolId]
		)
	).rows;
};

/**
 * @param {number} schoolId
 * @returns {Promise<IFilter>}
 */
const getCoursesFilter = async (querier, schoolId) => {
	const courses = await getAllCourses(querier, schoolId);
	return {
		id: "class",
		title: "Class",
		data: courses,
	};
};

/**
 * @param {number} schoolId
 * @returns {Promise<IFilter[]>}
 */
const getAllFilters = async (querier, schoolId) => {
	return [await getCoursesFilter(querier, schoolId)];
};

const getFiltersRoute = async (params, ctx) => {
	const schoolId = await validateRouteAndGetSchoolId(params, ctx);
	return {
		result: await getAllFilters(ctx.appDbQuery.bind(ctx), schoolId),
	};
};

/**
 * @param {IParams} params
 * @returns {Promise<IGetAllReturnData>}
 */
const getAllRoute = async function (params, ctx) {
	const [schoolId, courseOidsFilterSql] = await validateRouteAndGetParams(params, ctx);

	const unlockedTitles = parseInt(
		(
			await ctx.appDbQuery(
				`
					SELECT
						COUNT(DISTINCT asset.id) AS _count_
					FROM
						asset
					LEFT JOIN asset_school_info
						ON asset_school_info.asset_id = asset.id
						AND asset_school_info.school_id = $1
					WHERE
						asset.active
						AND asset.is_ep
						AND (
							asset.auto_unlocked
							OR (
								COALESCE(asset_school_info.is_unlocked, FALSE)
								AND (
									asset_school_info.expiration_date IS NULL
									OR asset_school_info.expiration_date > NOW()
								)
							)
						)::boolean
				`,
				[schoolId]
			)
		).rows[0]._count_,
		10
	);

	const [copiedTitles, copiesTotal] = await (async () => {
		const data = (
			await ctx.appDbQuery(
				`
					SELECT
						COUNT(DISTINCT extract.asset_id) AS assets,
						COUNT(extract.id) AS extracts
					FROM
						extract
					LEFT JOIN course
						ON course.id = extract.course_id
					WHERE
						extract.school_id = $1
						AND extract.archive_date IS NULL
						AND extract.date_expired > NOW()
						AND ${courseOidsFilterSql}
				`,
				[schoolId]
			)
		).rows[0];
		return [parseInt(data.assets, 10), parseInt(data.extracts, 10)];
	})();

	const studentViews = parseInt(
		(
			await ctx.appDbQuery(
				`
					SELECT
						COUNT(*) AS _count_
					FROM
						extract_access
					LEFT JOIN extract
						ON extract_access.extract_id = extract.id
					LEFT JOIN course
						ON course.id = extract.course_id
					WHERE
						extract.school_id = $1
						AND extract.archive_date IS NULL
						AND ${courseOidsFilterSql}
				`,
				[schoolId]
			)
		).rows[0]._count_,
		10
	);

	/**
	 * @type IGetAllReturnData
	 */
	const ret = {
		unlockedTitles,
		copiedTitles,
		copiesTotal,
		studentViews,
	};

	return ret;
};

module.exports = {
	getContentItemsRoute,
	getCopiesRoute,
	getAllRoute,
	getFiltersRoute,
};
