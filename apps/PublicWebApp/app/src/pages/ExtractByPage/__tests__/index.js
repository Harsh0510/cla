// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ExtractByPage from "../index";
import MockExtract from "../../../mocks/MockCopyManagementPage";
import USERDATA from "../../../mocks/MockUser";
import { func } from "prop-types";

let match, location, mockIsTouchDevice, history, mockPassEvents, mockUserData, mockField, mockDir;
let mockResultFlyoutIndex, mockResultFlyoutUpdate, mockResultUserUnlockedAttempt, mockRedirectingUrl;
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
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
				selectionEnd: 0,
			},
		};
	};
});
jest.mock("../../../widgets/ImageLightBox", () => mockPassthruHoc);
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
		destroy() {
			this._active = false;
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
					mockRedirectingUrl = redirectURL;
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

jest.mock("../../../common/isTouchDevice", () => {
	return function () {
		return mockIsTouchDevice;
	};
});
jest.mock("../../../common/smoothScroll", () => jest.fn());
jest.mock("../../../assets/images/cover_img.png", () => true);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	match = {
		params: {
			isbn: "9781913063047",
		},
	};
	location = {
		search: "",
	};
	history = {
		push: jest.fn(),
	};
	mockIsTouchDevice = false;
	mockUserData = USERDATA[0];
	mockField = "teacher";
	mockDir = "D";
	mockResultFlyoutIndex = { result: -1 };
	mockResultFlyoutUpdate = { result: true };
	mockResultUserUnlockedAttempt = { result: true };
	mockRedirectingUrl = null;
}

async function defaultApi(endpoint) {
	if (endpoint === "/public/asset-get-one") {
		return {
			result: {
				title: "title",
				authors: [{ firstName: "abc", lastName: "def" }],
				is_unlocked: true,
				page_count: 50,
				copy_excluded_pages: [2, 4, 6],
				content_form: "MI",
				file_format: "epub",
			},
			sas_token: "Sas Token",
		};
	}
	if (endpoint === "/public/course-get-all-for-school") {
		return {
			result: [
				{ oid: "bb031bd13942d0826772b61d6a6c94e90d17", title: "course 1" },
				{ oid: "bb031bd13942d0826772b61d6a6c94e90d18", title: "course 2" },
				{ oid: "bb031bd13942d0826772b61d6a6c94e90d19", title: "course 3" },
				{ oid: "45d0b50a4a276e3f559bdaf55d713845667e", title: "course 4" },
			],
		};
	}
	if (endpoint === "/public/extract-search") {
		return {
			extracts: MockExtract.ExtractSearch.extracts,
			unfiltered_count: 10,
			academic_year_end: [15, 8],
		};
	}
	if (endpoint === "/public/get-extract-limits") {
		return {
			course: { limit: 2, extracted: [1, 2] },
			school: { limit: 2, extracted: [5, 6] },
		};
	}

	if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyoutIndex;
	} else if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyoutUpdate;
	}
	if (endpoint === "/public/asset-favorite") {
		return {
			success: true,
		};
	}
	if (endpoint === "/public/course-search") {
		return {
			result: { id: "941e23e9b557f1fe738a3f2306b572d42c29", name: "Test Teacher" },
		};
	}

	throw new Error("should never be here");
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return { result: null };
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<ExtractByPage match={match} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(1);
	item.update();
	expect(item.text()).toEqual('<WithEventEmitterConsumer />No works found with ISBN "9781913063047".');
});

test("Set Notification Count", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return { result: null };
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<ExtractByPage match={match} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(1);
	item.update();
	expect(item.text()).toEqual('<WithEventEmitterConsumer />No works found with ISBN "9781913063047".');
	item.instance().setNotificationCount(2);
	expect(item.state("notificationCount")).toEqual(2);
});

test("Set Go To Page textBox value ", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state("gotoPageValue")).toEqual(10);
});

test("getClassesName value ", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setState({ coursesData: null });
	item.update();
	item.setState({ coursesData: null });
	expect(item.instance().getSelectedClass()).toEqual("");
});

test("Set Go To Page textBox value ", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state("gotoPageValue")).toEqual(10);
});

test("Click On the Image open Lightbox", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setState({ defaultPhotoIndex: 1 });
	item.update();
	item.instance().onOpen(item.state("defaultPhotoIndex"));

	expect(item.state("isOpen")).toEqual(true);
	expect(item.state("photoIndex")).toEqual(0);

	item.instance().onOpen();
	expect(item.state("isOpen")).toEqual(true);
	expect(item.state("photoIndex")).toEqual(0);
});

