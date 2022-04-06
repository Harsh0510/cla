/**
 * function for get JSON Data for generate the excel file
 */

const date = require("./date");

module.exports = function (resultData) {
	let exportData;
	if (resultData.length > 0) {
		// We have some results, so we push each row with the correct column headings.
		exportData = resultData.map((x) => ({
			"Asset DB ID": x.asset_id,
			"Asset Print ISBN": x.isbn13,
			"Asset Name": x.asset_name,
			"Extract Title": x.extract_title,
			"Creator Institution ID": x.creator_school_id,
			"Creator Institution Name": x.creator_school_name,
			"Accessor Institution ID": x.accessor_school_id,
			"Accessor Institution Name": x.accessor_school_name,
			"IP Address": x.ip_address,
			"User Agent": x.user_agent,
			"Access Date": date.rawToNiceDateForExcel(x.date_created),
			"Extract DB ID": x.extract_id,
			"Extract Access DB ID": x.extract_access_id,
			"Extract Share OID": x.extract_share_oid,
			"User ID": x.user_id,
		}));
	} else {
		// No rows, so we just push an empty header row.
		exportData = [
			{
				"Asset DB ID": "",
				"Asset Print ISBN": "",
				"Asset Name": "",
				"Extract Title": "",
				"Creator Institution ID": "",
				"Creator Institution Name": "",
				"Accessor Institution ID": "",
				"Accessor Institution Name": "",
				"IP Address": "",
				"User Agent": "",
				"Access Date": "",
				"Extract DB ID": "",
				"Extract Access DB ID": "",
				"Extract Share OID": "",
				"User ID": "",
			},
		];
	}
	return exportData;
};
