const unlockImageUploadStatus = require("../../common/unlockImageUploadStatus");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(unlockImageUploadStatus).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(unlockImageUploadStatus);
	expect(item.length).toBe(3);
});

/** returns Object correctly */
test("returns Object correctly", async () => {
	var item = unlockImageUploadStatus;
	expect(item).toEqual({
		imageUploadStatus: [
			{ id: "pending", name: "Pending" },
			{ id: "awaiting", name: "Awaiting" },
			{ id: "rejected", name: "Rejected" },
			{ id: "approved", name: "Approved" },
			{ id: "approved-pending", name: "Approved (Pending)" },
		],
		statusById: {
			pending: "pending",
			awaiting: "awaiting",
			rejected: "rejected",
			approved: "approved",
			"approved-pending": "approved-pending",
		},
		statusByName: {
			pending: "Pending",
			awaiting: "Awaiting",
			rejected: "Rejected",
			approved: "Approved",
			"approved-pending": "Approved (Pending)",
		},
	});
});