test("Get Image Title Click On the Image open Lightbox", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setState({ defaultPhotoIndex: 1 });
	item.update();
	item.instance().getImageTitle(1);
	expect(item.instance().getImageURL(1)).toEqual(1);
	item.instance().onOpen(item.state("defaultPhotoIndex"));
	expect(item.state("isOpen")).toEqual(true);
	expect(item.state("photoIndex")).toEqual(0);
});

test("Close Image Lightbox", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.setState({ defaultPhotoIndex: 1 });
	item.update();
	item.instance().onClose(item.state("defaultPhotoIndex"));
	expect(item.state("isOpen")).toEqual(false);
	expect(item.state("photoIndex")).toEqual(0);
});

test("Go To Page TextBox Submit", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 10 } });
	item.instance().handleGotoPageSubmit("10");
	expect(item.state("gotoPageValue")).toEqual(10);
});

test("Go To Page TextBox Submit", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 10 } });
	item.instance().handleGotoPageSubmit(" ");
	expect(item.state("gotoPageValue")).toEqual(10);

	item.instance().highlightPage(2);
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=&highlighted=3&numColumns=2&selected=");
	expect(item.state("gotoPageValue")).toEqual("");
});

test("User Go To Page TextBox Submit and click on highlighted page", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 10 } });
	item.instance().handleGotoPageSubmit(" ");
	expect(item.state("gotoPageValue")).toEqual(10);
});

test("ScrollWheel Up handler call", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.setState({ highlighted: 1 });
	item.instance().upHandler({ preventDefault: jest.fn() });
	expect(item.state("highlighted")).toEqual(2);
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=&highlighted=2&numColumns=2&selected=");
});

test("ScrollWheel Down handler call", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.setState({ highlighted: 2 });
	item.instance().downHandler({ preventDefault: jest.fn() });
	expect(item.state("highlighted")).toEqual(1);
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=&highlighted=1&numColumns=2&selected=");
});

test("The user is redirected back to the WorkDetailsPage if the work is not unlocked", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return { result: { title: "hello!", is_unlocked: false }, sas_token: "Sas Token" };
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractByPage match={match} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.find("Redirect").length).toBe(1);
});

test("A work is highlighted when it's preview is clicked on", async () => {
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();
	item.instance().highlightPage(2);

	const push = item.instance().props.history.push;

	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=&highlighted=3&numColumns=2&selected=");
});

test("A work is selected when it's preview is clicked on", async () => {
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().addSelectedPage(2);
	item.update();
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=&highlighted=2&isSelectPageFromInput=false&numColumns=2&selected=2");
});

// test("Limit exceeded", async () => {
// 	location = {
// 		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18",
// 	};

// 	const item = shallow(
// 		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
// 	);

// 	await wait(50);
// 	item.update();	item.setState({selectedClass :{value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a"}})

// 	expect(item.state().extractErrorMessage).toEqual("You have exceeded the maximum number of pages");
// });

test("User select page 5 and deselect this page when two column layout", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().addSelectedPage(5);
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toBe(
		"/works/9781913063047/extract?course=bb031bd13942d0826772b61d6a6c94e90d18&highlighted=1&isSelectPageFromInput=false&numColumns=2&selected=1-3-4"
	);
});

test("User select page 4 and deselect this page when one column layout", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18&numColumns=1",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().addSelectedPage(5);
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toBe(
		"/works/9781913063047/extract?course=bb031bd13942d0826772b61d6a6c94e90d18&highlighted=1&isSelectPageFromInput=false&numColumns=1&selected=1-3-4"
	);
});

test("User change the location search", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	item.setProps({
		location: {
			search: "selected=1-3-4-5-6&course=bb031bd13942d0826772b61d6a6c94e90d18",
		},
	});
	await wait(50);
	item.update();

	expect(item.state().selectedPagesMap[6]).toBe(true);
});

test('User pass course as "undefined"', async () => {
	location = {
		search: "selected=1-3-4-5&course=undefined",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	expect(item.state().course).toBe("");
});

test("User click on reset button", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();

	const btnReset = item.find("[name='btnReset']");
	btnReset.simulate("click");
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=bb031bd13942d0826772b61d6a6c94e90d17&highlighted=1&numColumns=2&selected=");
});

