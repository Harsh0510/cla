// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import SelectSchoolWithSearchFilter from "../SelectSchoolWithSearchFilter";

import MockUser from "../../../mocks/MockUser";
import MockSchoolFilterData from "../../../mocks/MockSchoolFilterData";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin ";
		}
		return WrappedComponent;
	};
});

let location, sortingA, sortingD, props;
let mockUserData, mockTerritoryData, mockLevelData, mockTypeData, mockSchoolData, mockResultFilter, page, filters, mockDidChange;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
jest.mock("../../../common/userDidChange", () => {
	return () => {
		return mockDidChange;
	};
});

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
			},
		};
	};
});

function mockMappingData(arrayData) {
	let arr = [];
	let setOption = {
		value: null,
		label: null,
		key: null,
	};
	arrayData.map((item) => {
		const data = Object.assign({}, setOption);
		data.value = item.id;
		data.label = item.title;
		data.key = item.id;
		arr.push(data);
	});
	return arr;
}

async function defaultApi(endpoint, data) {
	// "SelectSchoolWithSearchFilter" only queries this endpoint
	if (endpoint === "/admin/school-get-all") {
		if (data === "error") {
			throw "Unknown error";
		}
		return mockSchoolData;
	}
	if (endpoint === "/admin/school-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return MockSchoolFilterData;
	}
	throw new Error("should never be here");
}

function getData() {
	filters = [];
	mockResultFilter = MockSchoolFilterData.result;
	for (const item in mockResultFilter) {
		filters.push(mockResultFilter[item]);
	}
	let levelArray = filters.find((filter) => filter.id === "school_level");
	mockLevelData = levelArray ? mockMappingData(levelArray.data) : null;
	let territoryArray = filters.find((filter) => filter.id === "territory");
	mockTerritoryData = territoryArray ? mockMappingData(territoryArray.data) : null;
	let typeArray = filters.find((filter) => filter.id === "school_type");
	mockTypeData = typeArray ? mockMappingData(typeArray.data) : null;
	let schoolArray = filters.find((filter) => filter.id === "schools");
	mockSchoolData = schoolArray ? mockMappingData(schoolArray.data) : null;
}

function resetAll() {
	getData();

	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "name",
			sort_dir: "A",
			loading: true,
			schoolsLoaded: false,
			unfiltered_count: "5",
			schoolsData: mockSchoolData,
			message: null,
		},
	};
	sortingA = [{ direction: "A", columnName: "name" }];
	sortingD = [{ direction: "D", columnName: "name" }];
	page = 2;
	mockUserData = MockUser[3];
	props = {
		queryLocationSearch: {
			action: "new",
			id: null,
			limit: "10",
			offset: "0",
			query: "",
			school_limit: "10",
			school_offset: "0",
			school_query: "",
			school_sort_dir: "A",
			school_sort_field: "name",
			sort_dir: "desc",
			sort_field: "target_execution_date",
			filter_school_level: "first",
			filter_schools: "73",
			filter_territory: "england",
			filter_school_type: "academy",
		},
		rolloverJobId: 1,
		withRollover: true,
		saveSchoolSearchFiter: jest.fn(),
		pushQueryString: jest.fn(),
		withAuthConsumer_myUserDetails: mockUserData,
		hasSelectedAllSchools: false,
		mapSchoolIds: [1, 2, 3, 4, 5, 6],
		onChangeSelectedAllCheckbox: jest.fn(),
		onChangeSchoolCheckBox: jest.fn(),
		_selectAllRef: "",
		isHideSelect: false,
		isResetSchoolFilter: false,
	};
	filters = {
		TERRITORY: "territory",
		SCHOOL_LEVEL: "school_level",
		SCHOOL_TYPE: "school_type",
		QUERY: "query",
		SCHOOL: "School",
	};
	mockDidChange = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
});

/** Component renders correctly without pass dropdown data*/
test("Component renders correctly without pass dropdown data", async () => {
	props.territoryData = null;
	props.levelData = null;
	props.typeData = null;
	props.schoolData = null;
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	expect(item.find("SearchSectionOne").length).toBe(1);
	expect(item.find("WrapperDiv").length).toBe(1);
});

/** Component renders correctly with SearchFilters elements*/
test("Component renders correctly with SearchFilters elements", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	expect(item.find("SchoolSearchFilters").length).toBe(1);
});

/** User search school also filter the territory, school_level, school_type*/
test("User search school and call push histroy function", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	item.instance().handlefilterSelection([{ value: "nursery", label: "Nursery" }], filters.SCHOOL_LEVEL);
	item.instance().handlefilterSelection([{ value: "academy", label: "Academy" }], filters.SCHOOL_TYPE);
	item.instance().handlefilterSelection(["abc"], "query");
	item.instance().handlefilterSelection([2], "school");
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance()._doSchoolSearch("school");
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.pushQueryString;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`school`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_level=`nursery`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_type=`academy`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_territory=`england`").length !== -1).toBe(true);
});

/** User clears all filters */
test("User clears all filters", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance()._resetSchoolSearchFilter();
	expect(spy).toHaveBeenCalled();
	expect(item.state().school_query).toBe("");
});

/** User filter territory called handlefilterSelection */
test("When user filtering territory filter", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection({ value: "england", label: "England" }, filters.TERRITORY);
	expect(item.state().selectedTerritory).toEqual({
		value: "england",
		label: "England",
	});
});

test("When user clear territory filter", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.TERRITORY);
	expect(item.state().selectedTerritory).toEqual([]);
});

/** User filter school_level called handlefilterSelection */
test("When user filtering school_level filter", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection({ value: "nursery", label: "Nursery" }, filters.SCHOOL_LEVEL);
	expect(item.state().selectedSchoolLevel).toEqual({
		value: "nursery",
		label: "Nursery",
	});
});

