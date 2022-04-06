const update = require("../../../../core/admin/async_task/hwbSchoolSync/updateManySchools");

let mockIsIncludeDateEdited = false;

test("works with no schools", async () => {
	const qcalls = [];
	await update((...args) => {
		qcalls.push([...args]);
	}, []);
	expect(qcalls.length).toBe(0);
});

test("works with no schools", async () => {
	const qcalls = [];
	await update(
		(...args) => {
			qcalls.push([...args]);
		},
		[
			{
				name: "a",
				dfeNumber: "b",
			},
			{
				name: "c",
				dfeNumber: "d",
			},
		]
	);
	expect(qcalls.length).toBe(1);
	expect(
		qcalls[0][0]
			.replace(/[\s\t\r\n]+/g, " ")
			.trim()
			.indexOf("UPDATE school SET hwb_identifier") >= 0
	).toBe(true);
});

test("works with no school name", async () => {
	const qcalls = [];
	await update(
		(...args) => {
			qcalls.push([...args]);
		},
		[
			{
				name: "",
				dfeNumber: "b",
			},
			{
				name: "",
				dfeNumber: "d",
			},
		]
	);
	expect(qcalls.length).toBe(1);
	expect(
		qcalls[0][0]
			.replace(/[\s\t\r\n]+/g, " ")
			.trim()
			.indexOf("UPDATE school SET hwb_identifier") >= 0
	).toBe(true);
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
		[
			{
				name: "a",
				dfeNumber: "b",
			},
			{
				name: "b",
				dfeNumber: "d",
			},
		]
	);
	expect(qcalls.length).toBe(1);
	expect(
		qcalls[0][0]
			.replace(/[\s\t\r\n]+/g, " ")
			.trim()
			.indexOf("UPDATE school SET hwb_identifier") >= 0
	).toBe(true);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
