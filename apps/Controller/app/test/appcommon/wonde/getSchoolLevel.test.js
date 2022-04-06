const sl = require("../../../common/wonde/getSchoolLevel");

test(`Tests`, async () => {
	expect(sl(null)).toBe("other");
	expect(sl("")).toBe("other");
	expect(sl("HELLO")).toBe("other");
	expect(sl(" sd dsfs f")).toBe("other");
	expect(sl("other")).toBe("other");
	expect(sl("ALL THROUGH")).toBe("allthrough");
	expect(sl("PRIMARY")).toBe("primary");
	expect(sl("MIDDLE DEEMED PRIMARY")).toBe("primary");
	expect(sl("SECONDARY")).toBe("secondary");
	expect(sl("MIDDLE DEEMED SECONDARY")).toBe("secondary");
	expect(sl("NURSERY")).toBe("nursery");
});
