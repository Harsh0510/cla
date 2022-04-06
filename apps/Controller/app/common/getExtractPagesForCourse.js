const { extractStatus } = require("./staticValues");

/**
 * Get extract pages for update the extract_page by course
 * @param {*} querier
 * @param {*} schoolId
 * @param {*} assetId
 * @param {*} extractIdOrOid
 * @param {*} courseId
 * @param {*} newPages
 */
module.exports = async function (querier, schoolId, assetId, extractIdOrOid, courseId, newPages = []) {
	const extracts = await querier(
		`
			SELECT
				pages
			FROM
				extract
			WHERE
				asset_id = $1
				AND course_id = $2
				AND school_id = $3
				AND archive_date IS NULL
				AND ${typeof extractIdOrOid === "number" ? "id" : "oid"} <> $4
				AND status <> $5
		`,
		[assetId, courseId, schoolId, extractIdOrOid, extractStatus.cancelled]
	);

	const extractAssetPagesMap = Object.create(null);

	extracts.rows.forEach((extract) => {
		extract.pages.forEach((page) => {
			extractAssetPagesMap[page] = true;
		});
	});

	//bind new pages if any
	newPages.forEach((newPage) => {
		extractAssetPagesMap[newPage] = true;
	});

	return Object.keys(extractAssetPagesMap).map((p) => parseInt(p, 10));
};