test("User click on Next button when flyout seen", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.setState({ flyOutIndex: 3 });
	item.update();

	const btnNext = item.find("Button");
	btnNext.simulate("click");
	await wait(50);
	item.update();
	expect(item.state("flyOutIndex")).toEqual(4);
	expect(mockRedirectingUrl).toEqual("/works/9781913063047/extract/form?course=bb031bd13942d0826772b61d6a6c94e90d17&selected=1-3-5");
});

test("User change set columns layout", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	item.instance().setNumColumns(2);
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toBe(
		"/works/9781913063047/extract?course=bb031bd13942d0826772b61d6a6c94e90d17&highlighted=1&numColumns=2&selected=1-3-4-5"
	);
});

test("User passes invalid Selected pages value", async () => {
	location = {
		search: "selected=0-1-4-5-50001-50002&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	var length = Object.keys(item.state().selectedPagesMap).length; //you get length result
	expect(length).toBe(3);
});

test("User set course value as blank", async () => {
	location = {
		search: "selected=0-1-4-5-50001-50002&course=",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();

	var length = Object.keys(item.state().selectedPagesMap).length; //you get length result
	expect(length).toBe(3);
});

/** User clicks for sorting the copies table header */
test(`User clicks for sorting the copies table header`, async () => {
	location = {
		search: "selected=0-1-4-5-50001-50002&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().doSorting([{ columnName: "title", direction: "desc" }]);
	//const spy = jest.spyOn(item.instance(), 'fetchCopies');
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().mockField).not.toEqual(mockField);
	item.instance().doSorting([{ columnName: "title", direction: "asc" }]);
	//const spy = jest.spyOn(item.instance(), 'fetchCopies');
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().mockField).not.toEqual(mockField);
});

/** User clicks for pagination the copies table */
test(`User clicks for pagination the copies table pagination from page 0`, async () => {
	const mockOffset = 1;
	const mocklimit = 5;
	location = {
		search: "selected=0-1-4-5-50001-50002&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().doPagination(0, 1);
	//const spy = jest.spyOn(item.instance(), 'fetchCopies');
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).not.toEqual(mockOffset);
	expect(item.state().limit).not.toEqual(mocklimit);
});

test(`User clicks for pagination the copies table pagination from page 15`, async () => {
	const mockOffset = 1;
	const mocklimit = 5;
	location = {
		search: "selected=0-1-4-5-50001-50002&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().doPagination(15, 1);
	//const spy = jest.spyOn(item.instance(), 'fetchCopies');
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).not.toEqual(mockOffset);
	expect(item.state().limit).not.toEqual(mocklimit);
});

/** User Go to page index form table of content index */
test("User Go to page index form table of content index", async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().goToPageNumber(5);
	await wait(50);

	expect(spy).toHaveBeenCalled();
});

/** User pass wrong page index */
test("User pass wrong page index", async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().goToPageNumber(-1);
	await wait(50);

	expect(spy).not.toHaveBeenCalled();
});

/** User select Pages for copy */
/** handlePagesChange */
/** User select Pages for copy from input text box */
test("User select Pages for copy from input text box", async () => {
	location = {
		search: "selected=&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "1" } });
	await wait(50);

	expect(spy).toHaveBeenCalled();
});

/** User selected Pages:"1-3, 4"  */
test('User selected Pages:"1-3, 4"', async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.setState({ resultData: { page_count: 20, title: "english" } });
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "4,1-3" } });
	await wait(50);
	expect(JSON.stringify(item.state().selectedPagesMap)).toBe('{"1":true}');
});

test('User selected Pages:"1-3, 10000"', async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.setState({ resultData: { page_count: 20, title: "english" } });
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "1000" } });
	await wait(50);
	expect(JSON.stringify(item.state().selectedPagesMap)).toBe('{"1":true}');
});

/** User selected Pages:"1-3, 4"  */
test('User selected Pages:"1-3, 4"', async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.setState({ resultData: { page_count: 20, title: "english" } });
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "4,1-3" } });
	await wait(50);
	expect(JSON.stringify(item.state().selectedPagesMap)).toBe('{"1":true}');
});

/** User select Pages for more copy with , */
/** handlePagesChange */
test("User select Pages for more copy with comma", async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	const pages = item.state().selected;
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "1," } });

	await wait(50);
	expect(item.state().selected).toBe(pages);
	expect(spy).not.toHaveBeenCalled();
});

