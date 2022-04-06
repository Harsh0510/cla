// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Form from "../Form";

/**Mocks for image */
jest.mock("../../../assets/icons/plus.png", () => jest.fn());

let pages, course, errorMessage, coursesData, resultData;

function resetAll() {
	(resultData = { content_form: "BO", auto_unlocked: false }),
		(coursesData = [
			{ title: "My Random Course", year_group: "Y05", oid: "bb031bd13942d0826772b61d6a6c94e90d17" },
			{ title: "Philosophy", year_group: "Y08", oid: "3b6bb53d8901c553e773306f75b2a61c84d8" },
			{ title: "Teaching", year_group: "Y8.5", oid: "ec0f269e86f50a1a06b6d695f05ce503d691" },
		]),
		(errorMessage = false);
	pages = null;
	course = null;
}

beforeEach(resetAll);
afterEach(resetAll);

/**Mock functions */
const mockHandleSubmit = jest.fn();
const mockHandlePagesChange = jest.fn();
const mockHandleCourseChange = jest.fn();

/** Component renders correctly */
test("Component renders correctly", async () => {
	coursesData = null;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			flyOutIndex={1}
			resultData={resultData}
		/>
	);

	expect(item.find("FormSection").length).toEqual(1);
});

test("Component renders correctly with floyout index 0", async () => {
	coursesData = null;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			flyOutIndex={0}
			resultData={resultData}
		/>
	);

	expect(item.find("FormSection").length).toEqual(1);
});

/** User have coursesData */
test("User have coursesData", async () => {
	const item = shallow(
		<Form
			pages={pages}
			selectedClass={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			flyOutIndex={1}
			isMobile={true}
			canCopy={true}
		/>
	);

	expect(item.find("AjaxSearchableDropdown").length).toEqual(1);
});

/** User open the page in responsive view */
test(`User open the page in responsive view`, async () => {
	errorMessage = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
		/>
	);
	expect(item.exists("MobRow")).toEqual(true);
});

test("user see normal message in desktop view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
		/>
	);
	expect(item.exists("LockBook")).toEqual(true);
});

test("user see normal message in mobile view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
		/>
	);
	expect(item.exists("MobRow")).toEqual(true);
	expect(item.exists("MobTextIconWrap")).toEqual(true);
});

test("user see verify message in mobile view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={false}
			hasVerified={true}
		/>
	);
	expect(item.debug()).not.toEqual(null);
});

test("user see verify message in desktop view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={false}
			hasVerified={true}
		/>
	);
	expect(item.exists("AssetMessageAccess")).toEqual(false);
});

test("user see unlocked message in mobile view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={false}
			hasVerified={false}
		/>
	);
	expect(item.debug()).not.toEqual(null);
});

test("user see unlocked message in desktop view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={false}
			hasVerified={false}
		/>
	);
	expect(item.exists("LockBook")).toEqual(false);
});

test("when user viewing the Book and see unlocked message in desktop view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("LockBook").text()).toEqual("This book is unlocked. Select a class to create a copy.");
});

test("when user viewing the Book and see unlocked message in mobile view", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("MobTextIconWrap").text()).toEqual("This book is unlocked. Select a class to create a copy.");
});

test("when user viewing the magazine and see unlocked message in desktop view", async () => {
	resultData.content_form = "MI";
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("LockBook").text()).toEqual("This issue is unlocked. Select a class to create a copy.");
});

test("When user viewing the magazine and see unlocked message in mobile view", async () => {
	resultData.content_form = "MI";
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("MobTextIconWrap").text()).toEqual("This issue is unlocked. Select a class to create a copy.");
});

test("When user viewing the book and see unlocked message in mobile view", async () => {
	resultData.content_form = null;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("MobTextIconWrap").text()).toEqual("This book is unlocked. Select a class to create a copy.");
});

test("User see tool tip on course dropdown", async () => {
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
			isShowTooltip={true}
		/>
	);

	expect(item.find("AjaxSearchableDropdown").props().toolTipText).toBe("Please select a class");
});

test("User viewing the book and see unlocked message in mobile view", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;

	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("LockBook").text()).toEqual("This title is unlocked for everyone. Select a class to create a copy.");
});

test("User viewing the book and see unlock with tick icon ", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconSection").length).toBe(1);
});

test("User viewing the book and see unlock with tick icon in mobile view", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconSection").length).toBe(1);
});

test("User viewing the book and see full access icon", async () => {
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconSection").length).toBe(1);
});

test("User viewing the book and see full access icon in mobile view", async () => {
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconSection").length).toBe(1);
});

test("User viewing the book and see unlock with tick icon and full access icon", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconSection").length).toBe(2);
});

test("User viewing the book and see unlock with tick icon and full access icon in mobile view", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconSection").length).toBe(2);
});

test("When user viewing the book having full copy access and see unlocked message", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("LockBook").text()).toEqual("This title is unlocked for everyone and can be copied in full. Select a class to create a copy.");
});

test("User viewing the book having full copy access and see unlocked message in mobile view", async () => {
	resultData.auto_unlocked = true;
	resultData.is_unlocked = true;
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={true}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("IconText").text()).toEqual("This title is unlocked for everyone and can be copied in full. Select a class to create a copy.");
});

test("User viewing the unlocked book having full copy access and see unlocck and full circle icon", async () => {
	resultData.is_unlocked = true;
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("UnlockIcon").length).toBe(1);
	expect(item.find("IconSection").length).toBe(1);
});

test("When user viewing the book unlocked bbok with full copy access and see unlocked message", async () => {
	resultData.is_unlocked = true;
	resultData.can_copy_in_full = true;
	const item = shallow(
		<Form
			pages={pages}
			course={course}
			handleSubmit={mockHandleSubmit}
			handlePagesChange={mockHandlePagesChange}
			handleCourseChange={mockHandleCourseChange}
			errorMessage={errorMessage}
			coursesData={coursesData}
			resultData={resultData}
			isMobile={false}
			canCopy={true}
			hasVerified={true}
		/>
	);
	expect(item.find("LockBook").text()).toEqual("This title can be copied in full. Select a class to create a copy.");
});
