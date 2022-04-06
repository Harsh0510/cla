module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const school_id = sessionData.school_id;
	const result = [];
	try {
		const resultClass = await ctx.appDbQuery(
			`
				SELECT distinct
					course.id,
					course.title
				FROM
					course
				WHERE
					school_id = $1
					AND archive_date IS NULL
				ORDER BY
					course.title ASC
			`,
			[school_id]
		);

		if (Array.isArray(resultClass.rows) && resultClass.rows.length) {
			let classData = resultClass.rows;
			//push class-data in result
			result.push({
				id: "class",
				title: "class",
				data: classData,
			});
		}
		return {
			result: result,
		};
	} catch (e) {
		ctx.throw("500", "An unexpected error has occurred");
	}
};
