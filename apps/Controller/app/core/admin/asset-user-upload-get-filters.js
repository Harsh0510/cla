const flags = [
	{ id: "chapter", name: "Chapter" },
	{ id: "over_5", name: "Over 5%" },
	{ id: "incorrect_pdf_page_count", name: "Incorrect PDF page count" },
];

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	const result = [];

	//push flags data in result
	result.push({
		id: "flags",
		title: "Flags",
		data: flags.map((row) => ({ id: row.id, title: row.name })),
	});
	//push institution-data in result
	let institutionData = [];
	if (params.filter_institutions) {
		// get institutions
		const institutions = await ctx.appDbQuery(
			`
				SELECT
					id,
					name AS title
				FROM
					school
				WHERE
					id IN (${params.filter_institutions})
				ORDER BY
					name ASC
			`
		);
		institutionData = institutions.rows;
	}
	//push institution-data in result
	result.push({
		id: "institutions",
		title: "institutions",
		data: institutionData,
	});
	return {
		result: result,
	};
};
