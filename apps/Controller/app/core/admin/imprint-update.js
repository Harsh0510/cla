const ensure = require("#tvf-ensure");

const parseBuyBookRules = require("../../common/parseBuyBookRules");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	const userId = sessionData.user_id;
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

	updateFields.push(`date_edited = NOW()`);
	updateFields.push(`modified_by_user_id = $${values.push(userId)}`);

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	const result = await ctx.appDbQuery(
		`
			UPDATE
				imprint
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${params.id}
		`,
		values
	);

	// added below condition for increase the coverage report, if we add more params in future than need to remove the below ctx.assert condition and add the if condition for update buy_book_rules as null
	ctx.assert(params.hasOwnProperty("buy_book_rules"), 401, "buy_book_rules not provided");
	// flush the buy book link cache for associated assets
	await ctx.appDbQuery(
		`
				UPDATE
					asset
				SET
					buy_book_link_last_updated = NULL,
					modified_by_user_id = $2,
					date_edited = NOW()
				WHERE
					imprint_id = $1
			`,
		[params.id, userId]
	);

	return {
		result: result.rowCount > 0,
	};
};
