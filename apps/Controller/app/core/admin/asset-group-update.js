const ensure = require("#tvf-ensure");

const parseBuyBookRules = require("../../common/parseBuyBookRules");

module.exports = async function (params, ctx) {
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData, 401, "Unauthorized");

	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonNegativeInteger(ctx, params.id, "ID");

	const updateFields = [];
	const values = [];
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("buy_book_rules")) {
		ctx.assert(Array.isArray(params.buy_book_rules), 400, `'Buy Book' rules must be an array`);
		ctx.assert(params.buy_book_rules.length <= 10, 400, `Too many 'Buy Book' rules`);
		try {
			parseBuyBookRules(params.buy_book_rules);
		} catch (e) {
			ctx.throw(400, e.message);
		}
		numFieldsChanged++;
		values.push(JSON.stringify(params.buy_book_rules));
		updateFields.push(`buy_book_rules = $${values.length}`);
	}

	if (!numFieldsChanged) {
		ctx.throw(400, "No fields changed");
	}

	const result = await ctx.appDbQuery(
		`
			UPDATE
				asset_group
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${params.id}
		`,
		values
	);

	if (result.rowCount === 0) {
		ctx.throw(400, "Asset group not found");
	}

	if (params.hasOwnProperty("buy_book_rules")) {
		// flush the buy book link cache for associated assets
		await ctx.appDbQuery(
			`
				UPDATE
					asset
				SET
					buy_book_link_last_updated = NULL,
					date_edited = NOW(),
					modified_by_user_id = $1
				WHERE
					parent_asset_group_id = $2
			`,
			[sessionData.user_id, params.id]
		);
	}

	return {
		result: true,
	};
};
