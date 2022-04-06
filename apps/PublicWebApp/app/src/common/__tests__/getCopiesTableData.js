import getCopiesTableData from "../getCopiesTableData";

let props;

function resetAll() {
	props = {
		data: [
			{
				oid: "6c8a9d1cd85600c7fcfe8b41d69de123d1e3",
				title: "TEST A6",
				course_oid: "18387a7c84c6f241a8125146a42ac2610605",
				year_group: "y1",
				course_name: "Class 1",
				work_isbn13: "9781444123395",
				work_title: "Psychology AS for OCR",
				work_authors: [
					{ role: "A", lastName: "Oliver", firstName: "Karon" },
					{ role: "A", lastName: "Ellerby-Jones", firstName: "Louise" },
					{ role: "A", lastName: "Donald", firstName: "Moira" },
				],
				work_publisher: "Hodder Education Group",
				work_publication_date: "2011-04-29T00:00:00.000Z",
				edition: 1,
				imprint: "Hodder Education",
				exam_board: "CCEA",
				students_in_course: 12,
				page_count: 2,
				date_created: "2019-08-19T11:50:36.727Z",
				date_expired: "2019-11-19T11:50:36.726Z",
				expired: false,
				pages: [1, 2],
				user_id: 642,
				school_name: "AVM Mandir (AVM-65)",
				teacher: "Mrs Pushpa VPanchal",
				status: "Active",
			},
		],
		unfiltered_count: 1,
		sortField: "date_created",
		sort_dir: "A",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`function return object correctly`, async () => {
	const item = getCopiesTableData(props.data, props.unfiltered_count, props.sortField, props.sort_dir);

	expect(item.hasOwnProperty("unfiltered_count")).toBe(true);
	expect(item.hasOwnProperty("columns")).toBe(true);
	expect(item.hasOwnProperty("tableRows")).toBe(true);
	expect(item.hasOwnProperty("defaultColumnWidths")).toBe(true);
	expect(item.hasOwnProperty("tableColumnExtensions")).toBe(true);
	expect(item.hasOwnProperty("defaultSorting")).toBe(true);
	expect(item.hasOwnProperty("sortingStateColumnExtensions")).toBe(true);
	expect(item.hasOwnProperty("loading")).toBe(true);
	expect(item.hasOwnProperty("leftColumns")).toBe(true);
	expect(item.hasOwnProperty("rightColumns")).toBe(true);
	expect(item.hasOwnProperty("dateColumnsName")).toBe(true);

	expect(item.columns).not.toEqual(null);
	expect(item.unfiltered_count === props.unfiltered_count).toBe(true);
	expect(item.columns.length).toEqual(9);
	expect(item.hasOwnProperty("columns")).toBe(true);
});

test(`function return null object when no data found`, async () => {
	props.data = [];
	const item = getCopiesTableData(props.data, props.unfiltered_count, props.sortField, props.sort_dir);
	expect(item).toEqual(null);
});

test(`function return null object when unfiltered_count as 0`, async () => {
	props.unfiltered_count = 0;
	const item = getCopiesTableData(props.data, props.unfiltered_count, props.sortField, props.sort_dir);
	expect(item).toEqual(null);
});

test(`function return null object when sort_dir as "D", async ()`, async () => {
	props.sort_dir = "D";
	const item = getCopiesTableData(props.data, props.unfiltered_count, props.sortField, props.sort_dir);
	expect(item.hasOwnProperty("unfiltered_count")).toBe(true);
	expect(item.hasOwnProperty("columns")).toBe(true);
	expect(item.hasOwnProperty("tableRows")).toBe(true);
	expect(item.hasOwnProperty("defaultColumnWidths")).toBe(true);
	expect(item.hasOwnProperty("tableColumnExtensions")).toBe(true);
	expect(item.hasOwnProperty("defaultSorting")).toBe(true);
	expect(item.hasOwnProperty("sortingStateColumnExtensions")).toBe(true);
	expect(item.hasOwnProperty("loading")).toBe(true);
	expect(item.hasOwnProperty("leftColumns")).toBe(true);
	expect(item.hasOwnProperty("rightColumns")).toBe(true);
	expect(item.hasOwnProperty("dateColumnsName")).toBe(true);

	expect(item.columns).not.toEqual(null);
	expect(item.unfiltered_count === props.unfiltered_count).toBe(true);
	expect(item.columns.length).toEqual(9);
	expect(item.hasOwnProperty("columns")).toBe(true);
});
