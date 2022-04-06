const sendEmailData = require(`../../common/sendEmailData`);

test(`module render correctly `, async () => {
	const data = sendEmailData;
	expect(data.alertEmailHighRateUsage).not.toEqual(null);
	expect(data.alertEmailUserNotCreatedCopies).not.toEqual(null);
});
