/**
 * getExtractExpiryDate for get exipy date for extract
 * params : currentDate
 */
module.exports = function (currentDate, academicYearEndMonth, academicYearEndDay) {
	const expiryMonthDay = [academicYearEndMonth - 1, academicYearEndDay];

	expiryMonthDayNumber = expiryMonthDay[0] * 100 + expiryMonthDay[1] - 1; // Minus 1 day to count upto 30th July. cz if extract is created on 31st July it is valid until next term end
	currentMonthDayNumber = currentDate.getUTCMonth() * 100 + currentDate.getUTCDate();

	// we are after the expiry day in the current year - e.g. we are in September. So the next possible expiry date is July next year.
	let fixedExpiryDate = new Date(currentDate.getUTCFullYear() + 1, expiryMonthDay[0], expiryMonthDay[1], 23, 59, 59, 999);
	if (currentMonthDayNumber <= expiryMonthDayNumber) {
		// we are before the expiry day in the current year
		fixedExpiryDate = new Date(currentDate.getUTCFullYear(), expiryMonthDay[0], expiryMonthDay[1], 23, 59, 59, 999);
	} else {
		// we are after the expiry day in the current year - e.g. we are in September. So the next possible expiry date is July next year.
		fixedExpiryDate = new Date(currentDate.getUTCFullYear() + 1, expiryMonthDay[0], expiryMonthDay[1], 23, 59, 59, 999);
	}

	return fixedExpiryDate;
};
