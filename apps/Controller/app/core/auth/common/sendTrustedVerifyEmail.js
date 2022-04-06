const getUrl = require("../../../common/getUrl");

module.exports = function (sendEmail, email, token, firstName, schoolName) {
	const url = getUrl(`/auth/approved-verify/${token}`);
	return sendEmail.sendTemplate(
		null,
		email,
		`Welcome to the Education Platform`,
		{
			title: `Welcome to the Education Platform`,
			content: `Hello ${firstName},<br/><br/>You can now use the Education Platform to help save time in lesson preparation and use ${schoolName}'s books to make copies under the CLA Education Licence.<br/><br/>You can find and unlock books, make copies, and share them right away.<br/><br/>Finally, please click on the link below to verify your email address.`,
			cta: {
				title: `Verify email address`,
				url: url,
			},
		},
		null,
		"approved-verify"
	);
};
