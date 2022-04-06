import React from "react";
import Notification from "../index";
import { shallow } from "enzyme";

jest.mock("../NotificationItem", () => jest.fn());
let notifications, props;

const jestFn = jest.fn();

function resetAll() {
	notifications = [{ oid: "12345" }];
	props = {
		open: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component Renders Correctly`, async () => {
	const item = shallow(<Notification notifications={notifications} props={props} />);
	expect(item.find("Notificationmenu").length).toBe(1);
});

test(`Component Renders Correctly when no notifications are there`, async () => {
	const item = shallow(<Notification notifications={[]} props />);
	expect(item.find("Notificationmenu").length).toBe(1);
});
