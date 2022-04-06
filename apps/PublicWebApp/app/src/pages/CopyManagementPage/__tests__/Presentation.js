// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Presentation from "../Presentation";
import Header from "../../../widgets/Header";
import MockData from "../../../mocks/MockCopyManagementPage";
import MockUser from "../../../mocks/MockUser";
import { watchFile } from "fs";
import FlyOutModal from "../../../widgets/FlyOutModal";
import Flyout from "../../../widgets/Flyout";

//local params props decalration
let props = {
	resultData: null,
	copiesData: null,
	extractPages: null,
	copyOid: null,
	toggleSidebar: null,
	shareLinks: null,
	sidebar: null,
	getPagesForPrint: getPagesForPrint,
	getShareLink: getShareLink,
	deactivateShare: deactivateShare,
	loading: false,
	pageFooterText: "",
	error: "",
	action: "created",
	hideNewCopyMessage: jest.fn(),
	isShowBookInfo: false,
	handleEvents: jest.fn(),
	isCopyTitleEditable: false,
	submitCopyTitleEditable: jest.fn(),
	isDisplayCopyTitleEditable: jest.fn(),
	isLinkShare: false,
	resetAccessCode: jest.fn(),
};

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

//jest.mock('../../../common/withAdminAuth', () => mockPassthruHoc);
//jest.mock('../../../common/withPageSize', () => mockPassthruHoc);
jest.mock("../../../widgets/GenerateCopyRightImage", () => {
	return function () {
		return "https://dummyimage.com";
	};
});
jest.mock("../../../assets/images/cover_img.png", () => true);

