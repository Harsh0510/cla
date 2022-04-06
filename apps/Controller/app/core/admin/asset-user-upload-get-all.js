const ensure = require("#tvf-ensure");
const getExtractUserAssetUrl = require("../public/common/getExtractUserAssetUrl");

const flags = {
	chapter: "Chapter",
	over_5: "Over 5%",
	incorrect_pdf_page_count: "Incorrect PDF page count",
};

const sortableColumns = {
	id: `id`,
	institution: `school_name`,
	institution_id: `school_id`,
	user_name: (dir) => `asset_user_upload.user_first_name ${dir}, asset_user_upload.user_last_name ${dir}`,
	email: `email`,
	date_of_upload: `date_of_upload`,
	isbn: `isbn13`,
	title: `title`,
	page_count: `page_count`,
	pdf_size: `file_size`,
	copy_count: `copy_count`,
	publisher: `publisher`,
	copy_limit: `copy_ratio`,
	change_in_pdf_count: `page_count_difference_log`,
};

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

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

	// Ensure that the sort field is a valid column name
	ctx.assert(sortableColumns[params.sort_field], 400, "Sort field not found");

	const sortSql = (() => {
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
		const sortField = sortableColumns[params.sort_field];
		if (typeof sortField === "function") {
			return sortField(sortDirection);
		}
		return sortField + " " + sortDirection;
	})();

	let unfilteredCount;

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");

		if (params.filter.hasOwnProperty("institutions")) {
			ctx.assert(Array.isArray(params.filter.institutions), 400, "Invalid institutions provided");
			activeFilters.institutions = params.filter.institutions;
		}

		if (params.filter.hasOwnProperty("flags")) {
			ctx.assert(Array.isArray(params.filter.flags), 400, "Invalid Flags provided");
			activeFilters.flags = params.filter.flags;
		}
		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length for cla-admin
	if (Object.keys(filterRequest).length > 3 && userRole === "cla-admin") {
		ctx.throw(400, `Too many filters provided`);
	}

	//query parameters
	let binds = [];
	const whereClauses = [];
	let joins = [];
	//add filter for schools
	if (activeFilters.institutions) {
		const schoolValues = [];
		for (const school of activeFilters.institutions) {
			ensure.positiveInteger(ctx, school, "Institution id");
			schoolValues.push(school);
		}
		if (schoolValues.length > 0) {
			whereClauses.push(`(cla_user.school_id IN (${schoolValues.join(", ")}))`);
			joins.push("LEFT JOIN cla_user ON cla_user.id = asset_user_upload.user_id");
		}
	}

	//add filter for flag
	if (activeFilters.flags) {
		const flagValues = [];
		for (const flag of activeFilters.flags) {
			ctx.assert(flags.hasOwnProperty(flag), 400, "Flag not found");
			ensure.nonEmptyStr(ctx, flag, "Flag");
			flagValues.push(flag);
		}
		if (flagValues.length > 0) {
			const flagWhereCluases = [];
			for (const flag of flagValues) {
				if (flag === "chapter") {
					flagWhereCluases.push(`( asset_user_upload.is_copying_full_chapter = TRUE AND asset_user_upload.copy_ratio > 0.05)`);
				}
				if (flag === "over_5") {
					flagWhereCluases.push(`( asset_user_upload.is_copying_full_chapter = FALSE AND asset_user_upload.copy_ratio > 0.05)`);
				}
				if (flag === "incorrect_pdf_page_count") {
					flagWhereCluases.push(`( asset_user_upload.page_count_difference_log > 0)`);
				}
			}
			whereClauses.push(`(${flagWhereCluases.join(" OR")})`);
		}
	}
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		whereClauses.push(`(asset_user_upload.keywords @@ plainto_tsquery($${binds.push(params.query)}))`);
	}

	const whereClausesSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

	const count = await ctx.appDbQuery(
		`
			SELECT
				COUNT (*) AS _count_
			FROM
				asset_user_upload
			${joins.join(" ")}
			${whereClausesSql}
		`,
		binds
	);

	unfilteredCount = parseInt(count.rows[0]._count_, 10);

	if (!unfilteredCount) {
		return {
			data: [],
			unfiltered_count: 0,
		};
	}

	const result = await ctx.appDbQuery(
		`
			SELECT
				asset_user_upload.id AS id,
				asset_user_upload.user_id AS user_id,
				asset_user_upload.date_created AS date_of_upload,
				asset_user_upload.pages AS page_range,
				asset_user_upload.filename AS filename,
				asset_user_upload.file_size AS file_size,
				asset_user_upload.copy_ratio AS copy_ratio,
				asset_user_upload.user_first_name AS first_name,
				asset_user_upload.user_last_name AS last_name,
				asset_user_upload.page_count_difference_log AS page_count_difference_log,
				asset_user_upload.is_copying_full_chapter AS is_copying_full_chapter,
				MAX(cla_user.email) AS email,
				MAX(school.id) AS school_id,
				MAX(asset.isbn13) AS isbn13,
				MAX(asset.title) AS title,
				MAX(asset.publisher_name_log) AS publisher,
				MAX(asset.page_count) AS page_count,
				MAX(school.name) As school_name,
				COUNT(extract.id) FILTER (WHERE extract.archive_date IS NULL) AS copy_count
			FROM
				asset_user_upload
			LEFT JOIN cla_user
				ON asset_user_upload.user_id = cla_user.id
			LEFT JOIN school
				ON cla_user.school_id = school.id
			LEFT JOIN asset
				ON asset_user_upload.asset_id = asset.id
			LEFT JOIN extract
				ON asset_user_upload.id = extract.asset_user_upload_id
			${whereClausesSql}
			GROUP BY
				asset_user_upload.id
			ORDER BY
				${sortSql},
				asset_user_upload.id DESC
			OFFSET
				${offset}
			LIMIT
				${limit}
		`,
		binds
	);

	for (const extract of result.rows) {
		if (extract.filename) {
			extract.pdf_url = getExtractUserAssetUrl(extract.filename);
		}
	}
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
