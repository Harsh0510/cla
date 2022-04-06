let mockApiResponse = null;
let mockApiError = null;
const mockApiParams = [];

const resetAll = () => {
	mockApiResponse = null;
	mockApiError = null;
	mockApiParams.length = 0;
};

beforeEach(resetAll);
afterEach(resetAll);

jest.mock("../../../common/wonde/apiRequestEx.js", () => {
	return async (...args) => {
		mockApiParams.push([...args]);
		if (mockApiError) {
			throw mockApiError;
		}
		return mockApiResponse;
	};
});

const API_BASE_URL = `https://api.wonde.com/v1.0`;

const wonde = require("../../../common/wonde/wonde");

describe("getApprovedSchoolIds", () => {
	test("no date, no page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: false,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const ret = await wonde.getApprovedSchoolIds();
		expect(ret).toEqual({
			has_more: false,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools",
			{
				per_page: 100,
				page: 1,
			},
		]);
	});
	test("date, no page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: false,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const dt = new Date(Date.UTC(2020, 5, 5, 5, 45, 35, 500));
		const ret = await wonde.getApprovedSchoolIds(dt);
		expect(ret).toEqual({
			has_more: false,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools",
			{
				per_page: 100,
				page: 1,
				updated_after: "2020-06-05 05:45:35",
			},
		]);
	});
	test("date, page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: false,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const dt = new Date(Date.UTC(2020, 5, 5, 5, 45, 35, 500));
		const ret = await wonde.getApprovedSchoolIds(dt, 7);
		expect(ret).toEqual({
			has_more: false,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools",
			{
				per_page: 100,
				page: 7,
				updated_after: "2020-06-05 05:45:35",
			},
		]);
	});
	test("no date, page, more", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const ret = await wonde.getApprovedSchoolIds(null, 57);
		expect(ret).toEqual({
			has_more: true,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools",
			{
				per_page: 100,
				page: 57,
			},
		]);
	});
});

describe("getRevokedSchoolIds", () => {
	test("no date, no page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: false,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const ret = await wonde.getRevokedSchoolIds();
		expect(ret).toEqual({
			has_more: false,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/revoked",
			{
				per_page: 100,
				page: 1,
			},
		]);
	});
	test("date, no page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: false,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const dt = new Date(Date.UTC(2020, 5, 5, 5, 45, 35, 500));
		const ret = await wonde.getRevokedSchoolIds(dt);
		expect(ret).toEqual({
			has_more: false,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/revoked",
			{
				per_page: 100,
				page: 1,
				updated_after: "2020-06-05 05:45:35",
			},
		]);
	});
	test("date, page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: false,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const dt = new Date(Date.UTC(2020, 5, 5, 5, 45, 35, 500));
		const ret = await wonde.getRevokedSchoolIds(dt, 7);
		expect(ret).toEqual({
			has_more: false,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/revoked",
			{
				per_page: 100,
				page: 7,
				updated_after: "2020-06-05 05:45:35",
			},
		]);
	});
	test("no date, page", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					id: 7,
				},
				{
					id: 72,
				},
			],
		};
		const ret = await wonde.getRevokedSchoolIds(null, 57);
		expect(ret).toEqual({
			has_more: true,
			data: [7, 72],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/revoked",
			{
				per_page: 100,
				page: 57,
			},
		]);
	});
});

describe("getLatestSchools", () => {
	test("no date, no page, no more", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					name: " Hello123   ",
					urn: 12344,
					id: 284723,
					la_code: null,
					mis: "my mis",
					address: {
						address_postcode: "abc",
						address_line_1: "def",
						address_line_2: "ghi",
						address_town: "jkl",
					},
					phase_of_education: "PRIMARY",
				},
			],
		};
		const ret = await wonde.getLatestSchools();
		expect(ret).toEqual({
			has_more: true,
			data: [
				{
					name: "Hello123",
					urn: 12344,
					id: 284723,
					la_code: null,
					mis: "my mis",
					address_postcode: "abc",
					address_line_1: "def",
					address_line_2: "ghi",
					address_town: "jkl",
					school_level: "primary",
					address_country_name: null,
					territory: "england",
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/all",
			{
				per_page: 100,
				page: 1,
			},
		]);
	});
	test("date, no page, no more", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					name: " Hello123   ",
					urn: "12344",
					id: 284723,
					mis: "my mis",
					address: {
						address_postcode: "abc",
						address_line_1: "def",
						address_town: "jkl",
					},
					phase_of_education: "PRIMARY",
				},
			],
		};
		const dt = new Date(Date.UTC(2020, 5, 5, 5, 45, 35, 500));
		const ret = await wonde.getLatestSchools(dt);
		expect(ret).toEqual({
			has_more: true,
			data: [
				{
					name: "Hello123",
					urn: "12344",
					id: 284723,
					la_code: null,
					mis: "my mis",
					address_postcode: "abc",
					address_line_1: "def",
					address_line_2: null,
					address_town: "jkl",
					school_level: "primary",
					address_country_name: null,
					territory: "england",
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/all",
			{
				per_page: 100,
				page: 1,
				updated_after: "2020-06-05 05:45:35",
			},
		]);
	});
	test("date, page, no more", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					name: " Hello123   ",
					urn: "12344",
					id: 284723,
					mis: "my mis",
					address: {
						address_postcode: "abc",
						address_line_1: "def",
						address_town: "jkl",
					},
					phase_of_education: "PRIMARY",
				},
				{
					name: " Hello456   ",
					urn: "12344000",
					id: 284723000,
					mis: "",
					address: {
						address_postcode: "abc0",
						address_line_1: "def0",
						address_town: "jkl0",
					},
					phase_of_education: "SECONDARY",
				},
			],
		};
		const dt = new Date(Date.UTC(2020, 5, 5, 5, 45, 35, 500));
		const ret = await wonde.getLatestSchools(dt, 8);
		expect(ret).toEqual({
			has_more: true,
			data: [
				{
					name: "Hello123",
					urn: "12344",
					id: 284723,
					la_code: null,
					mis: "my mis",
					address_postcode: "abc",
					address_line_1: "def",
					address_line_2: null,
					address_town: "jkl",
					school_level: "primary",
					address_country_name: null,
					territory: "england",
				},
				{
					name: "Hello456",
					urn: "12344000",
					id: 284723000,
					la_code: null,
					mis: null,
					address_postcode: "abc0",
					address_line_1: "def0",
					address_line_2: null,
					address_town: "jkl0",
					school_level: "secondary",
					address_country_name: null,
					territory: "england",
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/all",
			{
				per_page: 100,
				page: 8,
				updated_after: "2020-06-05 05:45:35",
			},
		]);
	});
});

