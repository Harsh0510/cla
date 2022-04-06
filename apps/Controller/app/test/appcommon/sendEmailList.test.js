const sendEmailList = require(`../../common/sendEmailList`);

test(`module render correctly `, async () => {
	const data = sendEmailList;
	expect(data.supportCLA).not.toEqual(null);
	expect(data.supportEP).not.toEqual(null);
	expect(data.supportCLA).not.toEqual("support@educationplatform.zendesk.com");
	expect(data.supportEP).not.toEqual("support@claeedqueries.zendesk.com");
});
