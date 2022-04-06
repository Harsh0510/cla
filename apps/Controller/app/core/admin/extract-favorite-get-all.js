const ensure = require("#tvf-ensure");
const isUnlockedSql = require("../../common/isUnlockedSql");

const sortableColumns = Object.create(null);
sortableColumns.title = (dir) => `extract.title ${dir}, asset.title ${dir}`;
sortableColumns.publisher = (dir) => "asset.publisher_name_log " + dir;
sortableColumns.is_unlocked = (dir) => isUnlockedSql(true) + " " + dir;
sortableColumns.pdf_isbn13 = (dir) => "asset.pdf_isbn13 " + dir;
sortableColumns.publication_year = (dir) => "asset.publication_date " + dir;
sortableColumns.edition = (dir) => "asset.edition " + dir;
sortableColumns.date_created = (dir) => "asset.date_created " + dir;

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id, 401, "Must be associated with an institution");

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	if (!sortableColumns[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	const sortField = sortableColumns[params.sort_field];

	const sortDirection = (() => {
		if (params.sort_direction.toUpperCase()[0] === "D") {
			return "DESC";
		}
		return "ASC";
	})();

	const sortExpr = sortField(sortDirection);

	const limit = (() => {
		if (params.hasOwnProperty("limit")) {
			ensure.positiveInteger(ctx, params.limit, "Limit");
			return params.limit;
		}
		return 10;
	})();

	const offset = (() => {
		if (params.hasOwnProperty("offset")) {
			ensure.nonNegativeInteger(ctx, params.offset, "Offset");
			return params.offset;
		}
		return 0;
	})();

	const binds = [];
	const selectColumns = [
		"CONCAT(extract.title, ' | ', asset.title) AS title",
		"asset.publisher_name_log AS publisher",
		"asset.authors_log AS authors_log",
		isUnlockedSql(true) + " AS is_unlocked",
		"asset.pdf_isbn13 AS pdf_isbn13",
		"EXTRACT(YEAR FROM asset.publication_date) AS publication_year",
		"asset.edition AS edition",
		"extract.date_created AS date_created",
		"COALESCE(extract_user_info.is_favorite, FALSE) AS is_favorite",
		"extract.oid AS oid",
	];
	const whereClauses = [`(extract_user_info.user_id = $${binds.push(sessionData.user_id)})`, `extract_user_info.is_favorite`];
	const joins = [
		"INNER JOIN extract_user_info ON extract_user_info.extract_id = extract.id",
		"INNER JOIN asset ON extract.asset_id = asset.id",
		`LEFT JOIN asset_school_info ON asset_school_info.asset_id = asset.id AND asset_school_info.school_id = $${binds.push(sessionData.school_id)}`,
	];

	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const bindIdx = binds.push(params.query);
		whereClauses.push(`(
			(extract.keywords @@ plainto_tsquery($${bindIdx}))
			OR (asset.weighted_tsv @@ plainto_tsquery($${bindIdx}))
		)`);
	}

	whereClauses.push(`(extract.archive_date IS NULL)`);

	const unfilteredCount = await (async () => {
		const result = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					extract
				${joins.join(" ")}
				WHERE
					${whereClauses.join(" AND ")}
			`,
			binds
		);
		return result.rows[0]._count_;
	})();

	if (!unfilteredCount) {
		return {
			data: [],
			unfiltered_count: 0,
		};
	}

	const data = await (async () => {
		const result = await ctx.appDbQuery(
			`
				SELECT
					${selectColumns.join(", ")}
				FROM
					extract
				${joins.join(" ")}
				WHERE
					${whereClauses.join(" AND ")}
				ORDER BY
					${sortExpr},
					extract.id ASC
				OFFSET
					${offset}
				LIMIT
					${limit}
			`,
			binds
		);
		return result.rows;
	})();

	return {
		data: data,
		unfiltered_count: unfilteredCount,
	};
};
