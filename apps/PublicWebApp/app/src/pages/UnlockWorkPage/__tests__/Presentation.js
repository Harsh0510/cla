// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Presentation from "../Presentation";
import Header from "../../../widgets/Header";
import FlyOutModal from "../../../widgets/FlyOutModal";
import Flyout from "../../../widgets/Flyout";
import Overview from "../Overview";
import MockUserData from "../../../mocks/MockUser";

let unlocked, message, response, redirect, resultCode, unlockedTitle, mockFlyOutIndex, mockUserData, mockNotFound;

// Mock asset imports

function resetAll() {
	unlocked = false;
	message = "";
	response = null;
	redirect = false;
	resultCode = "9780198304494";
	unlockedTitle = {
		isbn: resultCode,
		title: "The 2nd Book of Mathsteasers for Years 5–8",
	};
	mockUserData = MockUserData[2];
	mockFlyOutIndex = -1;
	mockNotFound = "";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(
		<Presentation
			unlocked={unlocked}
			flyOutIndexNotification={mockFlyOutIndex}
			message={message}
			response={response}
			redirect={redirect}
			resultCode={resultCode}
		/>
	);
	expect(item.find(Header).length).toBe(1);
});

test(`Show First FlyOut Popup when flyOutIndex=-1`, async () => {
	const item = shallow(
		<Presentation
			unlocked={unlocked}
			myUserDetails={mockUserData}
			flyOutIndex={mockFlyOutIndex}
			message={message}
			response={response}
			redirect={redirect}
			resultCode={resultCode}
		/>
	);
	expect(item.find(FlyOutModal).length).toBe(1);
});

test(`Show First FlyOut when flyOutIndex=0`, async () => {
	mockFlyOutIndex = 0;
	const item = shallow(
		<Presentation
			unlocked={unlocked}
			myUserDetails={mockUserData}
			flyOutIndex={mockFlyOutIndex}
			message={message}
			response={response}
			redirect={redirect}
			resultCode={resultCode}
		/>
	);
	expect(item.find(Flyout).length).toBe(0);
});

test(`Show Second FlyOut when flyOutIndex=1`, async () => {
	mockFlyOutIndex = 1;
	const item = shallow(
		<Presentation
			unlocked={unlocked}
			flyOutIndexNotification={-1}
			notificationCount={2}
			myUserDetails={mockUserData}
			flyOutIndex={mockFlyOutIndex}
			message={message}
			response={response}
			redirect={redirect}
			resultCode={resultCode}
		/>
	);
	expect(item.find(Flyout).length).toBe(0);
});

test(`Show Notification FlyOut when flyOutIndex=0`, async () => {
	mockFlyOutIndex = 0;
	const item = shallow(
		<Presentation
			unlocked={unlocked}
			myUserDetails={mockUserData}
			flyOutIndex={mockFlyOutIndex}
			message={message}
			response={response}
			redirect={redirect}
			resultCode={resultCode}
		/>
	);
	expect(item.find(Flyout).length).toBe(0);
});

/** Component renders correctly with redirect true */
test(`Component renders correctly with redirect true`, async () => {
	redirect = true;
	const item = shallow(<Presentation redirect={redirect} resultCode={resultCode} unlockedTitle={unlockedTitle} />);
	expect(item.find("Redirect").length).toBe(1);
});

/** Get reponse value is Asset already unlocked */
test(`Get reponse value is Asset already unlocked`, async () => {
	response = "Asset already unlocked";
	const item = shallow(<Presentation response={response} resultCode={resultCode} unlockedTitle={unlockedTitle} />);
	expect(item.find("Redirect").length).toBe(0);
	expect(item.find("Redirect").length).toBe(0);
});

/** Component renders with unlocked value*/
test(`Component renders with unlocked true value`, async () => {
	unlocked = true;
	const item = shallow(<Presentation unlocked={unlocked} resultCode={resultCode} />);
	expect(item.find(Header).length).toBe(1);
});

/** When component render with no any props passed*/
test(`When component render with no any props passed`, async () => {
	unlocked = false;
	unlockedTitle = null;
	redirect = null;
	response = false;
	const item = shallow(
		<Presentation unlocked={unlocked} unlockedTitle={unlockedTitle} redirect={redirect} resultCode={resultCode} response={response} />
	);
	expect(item.find(Header).length).toBe(1);
	expect(item.find(Overview).length).toBe(1);
});
