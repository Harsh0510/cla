const XLSX = require("xlsx");

module.exports = function (exportData, fileName, sheetName = "sheet1") {
	/* make the worksheet */
	const ws = XLSX.utils.json_to_sheet(exportData);

	/* add to workbook */
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, sheetName, fileName);

	const attachFiledata = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false });
	return {
		fileName,
		attachFiledata,
	};
};
