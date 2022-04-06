const getUrl = require("../../../../common/getUrl");
const sendEmail = require("../../../../common/sendEmail");
const { emailNotificationCategory } = require("../../../../common/staticValues");

/**
 * @param {string} email
 * @param {string} firstName
 * @param {moment.Moment} rolloverDateMoment
 */
module.exports = async (email, firstName, rolloverDateMoment) => {
	const url = getUrl();
	const niceDate = rolloverDateMoment.format("D MMMM YYYY");
	const niceYear = rolloverDateMoment.format("YYYY");
	await sendEmail.sendTemplate(
		null,
		email,
		"Education Platform end of year rollover: What you need to know",
		{
			content: `Dear ${firstName},
<br/>
<br/>
Your CLA Education Licence term ends on 31 July ${niceYear}. After this, the copy limits resets for the new year.
<br/>
<br/>
This means that all of your current Education Platform copies will soon expire, in line with the Licence terms.
<strong>For your school, this will happen on ${niceDate}.</strong>
After this date, your classes' student numbers are set to 0 so you can add the correct numbers for the new year. Any share links you have shared with students in the last year will expire.
<br/>
<br/>
While this gives you a chance to copy a different page range from the same books for the same class in the new year, we know that you might want to continue using some of your copies just as they are now. Do not worry: it will be easy to reinstate your copies, and any copies where you choose to use the same page range for another year will retain the shame share link, so you don't have to replace links already shared with your students.
<br/>
<br/>
After ${niceDate}, simply login to the <a href="${url}">Education Platform</a> and we will show you what to do if you want to reuse any of this year's copies. And of course, you can create brand new copies for the new year after this date, too.
<br/>
<br/>
You can read our knowledgebase article about rollover already now, just click <a href="https://educationplatform.zendesk.com/hc/en-us/articles/4402451698577">here</a>.`,
		},
		null,
		emailNotificationCategory.rolloverEmail + "-1"
	);
};
