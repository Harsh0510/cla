const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	let limit, sortDirection, sortField;

	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "Limit");
		limit = params.limit;
	} else {
		limit = 3;
	}

	const columns = Object.create(null);
	columns.sort_order = `cached_latest_blog_post.sort_order`;

	// Ensure that the sort field is a valid column name
	if (params.hasOwnProperty("sort_field")) {
		if (!columns[params.sort_field]) {
			ctx.throw(400, "Sort field not found");
		}
		sortField = columns[params.sort_field];
	} else {
		sortField = "cached_latest_blog_post.sort_order";
	}

	if (params.hasOwnProperty("sort_direction")) {
		ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");
		switch (params.sort_direction.toUpperCase()[0]) {
			case "A":
				sortDirection = "ASC";
				break;
			case "D":
				sortDirection = "DESC";
				break;
			default:
				sortDirection = "ASC";
		}
	} else {
		sortDirection = "ASC";
	}

	const binds = [];
	const limitBind = binds.push(limit);
	const query = `
		SELECT
			id,
			title,
			author_name,
			date_created,
			relative_url,
			image_relative_url
		FROM
			cached_latest_blog_post
		ORDER BY
			${sortField} ${sortDirection}
		LIMIT
			$${limitBind}
	`;
	const result = await ctx.appDbQuery(query, binds);
	return {
		data: result.rows,
	};
};