/** User enter valid random pages like 5,6,7,8,12,21-25,1-3 in input text box*/
/** handlePagesChange */
test("User enter random pages like 5,6,7,8,12 in input text box", async () => {
	location = {
		search: "selected=5-6-7-8-12-21-22-23-24,1-2-3&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(200);
	item.update();
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "5,6,7,8,12,15" } });
	await wait(50);
	expect(item.state().isInputValid).toBe(true);
	expect(spy).toHaveBeenCalled();
});

/** User enter invalid random pages like 5,5040 in input text box */
/** handlePagesChange */
test("User enter invalid random pages like 5,5040 in input text box", async () => {
	location = {
		search: "selected=5&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "5-5040" } });

	await wait(50);
	expect(item.state().isInputValid).toBe(false);
	expect(spy).not.toHaveBeenCalled();
});

/** User click on down caret icon for show more book details */
test("User click on down caret icon for show more book details", async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const mockIsBookTableContent = item.state().isBookTableContent;
	item.instance().handleEvents({ preventDefault: jest.fn() }, "BookTableContent");
	await wait(20);

	expect(item.state().isBookTableContent).not.toBe(mockIsBookTableContent);
});

/** User click on down caret icon for hide table of content details */
test("User click on down caret icon for hide table of content details", async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const mockIsTableOfContent = item.state().isTableOfContent;
	item.instance().handleEvents({ preventDefault: jest.fn() }, "TableOfContent");
	await wait(20);

	expect(item.state().isTableOfContent).not.toBe(mockIsTableOfContent);
});

/** User enter leave the input text box for enter the pages */
test("User enter leave the input text box for enter the pages", async () => {
	location = {
		search: "selected=5&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	//set state for isSelectPageFromInput as false
	item.setState({ isSelectPageFromInput: true });
	item.instance().onBlur({ preventDefault: jest.fn() });
	await wait(50);

	expect(item.state().isSelectPageFromInput).toBe(false);
});

/** User not getting the copies data table*/
test("User not getting the copies data table", async () => {
	mockUserData.school = null;
	location = {
		search: "selected=5&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};
	async function api(endpoint) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: [],
				unfiltered_count: 0,
				academic_year_end: [15, 8],
			};
		}
		return defaultApi(endpoint);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);

	expect(item.find("Table").length).toBe(0);
});

/** User click on unsorting data */
test("User click on unsorting data", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const mockDefaultField = item.state().sortField;
	item.instance().doSorting([]);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().sortField).toEqual(mockDefaultField);
	expect(item.state().sortField).not.toBe("teacher");
});

/** User expand and collapsing the asset title */
test("User expand and collapsing the asset title", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().toggleWidth("title");
	expect(item.state().isTitleFull).toBe(true);

	item.instance().toggleWidth("title");
	expect(item.state().isTitleFull).toBe(false);
});

/** User expand and collapsing the asset editor */
test("User expand and collapsing the asset editor", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().toggleWidth("editor");
	expect(item.state().isEditorFull).toBe(true);

	item.instance().toggleWidth("editor");
	expect(item.state().isEditorFull).toBe(false);
});

/** User expand and collapsing the publisher */
test("User expand and collapsing the publisher", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().toggleWidth("publisher");
	expect(item.state().isPublisherFull).toBe(true);

	item.instance().toggleWidth("publisher");
	expect(item.state().isPublisherFull).toBe(false);
});

/** User expand and collapsing the author */
test("User expand and collapsing the author", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().toggleWidth("author");
	expect(item.state().isAuthorFull).toBe(true);

	item.instance().toggleWidth("author");
	expect(item.state().isAuthorFull).toBe(false);
});

/**when class limit < extractedPages.length */
// test('User get message like "You have exceeded the copying allowance for this class. Please deselect 3 pages before continuing."', async () => {
// 	location = {
// 		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18",
// 	};

// 	async function api(endpoint, data) {
// 		if (endpoint === "/public/get-extract-limits") {
// 			return {
// 				course: { limit: 2, extracted: [1, 2] },
// 				school: { limit: 2, extracted: [5, 6] },
// 			};
// 		}
// 		return defaultApi(endpoint, true);
// 	}

// 	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

// 	await wait(200);
// 	item.update();
// 	item.instance().forceUpdate();

