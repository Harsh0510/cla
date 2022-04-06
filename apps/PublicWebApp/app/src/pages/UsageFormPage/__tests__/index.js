// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import UsageFormPage from "../index";
import MockCourses from "../../../mocks/MockCourses";
import MockUser from "../../../mocks/MockUser";
import Header from "../../../widgets/Header";
import { inflateSync } from "zlib";
import FlyOutModal from "../../../widgets/FlyOutModal";
import Flyout from "../../../widgets/Flyout";
//import { MemoryRouter } from 'react-router';
import MockExtract from "../../../mocks/MockCopyManagementPage";

let mockUserDetails,
	filedIsValid = true,
	valid,
	mockResultFlyOutIndex,
	mockResultFlyOutUpdate,
	MockUserData,
	mockExtractSearchResult,
	isCalledSetDefaultCoverImage;

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
//jest.mock('../../../widgets/PageWrap', () => mockPassthruHoc);
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

jest.mock("../../../common/FlyOutHandler", () => {
	return class {
		constructor(instance, api, screen) {
			this._instance = instance;
			this._api = api;
			this._screen = screen;
		}
		getSeen() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: this._screen }).then((result) => {
				this._instance.setState({
					flyOutIndex: result.result,
				});
			});
		}
		onClose(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndex + 1;
			this._api("/public/first-time-user-experience-update", { screen: this._screen, index: nextIndex }).then((result) => {
				if (result.result) {
					this._instance.setState({
						flyOutIndex: nextIndex,
					});
				}
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					//const url = getUrl(redirectURL);
					//window.location.href = url;
				}
			});
		}
		onCloseNotification(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndexNotification + 1;
			this.setSeenNotification(nextIndex).then(() => {
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					this._instance.props.history.push(redirectURL);
				}
			});
		}
		getSeenNotification() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: "notification" }).then((result) => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					flyOutIndexNotification: parseInt(result.result, 10),
				});
			});
		}
		destroy() {
			this._active = false;
		}
	};
});

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

const unlockedISBN = "4871836482365";
const lockedISBN = "9870836489178";
const course = MockCourses[0];
let match, location, history;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	match = {
		params: {
			isbn: unlockedISBN,
		},
	};

	location = {
		search: `?course=${course.oid}&selected=1-2`,
	};

	history = {
		push: jest.fn(),
	};
	mockResultFlyOutIndex = { result: -1 };
	mockResultFlyOutUpdate = true;
	mockUserDetails = MockUser[1];
	valid = {
		errorType: "validation",
		isValid: false,
		message: null,
	};
	mockExtractSearchResult = { error: null, extracts: [MockExtract.ExtractSearch.extracts[0]] };
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function defaultApi(endpoint, data) {
	if (endpoint === "/public/course-get-all-for-school") {
		return {
			result: [
				{ oid: "c1", title: "Course One" },
				{ oid: "c2", title: "Course Two" },
			],
		};
	}
	if (endpoint === "/public/asset-get-one") {
		return {
			result: {
				title: "asset one",
				is_unlocked: true,
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
	if (endpoint === "/public/extract-update") {
		return {
			extract: {
				oid: "abc123",
			},
		};
	}
	if (endpoint === "/public/get-extract-limits") {
		if (data.course_oid === "p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e") {
			return {
				course: { limit: 2, extracted: [4, 5] },
				school: { limit: 10, extracted: [4, 7, 3, 2] },
			};
		} else {
			return {
				course: { limit: 3, extracted: [4, 5] },
				school: { limit: 1, extracted: [4, 7, 3, 2] },
			};
		}
	}
	if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyOutIndex;
	}
	if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyOutUpdate;
	}
	if (endpoint === "/public/extract-search") {
		return mockExtractSearchResult;
	}
	throw new Error("should not be here");
}

test("Component displays correctly when asset and course all exist", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	await wait(50);
	item.update();

	expect(item.containsMatchingElement(<Header />)).toBe(true);

	item.instance().componentWillUnmount();
	expect(item.instance()._flyOutHandler).toEqual(undefined);
});

test("Set Notification Count", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	item.update();
	item.instance().setNotificationCount(2);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.state("notificationCount")).toBe(2);
});

