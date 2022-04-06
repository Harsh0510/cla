const { rawToNiceDate } = require("../../../common/date");
const sendEmail = require("../../../common/sendEmail");
const sendEmailList = require("../../../common/sendEmailList");

module.exports = function (schoolName, assetTitle, isbn) {
	const currentDate = Date.now();
	const createdDate = rawToNiceDate(currentDate);
	return sendEmail.sendTemplate(
		null,
		sendEmailList.supportEP,
		`${isbn} has been temporarily unlocked by ${schoolName}`,
		{
			title: null,
			content: `The title, ${assetTitle} (${isbn}), has been temporarily unlocked by ${schoolName} on ${createdDate}.`,
			cta: null,
			secondary_content: null,
		},
		null,
		"admin-temp-unlocked"
	);
};
