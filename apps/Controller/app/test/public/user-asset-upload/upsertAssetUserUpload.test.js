const upsertAssetUserUpload = require("../../../core/public/user-asset-upload/upsertAssetUserUpload");
let params;

const resetAll = () => {
	params = {
		asset_id: 111,
		user_id: 222,
		pages: [1, 2, 4, 5],
		title: "title",
		file_name: "foo.pdf",
		upload_name: "test",
		is_copying_full_chapter: false,
		file_size: 2,
		copy_ratio: 0.03,
		oid: "12345667",
		asset_authors: ["abc", "def"],
		user_first_name: "test name",
		user_last_name: "abc",
	};
};

beforeEach(resetAll);
afterEach(resetAll);
test("runs", async () => {
	let binds;
	const querier = (q, b) => {
		binds = b;
		return {
			rows: [{ id: 12345 }],
			rowCount: 1,
		};
	};
	const ret = await upsertAssetUserUpload(querier, params);
	expect(ret).toBe(12345);
	expect(binds).toEqual([111, 222, "[1,2,4,5]", "title", "foo.pdf", "test", false, 2, 0.03, "12345667", ["abc", "def"], "test name", "abc"]);
});
