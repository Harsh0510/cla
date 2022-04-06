const unlockImageByImageStatus = require("../../common/unlockImageByImageStatus");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(unlockImageByImageStatus).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(unlockImageByImageStatus);
	expect(item.length).toBe(5);
});

/** returns Object correctly */
test("returns Object correctly", async () => {
	var item = unlockImageByImageStatus;
	expect(item).toEqual({
		PENDING: "Pending",
		APPROVED: "Approved",
		REJECTED: "Rejected",
		AWAITING: "Awaiting",
		APPROVED_PENDING: "Approved (Pending)",
	});
});
