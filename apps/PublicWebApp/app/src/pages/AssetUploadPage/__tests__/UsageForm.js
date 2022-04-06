import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UsageForm from "../UsageForm";
import MockCourses from "../../../mocks/MockCourses";
import MockUser from "../../../mocks/MockUser";

let props;
let mockExtractLimitResult;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				isValid: function () {
					return true;
				},
			},
		};
	};
});
jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

async function defaultApi(endpoint, data) {
	if (endpoint === "/public/course-get-all-for-school") {
		return {
			result: MockCourses,
		};
	}
	if (endpoint === "/public/asset-get-one") {
		return {
			result: {
				title: "asset one",
				is_unlocked: true,
				page_count: 100,
			},
		};
	}
	if (endpoint === "/public/extract-create") {
		return {
			extract: {
				oid: "abc123",
			},
		};
	}
	if (endpoint === "/public/get-extract-limits") {
		return mockExtractLimitResult;
	}
	if (endpoint === "/public/user-asset-upload") {
		return {
			extract_oid: "dff8e690d34653861c9954121ffb22b99fac",
		};
	}
	throw new Error("should not be here");
}

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = {
		withAuthConsumer_myUserDetails: MockUser[1],
		history: {
			push: jest.fn(),
		},
		location: {
			search: `?isbn13=9780320039324&course=${MockCourses[0].oid}&selected=1-2-3-4-5`,
			state: {
				requestParams: {
					title: "This is the fifth",
					isbn: "9780320039324",
					publication_date: 1009909800,
					page_count: 300,
					pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
					authors: ["Rowling, J.K."],
					publisher: "OUP",
					page_range: "1-10",
					upload_name: "test upload name",
					is_copying_full_chapter: false,
					is_created_extract: false,
					course_oid: "cd4cd1ad5f73e23159696481ae39426e3472",
					select_class: {
						value: "cd4cd1ad5f73e23159696481ae39426e3472",
						label: "Mr Fabiyani's Default class (3)",
						key: "cd4cd1ad5f73e23159696481ae39426e3472",
						id: "cd4cd1ad5f73e23159696481ae39426e3472",
					},
				},
				publicationYear: "2002",
				requestFile: {
					binary: true,
					files: {
						asset: {},
					},
				},
			},
		},
		api: defaultApi,
	};
	mockExtractLimitResult = {
		course: { limit: 2, extracted: [4, 5] },
		school: { limit: 10, extracted: [4, 7, 3, 2] },
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	expect(item.instance().__isMounted).toEqual(undefined);
	expect(item.find("HeadTitle").length).toBe(1);
	item.instance().componentWillUnmount();
	expect(item.instance.__isMounted).toEqual(undefined);
});

test("When user changes copy title", async () => {
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	item.instance().handleInputChange("extract_title", "new copy name", true);
	await wait(10);
	item.update();
	expect(item.state().fields.extract_title).toEqual("new copy name");
	expect(item.state().valid.extract_title).toEqual(true);
});

test("When user enter valid number of students", async () => {
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	item.instance().handleInputChange("number_of_students", "100", true);
	expect(item.state().fields.number_of_students).toEqual("100");
	expect(item.state().valid.number_of_students).toEqual(true);
});

test("User enter invalid number_of_students value", async () => {
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	item.instance().handleInputChange("number_of_students", "-1", false);
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().valid.number_of_students).toBe(false);
});

test("When user enters valid data and clicks on confirm", async () => {
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push).toHaveBeenCalled();
	expect(props.history.push.mock.calls[0][0]).toEqual("/profile/management/dff8e690d34653861c9954121ffb22b99fac?action=created");
});

test("When user comes from my uploads page for create a new copy and clicks on confirm", async () => {
	MockCourses[0].number_of_students = 100;
	MockCourses[0].exam_board = "AQA";
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[0].oid}&selected=1-2-3-4-5`,
	};
	const item = shallow(<UsageForm {...props} location={location} />);
	await wait(50);
	item.update();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push).toHaveBeenCalled();
	expect(props.history.push.mock.calls[0][0]).toEqual("/profile/management/abc123?action=created");
});

test(`Show help text when page allowed for school greater than page allowed course`, async () => {
	mockExtractLimitResult = {
		course: { limit: 5, extracted: [1, 2, 3, 4, 5, 6] },
		school: { limit: 10, extracted: [4, 7, 3, 2] },
	};
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[1].oid}&selected=1-2-3-4-5-6-7`,
	};
	const item = shallow(<UsageForm {...props} location={location} />);
	await wait(50);
	item.update();
	expect(item.find("HelpText").text()).toEqual(
		`You have exceeded the copying allowance for this class. If this class was selected in error, please change your selection. If you've selected the correct class, please contact support for further clarification.`
	);
});

