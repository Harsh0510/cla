let mockSchools;
let mockUpdateSingleSchoolResult;
let mockUpdateManySchoolsResult;
let taskDetails;

jest.mock("../../../../core/admin/async_task/hwbSchoolSync/pushTask", () => {
	return () => {};
});
jest.mock("../../../../core/admin/async_task/hwbSchoolSync/fetchSchools", () => {
	return () => mockSchools();
});
jest.mock("../../../../core/admin/async_task/hwbSchoolSync/updateSingleSchool", () => {
	return () => mockUpdateSingleSchoolResult();
});
jest.mock("../../../../core/admin/async_task/hwbSchoolSync/updateManySchools", () => {
	return () => mockUpdateManySchoolsResult();
});

let oldProcessEnv;
let oldConsoleLog;

beforeEach(() => {
	oldProcessEnv = process.env;
	oldConsoleLog = console.log;
	console.log = () => {};
	jest.resetModules();
	process.env.HWB_SCHOOLS_TOKEN_ENDPOINT = "a";
	process.env.HWB_SCHOOLS_CLIENT_ID = "a";
	process.env.HWB_SCHOOLS_CLIENT_SECRET = "a";
	process.env.HWB_SCHOOLS_DATA_ENDPOINT = "a";
	process.env.HWB_SCHOOLS_BASE64_CERT = "a";
	mockSchools = () => [];
	mockUpdateSingleSchoolResult = () => {};
	mockUpdateManySchoolsResult = () => {};
	taskDetails = {
		getAppDbPool() {
			return {
				query() {},
			};
		},
		deleteSelf() {},
	};
});

afterEach(() => {
	console.log = oldConsoleLog;
	process.env = oldProcessEnv;
});

test("no settings provided", async () => {
	delete process.env.HWB_SCHOOLS_TOKEN_ENDPOINT;
	delete process.env.HWB_SCHOOLS_CLIENT_ID;
	delete process.env.HWB_SCHOOLS_CLIENT_SECRET;
	delete process.env.HWB_SCHOOLS_DATA_ENDPOINT;
	delete process.env.HWB_SCHOOLS_BASE64_CERT;

	mockSchools = () => {
		throw new Error("should never get here");
	};
	const route = require("../../../../core/admin/async_task/hwbSchoolSync/route");
	await route(taskDetails);
});

test("updating many schools succeeds", async () => {
	mockSchools = () => [
		{
			name: "abc",
			dfeNumber: "def",
		},
	];
	const route = require("../../../../core/admin/async_task/hwbSchoolSync/route");
	await route(taskDetails);
});

test("updating many schools fails with an unexpected error", async () => {
	mockSchools = () => [
		{
			name: "abc",
			dfeNumber: "def",
		},
	];
	mockUpdateManySchoolsResult = () => {
		throw new Error("SOME ERROR!");
	};
	mockUpdateSingleSchoolResult = () => {
		throw new Error("should never get here");
	};
	const route = require("../../../../core/admin/async_task/hwbSchoolSync/route");
	let err;
	try {
		await route(taskDetails);
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error("SOME ERROR!"));
});

test("updating many schools fails with a unique constraint violation", async () => {
	mockSchools = () => [
		{
			name: "abc",
			dfeNumber: "def",
		},
	];
	mockUpdateManySchoolsResult = () => {
		throw new Error("violates unique constraint");
	};
	let timesCalled = 0;
	mockUpdateSingleSchoolResult = () => {
		timesCalled++;
	};
	const route = require("../../../../core/admin/async_task/hwbSchoolSync/route");
	await route(taskDetails);
	expect(timesCalled).toBe(1);
});

test("updating single school failure is logged", async () => {
	mockSchools = () => [
		{
			name: "abc",
			dfeNumber: "def",
		},
	];
	mockUpdateManySchoolsResult = () => {
		throw new Error("violates unique constraint");
	};
	mockUpdateSingleSchoolResult = () => {
		throw new Error("some other error");
	};
	let loggedWith;
	console.log = (v) => {
		loggedWith = v;
	};
	const route = require("../../../../core/admin/async_task/hwbSchoolSync/route");
	await route(taskDetails);
	expect(loggedWith).toEqual(new Error("some other error"));
});