test("When user clear school_level filter", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL_LEVEL);
	expect(item.state().selectedSchoolLevel).toEqual([]);
});

/** User filter school_type called handlefilterSelection */
test("When user filtering school_type filter", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection({ value: "academy", label: "Academy" }, filters.SCHOOL_TYPE);
	expect(item.state().selectedSchoolType).toEqual({
		value: "academy",
		label: "Academy",
	});
});

test("When user clear school_type filter", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL_TYPE);
	expect(item.state().selectedSchoolType).toEqual([]);
});

test("User click on pagination page", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter {...props} api={defaultApi} />);

	item.instance().doPaginationForSchool(page, location.search.limit);
	await wait(10);
	item.update();

	const push = item.instance().props.pushQueryString;
	let mockurl = "school_limit=10&school_offset=10&school_query=&school_sort_dir=A&school_sort_field=name";
	await wait(20);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User search school also filter the territory, school_level, school_type*/
test("User search school and call push histroy function", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	item.instance().handlefilterSelection([{ value: "nursery", label: "Nursery" }], filters.SCHOOL_LEVEL);
	item.instance().handlefilterSelection([{ value: "academy", label: "Academy" }], filters.SCHOOL_TYPE);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSchoolSearch("school");
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.pushQueryString;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`school`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_level=`nursery`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_type=`academy`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_territory=`england`").length !== -1).toBe(true);
});

test("User filtering and load filter data", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		territory: ["england"],
		school_level: ["first"],
		school_type: ["academy"],
		schools: [73],
	});
});

/** User click on sorting from table header field */
test("User click on sorting for asecending order", async () => {
	location.search.sort_dir = "D";
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);

	await wait(20);
	//ascending order
	item.instance().doSortingForSchool(sortingA);
	await wait(10);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on sorting from table header field */
test("User click on sorting for descending order", async () => {
	location.search.sort_dir = "A";
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);

	await wait(20);
	//descending order
	item.instance().doSortingForSchool(sortingD);
	await wait(10);
	item.update();

	expect(item.state().loading).toBe(true);
});

test("User filtering only territory, school_level filters", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	item.instance().handlefilterSelection([{ value: "nursery", label: "Nursery" }], filters.SCHOOL_LEVEL);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance()._doSchoolSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.pushQueryString;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_level=`nursery`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_territory=`england`").length !== -1).toBe(true);
});

test("User filtering territory and load filter data", async () => {
	delete props.queryLocationSearch.filter_school_level;
	delete props.queryLocationSearch.filter_school_type;
	delete props.queryLocationSearch.filter_schools;
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		territory: ["england"],
		school_level: [],
		school_type: [],
		schools: [],
	});
});

test("User filtering school and load filter data", async () => {
	delete props.queryLocationSearch.filter_school_level;
	delete props.queryLocationSearch.filter_school_type;
	delete props.queryLocationSearch.filter_territory;
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		territory: [],
		school_level: [],
		school_type: [],
		schools: [73],
	});
});

test("User filtering school level and load filter data", async () => {
	delete props.queryLocationSearch.filter_territory;
	delete props.queryLocationSearch.filter_school_type;
	delete props.queryLocationSearch.filter_schools;
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	await wait(50);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		territory: [],
		school_level: ["first"],
		school_type: [],
		schools: [],
	});
});

test("When user search school and more than one schools are selected", async () => {
	props._selectAllRef = {
		current: { indeterminate: true },
	};
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSchoolSearch();
	await wait(50);
	expect(item.find("SchoolTableGrid").props()._selectAllRef).toEqual({ current: { indeterminate: true } });
});

test("When user search school and no school is selected", async () => {
	props._selectAllRef = {
		current: { indeterminate: false },
	};
	props.mapSchoolIds = [];
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} />);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSchoolSearch();
	await wait(50);
	expect(item.find("SchoolTableGrid").props()._selectAllRef).toEqual({ current: { indeterminate: false } });
});

test("Reset all school filters", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} isResetSchoolFilter={false} />);
	await wait(50);
	item.setProps({ isResetSchoolFilter: true });
	expect(item.state("school_query")).toEqual("");
	expect(item.state("selectedTerritory")).toEqual([]);
	expect(item.state("selectedSchoolLevel")).toEqual([]);
	expect(item.state("selectedSchoolType")).toEqual([]);
	expect(item.state("selectedSchools")).toEqual([]);
});

test("When componentWillUnmount", async () => {
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} isResetSchoolFilter={false} />);
	item.instance().componentWillUnmount();
	await wait(10);
	expect(item.instance()._isMounted).toBe(undefined);
});

test("When user detail change", async () => {
	mockUserData.can_copy = false;
	mockUserData.has_trial_extract_access = true;
	mockUserData.has_verified = false;
	props.withAuthConsumer_myUserDetails = mockUserData;
	const item = shallow(<SelectSchoolWithSearchFilter api={defaultApi} {...props} isResetSchoolFilter={false} />);
	expect(item.find("SearchSectionOne").length).toBe(1);
	expect(item.find("WrapperDiv").length).toBe(1);

	mockUserData.can_copy = true;
	mockUserData.has_trial_extract_access = false;
	mockUserData.has_verified = true;
	const prevProps = {
		withAuthConsumer_myUserDetails: mockUserData,
		handleClose: jest.fn(),
		api: defaultApi,
	};
	mockDidChange = true;
	item.instance().componentDidUpdate(prevProps);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("SearchSectionOne").length).toBe(1);
	expect(item.find("WrapperDiv").length).toBe(1);
});
