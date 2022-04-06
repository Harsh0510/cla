const getAllStatuses = require("../../common/getAllStatuses");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(getAllStatuses).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(getAllStatuses);
	expect(item.length).toBe(3);
});

/** returns Object correctly */
test("returns Object correctly", async () => {
	var item = getAllStatuses;
	expect(item).toEqual({
		listStatusArr: [
			{ id: "unverified", name: "Unverified" },
			{ id: "pending", name: "Pending" },
			{ id: "approved", name: "Approved" },
			{ id: "registered", name: "Registered" },
		],
		statusById: {
			unverified: "unverified",
			pending: "pending",
			approved: "approved",
			registered: "registered",
		},
		statusByName: {
			unverified: "Unverified",
			pending: "Pending",
			approved: "Approved",
			registered: "Registered",
		},
	});
});
