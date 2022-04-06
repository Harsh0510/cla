const ensure = require("#tvf-ensure");
const inputStringIsValid = require("../../common/inputStringIsValid");

/** Creates a new carousel
 * @param {object} params The request body
 * @param {object} ctx The context object
 */

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	// Throw an error if non cla admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonEmptyStr(ctx, params.name, "Name");
	inputStringIsValid.lengthIsValid(ctx, params.name, "Name", 1, 255);
	ensure.nonEmptyStr(ctx, params.image_url, "Image Url");
	ctx.assert(typeof params.enabled === "boolean", 400, "Enabled should be a boolean");
	ctx.assert(typeof params.sort_order == "number" && params.sort_order >= 0, 400, "Sort Order should be a positive real type");

	if (params.image_alt_text) {
		ctx.assert(typeof params.image_alt_text === "string", 400, "Image Alt Text should be a string");
	}

	if (params.link_url) {
		ctx.assert(typeof params.link_url === "string", 400, "Link Url should be a string");
	}

	let result;

	try {
		result = await ctx.appDbQuery(
			`
			INSERT INTO
				carousel_slide
				(
					name,
					date_created,
					date_edited,
					enabled,
					sort_order,
					image_url,
					image_alt_text,
					link_url
				)
				VALUES
				(
					$1,
					NOW(),
					NOW(),
					$2,
					$3,
					$4,
					$5,
					$6
				)
			`,
			[params.name, params.enabled, params.sort_order, params.image_url, params.image_alt_text, params.link_url]
		);
	} catch (e) {
		// prevent carousel from having the same panel name
		if (e.message.indexOf("violates unique constraint") >= 0) {
			ctx.throw(400, "A carousel with that panel name already exists");
		}
		throw e;
	}
	return {
		created: result.rowCount > 0,
	};
};
