const ensure = require("#tvf-ensure");

const updateExtractPages = async (querier, schoolIds, courseIds) => {
	const courseIdsSql = courseIds.join(", ");

	const result = await querier(
		`
			SELECT
				pages,
				school_id,
				course_id
			FROM
				extract
			WHERE
				course_id IN (${courseIdsSql})
				AND archive_date IS NULL
		`
	);

	if (!result.rowCount) {
		await querier(`
			DELETE FROM
				extract_page_by_school
			WHERE
				archive_date IS NULL
				AND school_id IN (${schoolIds.join(", ")})
		`);
		await querier(`
			DELETE FROM
				extract_page
			WHERE
				archive_date IS NULL
				AND course_id IN (${courseIdsSql})
		`);
		return;
	}

	const pagesByCourse = Object.create(null);
	const pagesBySchool = Object.create(null);
	for (const extract of result.rows) {
		if (!pagesByCourse[extract.course_id]) {
			pagesByCourse[extract.course_id] = Object.create(null);
		}
		if (!pagesBySchool[extract.school_id]) {
			pagesBySchool[extract.school_id] = Object.create(null);
		}
		for (const page of extract.pages) {
			pagesByCourse[extract.course_id][page] = true;
			pagesBySchool[extract.school_id][page] = true;
		}
	}

	const schoolValues = [];
	for (const schoolId in pagesBySchool) {
		for (const page in pagesBySchool[schoolId]) {
			schoolValues.push("'" + schoolId + "." + page + "'");
		}
	}
	await querier(`
		DELETE FROM
			extract_page_by_school
		WHERE
			archive_date IS NULL
			AND school_id IN (${Object.keys(pagesBySchool).join(", ")})
			AND (school_id::text || '.' || page_number::text) NOT IN (${schoolValues.join(", ")})
	`);

	const courseValues = [];
	for (const courseId in pagesByCourse) {
		for (const page in pagesByCourse[courseId]) {
			courseValues.push("'" + courseId + "." + page + "'");
		}
	}
	await querier(`
		DELETE FROM
			extract_page
		WHERE
			archive_date IS NULL
			AND course_id IN (${Object.keys(pagesByCourse).join(", ")})
			AND (course_id::text || '.' || page_number::text) NOT IN (${courseValues.join(", ")})
	`);
};

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	ensure.nonNegativeInteger(ctx, params.id, "ID");

	let didDelete;

	const client = await ctx.getAppDbPool().connect();
	try {
		await client.query("START TRANSACTION ISOLATION LEVEL SERIALIZABLE");
		const results = await client.query(
			`
				DELETE FROM
					asset_user_upload
				WHERE
					id = $1
			`,
			[params.id]
		);

		didDelete = results.rowCount > 0;

		if (results.rowCount) {
			const extractResult = await client.query(
				`
					DELETE FROM
						extract
					WHERE
						asset_user_upload_id = $1
						AND archive_date IS NULL
					RETURNING
						id,
						school_id,
						course_id
				`,
				[params.id]
			);

			if (extractResult.rowCount) {
				const extractIdsSql = extractResult.rows.map((extract) => extract.id).join(", ");
				await client.query(`
					DELETE FROM
						extract_note
					WHERE
						archive_date IS NULL
						AND extract_id IN (${extractIdsSql})
				`);
				await client.query(`
					DELETE FROM
						extract_highlight
					WHERE
						archive_date IS NULL
						AND extract_id IN (${extractIdsSql})
				`);

				await updateExtractPages(
					client.query.bind(client),
					extractResult.rows.map((extract) => extract.school_id),
					extractResult.rows.map((extract) => extract.course_id)
				);
			}
		}
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}

	return {
		result: didDelete,
	};
};
