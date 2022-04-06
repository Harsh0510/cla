const ensure = require("#tvf-ensure");

const blogApi = require("../../common/blogApi");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	ctx.assert(params.blog_category_names !== undefined, 400, `No fields changed`);
	ctx.assert(Array.isArray(params.blog_category_names), 400, `News Feed Category must be an array`);
	const updateFields = [];
	const values = [];
	const trim_blog_category_names = [];
	if (params.hasOwnProperty("blog_category_names")) {
		params.blog_category_names.forEach((row) => {
			const hasValue = row ? row.trim() : null;
			if (hasValue) {
				trim_blog_category_names.push(hasValue);
			}
		});
		values.push(JSON.stringify(trim_blog_category_names));
		updateFields.push(`home_screen_blog_category_names = $${values.length}`);
	}

	let getBlogCategoryRecord = await ctx.appDbQuery(
		`
			SELECT
				id,
				home_screen_blog_category_names AS blog_category_names
			FROM
				settings
			ORDER BY 
				id DESC
			LIMIT 1
		`
	);

	if (
		getBlogCategoryRecord &&
		Array.isArray(getBlogCategoryRecord.rows) &&
		getBlogCategoryRecord.rows.length > 0 &&
		getBlogCategoryRecord.rows[0]._count_ > 0
	) {
		throw "Can not find the home screen category row.";
	}

	let result;
	const rowId = getBlogCategoryRecord.rows[0].id;
	const pool = ctx.getAppDbPool();
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		result = await client.query(
			`
			UPDATE
				settings
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${rowId}
			`,
			values
		);
		await client.query("COMMIT");
		await blogApi.blogUpsertByCategoryNames(client.query.bind(client), trim_blog_category_names);
	} catch (e) {
		await client.query("ROLLBACK");
		if (typeof e === "string") {
			ctx.throw(400, e);
		} else {
			ctx.throw(400, "Unknown Error [1]");
		}
	} finally {
		client.release();
	}

	return {
		result: result.rowCount > 0,
	};
};
