import React from "react";
import * as FlyoutManager from "../FlyoutManager";
import { shallow, mount } from "enzyme";
import MockUser from "../../mocks/MockUser";

let WrappedComponent, props, mockGetNotification;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**
 * HOC Mock functions
 */
jest.mock("../withApiConsumer", () => mockPassthruHoc);
jest.mock("../withAuthConsumer", () => mockPassthruHoc);

/**
 * reset function
 */
function resetAll() {
	WrappedComponent = mockPassthruHoc();
	props = {
		breakpoint: 30,
		ajaxLoaded: true,
		withAuthConsumer_myUserDetails: MockUser[0],
	};
	mockGetNotification = 10;
}

/**
 * Api Mock
 */
async function defaultApi(endpoint) {
	if (endpoint === "/public/first-time-user-experience-get-all-mine-seen") {
		return {
			data: {
				home: 4,
				search: 15,
			},
		};
	}
	if (endpoint === "/public/first-time-user-experience-update") {
		return true;
	}
	if (endpoint === "/auth/get-notification") {
		return mockGetNotification;
	}
	throw new Error("should never be here");
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * wait function
 */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component Renders Successfully */
test(`Component FlyoutManagerProvider renders Successfully`, async () => {
	delete props.withAuthConsumer_myUserDetails;
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} />);
	expect(item.find("ContextProvider").length).toBe(1);
});

test(`ComponentwithFlyoutManager renders Successfully`, async () => {
	const item = shallow(<FlyoutManager.withFlyoutManager {...props} />);
	expect(typeof item).toBe("object");
});

/** Test functions */
test(`Test api in doUpdate method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);

	await wait(50);
	expect(item.state("flyoutSeenData")).toEqual({
		home: 4,
		search: 15,
	});
	expect(item.state("flyouts_disabled")).toBe(false);
});

test(`Test api in doUpdate method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.instance()._isActive = false;
	await wait(50);
	expect(item.state("flyoutSeenData")).toEqual(null);
	expect(item.state("flyouts_disabled")).toBe(true);
});

test(`Test api in doUpdate method`, async () => {
	props.withAuthConsumer_myUserDetails.flyout_enabled = false;
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	expect(item.state("flyouts_disabled")).toBe(true);
	expect(item.state("flyoutSeenData")).toEqual({});
});

test(`Test doSet method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.instance().doSet("unlock", 2);
	expect(item.state("flyoutSeenData")).toEqual({});

	item.setState({ flyouts_disabled: false, flyoutSeenData: { unlock: 1 } });
	item.instance().doSet("unlock", 2);

	await wait(50);
	expect(item.state().flyoutSeenData).toEqual({ unlock: 2 });
	expect(item.state().counter).toBe(1);
});

test(`Test getSeenIndex method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	const result = item.instance().getSeenIndex("unlock");
	expect(result).toEqual(2147483647);

	item.setState({ flyouts_disabled: false, flyoutSeenData: { unlock: 1 } });
	const index = item.instance().getSeenIndex("unlock");
	expect(index).toEqual(1);

	item.setState({ flyouts_disabled: false, flyoutSeenData: {} });
	const indexNew = item.instance().getSeenIndex("unlock");
	expect(indexNew).toEqual(-1);
});

test(`Test componentDidUpdate method`, async () => {
	let prevProps = {
		breakpoint: 20,
	};
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.instance().componentDidUpdate(prevProps);
	await wait(50);
	expect(item.state("flyouts_disabled")).toBe(true);
});

test(`Test componentWillUnmount method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.instance()._isActive = true;
	item.instance().componentWillUnmount();

	await wait(50);
	expect(item.instance()._isActive).toBe(false);
});

test(`Test getFirstUnseenIndex method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.setState({ flyouts_disabled: true });
	const index = item.instance().getFirstUnseenIndex("unlock");
	expect(index).toEqual(10000);

	item.setState({ flyouts_disabled: false });
	const indexNew = item.instance().getFirstUnseenIndex("unlock");
	expect(indexNew).toEqual(0);
});

test(`Test doSetNext method`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.setState({ counter: 0 });
	item.instance().doSetNext("unlock");

	await wait(100);
	expect(item.state("counter")).toBe(0);
});

test(`Test doSetNext method When flyout is not disabled`, async () => {
	const item = shallow(<FlyoutManager.FlyoutManagerProvider {...props} api={defaultApi} />);
	item.setState({ counter: 0, flyouts_disabled: false, flyoutSeenData: {} });
	item.instance().doSetNext("unlock");

	await wait(100);
	expect(item.state("counter")).toBe(2);
});
