const moment = require("moment");
/**
 * get watermark text
 * @param {*} teacherName
 * @param {*} schoolName
 * @param {*} dateExpired
 */
module.exports = function (teacherName, schoolName, dateExpired) {
	return `${teacherName}, ${schoolName}. Licence expires ${moment(dateExpired).format("D MMMM YYYY")}.`;
};
