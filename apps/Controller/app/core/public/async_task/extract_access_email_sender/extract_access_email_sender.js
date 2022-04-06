const exportExtractAccessData = require("../../../../common/exportExtractAccessData");
const generateExcelFile = require("../../../../common/generateExcelFile");
const moment = require("moment");
const sendEmail = require("../../../../common/sendEmail");
const sendEmailData = require(`../../../../common/sendEmailData`);
const emailContent = sendEmailData.alertEmailHighRateUsage;

module.exports = async function (extractAccessRows) {
	const export_ExtractAccessData = exportExtractAccessData(extractAccessRows);
	let fileName = moment().format("YYYY-MM-DD_HH-MM-SS") + ".usage-report.xlsx";
	const export_ExcelFile = generateExcelFile(export_ExtractAccessData, fileName, "Usage");
	let attachment = [
		{
			content: export_ExcelFile.attachFiledata,
			filename: export_ExcelFile.fileName,
			contentType: "application/vnd.ms-excel",
		},
	];

	return await sendEmail.sendTemplate(
		emailContent.from,
		emailContent.to,
		emailContent.subject,
		{
			title: emailContent.subject,
			content: emailContent.body,
			secondary_content: ``,
		},
		attachment,
		"extract-accesses"
	);
};
