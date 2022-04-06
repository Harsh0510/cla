const ensure = require("#tvf-ensure");
const nameDisplayPreference = require("../../common/nameDisplayPreference/sql");
const { userRoles } = require("../../common/staticValues");
const getExtractUserAssetUrl = require("./common/getExtractUserAssetUrl");
const INVALIDACCESSCODE = "invalidaccesscode";
const REQUIREACCESSCODE = "requireaccesscode";
const COOKIEID = "esac"; // 'extract share access code' - keep as short as possible because cookies are transmitted with every request

const getArrayCookieValue = (ctx) => {
	const cookies = ctx._koaCtx.cookies.get(COOKIEID);
	if (!cookies) {
		return [];
	}
	return cookies.split(",");
};

const setArrayCookieValue = (ctx, values) => {
	ctx.setCookie(COOKIEID, values.join(","));
};

module.exports = async function (params, ctx) {
	const sessionData = await ctx.getSessionData();
	let academicYearEndMonth = 8;
	let academicYearEndDay = 15;
	let currentUser = null;
	let enable_extract_share_access_code = false;
	let extract_share_access_code = "";
	let error = null;

	if (params.extract_share_oid && params.extract_share_oid != "share") {
		ensure.validIdentifier(ctx, params.extract_share_oid, "Share OID");
	}

	/** If sessionData not available than check with params.extract_share_oid available than allow to users as viewers */
	if (!sessionData) {
		currentUser = userRoles.viewers;
		ensure.validIdentifier(ctx, params.extract_share_oid, "Share OID");
		//get value of enable_extract_share_access_code
		const results = await ctx.appDbQuery(
			`
				SELECT
					enable_extract_share_access_code,
					access_code
				FROM
					extract_share
				WHERE
					oid = $1
			`,
			[params.extract_share_oid]
		);
		ctx.assert(Array.isArray(results.rows) && results.rows.length, 400, "Extract not found");
		enable_extract_share_access_code = results.rows[0].enable_extract_share_access_code;
		extract_share_access_code = results.rows[0].access_code;
		if (enable_extract_share_access_code) {
			if (!params.access_code) {
				error = REQUIREACCESSCODE;
				if (getArrayCookieValue(ctx).includes(extract_share_access_code)) {
					error = null;
				}
			} else {
				ctx.assert(typeof params.access_code === "string", 400, "access_code is not valid");
				if (extract_share_access_code !== params.access_code) {
					error = INVALIDACCESSCODE;
				} else {
					let myAccessCodes = getArrayCookieValue(ctx);
					if (myAccessCodes.length >= 3) {
						myAccessCodes = myAccessCodes.slice(-2);
					}
					myAccessCodes.push(params.access_code);
					setArrayCookieValue(ctx, myAccessCodes);
				}
			}
		}
	} else {
		currentUser = sessionData.user_role;
		if (currentUser !== userRoles.claAdmin && currentUser !== userRoles.teacher && currentUser !== userRoles.schoolAdmin) {
			ctx.throw(401, "Unauthorized");
		} else {
			if (Array.isArray(sessionData.academic_year_end)) {
				academicYearEndMonth = sessionData.academic_year_end[0];
				academicYearEndDay = sessionData.academic_year_end[1];
			}
		}
	}

	let limit;
	let offset;
	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "Limit");
		limit = params.limit;
	} else {
		limit = 12;
	}

	if (params.hasOwnProperty("offset")) {
		ensure.nonNegativeInteger(ctx, params.offset, "Offset");
		offset = params.offset;
	} else {
		offset = 0;
	}

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");

		if (params.filter.hasOwnProperty("class")) {
			ctx.assert(Array.isArray(params.filter.class), 400, "Invalid class provided");
			activeFilters.class = params.filter.class;
		}

		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length for cla-admin
	if (Object.keys(filterRequest).length > 1) {
		ctx.throw(400, `Too many filters provided`);
	}

	let idx = 1;
	const whereClauses = [];
	whereClauses.push(`(extract.archive_date IS NULL)`);
	const values = [];
	//add filter for class
	if (activeFilters.class) {
		const classValues = [];
		for (const objClass of activeFilters.class) {
			ensure.positiveInteger(ctx, objClass, "Class id");
			classValues.push(objClass);
		}
		if (classValues.length > 0) {
			whereClauses.push(`(extract.course_id IN (${classValues.join(", ")}))`);
		}
	}

	if (params.mine_only) {
		whereClauses.push(`(extract.user_id = $${idx++})`);
		values.push(sessionData.user_id);
	} else {
		if (currentUser !== userRoles.viewers && currentUser !== userRoles.claAdmin) {
			whereClauses.push(`(extract.school_id = $${idx++})`);
			values.push(sessionData.school_id);
		}
	}
	if (params.page_count) {
		whereClauses.push(`(extract.page_count = $${idx++})`);
		values.push(params.page_count);
	}
	if (params.title) {
		whereClauses.push(`(extract.title_tsv @@ plainto_tsquery($${idx++}))`);
		values.push(params.title);
	}
	if (params.year) {
		whereClauses.push(`(extract.date_created_year = $${idx++})`);
		values.push(parseInt(params.year, 10));
	}
	if (params.course_name) {
		whereClauses.push(`(extract.course_name_log_tsv @@ plainto_tsquery($${idx++}))`);
		values.push(params.course_name);
	}
	if (params.work_isbn13) {
		whereClauses.push(`(asset.pdf_isbn13 = $${idx++})`);
		values.push(params.work_isbn13);
	}
	if (params.extract_oid) {
		whereClauses.push(`(extract.oid = $${idx++})`);
		values.push(params.extract_oid);
	}
	if (params.extract_share_oid && params.extract_share_oid != "share") {
		whereClauses.push(`(extract_share.oid = $${idx++})`);
		values.push(params.extract_share_oid);
	}
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		values.push(params.query);
		whereClauses.push(`(extract.keywords @@ plainto_tsquery($${idx++}))`);
	}
	if (sessionData && params.expiry_status) {
		if (params.expiry_status === "active_only") {
			whereClauses.push(`(extract.date_expired >= NOW())`);
		}
		if (params.expiry_status === "review_only") {
			whereClauses.push(`(extract.date_expired < NOW())`, `(extract.parent_id <> 0)`);
		}
	}
	if (params.asset_user_upload_oid) {
		whereClauses.push(`(asset_user_upload.oid = $${idx++})`);
		values.push(params.asset_user_upload_oid);
	}

	const allowedSortFields = {
		teacher: true,
		year_group: true,
		title: true,
		course_name: true,
		page_count: true,
		date_created: true,
		work_title: true,
		date_expired: true,
		status: `(CASE WHEN COALESCE(extract.date_expired <= NOW(), FALSE) THEN 4
		WHEN extract.status='active' THEN 1
		WHEN extract.status='cancelled' THEN 2
		WHEN extract.status='editable' THEN 3
		ELSE 4 END)`,
	};

	let orderByClause = "";
	if (
		Array.isArray(params.order_by) &&
		params.order_by.length === 2 &&
		(params.order_by[1] == "A" || params.order_by[1] == "D") &&
		allowedSortFields.hasOwnProperty(params.order_by[0])
	) {
		let orderByField;
		if (allowedSortFields[params.order_by[0]] === true) {
			orderByField = params.order_by[0];
		} else {
			orderByField = allowedSortFields[params.order_by[0]];
		}
		orderByClause = orderByField + " " + (params.order_by[1] === "A" ? "ASC" : "DESC");
	} else {
		orderByClause = "extract.date_created DESC";
	}

	let unfilteredCount = 0;
	{
		const joins = [];
		joins.push("LEFT JOIN course ON extract.course_id = course.id");
		joins.push("INNER JOIN asset ON extract.asset_id = asset.id");
		joins.push("LEFT JOIN asset_user_upload ON asset_user_upload.id = extract.asset_user_upload_id");
		//Add shareoid for access viewers user
		if (params.extract_share_oid && params.extract_share_oid != "share") {
			joins.push("INNER JOIN extract_share ON extract_share.extract_id = extract.id");
		}

		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					extract
					${joins.join(" ")}
				WHERE
					${whereClauses.join(" AND ")}
			`,
			values
		);
		if (Array.isArray(results.rows) && results.rows.length) {
			unfilteredCount = parseInt(results.rows[0]._count_);
		}
	}

	values.push(limit);
	values.push(offset);

	let extracts = [];
	if (unfilteredCount) {
		const joins = [];
		const selectColumns = [];
		joins.push("LEFT JOIN course ON extract.course_id = course.id");
		joins.push("INNER JOIN asset ON extract.asset_id = asset.id");
		joins.push("LEFT JOIN cla_user ON extract.user_id = cla_user.id");
		joins.push("LEFT JOIN school ON course.school_id = school.id");
		joins.push("LEFT JOIN asset_user_upload ON asset_user_upload.id = extract.asset_user_upload_id");

		if (error === null) {
			// Access code not required
			joins.push("INNER JOIN publisher ON asset.publisher_id = publisher.id");
			if (sessionData && sessionData.user_id) {
				joins.push(`LEFT JOIN extract_user_info ON extract.id = extract_user_info.extract_id AND extract_user_info.user_id = ${sessionData.user_id}`);
				selectColumns.push("COALESCE(extract_user_info.is_favorite, FALSE) AS is_favorite");
			} else {
				selectColumns.push("FALSE AS is_favorite");
			}

			selectColumns.push("extract.oid AS oid");
			selectColumns.push("extract.title AS title");
			selectColumns.push("extract.page_count AS page_count");
			selectColumns.push("course.oid AS course_oid");
			selectColumns.push("course.year_group AS year_group");
			selectColumns.push("extract.course_name_log AS course_name");
			selectColumns.push("asset.pdf_isbn13 AS work_isbn13");
			selectColumns.push("asset.title AS work_title");
			selectColumns.push("asset.authors_log AS work_authors");
			selectColumns.push("asset.publisher_name_log AS work_publisher");
			selectColumns.push("asset.publication_date AS work_publication_date");
			selectColumns.push("asset.edition AS edition");
			selectColumns.push("asset.imprint AS imprint");
			selectColumns.push("extract.exam_board AS exam_board");
			selectColumns.push("extract.students_in_course AS students_in_course");
			selectColumns.push("extract.date_created AS date_created");
			selectColumns.push("extract.date_expired AS date_expired");
			selectColumns.push("COALESCE(extract.date_expired <= NOW(), FALSE) AS expired");
			selectColumns.push("extract.pages AS pages");
			selectColumns.push("school.name AS school_name");
			selectColumns.push("extract.oid AS oid");
			selectColumns.push(`${nameDisplayPreference.getFinal(`cla_user`)} AS teacher`);
			selectColumns.push("asset.page_offset_roman AS page_offset_roman");
			selectColumns.push("asset.page_offset_arabic AS page_offset_arabic");
			selectColumns.push("publisher.enable_extract_share_access_code AS publisher_enable_extract_share_access_code");
			selectColumns.push("asset.content_form AS work_content_form");
			selectColumns.push("asset.file_format AS file_format");
			selectColumns.push("extract.status AS status");
			selectColumns.push("extract.grace_period_end AS grace_period_end");
			if (!sessionData) {
				selectColumns.push(`false AS did_create`);
			} else {
				selectColumns.push(`(extract.user_id = ${sessionData.user_id}) AS did_create`);
			}
			if (sessionData && params.expiry_status && params.expiry_status === "review_only") {
				selectColumns.push(`course.number_of_students AS number_of_students`);
			}
			selectColumns.push("asset_user_upload.filename AS asset_filename");
		} else {
			// Access code required
			selectColumns.push("extract.course_name_log AS course_name");
			selectColumns.push("asset.title AS work_title");
			selectColumns.push("school.name AS school_name");
			selectColumns.push("extract.date_created AS date_created");
			selectColumns.push("asset.pdf_isbn13 AS work_isbn13");
		}

		//Add shareoid for access viewers user
		if (params.extract_share_oid && params.extract_share_oid != "share") {
			joins.push("INNER JOIN extract_share ON extract_share.extract_id = extract.id");
			selectColumns.push(`extract_share.enable_extract_share_access_code`);
		}
		const selectColumnsString = selectColumns.join(", ");
		const results = await ctx.appDbQuery(
			`
				SELECT
					${selectColumnsString}
				FROM
					extract
					${joins.join(" ")}
				WHERE
					${whereClauses.join(" AND ")}
				ORDER BY
					${orderByClause}
				LIMIT
					$${idx++}
				OFFSET
					$${idx++}
			`,
			values
		);
		extracts = results.rows;
	}

	for (const extract of extracts) {
		if (extract.asset_filename) {
			extract.asset_url = getExtractUserAssetUrl(extract.asset_filename);
		}
		delete extract.asset_filename;
	}
	return {
		error: error,
		extracts: extracts,
		unfiltered_count: unfilteredCount,
		academic_year_end: [academicYearEndMonth, academicYearEndDay],
	};
};
