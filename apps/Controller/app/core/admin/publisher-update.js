const ensure = require("#tvf-ensure");

const parseBuyBookRules = require("../../common/parseBuyBookRules");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	// validate inputs
	ensure.nonNegativeInteger(ctx, params.id, `ID`);

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
	}
	if (params.hasOwnProperty("temp_unlock_opt_in")) {
		ctx.assert(typeof params.temp_unlock_opt_in === "boolean", 400, "Temp Unlock Opt-in should be a boolean");
		numFieldsChanged++;
		updateFields.push(`temp_unlock_opt_in = $${values.push(params.temp_unlock_opt_in)}`);
	}

	updateFields.push(`date_edited = NOW()`);
	updateFields.push(`modified_by_user_id = $${values.push(sessionData.user_id)}`);
	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	const result = await ctx.appDbQuery(
		`
			UPDATE
				publisher
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${params.id}
		`,
		values
	);

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
					publisher_id = $2
			`,
			[sessionData.user_id, params.id]
		);
	}

	return {
		result: result.rowCount > 0,
	};
};
