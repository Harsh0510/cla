const constants = require(`../../../../core/auth/async_task/user_not_verified_email_sender/constants`);

test(`module render correctly `, async () => {
	const data = constants.hours;
	expect(data.length).toEqual(3);
	expect(data[0]).toEqual(407);
	expect(data[1]).toEqual(239);
	expect(data[2]).toEqual(71);
});
