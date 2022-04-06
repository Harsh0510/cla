module.exports = async function (params, ctx) {
	ctx.assert(typeof params.isbn13 === "string", 400, "ISBN not provided");
	const result = await ctx.appDbQuery(
		`
			SELECT
				publisher_name_log AS publisher,
				imprint AS imprint
			FROM
				asset
			WHERE
				pdf_isbn13 = $1
				AND is_ep
		`,
		[params.isbn13]
	);
	return {
		data: result.rowCount ? result.rows[0] : null,
	};
};
