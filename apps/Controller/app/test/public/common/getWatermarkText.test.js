const getWatermarkText = require("../../../core/public/common/getWatermarkText");

let params;

function resetAll() {
	params = {
		teacherName: "teacher",
		schoolName: "school",
		dateExpired: new Date("2021-08-24T13:40:33.670Z"),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function getParams() {
	return params;
}

test("Render successfully", async () => {
	const params = getParams();
	expect(await getWatermarkText(params.teacherName, params.schoolName, params.dateExpired)).toEqual(
		"teacher, school. Licence expires 24 August 2021."
	);
});
