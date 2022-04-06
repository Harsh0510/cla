import idGenerate from "../idGenerate";

/** Function renders correctly */
test("Function renders correctly", async () => {
	const result = idGenerate();
	expect(result).toEqual("ID1");
});
