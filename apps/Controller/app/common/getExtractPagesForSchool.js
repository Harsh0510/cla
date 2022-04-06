const { extractStatus } = require("./staticValues");
/**
 * get extract pages for update the extract_page_by_school
 * @param {*} querier
 * @param {*} schoolId
 * @param {*} assetId
 * @param {*} extractIdOrOid
 * @param {*} newPages
 */
module.exports = async function (querier, schoolId, assetId, extractIdOrOid, newPages = []) {
	const extracts = await querier(
		`
			SELECT
				pages
			FROM
				extract
			WHERE
				asset_id = $1
				AND school_id = $2
				AND archive_date IS NULL
				AND ${typeof extractIdOrOid === "number" ? "id" : "oid"} <> $3
				AND status <> $4
		`,
		[assetId, schoolId, extractIdOrOid, extractStatus.cancelled]
	);
	const extractAssetPagesMap = Object.create(null);

	//bind all pages for active or editable extracts
	extracts.rows.forEach((extract) => {
		extract.pages.forEach((page) => {
			extractAssetPagesMap[page] = true;
		});
	});

	//bind newpages if any
	newPages.forEach((newPage) => {
		extractAssetPagesMap[newPage] = true;
	});

	return Object.keys(extractAssetPagesMap).map((p) => parseInt(p, 10));
};
