import getNoneEmptyValueArray from "../getNoneEmptyValueArray";

test("Function renders successfully with string array", () => {
	const arr = ["test1", "", "test2", "test3", "", ""];
	expect(getNoneEmptyValueArray(arr)).toEqual(["test1", "test2", "test3"]);
});

test("Function renders successfully with numbers array", () => {
	const arr = [1, "", 2, 3, 4, 5, ""];
	expect(getNoneEmptyValueArray(arr)).toEqual([1, 2, 3, 4, 5]);
});

test("Function renders successfully with both string and numbers array", () => {
	const arr = [1, "", "test1", 2, 3, "test2", 4, 5, ""];
	expect(getNoneEmptyValueArray(arr)).toEqual([1, "test1", 2, 3, "test2", 4, 5]);
});

test("Function renders successfully with all null values", () => {
	const arr = ["", ""];
	expect(getNoneEmptyValueArray(arr)).toEqual([]);
});
