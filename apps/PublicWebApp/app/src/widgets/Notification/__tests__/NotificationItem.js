import React from "react";
import NotificationItem from "../NotificationItem";
import { shallow } from "enzyme";
let notification, props;

const jestFn = jest.fn(() => true);
const jestDeleteFn = jest.fn((oid, catId = false) => true);

function resetAll() {
	notification = {
		oid: "12345",
		has_read: false,
		category_id: 1,
		category_name: "test",
		title: "testTitle",
		description: "testDescription",
		date_created: "2019-10-15 15:47:14.071321+00",
		link: {
			type: "awaiting-approval",
			value: "vaibhav@testingmail.com",
			static: false,
		},
		hideable_log: true,
	};

	props = {
		onDeleteNotification: jestDeleteFn,
		onToggleNotification: jestFn,
		openNotificationOid: jestFn,
		onToggleNotification: jestFn,
		onToggleNotificationItem: jestFn,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component Renders Correctly`, async () => {
	const item = shallow(<NotificationItem notif={notification} props />);
	expect(item.find("NotificationLinkItem").length).toBe(1);
});

test(`Toggle Works correctly`, async () => {
	const item = shallow(
		<NotificationItem
			notif={notification}
			onToggleNotification={props.onToggleNotification}
			onToggleNotificationItem={props.onToggleNotificationItem}
		/>
	);
	item.find("NotificationItemLink").simulate("click");
	item.find("NotificationStatusIcon").simulate("click");
	item.find("NotificationSubMenuDropdown").simulate("click");
	expect(jestFn).toHaveReturnedTimes(3);
});

test(`clicking on Delete and Dont show works correctly`, async () => {
	const item = shallow(<NotificationItem notif={notification} onDeleteNotification={props.onDeleteNotification} />);
	item.find("NotificationSubMenu").find("li").first().simulate("click");
	expect(jestDeleteFn).toHaveBeenNthCalledWith(1, notification.oid);
	item.find("NotificationSubMenu").childAt(1).simulate("click");
	expect(jestDeleteFn).toHaveBeenNthCalledWith(2, 0, notification.category_id);
});

test(`When title is longer and notification is read and submenu is clicked`, async () => {
	notification.has_read = true;
	notification.title = "This string is longer than 30 character to show ellipsis";
	const item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationDuration").find("i").props().className).toBe("far fa-dot-circle");
	expect(item.find("NotificationItemLink").find("NotificationCategory").text()).toBe(notification.title.substr(0, 40) + "...");
});

test(`When the category is not hideable, we don't have option to don't show again`, async () => {
	notification.hideable_log = false;
	const item = shallow(<NotificationItem notif={notification} onDeleteNotification={props.onDeleteNotification} />);
	item.find("NotificationSubMenu").find("li").first().simulate("click");
	expect(item.find("NotificationSubMenu").children.length).toBe(1);
});

test(`when subtitle is less then 40 character, do not conert it to ellipsis and if greater then 40 char show with ellipsis`, () => {
	notification.subtitle = "Subtitle test";
	const item = shallow(<NotificationItem notif={notification} onDeleteNotification={props.onDeleteNotification} />);
	expect(item.find("NotificationTitle").text()).toBe(notification.subtitle);

	notification.subtitle = "Subtitle test Subtitle test Subtitle test Subtitle test Subtitle test";
	const itemNew = shallow(<NotificationItem notif={notification} onDeleteNotification={props.onDeleteNotification} />);
	expect(itemNew.find("NotificationTitle").text()).toBe(notification.subtitle.substr(0, 40) + "...");
});

test(`Render Static Link`, async () => {
	notification.link.static = true;
	notification.link.value = "/";
	const item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationItemLink").props().to).toBe(notification.link.value);
});

test(`Render Home Link When no route is present in static file`, async () => {
	notification.link.type = "user-awaiting-approval";
	const item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationItemLink").props().to).toBe("/?query=" + encodeURIComponent(notification.link.value));
});

test(`When no Value is Present in Link Object`, async () => {
	notification.link.value = null;
	const item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationItemLink").props().to).not.toMatch(/query=/);
});

test(`Time calculates Correctly`, async () => {
	let date_created = new Date();
	date_created.setDate(date_created.getDate() - 1);
	notification.date_created = date_created.toISOString();
	let item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationDuration").text()).toMatch(/d/);
	date_created.setDate(date_created.getDate() - 8);
	notification.date_created = date_created.toISOString();
	item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationDuration").text()).toMatch(/w/);
	notification.date_created = new Date(Date.now() - 28800000).toISOString(); // set to 8 hours previous
	item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationDuration").text()).toMatch(/h/);
	notification.date_created = new Date(Date.now() - 60000).toISOString(); // set to few minutes previous
	item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationDuration").text()).toMatch(/m/);
	notification.date_created = new Date(Date.now() - 600).toISOString(); // set to < 1m
	item = shallow(<NotificationItem notif={notification} openNotificationOid={notification.oid} />);
	expect(item.find("NotificationDuration").text()).toMatch(/< 1m/);
});
