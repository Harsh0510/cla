const fs = require("fs-extra");
const XLSX = require("xlsx");

const BlobResource = require("../../azure/BlobResource");
const blobService = require("../../azure/azureBlobService");

const pushTask = require("./pushTask");

const writeXlsxFile = (outputPath, workbook, opts) =>
	new Promise((resolve, reject) => {
		XLSX.writeFileAsync(outputPath, workbook, opts, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});

module.exports = async function (taskDetails) {
	const outputPath = "/tmp/out.xlsx";
	try {
		const result = await taskDetails.query(`
			SELECT
				email_activity_log.id AS "DB ID",
				cla_user.id AS "User ID",
				email_activity_log.date_inserted AS "Date inserted",
				email_activity_log.date_event AS "Date of event",
				email_activity_log.first_category AS "First category",
				email_activity_log.event_type AS "Event type",
				email_activity_log.reason AS "Reason",
				email_activity_log.response AS "Response",
				email_activity_log.status AS "Status",
				email_activity_log.smtp_id AS "SMTP ID",
				email_activity_log.url AS "Clicked URL",
				email_activity_log.sg_event_id AS "SendGrid event ID",
				email_activity_log.sg_message_id AS "SendGrid message ID",
				email_activity_log.user_agent AS "User agent",
				email_activity_log.ip AS "IP",
				email_activity_log.content_type AS "Content type"
			FROM 
				email_activity_log
			LEFT JOIN cla_user
				ON cla_user.email = email_activity_log.target_email
			ORDER BY
				date_event DESC
			LIMIT
				50000
		`);

		/* make the worksheet */
		const ws = XLSX.utils.json_to_sheet(result.rows);

		/* add to workbook */
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, `Activity`);

		await writeXlsxFile(outputPath, wb, { bookType: "xlsx", bookSST: false });

		await blobService.uploadFile(outputPath, new BlobResource(`emailactivityreport`, `report.xlsx`));
	} finally {
		try {
			await fs.unlink(outputPath);
		} catch (e) {}
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