// 	// expect(item.state().classLimitExceeded).toBe(true);
// 	// expect(item.state().schoolLimitExceeded).toBe(true);
// 	expect(item.find("HelpText").length).toBe(1);
// 	expect(item.find("HelpText").text()).toBe("You have exceeded the copying allowance for this class. Please deselect 3 pages before continuing.");
// });

test("User selected five pages when extract class limit is two", async () => {
	location = {
		search: "selected=1-3-5-7-8&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 2, extracted: [] },
				school: { limit: 5, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have exceeded the copying allowance for this class. Please deselect 3 pages before continuing.");
});

test("User selected two pages when extract course limit is five", async () => {
	location = {
		search: "selected=1-3&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 5, extracted: [] },
				school: { limit: 15, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There are 3 pages left of the copying allowance (5 pp) of this book for this class ");
});

test(`User get message like "You have exceeded the copying allowance for this book. Please deselect 3 pages before continuing."`, async () => {
	location = {
		search: "selected=17-18-19-20-21&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 8, extracted: [] },
				school: { limit: 16, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have exceeded the copying allowance for this book. Please deselect 3 pages before continuing.");
});

// /**when school limit < extractedPages.length */
test('User get message like "You have exceeded the copying allowance for this book. Please deselect 1 page before continuing."', async () => {
	location = {
		search: "course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 2, extracted: [] },
				school: { limit: 5, extracted: [1, 2, 3, , 4, 5] },
			};
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have exceeded the copying allowance for this book. Please deselect 1 page before continuing.");
});

test("User get flyout modal popup and view the flyouts", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 2, extracted: [5] },
				school: { limit: 2, extracted: [5, 6, 7] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().flyOutIndex).toEqual(-1);

	//now user click on Show me button
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	expect(item.state().flyOutIndex).toEqual(0);
	expect(item.find("FlyoutModal").length).toEqual(0);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(1);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(2);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(3);
});

test("Test doToggleFavorite method", async () => {
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: { is_favorite: true, title: "title" } });
	item.instance().doToggleFavorite();
	expect(item.state().resultData).toEqual({ is_favorite: true, title: "title" });
});

test("Test doToggleFavorite method", async () => {
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: { is_favorite: true, title: "title" } });
	item.instance().doToggleFavorite();
	item.instance().componentWillUnmount();
	expect(item.state().resultData.length).not.toBe(null);
});

