const rolloverIntervalForFirstEmail = require("../../../core/admin/lib/rolloverIntervalForFirstEmail");

test("Sucessful get rolloverIntervalForFirstEmail", async () => {
	const result = rolloverIntervalForFirstEmail;
	expect(result).toEqual(7);
});