test("Show the FlyOut If flyOut Index is -1", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	await wait(50);
	item.update();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.containsMatchingElement(<FlyOutModal />)).toBe(true);
});

test("Show the notification Flyout", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	item.update();
	item.setState({ flyOutIndex: 0, flyOutIndexNotification: -1, notificationCount: 2 });

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find(Flyout).length).toBe(1);
});

test("Component handles form submission correctly", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	await wait(50);
	item.update();

	const extractTitle = item.find('[name="extract_title"]');
	const numStudents = item.find('[name="number_of_students"]');
	const examBoard = item.find('[name="exam_board"]');
	const form = item.find("UsagePageForm");

	extractTitle.simulate("change", {
		target: {
			name: "extract_title",
			value: "New title",
		},
	});

	numStudents.simulate("change", {
		target: {
			name: "number_of_students",
			value: "4",
		},
	});

	examBoard.simulate("change", {
		target: {
			name: "exam_board",
			value: "EdExcel",
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	form.simulate("submit", {
		preventDefault: jest.fn(),
	});

	await wait(50);
	item.update();
	expect(item.state().formRedirect).toBe(true);
	expect(item.props().to).toBe("/profile/management/abc123?action=created");
});

/** Component load without cource  */
test("Component load without cource", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};
	const location = {
		search: "?course=&selected=1-4-5",
	};
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />
	);

	await wait(50);
	item.update();

	expect(item.state().extractErrorMessage).toEqual("You do not have extract limit");
});

/** User canExtract the pages  */
test("If user cross page limit then he can't extract page", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};
	const location = {
		search: "?course=c1&selected=1-4-5",
	};
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />
	);

	item.setProps({ location: { search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=1-4-5" } });

	await wait(50);
	item.update();
	expect(item.state().canExtract).toBe(false);
});

/** User enter invalid number_of_students value **/
test("User enter invalid number_of_students value", async () => {
	filedIsValid = false;
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=1",
	};
	const item = shallow(
		<UsageFormPage
			match={match}
			location={location}
			history={history}
			withAuthConsumer_myUserDetails={mockUserDetails}
			api={defaultApi}
			error={false}
		/>
	);

	await wait(50);
	item.instance().handleInputChange("number_of_students", "-1", valid);
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().valid.number_of_students).toBe(valid);
});

/** User enter valid number_of_students value **/
test("User enter valid number_of_students value", async () => {
	valid.isValid = true;
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />
	);

	await wait(50);
	item.update();
	item.instance().handleInputChange("number_of_students", "10", valid);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().valid.number_of_students.isValid).toEqual(true);
	expect(item.state().valid.number_of_students.message).toEqual(null);
});

/** Show help text when page allowed school greater than page allowed course*/
test(`Show help text when page allowed school greater than page allowed course`, async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=1",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	await wait(50);
	item.update();
	expect(item.find("HelpText").text()).toEqual(
		`You have reached the copying limit for this class but you can still copy pages that have previously been copied.`
	);
});

/** User filled the confirm details and get exception error */
test("User filled the confirm details and get exception error", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-create") {
			throw "Something went wrong. Please try again later.";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={api} />);

	await wait(50);
	const form = item.find("UsagePageForm");
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	form.simulate("submit", {
		preventDefault: jest.fn(),
	});

	await wait(50);
	item.update();
	expect(item.state().message).toBe(`Something went wrong. Please try again later.`);
});

/** User can `Extract` if cource and school page size more than zero  **/
test("User can `Extract` if cource and school page size more than zero", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-create") {
			return {
				course: { limit: 1, extracted: [] },
				school: { limit: 2, extracted: [] },
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={api} error={false} />
	);

	await wait(50);
	expect(item.state().canExtract).toBe(true);
	expect(item.state().extractErrorMessage).toBe("");
});