function resetAll() {
	props = {
		resultData: null,
		copiesData: MockData.ExtractSearch.extracts,
		extractPages: MockData.ExtractPages,
		copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		toggleSidebar: jest.fn(),
		shareLinks: MockData.ExtractGetShareLinks.result,
		sidebar: true,
		getPagesForPrint: getPagesForPrint,
		getShareLink: getShareLink,
		deactivateShare: deactivateShare,
		loading: false,
		pageFooterText: "Created by tfb1name tlb1name for School CLA School B on Date 21 February 2019",
		error: "",
		action: "created",
		hideNewCopyMessage: jest.fn(),
		isShowBookInfo: false,
		handleEvents: jest.fn(),
		isCopyTitleEditable: false,
		submitCopyTitleEditable: jest.fn(),
		isDisplayCopyTitleEditable: jest.fn(),
		isLinkShare: false,
		resetAccessCode: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);
/**Common mock function */
function getPagesForPrint() {
	return MockData.ExtractPages;
}

function getShareLink() {
	return MockData.ExtractGetShareLinks;
}

function deactivateShare() {
	if (props.extractPages && props.extractPages.length) {
		return MockData.ExtractGetShareLinks;
	}
	return "";
}

/** Component renders correctly */
test("Component renders correctly with FlyOutIndex -1", async () => {
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
			flyOutIndex={-1}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(1);
	expect(item.find("CloseButton").length).toBe(1);
	expect(item.containsMatchingElement(<FlyOutModal />)).toBe(true);
});

test("Component renders correctly with FlyOutIndex 0", async () => {
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
			flyOutIndex={0}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(1);
	expect(item.find("CloseButton").length).toBe(1);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test("Component renders correctly with FlyOutIndex 2", async () => {
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
			flyOutIndex={2}
			notificationCount={0}
			flyOutIndexNotification={0}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(1);
	expect(item.find("CloseButton").length).toBe(1);
	expect(item.containsMatchingElement(<FlyOutModal />)).toBe(true);
});

test("Component renders correctly with FlyOutIndex 2 when notificationCount is 1", async () => {
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
			flyOutIndex={2}
			notificationCount={1}
			flyOutIndexNotification={-1}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(1);
	expect(item.find("CloseButton").length).toBe(1);
	expect(item.containsMatchingElement(<FlyOutModal />)).toBe(true);
	expect(item.find("withWhiteOutConsumer").props().closeBackgroundImmediately).toBe(false);
});

test("Show Notification Flyout", async () => {
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
			flyOutIndex={3}
			flyOutIndexNotification={-1}
			notificationCount={2}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(1);
	expect(item.find("CloseButton").length).toBe(1);
	expect(item.find(Flyout).length).toBe(1);
});

/** User click on full view first time */
test("User click on full view first time", async () => {
	props.sidebar = true;
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	expect(item.find("Sidebar").length).toBe(0);
});

/** User click on full view second time */
test("User click on full view second time", async () => {
	props.sidebar = false;
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	expect(item.find("Sidebar").length).toBe(0);
});

/** User not getting the message when landing*/
test("User not getting the message when landing", async () => {
	props.action = false;
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(0);
	expect(item.find("CloseButton").length).toBe(0);
});

/** User click on close icon from message section */
test("User click on close icon from message section", async () => {
	props.action = true;
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("NewCopyMessage").length).toBe(1);
	expect(item.find("CloseButton").length).toBe(1);

	item.instance().onCloseNewCopyMessage({ preventDefault: jest.fn() });
	expect(props.hideNewCopyMessage).toHaveBeenCalled();
});

/** User click on Print this copy */
test("User click on Print this copy", async () => {
	global.window = Object.create(window);
	Object.defineProperty(window, "location", {
		value: {
			reload: jest.fn(),
		},
	});
	//mock function for window.print
	global.print = jest.fn();

	props.sidebar = false;
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	item.instance().onDoPrint({ preventDefault: jest.fn() });
	await wait(1500);
	expect(global.print).toHaveBeenCalled();
});

/** User getting the loading process */
test("User getting the loading process", async () => {
	global.window = Object.create(window);
	Object.defineProperty(window, "location", {
		value: {
			reload: jest.fn(),
		},
	});
	//mock function for window.print
	global.print = jest.fn();
	props.copiesData = [];
	props.action = false;
	props.sidebar = false;
	props.loading = true;
	props.error = "Could not view extract. Are you sure you followed the link correctly?";
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	expect(item.find("Loader").length).toBe(1);
});

/** User getting the error "Extract not found" */
test('User getting the error "Extract not found"', async () => {
	global.window = Object.create(window);
	Object.defineProperty(window, "location", {
		value: {
			reload: jest.fn(),
		},
	});
	//mock function for window.print
	global.print = jest.fn();
	props.copiesData = [];
	props.action = false;
	props.sidebar = false;
	props.error = "Could not view extract. Are you sure you followed the link correctly?";
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();
	const errorMessage = item.find("Container");
	expect(item.find("Loader").length).toBe(0);
	expect(errorMessage.find("div").at(0).text()).toEqual("Could not view extract. Are you sure you followed the link correctly?");
});

/** User not getting the Book Cover page details while print */
test("User not getting the Book Cover page details while print", async () => {
	global.window = Object.create(window);
	Object.defineProperty(window, "location", {
		value: {
			reload: jest.fn(),
		},
	});
	//mock function for window.print
	global.print = jest.fn();
	//props.copiesData=[];
	props.action = false;
	props.sidebar = false;
	props.copyOid = "asessddlskfjdlsfkjdlfkjdlfkjdflksdfsd";
	props.error = "Could not view extract. Are you sure you followed the link correctly?";
	const item = shallow(
		<Presentation
			resultData={props.resultData}
			copiesData={props.copiesData}
			extractPages={props.extractPages}
			copyOid={props.copyOid}
			toggleSidebar={props.toggleSidebar}
			shareLinks={props.shareLinks}
			sidebar={props.sidebar}
			getPagesForPrint={props.getPagesForPrint}
			getShareLink={props.getShareLink}
			deactivateShare={props.deactivateShare}
			loading={props.loading}
			pageFooterText={props.pageFooterText}
			error={props.error}
			action={props.action}
			hideNewCopyMessage={props.hideNewCopyMessage}
			isShowBookInfo={props.isShowBookInfo}
			handleEvents={props.handleEvents}
			isCopyTitleEditable={props.isCopyTitleEditable}
			submitCopyTitleEditable={props.submitCopyTitleEditable}
			isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
			isLinkShare={props.isLinkShare}
		/>
	).dive();

	expect(item.find("BookCoverPage").length).toBe(0);
});
