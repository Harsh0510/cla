/**
 * Get an array of slider items from carousel_slide
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	const result = await ctx.appDbQuery(`
		SELECT
			image_url,
			image_alt_text,
			link_url
		FROM
			carousel_slide
		WHERE
			enabled = true
		ORDER BY
			sort_order ASC,
			date_edited ASC,
			id ASC
	`);
	return {
		result: result.rows,
	};
};