/** Please ensure all fields are filled correctly. **/
test("Please ensure all fields are filled correctly.", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=1",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-create") {
			return {
				course: { limit: 3, extracted: [] },
				school: { limit: 10, extracted: [] },
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={api} error={false} />
	);

	await wait(50);
	const form = item.find(".form");

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

test('User get message "You have exceeded the copying limit for this class."', async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=1",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 3, extracted: [1, 2, 3, 4, 5] },
				school: { limit: 10, extracted: [1, 2, 3, 4, 5] },
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={api} error={false} />
	);

	await wait(50);
	const form = item.find(".form");

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

	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe(
		"You have reached the copying limit for this class but you can still copy pages that have previously been copied."
	);
});

test('User get message "You have exceeded the copying limit for this book."', async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=p8qauxv1qep3ip11iv41pag2h1ktnr54d3m25c0eufpspt2e&selected=1",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 3, extracted: [1, 2] },
				school: { limit: 5, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(
		<UsageFormPage match={match} location={location} history={history} withAuthConsumer_myUserDetails={mockUserDetails} api={api} error={false} />
	);

	await wait(50);

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe(
		"You have reached the copying limit for this book but you can still copy pages that have previously been copied."
	);
});

/** check form input validation */
test("Test form input validations", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	item.setState({
		valid: {
			number_of_students: {
				isValid: false,
				status: true,
				errorType: "required",
			},
			extract_title: {
				isValid: false,
				status: true,
				errorType: "required",
			},
			exam_board: {
				isValid: false,
				status: true,
				errorType: "required",
			},
		},
	});
	const result = item.instance().isFormValid();
	expect(result).toEqual({ status: false, message: "This is a required field." });
});

test("When user create extract of magazine", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: {
					title: "asset one",
					is_unlocked: true,
					content_form: "MI",
				},
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={api} />);
	await wait(50);

	const result = item.find("CopyConfirmDetails").dive().find("Table").childAt(0).childAt(0).text();
	expect(result).toEqual("Magazine/issue:asset one");
});

test("When user create extract of book", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: {
					title: "asset one",
					is_unlocked: true,
					content_form: "BO",
				},
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={api} />);
	await wait(50);
	const result = item.find("CopyConfirmDetails").dive().find("Table").childAt(0).childAt(0).text();
	expect(result).toEqual("Book:asset one");
});

test("When user review an extract", async () => {
	mockExtractSearchResult = { error: null, extracts: [MockExtract.ExtractSearch.extracts[1]] };
	const location = {
		search: "?course=c1&selected=1-4-5&rollover_review_oid=18c7658fa8c470b2e25f846b4fd42d9e531e",
	};
	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	expect(item.state("isRolloverReviewExtractExpired")).toEqual(true);
	expect(item.find("CheckBoxField").length).toBe(1);
});

test("When user clicks on the Do you want to save this number of students for this class checkbox", async () => {
	mockExtractSearchResult = { error: null, extracts: [MockExtract.ExtractSearch.extracts[1]] };
	const location = {
		search: "?course=c1&selected=1-4-5&rollover_review_oid=18c7658fa8c470b2e25f846b4fd42d9e531e",
	};
	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	expect(item.find("CheckBoxField").length).toBe(1);
	item.find("CheckBoxField").simulate("change", { preventDefault: jest.fn() });
	expect(item.state("setCourseDefaultNoOfStudent")).toEqual(true);
});

test("Component handles form submission correctly when extract updated", async () => {
	const match = {
		url: "/works/12345/extract/form",
		params: {
			isbn: "12345",
		},
	};

	const location = {
		search: "?course=c1&selected=1-4-5&extract_oid=dff8e690d34653861c9954121ffb22b99fac",
	};

	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	await wait(50);
	item.update();
	const form = item.find("UsagePageForm");

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	form.simulate("submit", {
		preventDefault: jest.fn(),
	});

	await wait(50);
	item.update();
	expect(item.state().formRedirect).toBe(true);
	expect(item.props().to).toBe("/profile/management/abc123?action=updated");
});

test("When user review an cloned extract", async () => {
	const location = {
		search: "?course=c1&selected=1-4-5&clone_from_copy_oid=18c7658fa8c470b2e25f846b4fd42d9e531e",
	};
	const item = shallow(<UsageFormPage match={match} location={location} withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	expect(item.find("TitleMessage").length).toBe(1);
	expect(item.find("TitleMessage").text()).toBe("Remember to change your Copy Name, unless you would like to use the same name for this copy.");
});
