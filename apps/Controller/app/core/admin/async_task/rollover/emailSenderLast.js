const getUrl = require("../../../../common/getUrl");
const sendEmail = require("../../../../common/sendEmail");
const { emailNotificationCategory } = require("../../../../common/staticValues");
/**
 *
 * @param {string} email
 * @param {string} firstName
 */
module.exports = async (email, firstName) => {
	const url = getUrl();
	await sendEmail.sendTemplate(
		null,
		email,
		"Education Platform rollover is complete: Login now to create your copies for the new year",
		{
			content: `Dear ${firstName},
<br/>
<br/>
We can confirm that rollover is now complete for your school. This means that you have successfully started a new year on the Education Platform. As we mentioned in a previous email to you, this means that
<br/>
<br/>
&bull; Your class details have been kept with the exception of student numbers, which have been set to 0.
<br/>
<br/>
&bull; Your copies from last year have expired, and your copy limit reset. You can now create new copies, or you can review and easily reinstate last year's copies if you wish to do so.
<br/>
<br/>
Read more <a href="https://educationplatform.zendesk.com/hc/en-us/articles/4402451698577">here</a> or head over to the <a href="${url}">Education Platform</a> now to get started.`,
		},
		null,
		emailNotificationCategory.rolloverEmail + "-3-complete"
	);
};
