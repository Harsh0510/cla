const doRollover = require("../../../../core/admin/async_task/rollover/doRollover");

test("runs", async () => {
	const allBinds = [];
	let numCalls = 0;
	const querier = (value, binds) => {
		numCalls++;
		if (Array.isArray(binds)) {
			for (const bind of binds) {
				allBinds.push(bind);
			}
		}
	};
	await doRollover(querier, 9999);
	expect(numCalls > 0).toBe(true);
	expect(allBinds.length > 0).toBe(true);
	for (const bind of allBinds) {
		if (typeof bind === "number") {
			expect(bind).toBe(9999);
		} else {
			expect(bind === "cancelled" || bind === "active");
		}
	}
});

test("Ensure date_edited updated successfully in database", async () => {
	const allBinds = [];
	let numCalls = 0;
	let isIncludeDateEditedTimes = 0;
	const querier = (value, binds) => {
		numCalls++;
		if (Array.isArray(binds)) {
			for (const bind of binds) {
				allBinds.push(bind);
			}
		}
		value = value.replace(/[\s\t\r\n]+/g, " ").trim();
		if (value.indexOf("date_edited") !== -1) {
			if (value.indexOf("UPDATE course SET") >= 0) {
				isIncludeDateEditedTimes++;
			}
			if (value.indexOf("UPDATE extract SET") >= 0) {
				isIncludeDateEditedTimes++;
			}
			if (value.indexOf("UPDATE extract_share SET") >= 0) {
				isIncludeDateEditedTimes++;
			}
			if (value.indexOf("UPDATE extract_page SET") >= 0) {
				isIncludeDateEditedTimes++;
			}
			if (value.indexOf("UPDATE extract_page_by_school SET") >= 0) {
				isIncludeDateEditedTimes++;
			}
			if (value.indexOf("UPDATE school SET") >= 0) {
				isIncludeDateEditedTimes++;
			}
		}
	};
	await doRollover(querier, 9999);
	expect(numCalls > 0).toBe(true);
	expect(allBinds.length > 0).toBe(true);
	for (const bind of allBinds) {
		if (typeof bind === "number") {
			expect(bind).toBe(9999);
		} else {
			expect(bind === "cancelled" || bind === "active");
		}
	}
	expect(isIncludeDateEditedTimes).toEqual(6);
});
