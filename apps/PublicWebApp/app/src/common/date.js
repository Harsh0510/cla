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
		parseInt(millis, 10)
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

function jsDateTimeToNiceFormat(date) {
	let day = date.getUTCDate();
	let month = date.getUTCMonth() + 1;
	let year = date.getUTCFullYear();
	let hours = date.getUTCHours();
	if (hours < 10) {
		hours = "0" + hours;
	}
	let minutes = date.getUTCMinutes() < 10 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function sqlToNiceFormat(sqlDate) {
	if (sqlDate) {
		return jsDateToNiceFormat(sqlToJsDate(sqlDate));
	} else {
		return null;
	}
}

function sqlToNiceDateTimeFormat(sqlDate) {
	if (sqlDate) {
		return jsDateTimeToNiceFormat(sqlToJsDate(sqlDate));
	} else {
		return null;
	}
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

function rawToNiceDateForExcel(raw) {
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
	return mom.format("YYYY-MM-DD HH:mm:ss");
}

//return MMMM YYYY like January 2020
function sqlToFullMonthYearFormat(raw) {
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
	return mom.format("MMMM YYYY");
}

function timeDifferences(sqlTime) {
	let jsTimeStamp = sqlToJsTimestamp(sqlTime);
	let currentdate = new Date();
	var timeDiff = currentdate - jsTimeStamp;
	var timeDiffinSeconds = parseInt(timeDiff / 1000, 10);
	var minuteDiff = parseInt(timeDiffinSeconds / 60, 10);
	var hourDiff = parseInt(minuteDiff / 60, 10);
	var dayDiff = parseInt(hourDiff / 24, 10);
	var weekDiff = parseInt(dayDiff / 7, 10);

	return {
		minuteDiff,
		hourDiff,
		dayDiff,
		weekDiff,
	};
}

function sqlToNiceDateWithTimeFormat(sqlDate) {
	if (sqlDate) {
		return moment(sqlToJsDate(sqlDate)).format("DD/MM/YYYY HH:mm:ss");
	}
	return null;
}

function getEncodedDate(dt) {
	if (!dt) {
		return null;
	}
	if (typeof dt === "number") {
		return dt;
	}
	return Math.floor(dt.getTime() * 0.001);
}

function getDecodedDate(dt) {
	if (!dt) {
		return null;
	}
	if (typeof dt === "number") {
		return new Date(dt * 1000);
	}
	return dt;
}

export default {
	sqlToJsTimestamp,
	sqlToJsDate,
	jsDateToNiceFormat,
	jsDateTimeToNiceFormat,
	sqlToNiceFormat,
	sqlToNiceDateTimeFormat,
	rawToNiceDate,
	rawToNiceDateForExcel,
	timeDifferences,
	sqlToFullMonthYearFormat,
	sqlToNiceDateWithTimeFormat,
	getEncodedDate,
	getDecodedDate,
};