test('User get message like "There is only one page available in the copying allowance of this book for this class."', async () => {
	location = {
		search: "course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 1, extracted: [] },
				school: { limit: 2, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There is only one page available in the copying allowance of this book for this class.");
});

test('User get message like "You have reached the copying allowance for this book (8 pages)."', async () => {
	location = {
		search: "selected=1-3-5-7-8-9-10-11&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 8, extracted: [] },
				school: { limit: 16, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have reached the copying allowance for this book (8 pages).");
});

test('User get message like "You have reached the copying allowance for this book (1 page)."', async () => {
	location = {
		search: "selected=1&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 1, extracted: [] },
				school: { limit: 4, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have reached the copying allowance for this book (1 page).");
});

test('User get message like "There is 1 page left of the copying allowance (6 pp) of this book for this class."', async () => {
	location = {
		search: "selected=1-3-5-7-8&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 6, extracted: [] },
				school: { limit: 18, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There is 1 page left of the copying allowance (6 pp) of this book for this class ");
});

test('User get message like "There are 4 pages left of the copying allowance (6 pp) of this book for this class "', async () => {
	location = {
		search: "selected=1-3&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 6, extracted: [] },
				school: { limit: 18, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There are 4 pages left of the copying allowance (6 pp) of this book for this class ");
});

test('User get message like "There is 1 page left of the copying allowance(12 pp) of this book."', async () => {
	location = {
		search: "selected=11&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 4, extracted: [] },
				school: { limit: 12, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There is 1 page left of the copying allowance (12 pp) of this book");
});

test('User get message like "There are 2 pages left of the copying allowance(12 pp) of this book."', async () => {
	location = {
		search: "course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 4, extracted: [] },
				school: { limit: 12, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There are 2 pages left of the copying allowance (12 pp) of this book");
});

test('User move to another screen after selection"', async () => {
	location = {
		search: "selected=11&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 4, extracted: [] },
				school: { limit: 12, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There is 1 page left of the copying allowance (12 pp) of this book");

	item.instance().componentWillUnmount();
	expect(item._flyOutHandler).toBe(undefined);
});

test('User get message like "You have reached the copying allowance for this book (12 pp)."', async () => {
	location = {
		search: "selected=11-12&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 4, extracted: [] },
				school: { limit: 12, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have reached the copying allowance for this book (12 pages).");
});

test('User get message like "There are 6 pages left of the copying allowance (6 pp) of this book for this class "', async () => {
	location = {
		search: "course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 6, extracted: [] },
				school: { limit: 22, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("There are 6 pages left of the copying allowance (6 pp) of this book for this class ");
});

test('User get message like "You have reached the copying allowance for this book (6 pages)."', async () => {
	location = {
		search: "selected=21-22-23-24-25-26&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 6, extracted: [] },
				school: { limit: 22, extracted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});

	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe("You have reached the copying allowance for this book (6 pages).");
});

test(` showing user a modal for unverfied or un approve user `, async () => {
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	const value = "Dummy Value";
	item.instance().doShowModal(value);
	expect(item.state("showModal")).toEqual("Dummy Value");
});

test(` hiding a modal for unverfied or un approve user `, async () => {
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.instance().hideModal();
	expect(item.state("showModal")).toBe(false);
});

test('User pass course as "undefined"', async () => {
	location = {
		search: "startPage=4",
	};
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();

	expect(item.state().highlighted).toBe(4);
});

test("Set Notification Count", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(1);
	item.update();
	item.instance().handleDrpChange();
	expect(item.state("isShowTooltip")).toEqual(false);
});

test("Set Notification Count", async () => {
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(1);
	item.update();
	item.instance().addSelectedPage();
	expect(item.state("isShowTooltip")).toEqual(true);
});

test("getClassesName value ", async () => {
	const data = [];
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	//item.setState({ coursesData: data });
	item.instance().getSelectedClass(data);
	item.update();
	expect(item.instance().getSelectedClass()).toEqual("");
});

test("getClassesName value ", async () => {
	const data = [{ id: "941e23e9b557f1fe738a3f2306b572d42c29", name: "Test Teacher" }];
	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	//item.setState({ coursesData: data });
	item.instance().getSelectedClass(data);
	item.update();
	expect(item.instance().getSelectedClass()).toEqual("");
});

// test("getClassesName value ", async () => {
// 	const item = shallow(<ExtractByPage match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
// 	await wait(50);
// 	item.instance().handleGotoPageSubmit(null)
// 	item.update();
// 	expect(item.instance().getSelectedClass()).toEqual("");
// });

test("When invalid page no is provided", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: -1 } });
	item.instance().handleGotoPageSubmit(" ");
	expect(item.state("gotoPageValue")).toEqual(-1);

	item.instance().highlightPage(-1);
	await wait(50);
	item.update();
	expect(item.state("gotoPageValue")).toEqual(-1);
});

test("When result data is null", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: -1 } });
	item.setState({ resultData: null });
	item.instance().updateSliderItems("9781913063368");
	expect(item.state("gotoPageValue")).toEqual(-1);

	item.instance().highlightPage(-1);
	await wait(50);
	item.update();
	expect(item.state("gotoPageValue")).toEqual(-1);
});

test("When page is provided as 0", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: { page_count: 10, title: "english" } });
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 0 } });
	item.instance().handleGotoPageSubmit("0");
	expect(item.state("gotoPageValue")).toEqual(0);
});

test("When page is provided as 10", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: { page_count: 1, title: "english" } });
	await wait(50);
	item.update();
	item.instance().setGoToPageValue({ preventDefault: jest.fn(), target: { value: 10 } });
	item.instance().handleGotoPageSubmit("10");
	expect(item.state("gotoPageValue")).toEqual(10);
});

test("test of onMoveNextRequest method", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().onMoveNextRequest(1);
	expect(item.state("photoIndex")).toEqual(2);
});

test("when no value is passed ", async () => {
	const item = shallow(
		<ExtractByPage match={match} history={history} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().pushHistory(null);
	expect(item.instance().getQueryString()).toEqual("course=&highlighted=1&numColumns=2&selected=");
});

test("User enter invalid pages in input text box", async () => {
	location = {
		search: "selected=&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	item.instance().handlePagesChange({ preventDefault: jest.fn(), target: { value: "" } });
	await wait(50);

	expect(spy).toHaveBeenCalled();
});

test("User select Pages for copy from input text box", async () => {
	location = {
		search: "selected=&course=bb031bd13942d0826772b61d6a6c94e90d17",
	};

	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.setState({ isSelectPageFromInput: true });
	item.instance().fetchWork("9781913063368");
	await wait(50);

	expect(item.state().userSelectedString).toBe("");
});

test('User get message like "The pages you have selected are all unavailable for copying from this issue – please select alternative pages. "', async () => {
	location = {
		search: "selected=2-4&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 6, extracted: [] },
				school: { limit: 18, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe(
		"The pages you have selected are all unavailable for copying from this issue – please select alternative pages."
	);
});

test('when user selected all excludedpage and get next button disabled"', async () => {
	location = {
		search: "selected=2&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 6, extracted: [] },
				school: { limit: 18, extracted: [] },
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	const btnNext = item.find("ButtonLink");
	expect(btnNext.props().disabled).toEqual(true);
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text()).toBe(
		"The pages you have selected are all unavailable for copying from this issue – please select alternative pages."
	);
});

test("user get next button disabled when user can't create copy", async () => {
	location = {
		search: "startPage=4",
	};
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={USERDATA[4]} />
	);
	await wait(50);
	item.update();

	expect(item.state().highlighted).toBe(4);
	const btnNext = item.find("ButtonLink");
	expect(btnNext.props().disabled).toEqual(true);
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("WithAuthConsumer").length).toBe(2);
});

test("user not allowing to select pages when user can't create copy", async () => {
	location = {
		search: "startPage=4",
	};
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={USERDATA[4]} />
	);
	await wait(50);
	item.update();
	item.instance().addSelectedPage(5);
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?course=&highlighted=5&numColumns=2&selected=");
});

test("When user have 100% pages copy access", async () => {
	location = {
		search: "selected=1-2-3-4-5-6&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: {
					title: "title",
					authors: [{ firstName: "abc", lastName: "def" }],
					is_unlocked: true,
					page_count: 50,
					copy_excluded_pages: [2, 4, 6],
					content_form: "MI",
					can_copy_in_full: true,
				},
				sas_token: "Sas Token",
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(200);
	item.setState({
		selectedClass: { value: "1012cced45a8368da9ef694d236d07989b0a", label: "Mr shah's Default class", key: "1012cced45a8368da9ef694d236d07989b0a" },
	});
	expect(item.find("HelpText").length).toBe(1);
	expect(item.find("HelpText").text().indexOf("You have selected 3 pages; the other pages are available for copy.")).not.toEqual(-1);
});

test("First-time User Experience for ePubs ", async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18",
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				course: { limit: 2, extracted: [5] },
				school: { limit: 2, extracted: [5, 6, 7] },
			};
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<ExtractByPage match={match} location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().flyOutIndex).toEqual(-1);

	//now user click on Show me button
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	expect(item.state().flyOutIndex).toEqual(0);
	expect(item.find("FlyoutModal").length).toEqual(0);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(1);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(2);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(3);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(4);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(5);

	//now user click on close icon
	item.instance()._flyOutHandlerOnCloseBound();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().flyOutIndex).toEqual(6);
});

