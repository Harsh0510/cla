const update = require("../../../../core/admin/async_task/hwbSchoolSync/updateSingleSchool");

let mockIsIncludeDateEdited = false;

test("works with school name", async () => {
	const qcalls = [];
	await update(
		(...args) => {
			qcalls.push([...args]);
		},
		"XXX",
		"YYY"
	);
	expect(qcalls.length).toBe(1);
	expect(
		qcalls[0][0]
			.replace(/[\s\t\r\n]+/g, " ")
			.trim()
			.indexOf("UPDATE school SET hwb_identifier") >= 0
	).toBe(true);
	expect(qcalls[0][1]).toEqual(["XXX", "YYY"]);
});

test("works without school name", async () => {
	const qcalls = [];
	await update(
		(...args) => {
			qcalls.push([...args]);
		},
		"XXX",
		null
	);
	expect(qcalls.length).toBe(1);
	expect(
		qcalls[0][0]
			.replace(/[\s\t\r\n]+/g, " ")
			.trim()
			.indexOf("UPDATE school SET hwb_identifier") >= 0
	).toBe(true);
	expect(qcalls[0][1]).toEqual(["XXX", ""]);
});

test("Ensure date_edited updated successfully in database", async () => {
	const qcalls = [];
	await update(
		(...args) => {
			qcalls.push([...args]);
			if (
				args[0]
					.replace(/[\s\t\r\n]+/g, " ")
					.trim()
					.indexOf("UPDATE school SET hwb_identifier") >= 0
			) {
				mockIsIncludeDateEdited =
					args[0]
						.replace(/[\s\t\r\n]+/g, " ")
						.trim()
						.indexOf("date_edited") !== -1
						? true
						: false;
			}
		},
		"XXX",
		"YYY"
	);
	expect(qcalls.length).toBe(1);
	expect(
		qcalls[0][0]
			.replace(/[\s\t\r\n]+/g, " ")
			.trim()
			.indexOf("UPDATE school SET hwb_identifier") >= 0
	).toBe(true);
	expect(qcalls[0][1]).toEqual(["XXX", "YYY"]);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
