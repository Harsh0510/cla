const ensure = require("#tvf-ensure");

const parseBuyBookRules = require("../../common/parseBuyBookRules");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
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
		updateFields.push(`buy_book_rules = $${values.push(JSON.stringify(params.buy_book_rules))}`);
		// flush the buy book rule update cache for this asset
		updateFields.push(`buy_book_link_last_updated = NULL`);
	}
	if (params.hasOwnProperty("active")) {
		numFieldsChanged++;
		const v = params.active ? "TRUE" : "FALSE";
		updateFields.push(`active = ${v}`);
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	updateFields.push(`modified_by_user_id = $${values.push(sessionData.user_id)}`);
	updateFields.push(`date_edited = NOW()`);

	const result = await ctx.appDbQuery(
		`
			UPDATE
				asset
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${params.id}
				AND is_ep
		`,
		values
	);

	if (result.rowCount === 0) {
		ctx.throw(400, "Asset not found");
	}

	return {
		result: true,
	};
};