test(`When user is redirected from review copy page to extract page`, async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18&rollover_review_oid=bb031bd13942d0826772b61d6a6c94e90d17",
	};
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().rolloverReviewOid).toBe("bb031bd13942d0826772b61d6a6c94e90d17");
	expect(item.find("ReviewWrap").length).toBe(1);
	expect(item.find("ButtonLink").props().to).toEqual(
		"/works/9781913063047/extract/form?course=bb031bd13942d0826772b61d6a6c94e90d18&selected=1-3-5&rollover_review_oid=bb031bd13942d0826772b61d6a6c94e90d17"
	);
});

test(`When user is redirected from copy managemnet page to extract page by cloning existing exstract`, async () => {
	location = {
		search: "selected=1-3-4-5&course=bb031bd13942d0826772b61d6a6c94e90d18&clone_from_copy_oid=bb031bd13942d0826772b61d6a6c94e90d17",
	};
	const item = shallow(
		<ExtractByPage match={match} location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().cloneFromExtractOid).toBe("bb031bd13942d0826772b61d6a6c94e90d17");
	expect(item.find("ReviewWrap").length).toBe(1);
	expect(item.find("ButtonLink").props().to).toEqual(
		"/works/9781913063047/extract/form?course=bb031bd13942d0826772b61d6a6c94e90d18&selected=1-3-5&clone_from_copy_oid=bb031bd13942d0826772b61d6a6c94e90d17"
	);
});
