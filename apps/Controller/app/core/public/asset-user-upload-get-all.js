const ensure = require("#tvf-ensure");
const getExtractUserAssetUrl = require("./common/getExtractUserAssetUrl");

const sortableColumns = {
	upload_name: `asset_user_upload.upload_name`,
	content_title: `asset_user_upload.title`,
	user: (dir) => `asset_user_upload.user_first_name ${dir}, asset_user_upload.user_last_name ${dir}`,
	date_created: `asset_user_upload.date_created`,
	copy_count: `copy_count`,
	amount_used: `asset_user_upload.copy_ratio`,
};

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if cla admins attempt to access this endpoint
	ctx.assert(userRole === "teacher" || userRole === "school-admin", 401, "Unauthorized");

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

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	// Ensure that the sort field is a valid column name
	ctx.assert(sortableColumns[params.sort_field], 400, "Sort field not found");

	let unfilteredCount;

	const sortSql = (() => {
		let sortDirection;

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

	const whereClauses = [];
	whereClauses.push(`cla_user.school_id = ${sessionData.school_id}`);
	const binds = [];
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		whereClauses.push(`(asset_user_upload.keywords @@ plainto_tsquery($${binds.push(params.query)}))`);
	}
	if (params.mine_only) {
		whereClauses.push(`(asset_user_upload.user_id = $${binds.push(sessionData.user_id)})`);
	}

	const whereClausesSql = whereClauses.join(" AND ");

	// Count all
	{
		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					asset_user_upload
				INNER JOIN cla_user
					ON cla_user.id = asset_user_upload.user_id
				WHERE
					${whereClausesSql}
			`,
			binds
		);

		unfilteredCount = parseInt(results.rows[0]._count_, 10);
	}
	const mainQueryBinds = binds.slice(0);
	const query = `
		SELECT
			asset_user_upload.id AS id,
			asset_user_upload.oid AS oid,
			asset_user_upload.upload_name AS upload_name,
			asset_user_upload.title AS content_title,
			asset_user_upload.date_created AS date_created,
			asset_user_upload.pages AS pages,
			asset_user_upload.asset_id AS asset_id,
			asset_user_upload.filename AS filename,
			asset_user_upload.copy_ratio AS copy_ratio,
			percentile_disc(0.0) WITHIN GROUP (ORDER BY asset.authors_log) AS authors,
			percentile_disc(0.0) WITHIN GROUP (ORDER BY asset.pdf_isbn13) AS isbn13,
			asset_user_upload.user_first_name AS first_name,
			asset_user_upload.user_last_name AS last_name,
			COUNT(extract.id) AS copy_count
		FROM
			asset_user_upload
		LEFT JOIN asset
			ON asset_user_upload.asset_id = asset.id
		LEFT JOIN extract
			ON asset_user_upload.id = extract.asset_user_upload_id
		INNER JOIN cla_user
			ON cla_user.id = asset_user_upload.user_id
		WHERE
			${whereClausesSql}
		GROUP BY
			asset_user_upload.id
		ORDER BY
			${sortSql},
			asset_user_upload.id DESC
		LIMIT
			$${mainQueryBinds.push(limit)}
		OFFSET
			$${mainQueryBinds.push(offset)}
	`;
	const result = await ctx.appDbQuery(query, mainQueryBinds);
	for (const userUpload of result.rows) {
		if (userUpload.filename) {
			userUpload.pdf_url = getExtractUserAssetUrl(userUpload.filename);
		}
	}
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
