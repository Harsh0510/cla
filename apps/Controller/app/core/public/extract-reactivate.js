const ensure = require("#tvf-ensure");
const getExtractExpiryDate = require("../../common/getExtractExpiryDate");
const getExtractLimitPercentage = require("./common/getExtractLimitPercentage");
const { extractEditableGracePeriodLimit, extractStatus } = require("../../common/staticValues");
const EXCEEDED_FOR_SCHOOL = "school";
const EXCEEDED_FOR_COURSE = "course";
const EXTRACT_STATUS_EDITABLE = extractStatus.editable;

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const academicYearEndMonth = sessionData.academic_year_end[0];
	const academicYearEndDay = sessionData.academic_year_end[1];

	const currentUserRole = sessionData.user_role;
	const schoolId = sessionData.school_id;

	const querier = ctx.appDbQuery.bind(ctx);

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");
		if (params.filter.hasOwnProperty("class")) {
			ctx.assert(Array.isArray(params.filter.class), 400, "Invalid class provided");
			activeFilters.class = params.filter.class;
		}
		Object.assign(filterRequest, params.filter);
	}

	// Throw an error if non role attempt to access this endpoint
	ctx.assert(currentUserRole === "teacher" || currentUserRole === "school-admin", 401, "Unauthorized");
	ctx.assert(typeof params.has_selected_all_copies === "boolean", 400, "has_selected_all_copies should be a boolean");
	ctx.assert(Array.isArray(params.oids), 400, "oids should be an array");

	if (!params.oids.length && !params.has_selected_all_copies) {
		ctx.throw(400, "Select at-least one copy from the list");
	}

	//Check filter request length for cla-admin
	if (Object.keys(filterRequest).length > 1) {
		ctx.throw(400, `Too many filters provided`);
	}

	const whereClauses = [];
	const values = [];

	whereClauses.push(`(extract.user_id = $${values.push(sessionData.user_id)})`);
	whereClauses.push(`(extract.date_expired < NOW())`);
	whereClauses.push(`(extract.archive_date IS NULL)`);

	if (params.oids.length) {
		const oidBinds = [];
		for (const oid of params.oids) {
			oidBinds.push("$" + values.push(oid));
		}
		whereClauses.push(`(extract.oid ${params.has_selected_all_copies ? "NOT IN" : "IN"} (${oidBinds.join(",")}))`);
	}

	//add filter for class
	if (activeFilters.class) {
		const classValues = [];
		for (const objClass of activeFilters.class) {
			ensure.positiveInteger(ctx, objClass, "Class id");
			classValues.push(objClass);
		}
		if (classValues.length > 0) {
			whereClauses.push(`(extract.course_id IN (${classValues.join(", ")}))`);
		}
	}

	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		whereClauses.push(`(extract.keywords @@ plainto_tsquery($${values.push(params.query)}))`);
	}

	const joins = [];
	joins.push("INNER JOIN asset ON extract.asset_id = asset.id");
	joins.push("INNER JOIN course ON extract.course_id = course.id");
	joins.push(`LEFT JOIN asset_school_info ON asset.id = asset_school_info.asset_id AND asset_school_info.school_id = $${values.push(schoolId)}`);

	const extractData = await querier(
		`
			SELECT
				extract.id AS extract_id,
				extract.oid AS oid,
				asset.pdf_isbn13 AS pdf_isbn13,
				extract.asset_id AS asset_id,
				extract.pages AS pages,
				extract.title AS title,
				asset_school_info.expiration_date AS asset_expiration_date,
				asset.copyable_page_count AS asset_copyable_page_count,
				CONCAT (extract.course_id, '_', extract.asset_id) AS course_asset_identity,
				extract.course_id AS course_id,
				course.oid AS course_oid
			FROM
				extract
				${joins.join(" ")}
			WHERE
				${whereClauses.join(" AND ")}
		`,
		values
	);

	let reactivateCount = 0;
	const erroredExtract = []; //keep the extract info which copies limit exceeded
	if (Array.isArray(extractData.rows) && extractData.rows.length) {
		const extractOids = [];
		const extractOidBindIndexes = [];

		for (const extract of extractData.rows) {
			extractOidBindIndexes.push("$" + extractOids.push(extract.oid));
		}

		const extractPagesforSchool = await querier(
			`
				SELECT
					asset_id,
					page_number
				FROM
					extract_page_by_school
				WHERE
					school_id = ${schoolId}
					AND asset_id IN (SELECT DISTINCT asset_id FROM extract WHERE oid IN (${extractOidBindIndexes.join(",")}) AND (extract.archive_date IS NULL))
					AND archive_date IS NULL
			`,
			extractOids
		);
		const pagesAlreadyExtractedSchool = Object.create(null);
		for (const row of extractPagesforSchool.rows) {
			if (!pagesAlreadyExtractedSchool[row.asset_id]) {
				pagesAlreadyExtractedSchool[row.asset_id] = Object.create(null);
			}
			pagesAlreadyExtractedSchool[row.asset_id][row.page_number] = true;
		}

		// @todo Performance of this might be problematic - 'where CONCAT(...)' is probably slow
		const extractPagesforCourse = await querier(
			`
				SELECT
					CONCAT (course_id, '_', asset_id) AS course_asset_identity,
					page_number
				FROM
					extract_page
				WHERE
					CONCAT (course_id, '_', asset_id) IN (SELECT DISTINCT CONCAT (course_id, '_', asset_id) FROM extract WHERE oid IN (${extractOidBindIndexes.join(
						","
					)}) AND (extract.archive_date IS NULL))
					AND archive_date IS NULL
			`,
			extractOids
		);
		const pagesAlreadyExtractedCourseAsset = Object.create(null);
		for (const row of extractPagesforCourse.rows) {
			if (!pagesAlreadyExtractedCourseAsset[row.course_asset_identity]) {
				pagesAlreadyExtractedCourseAsset[row.course_asset_identity] = Object.create(null);
			}
			pagesAlreadyExtractedCourseAsset[row.course_asset_identity][row.page_number] = true;
		}

		const cachedExtractLimitsByPdfIsbn13 = Object.create(null);

		const extractPagesByCourse = [];
		const extractPagesBySchool = [];
		for (const extract of extractData.rows) {
			const extractLimitPercentage = await (async () => {
				if (typeof cachedExtractLimitsByPdfIsbn13[extract.pdf_isbn13] === "undefined") {
					cachedExtractLimitsByPdfIsbn13[extract.pdf_isbn13] = await getExtractLimitPercentage(querier, extract.pdf_isbn13);
				}
				return cachedExtractLimitsByPdfIsbn13[extract.pdf_isbn13];
			})();
			const allowedExtractRatio = extractLimitPercentage.class;
			const allowedExtractRatioBySchool = extractLimitPercentage.school;
			const schoolLimit = Math.ceil(extract.asset_copyable_page_count * allowedExtractRatioBySchool);
			const courseLimit = Math.ceil(extract.asset_copyable_page_count * allowedExtractRatio);

			for (const page of extract.pages) {
				extractPagesByCourse.push(`(${extract.course_id},${extract.asset_id},${page})`);
				extractPagesBySchool.push(`(${sessionData.school_id},${extract.asset_id},${page})`);
			}

			for (const page of extract.pages) {
				if (!pagesAlreadyExtractedSchool[extract.asset_id]) {
					pagesAlreadyExtractedSchool[extract.asset_id] = Object.create(null);
				}
				if (!pagesAlreadyExtractedSchool[extract.asset_id][page]) {
					pagesAlreadyExtractedSchool[extract.asset_id][page] = true;
				}

				if (!pagesAlreadyExtractedCourseAsset[extract.course_asset_identity]) {
					pagesAlreadyExtractedCourseAsset[extract.course_asset_identity] = Object.create(null);
				}

				if (!pagesAlreadyExtractedCourseAsset[extract.course_asset_identity][page]) {
					pagesAlreadyExtractedCourseAsset[extract.course_asset_identity][page] = true;
				}
			}

			if (Object.keys(pagesAlreadyExtractedSchool[extract.asset_id]).length > schoolLimit) {
				erroredExtract.push({
					exceededFor: EXCEEDED_FOR_SCHOOL,
					copyTitle: extract.title,
					pdf_isbn13: extract.pdf_isbn13,
					course_oid: extract.course_oid,
					oid: extract.oid,
					pages: extract.pages,
				});
			} else if (Object.keys(pagesAlreadyExtractedCourseAsset[extract.course_asset_identity]).length > courseLimit) {
				erroredExtract.push({
					exceededFor: EXCEEDED_FOR_COURSE,
					copyTitle: extract.title,
					pdf_isbn13: extract.pdf_isbn13,
					course_oid: extract.course_oid,
					oid: extract.oid,
					pages: extract.pages,
				});
			}
		}

		//if no any copy limit exceeded for selected reactivate extracts than allow to reactive them
		if (erroredExtract.length === 0) {
			const updateExtractValues = [];
			const updateExtractShareValues = [];
			const bindExtractValues = [];
			const bindExtractShareValues = [];
			let dateExpired = getExtractExpiryDate(new Date(), academicYearEndMonth, academicYearEndDay);

			for (const extract of extractData.rows) {
				if (extract.asset_expiration_date) {
					dateExpired = extract.asset_expiration_date;
				}
				updateExtractValues.push(
					`($${bindExtractValues.push(extract.extract_id)}::integer, $${bindExtractValues.push(dateExpired)}::timestamp, $${bindExtractValues.push(
						EXTRACT_STATUS_EDITABLE
					)}::extract_status)`
				);
				updateExtractShareValues.push(
					`($${bindExtractShareValues.push(extract.extract_id)}::integer, $${bindExtractShareValues.push(dateExpired)}::timestamp)`
				);
				reactivateCount = reactivateCount + 1;
			}
			const pool = ctx.getAppDbPool();
			const client = await pool.connect();
			try {
				await client.query("BEGIN");
				//reactivate extract
				await client.query(
					`
						UPDATE
							extract
						SET
							date_expired = v.date_expired,
							status = v.status,
							grace_period_end = NOW() + INTERVAL '${extractEditableGracePeriodLimit} days',
							modified_by_user_id = ${sessionData.user_id},
							date_edited = NOW()
						FROM
							(VALUES ${updateExtractValues.join(", ")})
							AS v(extract_id, date_expired, status)
						WHERE
							extract.id = v.extract_id
					`,
					bindExtractValues
				);

				//reactivate extract share copy
				await client.query(
					`
						UPDATE
							extract_share
						SET
							date_expired = v.date_expired,
							date_edited = NOW(),
							modified_by_user_id = ${sessionData.user_id}
						FROM
							(VALUES ${updateExtractShareValues.join(", ")})
							AS v(extract_id, date_expired)
						WHERE
							extract_share.extract_id = v.extract_id
					`,
					bindExtractShareValues
				);
				//Update course no_of_students if course's no_of_students is 0 or null for selected extract
				await client.query(
					`
						UPDATE
							course
						SET
							number_of_students = e.students_in_course,
							date_edited = NOW(),
							modified_by_user_id = ${sessionData.user_id}
						FROM (
							SELECT
								course_id,
								MAX(students_in_course) AS students_in_course
							FROM
								extract
							WHERE
								oid IN (${extractOidBindIndexes.join(",")})
								AND archive_date IS NULL
							GROUP BY course_id
						) e
						WHERE
							course.id = e.course_id
							AND (course.number_of_students = 0 OR course.number_of_students IS NULL)
							AND archive_date IS NULL
					`,
					extractOids
				);

				//insert extarct pages
				await client.query(`
					INSERT INTO
						extract_page
						(course_id, asset_id, page_number)
					VALUES
						${extractPagesByCourse.join(",")}
					ON CONFLICT DO NOTHING
				`);

				//insert school extarct pages
				await client.query(`
					INSERT INTO
						extract_page_by_school
						(school_id, asset_id, page_number)
					VALUES
						${extractPagesBySchool.join(",")}
					ON CONFLICT DO NOTHING
				`);
				await client.query("COMMIT");
			} catch (e) {
				await client.query("ROLLBACK");
				throw e;
			} finally {
				client.release();
			}
		}
	}

	return {
		erroredExtract: erroredExtract,
		reactivateCount: reactivateCount,
	};
};
