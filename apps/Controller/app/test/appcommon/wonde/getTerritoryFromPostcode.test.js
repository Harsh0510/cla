const g = require("../../../common/wonde/getTerritoryFromPostcode");

test("no postcode", () => {
	expect(g(null)).toBe("england");
});

test("empty postcode", () => {
	expect(g("")).toBe("england");
});

test("wrong type", () => {
	expect(g(true)).toBe("england");
});

test("invalid postcode", () => {
	expect(g("abc def ghi")).toBe("england");
});

test("syntactically malformed", () => {
	expect(g("AAA BBB")).toBe("england");
});

test("scotland (central)", () => {
	expect(g("FK2 9FB")).toBe("scotland");
});

test("scotland (west)", () => {
	expect(g("G84 0LT")).toBe("scotland");
});

test("wales", () => {
	expect(g("CF37 3EW")).toBe("wales");
});

test("northern ireland", () => {
	expect(g("BT18 0LZ")).toBe("northern-ireland");
});

test("isle of man", () => {
	expect(g("IM1 2EL")).toBe("isle-of-man");
});

test("guernsey", () => {
	expect(g("GY1 2JQ")).toBe("guernsey");
});

test("jersey", () => {
	expect(g("JE1 1AA")).toBe("jersey");
});

test("england (london)", () => {
	expect(g("SW15 5PU")).toBe("england");
});

test("england (liverpool)", () => {
	expect(g("L4 1SE")).toBe("england");
});

test("republic of ireland", () => {
	// we don't support Republic of Ireland postcodes
	expect(g("A65 B2CD")).toBe("england");
});

test("spain", () => {
	// we don't support postcodes in Spain
	expect(g("30003")).toBe("england");
});
