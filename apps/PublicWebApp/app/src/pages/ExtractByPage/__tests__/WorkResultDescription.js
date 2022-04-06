// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

/** Used by Titlesection component */
import React from "react";
import { shallow } from "enzyme";
import WorkResultDescription from "../WorkResultDescription";

let assets;
let isAuthorFull = false,
	isEditorFull = false,
	isPublisherFull = false,
	isTitleFull = false,
	isTranslatorFull = false;

const toggleWidth = function (data) {
	switch (data) {
		case "author":
			isAuthorFull = !isAuthorFull;
			break;
		case "editor":
			isEditorFull = !isEditorFull;
			break;
		case "publisher":
			isPublisherFull = !isPublisherFull;
			break;
		case "translator":
			isTranslatorFull = !isTranslatorFull;
			break;
		default:
			isTitleFull = !isTitleFull;
			break;
	}
};

jest.mock("../../../common/bookMetaLength", () => {
	return {
		create_copy: {
			MAX_TITLE_LENGTH: 30,
			MAX_CONTRIBUTOR_LENGTH: 30,
			MAX_PUBLISHER_LENGTH: 55,
		},
	};
});

function resetAll() {
	assets = {
		authors: [
			{ role: "A", lastName: "Kaur", firstName: "B." },
			{ role: "A", lastName: "Kaur", firstName: "B." },
			{ role: "B", lastName: "Kaur", firstName: "B." },
			{ role: "B", lastName: "Kaur", firstName: "B." },
			{ role: "B", lastName: "Kaur", firstName: "B." },
			{ role: "T", lastName: "Kaur", firstName: "B." },
		],
		length: 2,
		__proto__: [],
		description:
			"Combining the latest English Language research with up-to-date source texts and activities, this revision workbook for AQA AS/A Level English Language offers students a practical approach to preparing for their AS and A Level assessments, and can be used alongside the AQA AS/A Level English Language Student Book. Structured around the exam papers, so that students know exactly what they need to do for each section of the exam, this workbook provides tips and revision strategies to↵support students as they revise along with practice questions to familiarise them with the requirements of the exam.",
		edition: 2,
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
		content_form: "BO",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<WorkResultDescription asset={assets} />);

	expect(item.find("BookText").length).toBe(1);
});

/** Book haven't any authors, publisher, and edition details  */
test("Book haven't any authors, publisher, and publication date details", async () => {
	assets.authors = null;
	assets.publication_date = null;
	assets.edition = 1;
	const item = shallow(<WorkResultDescription asset={assets} isBookTableContent={true} />);
	expect(item.find("BookInfo").length).toBe(1);
});

/** When user want to see book details so it click on the down caret icon  */
test("User want to see book details", async () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher =
		"TEST TEST TEST AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.authors = [
		{
			role: "A",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level EnglishAQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{
			role: "B",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName: "AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = shallow(<WorkResultDescription asset={assets} isBookTableContent={true} toggleWidth={toggleWidth} />);
	item.find("BookInfo").childAt(0).simulate("click");
	item.find("BookInfo").childAt(1).simulate("click");
	expect(isAuthorFull).toBe(true);
	expect(isEditorFull).toBe(true);
	//expect(item.find('BookInfo').length).toBe(1);
});

test("User seen book full title and not seen the expanded iconthe down caret icon", async () => {
	assets.title = "AQA A Level";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("h2").find("FontAwesomeIcon").length).toBe(0);
});

test("User seen book short title and clicked on the down caret icon", async () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("TitleHeadding").find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("TitleHeadding").find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});

/** When user does not want to see book details so it click on the up caret icon  */
test("User doesn't want to see book details", async () => {
	const item = shallow(<WorkResultDescription asset={assets} isBookTableContent={false} />);
	//expect(item.find('BookInfo').length).toBe(0);
});

test("When Title, Author is big show chevron", async () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.authors = [{ role: "A", lastName: "K", firstName: "B." }];
	assets.publisher = "TEST TEST TEST TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	const item = shallow(<WorkResultDescription asset={assets} isBookTableContent={false} toggleWidth={toggleWidth} />);
	expect(item.find("TitleHeadding").find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("BookInfo").childAt(3).find("FontAwesomeIcon").length).toBe(1);
	item.find("BookText").childAt(0).simulate("click");
	item.find("BookInfo").childAt(3).simulate("click");
	expect(isTitleFull).toBe(true);
	expect(isPublisherFull).toBe(true);
});