test("User get message when exceeded the copying limit for book.", async () => {
	mockExtractLimitResult = {
		course: { limit: 3, extracted: [1] },
		school: { limit: 5, extracted: [1, 2, 3, 4, 5] },
	};
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[1].oid}&selected=1-2-3-4-5`,
	};
	const item = shallow(<UsageForm {...props} location={location} />);
	await wait(50);
	item.update();
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe(
		"The copying allowance for this book has already been reached. Please contact support for further clarification."
	);
});

test("When user asset upload api returns error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/user-asset-upload") {
			return new Promise((resolve, reject) => {
				reject("Unknown Error");
			});
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UsageForm {...props} api={api} />);
	await wait(50);
	item.update();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(item.find("HelpText").at(1).text()).toEqual("Unknown Error");
});

test("When user extract create api returns error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-create") {
			return new Promise((resolve, reject) => {
				reject("Unknown Error");
			});
		}
		return defaultApi(endpoint, data);
	}
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[1].oid}&selected=1-2-3`,
	};
	const item = shallow(<UsageForm {...props} location={location} api={api} />);
	await wait(50);
	item.update();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(item.find("HelpText").at(1).text()).toEqual("Unknown Error");
});

test("Please ensure all fields are filled correctly.", async () => {
	const item = shallow(<UsageForm {...props} />);
	await wait(50);
	item.setState({
		valid: {
			extract_title: { isValid: false, message: "" },
			number_of_students: { isValid: false, message: "", errorType: "" },
			exam_board: { isValid: false, message: "" },
		},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("MessageBox").length).toBe(1);
});

test(`When pagesAllowedForCourse greater than 0`, async () => {
	mockExtractLimitResult = mockExtractLimitResult = {
		course: { limit: 20, extracted: [1] },
		school: { limit: 10, extracted: [4, 7, 3, 2] },
	};
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[1].oid}&selected=1`,
	};
	const item = shallow(<UsageForm {...props} location={location} />);
	await wait(50);
	item.update();
	expect(item.state().extractErrorMessage).toEqual("");
});

test(`When course oid is null`, async () => {
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&selected=1`,
	};
	const item = shallow(<UsageForm {...props} location={location} />);
	await wait(50);
	item.update();
	expect(item.state().canExtract).toEqual(false);
	expect(item.state().extractErrorMessage).toEqual("You do not have extract limit");
});

test("When user comes from uploads page and component unmounts after handleSubmit calls", async () => {
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[1].oid}&selected=1`,
	};
	const item = shallow(<UsageForm {...props} location={location} />);
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.instance()._isActive).toBe(undefined);
});

test("When component unmounts after handleSubmit calls", async () => {
	const item = shallow(<UsageForm {...props} />);
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.instance()._isActive).toBe(undefined);
});

test("When user extract create api returns error after component unmounts", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-create") {
			return new Promise((resolve, reject) => {
				reject("Unknown Error");
			});
		}
		return defaultApi(endpoint, data);
	}
	const location = {
		search: `?isbn13=9781911208938&asset_user_upload_oid=8ce106af7fdbfb54be75535cbae2a3b65efd&course=${MockCourses[1].oid}&selected=1-2-3-4-5-6-7-8-9-10-11-12`,
	};
	const item = shallow(<UsageForm {...props} location={location} api={api} />);
	await wait(50);
	item.update();
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.instance()._isActive).toBe(undefined);
});

test("When user asset upload api returns error after component unmounts", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/user-asset-upload") {
			return new Promise((resolve, reject) => {
				reject("Unknown Error");
			});
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UsageForm {...props} api={api} />);
	await wait(50);
	item.update();
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(item.instance()._isActive).toBe(undefined);
});

test("When user changes class", async () => {
	const selectedClass = {
		id: "p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e",
		value: "p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e",
		label: "test label",
	};
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	item.instance().handleDrpChange("course_oid", selectedClass, { isValid: true, message: "", errorType: "" });
	item.update();
	await wait(10);
	expect(props.history.push).toHaveBeenCalled();
});

test("When back url is passed", async () => {
	props.location.search = `?isbn13=9780320039324&course=${MockCourses[0].oid}&selected=1-2-3-4-5&back_url=/back/url`;
	const item = shallow(<UsageForm {...props} />);
	await wait(10);
	item.update();
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("BackButton").props().to).toBe("/back/url");
});
