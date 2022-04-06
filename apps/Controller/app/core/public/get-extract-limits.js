const ensure = require("#tvf-ensure");
const getExtractLimitPercentage = require("./common/getExtractLimitPercentage");
const getSchoolIdFromExtract = require("./common/getSchoolIdFromExtract");
const getExtractPagesForCourse = require("../../common/getExtractPagesForCourse");
const getExtractPagesForSchool = require("../../common/getExtractPagesForSchool");
const staticValues = require("../../common/staticValues");

module.exports = async function (params, ctx) {
	ensure.validAssetIdentifier(ctx, params.work_isbn13, "ISBN");

	await ctx.ensureLoggedIn();

	const querier = ctx.appDbQuery.bind(ctx);
	const schoolId = await getSchoolIdFromExtract(ctx, params.extract_oid);

	// ensure the asset exists
	let asset;
	{
		const results = await querier(
			`
				SELECT
					id,
					copyable_page_count
				FROM
					asset
				WHERE
					pdf_isbn13 = $1
					AND active
					AND is_ep
			`,
			[params.work_isbn13]
		);
		if (Array.isArray(results.rows) && results.rows.length) {
			asset = results.rows[0];
		}
	}
	ctx.assert(asset, 400, "Asset not found");
	asset.id = parseInt(asset.id, 10);
	asset.copyable_page_count = parseInt(asset.copyable_page_count, 10);

	const extractLimitPercentage = await getExtractLimitPercentage(querier, params.work_isbn13);

	// calculate the extract ratio and extract ratio by school
	const allowed_extract_ratio = extractLimitPercentage.class;
	const allowed_extract_ratio_by_school = extractLimitPercentage.school;

	// get the page numbers already extracted - for school
	let pagesAlreadyExtractedForSchool = [];
	if (params.extract_oid) {
		/**
		 * Exclude the pages contributed by params.extract_oid.
		 * Needed if we're e.g. _editing_ an extract rather than creating one.
		 * We must exclude this extract because, on the front-end, the user may remove
		 * pages from the extract.
		 */
		pagesAlreadyExtractedForSchool = await getExtractPagesForSchool(querier, schoolId, asset.id, params.extract_oid, []);
	} else {
		/**
		 * No need to exclude an extract (e.g. because we're creating a new extract).
		 */
		const results = await querier(
			`
				SELECT
					page_number
				FROM
					extract_page_by_school
				WHERE
					school_id = $1
					AND asset_id = $2
					AND archive_date IS NULL
			`,
			[schoolId, asset.id]
		);
		pagesAlreadyExtractedForSchool = results.rows.map((row) => row.page_number);
	}
	const extractPageLimitForSchool = Math.ceil(asset.copyable_page_count * allowed_extract_ratio_by_school);

	if (params.course_oid) {
		ensure.validIdentifier(ctx, params.course_oid, "Course");

		// ensure the course oid exists
		let courseId = 0;
		{
			const results = await querier(
				`
				SELECT
					id
				FROM
					course
				WHERE
					oid = $1
					AND archive_date IS NULL
			`,
				[params.course_oid]
			);
			if (Array.isArray(results.rows) && results.rows.length) {
				courseId = parseInt(results.rows[0].id, 10);
			}
		}
		if (!courseId) {
			ctx.throw(400, "Course not found");
		}

		// get the page numbers already extracted - for course
		let pagesAlreadyExtractedForCourse = [];
		if (params.extract_oid) {
			/**
			 * Exclude the pages contributed by params.extract_oid.
			 * Needed if we're e.g. _editing_ an extract rather than creating one.
			 * We must exclude this extract because, on the front-end, the user may remove
			 * pages from the extract.
			 */
			pagesAlreadyExtractedForCourse = await getExtractPagesForCourse(
				querier,
				schoolId,
				asset.id,
				params.extract_oid /* Exclude the pages from this extract */,
				courseId,
				[]
			);
		} else {
			/**
			 * No need to exclude an extract (e.g. because we're creating a new extract).
			 */
			const results = await querier(
				`
				SELECT
					page_number
				FROM
					extract_page
				WHERE
					course_id = $1
					AND asset_id = $2
					AND archive_date IS NULL
			`,
				[courseId, asset.id]
			);
			if (Array.isArray(results.rows)) {
				pagesAlreadyExtractedForCourse = results.rows.map((row) => parseInt(row.page_number, 10));
			}
		}
		const extractPageLimitForCourse = Math.ceil(asset.copyable_page_count * allowed_extract_ratio);

		return {
			course: {
				limit: extractPageLimitForCourse,
				extracted: pagesAlreadyExtractedForCourse,
			},
			school: {
				limit: extractPageLimitForSchool,
				extracted: pagesAlreadyExtractedForSchool,
			},
		};
	}

	return {
		school: {
			limit: extractPageLimitForSchool,
			extracted: pagesAlreadyExtractedForSchool,
		},
	};
};
