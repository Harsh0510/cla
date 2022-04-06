const XLSX = require("xlsx");

const BlobResource = require("../../azure/BlobResource");
const blobService = require("../../azure/azureBlobService");
const pushTask = require("./pushTask");

module.exports = async function (taskDetails) {
	try {
		const result = await taskDetails.query(`
			SELECT
				id AS "DB ID",
				user_id AS "User DB ID",
				school_id AS "School ID",
				school_name AS "School Name",
				isbn AS "ISBN",
				date_created AS "Date Created",
				status AS "Status",
				asset_id AS "Asset DB ID",
				event AS "Unlock Event",
				asset_title AS "Book Title",
				publisher_name AS "Publisher",
				expiration_date AS "Expiration Date"
			FROM
				unlock_attempt
			WHERE
				date_created >= NOW() - interval '6 months'
			ORDER BY
				date_created DESC
			LIMIT 20000
		`);

		/* make the worksheet */
		const ws = XLSX.utils.json_to_sheet(result.rows);

		/* add to workbook */
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, `Sheet1`);

		const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false });

		await blobService.uploadBuffer(xlsxBuffer, new BlobResource(`unlock-attempt`, `attempts.xlsx`));
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
