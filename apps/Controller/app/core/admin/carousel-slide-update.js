const ensure = require("#tvf-ensure");
const inputStringIsValid = require("../../common/inputStringIsValid");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonNegativeInteger(ctx, params.id, "ID");

	const updateFields = [];
	const values = [];
	let numFieldsChanged = 0;

	if (params.hasOwnProperty("name")) {
		ensure.nonEmptyStr(ctx, params.name, "Name");
		inputStringIsValid.lengthIsValid(ctx, params.name, "Name", 1, 255);
		numFieldsChanged++;
		values.push(params.name);
		updateFields.push(`name = $${values.length}`);
	}
	if (params.hasOwnProperty("image_url")) {
		inputStringIsValid.nameIsValid(ctx, params.image_url, "Image url");
		numFieldsChanged++;
		values.push(params.image_url);
		updateFields.push(`image_url = $${values.length}`);
	}
	if (params.hasOwnProperty("image_alt_text")) {
		ctx.assert(typeof params.image_alt_text === "string", 400, "Image Alt Text should be a string");
		numFieldsChanged++;
		values.push(params.image_alt_text);
		updateFields.push(`image_alt_text = $${values.length}`);
	}
	if (params.hasOwnProperty("link_url")) {
		ctx.assert(typeof params.link_url === "string", 400, "Link Url should be a string");
		numFieldsChanged++;
		values.push(params.link_url);
		updateFields.push(`link_url = $${values.length}`);
	}
	if (params.hasOwnProperty("enabled")) {
		ctx.assert(typeof params.enabled === "boolean", 400, "enabled should be a boolean");
		numFieldsChanged++;
		values.push(params.enabled);
		updateFields.push(`enabled = $${values.length}`);
	}
	if (params.hasOwnProperty("sort_order")) {
		ctx.assert(typeof params.sort_order == "number" && params.sort_order >= 0, 400, "Sort Order should be a positive real type");
		numFieldsChanged++;
		values.push(params.sort_order);
		updateFields.push(`sort_order = $${values.length}`);
	}

	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}

	updateFields.push(`date_edited = NOW()`);

	let result;

	try {
		result = await ctx.appDbQuery(
			`
			UPDATE
				carousel_slide
			SET
				${updateFields.join(", ")}
			WHERE
				id = ${params.id}
		`,
			values
		);

		if (result.rowCount === 0) {
			ctx.throw(400, "Carousel slide not found");
		}
	} catch (e) {
		// prevent carousel from having the same panel name
		if (e.message.indexOf("violates unique constraint") >= 0) {
			ctx.throw(400, "A carousel with that panel name already exists");
		}
		throw e;
	}

	return {
		result: {
			edited: true,
		},
	};
};
