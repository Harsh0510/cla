import mappingExtractStatus from "../mappingExtractStatus";

let extracts, academicYearEnd;

function resetAll() {
	extracts = [
		{
			oid: "c38da68d77e2ab50f2055f7fb029cc10b8c0",
			title: "test core functionality",
			date_created: "2019-06-05T16:37:13.552Z",
			date_expired: "2019-07-31T23:59:59.999Z",
			expired: true,
		},
		{
			oid: "c38da68d77e2ab50f2055f7fb029cc10b8c0",
			title: "test core functionality",
			date_created: "2019-08-26T07:11:02.173Z",
			date_expired: "2019-11-31T23:59:59.999Z",
			expired: false,
			status: "Active",
		},
	];
	academicYearEnd = [8, 15];
}

beforeEach(resetAll);
afterEach(resetAll);

/** function return correctly */
test("Return Array with Status ", async () => {
	const item = mappingExtractStatus(extracts, academicYearEnd);
	expect(item[0].status).toEqual("Expired");
	expect(item[1].status).toEqual("Active");
});
