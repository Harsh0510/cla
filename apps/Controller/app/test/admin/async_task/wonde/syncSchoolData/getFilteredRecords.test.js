const filteredSchools = require("../../../../../core/admin/async_task/wonde/syncSchoolData/getFilteredRecords");

const makeSchool = () => ({
	name: "a1",
	urn: "159233",
	id: "c",
	la_code: null,
	mis: null,
	address_postcode: "x",
	address_line_1: "y",
	address_line_2: null,
	address_town: "z",
	address_country_name: "United Kingdom",
	school_level: "primary",
});

describe("getFilteredSchools", () => {
	const f = filteredSchools.getFilteredRecords;
	test(`No schools (1)`, () => {
		expect(f(new Set(), null)).toEqual([]);
	});
	test(`No schools (2)`, () => {
		expect(f(new Set(), [])).toEqual([]);
	});
	test(`No exclusion`, () => {
		const s = makeSchool();
		expect(f(new Set(), [s])).toEqual([s]);
	});
	test(`Exclude based on ID`, () => {
		const s = makeSchool();
		s.id = "1234567";
		expect(f(new Set(["1234567"]), [s])).toEqual([]);
	});
	test(`Exclude based on country`, () => {
		const s = makeSchool();
		s.address_country_name = "Australia";
		expect(f(new Set(), [s])).toEqual([]);
	});
	test(`Exclude based on school level`, () => {
		const s = makeSchool();
		s.school_level = "nursery";
		expect(f(new Set(), [s])).toEqual([]);
	});
	describe("Exclude based on URN", () => {
		test(`No URN`, () => {
			const s = makeSchool();
			s.urn = null;
			expect(f(new Set(), [s])).toEqual([]);
		});
		test(`Invalid type`, () => {
			const s = makeSchool();
			s.urn = true;
			expect(f(new Set(), [s])).toEqual([]);
		});
		test(`URN too low`, () => {
			const s = makeSchool();
			s.urn = "012842";
			expect(f(new Set(), [s])).toEqual([]);
		});
		test(`URN too high`, () => {
			const s = makeSchool();
			s.urn = 123456789;
			expect(f(new Set(), [s])).toEqual([]);
		});
	});
	test(`Multiple schools`, () => {
		const s1 = makeSchool();
		const s2 = makeSchool();
		const s3 = makeSchool();
		s2.id = "123456";
		expect(f(new Set(["123456"]), [s1, s2, s3])).toEqual([s1, s3]);
	});
});

test("getExcludedWondeIdentifiers", async () => {
	const querier = () => ({
		rows: [
			{
				id: "123",
			},
			{
				id: "456",
			},
			{
				id: "789",
			},
		],
		rowCount: 3,
	});
	expect(await filteredSchools.getExcludedWondeIdentifiers(querier)).toEqual(new Set(["123", "456", "789"]));
});
