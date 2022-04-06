const moment = require("moment");

function sqlToJsTimestamp(sqlDate) {
	// Example input: 2018-11-11T11:13:20.584Z
	const parts = sqlDate.split(/[^0-9]/g);
	const [year, month, day, hour, minutes, seconds, millis] = parts;
	return Date.UTC(
		parseInt(year, 10),
		parseInt(month, 10) - 1,
		parseInt(day, 10),
		parseInt(hour, 10),
		parseInt(minutes, 10),
		parseInt(seconds, 10),
		parseInt(millis, 10) || 0
	);
}

function sqlToJsDate(sqlDate) {
	return new Date(sqlToJsTimestamp(sqlDate));
}

function jsDateToNiceFormat(date) {
	let day = date.getUTCDate();
	let month = date.getUTCMonth() + 1;
	let year = date.getUTCFullYear();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return `${day}/${month}/${year}`;
}

function sqlToNiceFormat(sqlDate) {
	return jsDateToNiceFormat(sqlToJsDate(sqlDate));
}

function rawToNiceDate(raw) {
	if (!raw) {
		return null;
	}
	let date;
	if (typeof raw === "string") {
		date = sqlToJsDate(raw);
	} else {
		date = raw;
	}
	let mom = moment.utc(date);
	return mom.format("D MMMM YYYY");
}

function rawToNiceDateForExcel(raw, format = "YYYY-MM-DD HH:mm:ss") {
	if (!raw) {
		return null;
	}
	let date;
	if (typeof raw === "string") {
		date = sqlToJsDate(raw);
	} else {
		date = raw;
	}
	let mom = moment.utc(date);
	return mom.format(format);
}

module.exports = {
	sqlToJsTimestamp,
	sqlToJsDate,
	jsDateToNiceFormat,
	sqlToNiceFormat,
	rawToNiceDate,
	rawToNiceDateForExcel,
};
