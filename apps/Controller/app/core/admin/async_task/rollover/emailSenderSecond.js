const moment = require("moment");

const sendEmail = require("../../../../common/sendEmail");
const { emailNotificationCategory } = require("../../../../common/staticValues");

/**
 *
 * @param {string} email
 * @param {string} firstName
 * @param {moment.Moment} rolloverDateMoment
 */
module.exports = async (email, firstName, rolloverDateMoment) => {
	const niceDate = rolloverDateMoment.format("D MMMM YYYY");
	const niceDateNext = moment(rolloverDateMoment.valueOf() + 24 * 60 * 60 * 1000).format("D MMMM YYYY");

	const niceYear = rolloverDateMoment.format("YYYY");
	const niceYearNext = (parseInt(niceYear, 10) + 1).toString().slice(2);
	await sendEmail.sendTemplate(
		null,
		email,
		"Reminder: A new academic year starts on the Education Platform tomorrow",
		{
			content: `Dear ${firstName},
<br/>
<br/>
This is a reminder to let you know that your school will rollover to a new school year on the Education Platform <strong>tomorrow, on ${niceDate}</strong>. This will be done overnight to ensure as little disruption to you as possible.
<br/>
<br/>
Please login on or after ${niceDateNext} to create new copies for ${niceYear}/${niceYearNext} and create new or edit existing classes. You will also be able to review and reinstate your existing copies if you wish.
<br/>
<br/>
<em>Rollover is a process which happens annually to help you comply with the terms of your CLA Education Licence. For more information, read our rollover knowledgebase article <a href="https://educationplatform.zendesk.com/hc/en-us/articles/4402451698577">here</a>.</em>`,
		},
		null,
		emailNotificationCategory.rolloverEmail + "-2"
	);
};