test("When Title, publisher is Small", () => {
	assets.title = "AQA A Level English";
	assets.publisher = null;
	assets.publication_date = null;
	assets.edition = 1;
	const item = shallow(<WorkResultDescription asset={assets} isBookTableContent={false} toggleWidth={toggleWidth} />);
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").length).toBe(0);
});

test("When author is small, user not seen the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(0);
});

test("When author editors small, user not seen the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(0);
});

test("When author editors big, user seen the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "B",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level EnglishAQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{
			role: "B",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName: "AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(1).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-down");
});

test("When author editors big and user clicked the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "B",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level EnglishAQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{
			role: "B",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName: "AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={true}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(1).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});

test("When author is big, user seen the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "A",
			lastName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
			firstName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
		},
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-down");
});

test("When author is big, user clicked on the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "A",
			lastName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
			firstName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
		},
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(0).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});

test("When publisher text is small, user not seen the expanded icon", () => {
	assets.title = "AQA A Level English Language: AQA A Level English Language Revision Workbook.";
	assets.publisher = "Test";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "A",
			lastName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
			firstName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
		},
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").length).toBe(0);
});

test("When publisher is big, user clicked on the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "A",
			lastName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
			firstName: "AQA A Level English Language: AQA A Level English Language AQA A Level English Language: AQA A Level English Language",
		},
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={true}
			isEditorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(3).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(3).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});

test("when user viewing the magazine and see the title", () => {
	assets.title = "AQA";
	assets.content_form = "MI";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookText").find("TitleHeadding").text()).toBe(`AQA`);
});

test("when user viewing the book and see the Title display without month and year", () => {
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookText").find("TitleHeadding").text()).toBe(`AQA`);
});

test("when user viewing the magazine and see the Publisher detail display with month and year", () => {
	assets.title = "AQA";
	assets.content_form = "MI";
	assets.edition = 1;
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookInfo").childAt(3).text()).toBe("OUP Oxford. Published December 2018.");
});

test("when user viewing the book and see the Publisher detail display with month and year", () => {
	assets.title = "AQA";
	assets.edition = 1;
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookInfo").childAt(3).text()).toBe("OUP Oxford. Published 2018.");
});

test("when user viewing the book and see the Author and editor detail", () => {
	assets.title = "AQA";
	assets.edition = 1;
	assets.authors = [
		{
			role: "A",
			lastName: "AQA",
			firstName: "Level",
		},
		{
			role: "A",
			lastName: "AQA",
			firstName: "Level",
		},
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookInfo").childAt(0).text()).toBe("Level AQA and Level AQA");
	expect(item.find("BookInfo").childAt(1).text()).toBe("Edited by  B. Kaur");
});

test("when user viewing the Magazine and don't see the Author and editor detail", () => {
	assets.title = "AQA";
	assets.edition = 1;
	assets.content_form = "MI";
	assets.authors = [
		{
			role: "A",
			lastName: "AQA",
			firstName: "Level",
		},
		{
			role: "A",
			lastName: "AQA",
			firstName: "Level",
		},
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isPublisherFull={true}
			isEditorFull={true}
			isTitleFull={true}
		/>
	);
	expect(item.find("BookInfo").childAt(0).text()).toBe("");
	expect(item.find("BookInfo").childAt(1).text()).toBe("");
});

test("When Title, publisher is Small in magzine", () => {
	assets.title = "AQA A Level English";
	assets.publisher = null;
	assets.publication_date = null;
	assets.edition = 1;
	assets.content_form = "MI";
	const item = shallow(<WorkResultDescription asset={assets} isBookTableContent={false} toggleWidth={toggleWidth} />);
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").length).toBe(0);
});

test("When author editors big, user seen the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "T",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level EnglishAQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{
			role: "T",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName: "AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTranslatorFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-down");
});

test("When author translators big and user clicked the expanded icon", () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.publisher = "TEST TEST TEST ";
	assets.publication_date = "2018-09-28";
	assets.authors = [
		{
			role: "T",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level EnglishAQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
		{
			role: "T",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName: "AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isBookTableContent={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isPublisherFull={false}
			isEditorFull={false}
			isTranslatorFull={true}
			isTitleFull={false}
		/>
	);
	item.find("BookInfo").childAt(2).simulate("click");
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").childAt(2).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});
