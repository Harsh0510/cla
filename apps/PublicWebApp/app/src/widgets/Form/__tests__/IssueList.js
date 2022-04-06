import IssueList from "../IssueList";

/** Test Initialization of Class */
test(`Test Initialization of Class`, async () => {
	const IssueLists = new IssueList();
	expect(IssueLists.byTypeArray).toEqual({});
	expect(IssueLists.byType).toEqual({});
	expect(IssueLists.byName).toEqual({});
	expect(IssueLists.array).toEqual([]);
});

/** Test methods */
test(`Test addIssue method`, async () => {
	let issue = {
		type: "required",
	};
	let field = "age";
	const IssueLists = new IssueList();
	IssueLists.addIssue(issue, field);
	expect(IssueLists.byTypeArray).toEqual({
		required: [{ field: "age", type: "required" }],
	});

	IssueLists.addIssue(issue, field);
	expect(IssueLists.byTypeArray).toEqual({
		required: [
			{ type: "required", field: "age" },
			{ type: "required", field: "age" },
		],
	});
});

test(`Test hasError method`, async () => {
	let issue = {
		type: "error",
	};
	let field = "age";
	const IssueLists = new IssueList();
	IssueLists.addIssue(issue, field);
	expect(IssueLists.byTypeArray).toEqual({
		error: [{ field: "age", type: "error" }],
	});

	const result = IssueLists.hasError();
	expect(result).toEqual({ undefined: { type: "error", field: "age" } });
});
