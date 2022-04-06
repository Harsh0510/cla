const unlockAssetForSchool = require("../../../core/public/user-asset-upload/unlockAssetForSchool");

test("runs", async () => {
	let binds;
	const querier = (q, b) => {
		binds = b;
		return {
			rows: [{ id: 12345 }],
			rowCount: 1,
		};
	};
	const ret = await unlockAssetForSchool(querier, 111, 222, 123);
	expect(ret).toEqual({ rowCount: 1, rows: [{ id: 12345 }] });
	expect(binds).toEqual([222, 111, 123]);
});
