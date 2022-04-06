const isUnlockedSql = require("../../common/isUnlockedSql");

test("result returns correctly", async () => {
	const item = isUnlockedSql(true);
	expect(item.trim().replace(/\s+/g, " ")).toEqual(
		"( asset.auto_unlocked OR ( COALESCE(asset_school_info.is_unlocked, FALSE) AND ( asset_school_info.expiration_date IS NULL OR asset_school_info.expiration_date > NOW() ) ) )::boolean"
	);
});

test("result returns correctly", async () => {
	const item = isUnlockedSql(false);
	expect(item).toBe("FALSE");
});
