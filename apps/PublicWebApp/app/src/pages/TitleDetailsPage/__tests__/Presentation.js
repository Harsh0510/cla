// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Presentation from "../Presentation";
import Header from "../../../widgets/Header";
import FlyOutModal from "../../../widgets/FlyOutModal";
import FlyOut from "../../../widgets/Flyout";
import MockTempUnlockAsset from "../../../mocks/MockTempUnlockAsset";

let match, resultData, copiesData, coursesData, sortField, sortDir, userData, loading, unfilteredCountForCopies, currentPage, limit, mockTempAsset;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../assets/images/cover_img.png", () => true);

function resetAll() {
	(match = {
		params: {
			isbn: "9780007457939-collins-mental-maths",
		},
		path: "/works/:isbn",
		url: "/works/9780007457939-collins-mental-maths",
		isExact: true,
	}),
		(resultData = {
			authors: [
				{ lastName: "Clayton", firstName: "Dan" },
				{ lastName: "Kolaric", firstName: "Angie" },
			],
			description:
				"Combining the latest English Language research with up-to-date source texts and activities, this revision workbook for AQA AS/A Level English Language offers students a practical approach to preparing for their AS and A Level assessments, and can be used alongside the AQA AS/A Level English Language Student Book. Structured around the exam papers, so that students know exactly what they need to do for each section of the exam, this workbook provides tips and revision strategies to↵support students as they revise along with practice questions to familiarise them with the requirements of the exam.",
			edition: 1,
			id: 970,
			is_unlocked: true,
			page_count: 172,
			publication_date: "2018-12-20T00:00:00.000Z",
			publisher: "OUP Oxford",
			sub_title: null,
			subject_code: "C",
			subject_name: "Language",
			table_of_contents: null,
			title: "AQA A Level English Language: AQA A Level English Language Revision Workbook",
			is_favorite: true,
		});
	copiesData = [
		{
			course_name: "My Random Course",
			course_oid: "bb031bd13942d0826772b61d6a6c94e90d17",
			date_created: "2019-01-08T09:39:04.614Z",
			exam_board: "AQA",
			oid: "e9e283f3918094ab8f4814396b586102589a",
			page_count: 8,
			pages: [1, 2, 3, 7, 8, 9, 11, 12],
			school_name: "CLA School A3",
			students_in_course: 15,
			teacher: "tfa1name tla1name",
			title: "Test 1 copy",
			user_id: 5,
			work_authors: [
				{ lastName: "Clayton", firstName: "Dan" },
				{ lastName: "Kolaric", firstName: "Angie" },
			],
			length: 2,
			__proto__: [],
			work_isbn13: "9780198426707",
			work_publication_date: "2018-12-20T00:00:00.000Z",
			work_publisher: "OUP Oxford",
			work_title: "AQA A Level English Language: AQA A Level English Language Revision Workbook",
			year_group: "Y05",
		},
		{
			course_name: "My Random Course",
			course_oid: "bb031bd13942d0826772b61d6a6c94e90d17",
			date_created: "2019-01-08T09:39:04.614Z",
			exam_board: "AQA",
			oid: "b0c43984aefc51080d13e9915edb35792921",
			page_count: 8,
			pages: [1, 2, 3, 7, 8, 9, 11, 12],
			school_name: "CLA School A3",
			students_in_course: 15,
			teacher: "tfa1name tla1name",
			title: "Test 1 copy",
			user_id: 5,
			work_authors: [
				{ lastName: "Clayton", firstName: "Dan" },
				{ lastName: "Kolaric", firstName: "Angie" },
			],
			length: 2,
			__proto__: [],
			work_isbn13: "9780198426707",
			work_publication_date: "2018-12-20T00:00:00.000Z",
			work_publisher: "OUP Oxford",
			work_title: "AQA A Level English Language: AQA A Level English Language Revision Workbook",
			year_group: "Y05",
		},
	];
	sortDir = "A";
	sortField = "date_created";
	(userData = {
		first_name: "school",
		last_name: "admin",
		role: "school-admin",
		school: "Test School",
		academic_year_end_month: 8,
		academic_year_end_day: 15,
		can_copy: true,
	}),
		(loading = false);
	unfilteredCountForCopies = 20;
	currentPage = 1;
	limit = 5;
	mockTempAsset = MockTempUnlockAsset;
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**Mock functions */
const doExtractSort = jest.fn();
const onGoToPageSubmit = jest.fn();
const onCreateCopySubmit = jest.fn();
const doExtractPagination = jest.fn();

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			loading={loading}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
		/>
	).dive();
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test("Show First Popup", async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			loading={loading}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			flyOutIndex={-1}
		/>
	).dive();

	expect(item.containsMatchingElement(<FlyOutModal />)).toBe(true);
});

test("Show First FlyOut", async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			loading={loading}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			flyOutIndex={0}
		/>
	).dive();
	await wait(20);
	expect(item.find(FlyOut).length).toBe(1);
});

