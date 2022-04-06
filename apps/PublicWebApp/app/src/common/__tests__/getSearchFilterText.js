import getSearchFilterText from "../getSearchFilterText";

let props;

function resetAll() {
	props = {
		limit: 5,
		offset: 0,
		query: "Test",
		selectedFilter: [{ filter: "Class", values: ["test1", "test2"] }],
		totalRecords: 10,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** function return correctly */
test("function return string correctly", async () => {
	const item = getSearchFilterText(props.limit, props.offset, props.query, props.selectedFilter, props.totalRecords);
	expect(item).toEqual('Showing 1-5 of 10 results for "Test" where Class = "test1" OR "test2"');
});

/** function return correctly without any props*/
test("function return string correctly", async () => {
	const item = getSearchFilterText();
	expect(item).toEqual("");
});

/** function return string when pass more than two filters*/
test("function return string when pass more than two filters", async () => {
	props.selectedFilter = [
		{ filter: "Class", values: ["test1", "test2"] },
		{ filter: "School", values: ["school 1", "school 2"] },
	];
	const item = getSearchFilterText(props.limit, props.offset, props.query, props.selectedFilter, props.totalRecords);
	expect(item).toEqual('Showing 1-5 of 10 results for "Test" where Class = "test1" OR "test2" AND School = "school 1" OR "school 2"');
});

test("function return string when selected filter as object", async () => {
	props.selectedFilter = { filter: "Class", values: ["test1", "test2"] };
	const item = getSearchFilterText(props.limit, props.offset, props.query, props.selectedFilter, props.totalRecords);
	expect(item).toEqual('Showing 1-5 of 10 results for "Test"');
});

test("function return string when single record found", async () => {
	props.totalRecords = 1;
	const item = getSearchFilterText(props.limit, props.offset, props.query, props.selectedFilter, props.totalRecords);
	expect(item).toEqual('Showing 1 result for "Test" where Class = "test1" OR "test2"');
});
