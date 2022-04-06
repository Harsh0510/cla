// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

/** Used by Titlesection component */
import React from "react";
import { shallow } from "enzyme";
import WorkResultDescription from "../WorkResultDescription";
import { watchFile } from "fs";

let assets;
let isAuthorFull = false,
	isEditorFull = false,
	isPublisherFull = false,
	isTitleFull = false,
	isTranslatorFull = false;
function resetAll() {
	assets = {
		work_authors: [
			{ lastName: "Clayton", firstName: "Dan", role: "A" },
			{ lastName: "Kolaric", firstName: "Angie", role: "B" },
		],
		length: 2,
		__proto__: [],
		description:
			"Combining the latest English Language research with up-to-date source texts and activities, this revision workbook for AQA AS/A Level English Language offers students a practical approach to preparing for their AS and A Level assessments, and can be used alongside the AQA AS/A Level English Language Student Book. Structured around the exam papers, so that students know exactly what they need to do for each section of the exam, this workbook provides tips and revision strategies to↵support students as they revise along with practice questions to familiarise them with the requirements of the exam.",
		edition: 1,
		id: 970,
		is_unlocked: true,
		page_count: 172,
		work_publication_date: "2018-12-20T00:00:00.000Z",
		publisher: "OUP Oxford",
		sub_title: null,
		subject_code: "C",
		subject_name: "Language",
		table_of_contents: null,
		title: "AQA A Level English Language: AQA A Level English Language Revision Workbook",
		work_title: "Behaviour 4 My Future",
		work_content_form: "BO",
	};
}

jest.mock("../../../common/bookMetaLength", () => {
	return {
		extract_view: {
			MAX_TITLE_LENGTH: 7,
			MAX_CONTRIBUTOR_LENGTH: 5,
			MAX_PUBLISHER_LENGTH: 5,
		},
	};
});

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

const toggleWidth = function (data) {
	switch (data) {
		case "author":
			isAuthorFull = true;
			break;
		case "editor":
			isEditorFull = true;
			break;
		case "publisher":
			isPublisherFull = true;
			break;
		case "translator":
			isTranslatorFull = true;
			break;
		default:
			isTitleFull = true;
			break;
	}
};

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<WorkResultDescription asset={assets} />);
	expect(item.find("BookText").length).toBe(1);
});

/** Book dont get authors values */
test("Book dont get authors values", async () => {
	assets.work_authors = null;
	const item = shallow(<WorkResultDescription asset={assets} />);

	expect(item.find("BookText").length).toBe(1);
	expect(item.find("HeadTitle").find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").length).toBe(0);
});

/** Book dont get publication_date */
test("Book dont get publication_date", async () => {
	assets.publication_date = null;
	const item = shallow(<WorkResultDescription asset={assets} />);
	expect(item.find("BookText").length).toBe(1);
});

/** Book Work_title length is not greater then maximun length */
test("Book Work_title length is not greater then maximun length", async () => {
	assets.work_title = "Title";
	const item = shallow(<WorkResultDescription asset={assets} />);
	expect(item.find("ChevronTag").length).toBe(3);
});

/** Book have edition > 1 */
test("Book have edition > 1", async () => {
	assets.edition = 2;
	const item = shallow(<WorkResultDescription asset={assets} />);
	expect(item.find("BookText").length).toBe(1);
});

test("Click Title", async () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.work_authors = [
		{ role: "A", lastName: "B", firstName: "C" },
		{ role: "B", lastName: "D", firstName: "D" },
	];
	assets.publisher = "T ";
	assets.publication_date = "2018-09-28";
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);

	//find boot title text section
	const titleText = item.find("BookText").childAt(0);
	titleText.simulate("click");
	expect(isTitleFull).toBe(true);

	//set props isTitleFull as true
	item.setProps({ isTitleFull: true });
	const fontAwesomeIcon = titleText.find("FontAwesomeIcon");
	expect(fontAwesomeIcon.props().icon.iconName).toBe("chevron-down");
});

test("Click on Author", async () => {
	assets.title = "AQ";
	assets.publisher = "T ";
	assets.publication_date = "2018-09-28";
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);

	//find boot title text section
	const titleText = item.find("BookInfo").childAt(0);
	titleText.simulate("click");
	expect(isAuthorFull).toBe(true);

	//set props isAuthorFull as true
	item.setProps({ isAuthorFull: true });
	const fontAwesomeIcon = titleText.find("FontAwesomeIcon");
	expect(fontAwesomeIcon.props().icon.iconName).toBe("chevron-down");
});

test("Click on Editors", async () => {
	assets.title = "AQ";
	assets.publisher = "T ";
	assets.publication_date = "2018-09-28";
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);

	//find boot title text section
	const titleText = item.find("BookInfo").childAt(1);
	titleText.simulate("click");
	expect(isEditorFull).toBe(true);

	//set props isEditorFull as true
	item.setProps({ isAuthorFull: true });
	const fontAwesomeIcon = titleText.find("FontAwesomeIcon");
	expect(fontAwesomeIcon.props().icon.iconName).toBe("chevron-down");
});

test("Click on Publishers", async () => {
	assets.title = "AQ";
	assets.publisher = "Taylor and Francis";
	assets.publication_date = "2018-09-28";
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);

	//find boot title text section
	const titleText = item.find("BookInfo").childAt(3);
	titleText.simulate("click");
	expect(isPublisherFull).toBe(true);

	//set props isPublisherFull as true
	item.setProps({ isPublisherFull: true });
	const fontAwesomeIcon = titleText.find("FontAwesomeIcon");
	expect(fontAwesomeIcon.props().icon.iconName).toBe("chevron-down");
});

/** User view magazine and not getting the  authors and editors information */
test("User view magazine and not getting the authors and editors information", async () => {
	assets.work_content_form = "MI";
	assets.edition = 2;
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);
	expect(item.find("BookText").length).toBe(1);
	expect(item.find("HeadTitle").find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").length).toBe(0);
});

test(`User see citation link`, async () => {
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);
	expect(item.find("CitationTool").length).toBe(1);
});

test("Click on translator", async () => {
	assets.title = "AQ";
	assets.publisher = "Taylor and Francis";
	assets.publication_date = "2018-09-28";
	assets.work_authors = [
		{
			role: "T",
			lastName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
			firstName:
				"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level EnglishAQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English",
		},
	];
	const item = shallow(<WorkResultDescription asset={assets} toggleWidth={toggleWidth} />);

	//find boot title text section
	const titleText = item.find("BookInfo").childAt(2);
	titleText.simulate("click");
	expect(isTranslatorFull).toBe(true);

	//set props isTranslatorFull as true
	item.setProps({ isTranslatorFull: true });
	const fontAwesomeIcon = titleText.find("FontAwesomeIcon");
	expect(fontAwesomeIcon.props().icon.iconName).toBe("chevron-down");
});