test("Show second FlyOut", async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			loading={loading}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			flyOutIndex={1}
		/>
	).dive();
	await wait(20);
	expect(item.find(FlyOut).length).toBe(1);
});

test("Show Notification FlyOut", async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			loading={loading}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			flyOutIndex={2}
			flyOutIndexNotification={-1}
			notificationCount={2}
		/>
	).dive();
	await wait(50);
	expect(item.find(FlyOut).length).toBe(1);
});

/** User click on table for collapse */
/**  doToggleTableVisibility */
test("User click on table for collapse", async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	const isTableIsVisible = item.state().tableIsVisible;

	item.instance().doToggleTableVisibility({ preventDefault: jest.fn() });

	expect(item.state().tableIsVisible).not.toBe(isTableIsVisible);
});

test('User get "No works found with ISBN "9780007457939" message', async () => {
	resultData = null;
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	expect(item.find("NoWorksFound").text()).toBe('No works found with ISBN "9780007457939".');
});

test("User loading the data", async () => {
	loading = true;
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	expect(item.find("Loader").length).toBe(1);
});

test("Unsigned user not show the copies data", async () => {
	//Unsigned user
	userData = null;

	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	expect(item.find("Table").length).toBe(0);
});

test("Signed user dont have the copies data", async () => {
	copiesData = null;
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	expect(item.find("Table").length).toBe(0);
});

test("Signed User view locked content", async () => {
	resultData.is_unlocked = false;
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			loading={loading}
		/>
	);

	expect(item.find("SectionTwo").length).toBe(0);
	expect(item.find("CopiesWrap").length).toBe(0);
});

test("User have hasContents", async () => {
	resultData.table_of_contents = "<span>table_of_contents</span>";

	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	expect(item.find("CopiesTable").length).toBe(1);
});

/** When user clicks on 'doToggelWizard' info icon */
test(`When user clicks on 'doToggelWizard' info icon`, async () => {
	resultData.table_of_contents = "<span>table_of_contents</span>";
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	const mockIsTextDisplay = item.state().isTextDisplay;
	item.instance().doToggelWizard(true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().isTextDisplay).not.toBe(mockIsTextDisplay);
});

/** When book is locked and user click on unlock button */
test(`When book is locked and user click on unlock button`, async () => {
	const mockGoToUnlockPage = jest.fn();
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();
	item.instance().goToUnlockPage({ preventDefault: mockGoToUnlockPage });
	expect(mockGoToUnlockPage).toHaveBeenCalled();
});

/** When user click on unlock button and redirect to unlock page */
test(` When user click on unlock button and redirect to unlock page `, async () => {
	const mockGoToUnlockPage = jest.fn();
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();
	item.instance().goToUnlockPage({ preventDefault: mockGoToUnlockPage });
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().formRedirect).toBe(true);
});

test(` showing user a modal for unverfied or un approve user `, async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();
	item.update();
	const value = "Dummy Value";
	item.instance().doShowModal(value);
	expect(item.state("showModal")).toEqual("Dummy Value");
});

test(` hiding a modal for unverfied or un approve user `, async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();
	item.update();
	item.instance().hideModal();
	expect(item.state("showModal")).toBe(false);
});

test(`User see prompt when the asset is temporarily unlocked`, async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
			tempUnlockAssetTitles={mockTempAsset.result}
		/>
	).dive();
	item.update();
	expect(item.find("TempUnlockWrap").length).toBe(1);
	expect(item.find("TempUnlockAsset").length).toBe(1);
});
test(`User don't see prompt when the asset is temporarily unlocked and user is not logged in`, async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
			tempUnlockAssetTitles={mockTempAsset}
		/>
	).dive();
	item.update();
	expect(item.find("TempUnlockWrap").length).toBe(0);
	expect(item.find("TempUnlockAsset").length).toBe(0);
});
test(`User don't see prompt when the asset is not temporarily unlocked`, async () => {
	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
			userData={userData}
		/>
	).dive();
	item.update();
	expect(item.find("TempUnlockWrap").length).toBe(0);
	expect(item.find("TempUnlockAsset").length).toBe(0);
});

test("When metadata does not contain a description and there is no table of content data available for asset", async () => {
	resultData.table_of_contents = null;
	resultData.description = "";

	const item = shallow(
		<Presentation
			match={match}
			resultData={resultData}
			copiesData={copiesData}
			doExtractSort={doExtractSort}
			coursesData={coursesData}
			onGoToPageSubmit={onGoToPageSubmit}
			onCreateCopySubmit={onCreateCopySubmit}
			sortField={sortField}
			sortDir={sortDir}
			userData={userData}
			doExtractPagination={doExtractPagination}
			limit={limit}
			unfilteredCountForCopies={unfilteredCountForCopies}
			currentPage={currentPage}
			loading={loading}
		/>
	).dive();

	expect(item.find("CopiesTable").length).toBe(1);
	expect(item.find("AccordianSection").length).toBe(0);
});