describe("getUsersForSchool", () => {
	test("no page, no more", async () => {
		mockApiResponse = {
			data: [
				{
					id: "abc",
					forename: "def",
					surname: "ghi",
					title: "Mr",
					contact_details: {
						data: {
							emails: {
								work: "x@x.x",
							},
						},
					},
				},
			],
		};
		const ret = await wonde.getUsersForSchool("XXX");
		expect(ret).toEqual({
			has_more: false,
			data: [
				{
					id: "abc",
					email: "x@x.x",
					first_name: "def",
					last_name: "ghi",
					title: "Mr",
					mis_id: null,
					upi: null,
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/XXX/employees",
			{
				include: "contact_details",
				per_page: 100,
				page: 1,
			},
		]);
	});
	test("page, many records, skipped records", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					id: "abc",
					forename: "def",
					surname: "ghi",
					title: "Mr",
					contact_details: {
						data: {
							emails: {
								work: "x@x.x",
							},
						},
					},
				},
				{
					id: "abcX - skipped because no contact_details",
					forename: "defX",
					surname: "ghiX",
					title: "Ms",
				},
				{
					id: "abcX - skipped because invalid email",
					forename: "defX",
					surname: "ghiX",
					title: "Ms",
					contact_details: {
						data: {
							emails: {
								work: "     ",
							},
						},
					},
				},
				{
					id: "abc1",
					forename: "def1",
					surname: "ghi1",
					title: "Mrs",
					contact_details: {
						data: {
							emails: {
								primary: "Y@y.Y",
							},
						},
					},
				},
			],
		};
		const ret = await wonde.getUsersForSchool("XXX", 4);
		expect(ret).toEqual({
			has_more: true,
			data: [
				{
					id: "abc",
					email: "x@x.x",
					first_name: "def",
					last_name: "ghi",
					title: "Mr",
					mis_id: null,
					upi: null,
				},
				{
					id: "abc1",
					email: "y@y.y",
					first_name: "def1",
					last_name: "ghi1",
					title: "Mrs",
					mis_id: null,
					upi: null,
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/XXX/employees",
			{
				include: "contact_details",
				per_page: 100,
				page: 4,
			},
		]);
	});
});

describe("getClassesForSchool", () => {
	test("no page, no more", async () => {
		mockApiResponse = {
			data: [
				{
					id: "abc",
					mis_id: "def",
					name: "ghi",
				},
			],
		};
		const ret = await wonde.getClassesForSchool("XXX");
		expect(ret).toEqual({
			has_more: false,
			data: [
				{
					id: "abc",
					mis_id: "def",
					title: "ghi",
					year_group: "Wonde class",
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/XXX/classes",
			{
				include: "students.year",
				per_page: 100,
				page: 1,
			},
		]);
	});
	test("page, more, multiple records, with year group", async () => {
		mockApiResponse = {
			meta: {
				pagination: {
					more: true,
				},
			},
			data: [
				{
					id: "abc",
					mis_id: "def",
					name: "ghi",
				},
				{
					id: "abc0",
					mis_id: "def0",
					name: "",
					students: {
						data: [
							{
								year: {
									data: {
										description: "Some class here",
									},
								},
							},
						],
					},
				},
			],
		};
		const ret = await wonde.getClassesForSchool("XXX", 23);
		expect(ret).toEqual({
			has_more: true,
			data: [
				{
					id: "abc",
					mis_id: "def",
					title: "ghi",
					year_group: "Wonde class",
				},
				{
					id: "abc0",
					mis_id: "def0",
					title: null,
					year_group: "Some class here",
				},
			],
		});
		expect(mockApiParams[0]).toEqual([
			"GET",
			API_BASE_URL + "/schools/XXX/classes",
			{
				include: "students.year",
				per_page: 100,
				page: 23,
			},
		]);
	});
});
