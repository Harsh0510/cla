const push = require("../../../../core/admin/async_task/hwbSchoolSync/pushTask");

test("works", () => {
	const expected = new Date();
	expected.setDate(expected.getDate() + 1);
	expected.setHours(3);
	expected.setMinutes(47);
	expected.setSeconds(0);
	expected.setMilliseconds(0);
	const res = push({
		pushTask(deets) {
			return deets;
		},
	});
	expect(res).toEqual({
		key: `/admin/hwbSchoolSync`,
		callback: `/admin/hwbSchoolSync`,
		dateToExecute: expected,
	});
});
