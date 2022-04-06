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
function resetAll() {
	assets = {
		authors: [
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
		publication_date: "2018-12-20T00:00:00.000Z",
		publisher: "OUP Oxford",
		sub_title: null,
		subject_code: "C",
		subject_name: "Language",
		table_of_contents: null,
		title: "AQA A Level English Language: AQA A Level English Language Revision Workbook",
		content_form: "MI",
	};
}

jest.mock("../../../common/bookMetaLength", () => {
	return {
		content_detail: {
			MAX_TITLE_LENGTH: 30,
			MAX_CONTRIBUTOR_LENGTH: 30,
			MAX_PUBLISHER_LENGTH: 30,
		},
	};
});

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
	assets.authors = null;
	const item = shallow(<WorkResultDescription asset={assets} />);

	expect(item.find("BookText").length).toBe(1);
	expect(item.find("HeadTitle").find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").length).toBe(0);
});

/** Book dont get publication_date */
test("Book dont get publication_date", async () => {
	assets.publication_date = null;
	const item = shallow(<WorkResultDescription asset={assets} />);
	expect(item.find("BookText").length).toBe(1);
});

/** Book have edition > 1 */
test("Book have edition > 1", async () => {
	assets.edition = 2;
	const item = shallow(<WorkResultDescription asset={assets} />);
	expect(item.find("BookText").length).toBe(1);
});

/** Hide a book title when page view in mobile device */
test("Hide a book title when page view in mobile device", async () => {
	const item = shallow(<WorkResultDescription asset={assets} isMobile={true} />);
	expect(item.find("BookText").find("TilteHeading").length).toBe(1);
});

/*---- Add Chevron if title is greater than length expected ---- */
test("Hide a book title when page view in mobile device", async () => {
	assets.title =
		"AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook. AQA A Level English Language: AQA A Level English Language Revision Workbook";
	assets.authors = [{ lastName: "Cl", firstName: "D", role: "A" }];
	assets.publisher = "T";
	assets.publication_date = "";
	const item = shallow(<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} />);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").length).toBe(0);
	expect(item.find("BookText").find("TilteHeading").find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt("3").find("FontAwesomeIcon").length).toBe(0);
});

test("Click publisher", () => {
	assets.content_form = "BO";
	assets.title = "AQA A Level English Language".repeat(10);
	assets.publisher = "TEST".repeat(10);
	assets.authors = [
		{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "A" },
		{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "B" },
	];
	assets.publication_date = "2018-09-28";
	const item = shallow(<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} />);
	item.find("BookText").childAt(0).simulate("click");
	expect(isTitleFull).toBe(true);
	item.find("BookText").childAt(1).simulate("click");
	expect(isAuthorFull).toBe(true);
	item.find("BookText").childAt(2).simulate("click");
	expect(isEditorFull).toBe(true);
	item.find("BookText").childAt(4).simulate("click");
	expect(isPublisherFull).toBe(true);
});

test("Click publisher", () => {
	assets.title = "AQA";
	assets.publisher = "T";
	assets.publication_date = null;
	const item = shallow(<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} />);
});

test("Show Full Title,Publisher", () => {
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
});

test("when user viewing the magazine and see the title in desktop device", () => {
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").find("TilteHeading").text()).toBe(`AQA`);
});

test("when user viewing the magazine and see the title in mobile device", () => {
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={true} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").find("TilteHeading").text()).toBe(`AQA`);
});

test("when user viewing the Book and see the title in desktop device", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").find("TilteHeading").text()).toBe(`AQA`);
});

test("when user viewing the Book and see the title in mobile device", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={true} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").find("TilteHeading").text()).toBe(`AQA`);
});

test("when user viewing the magazine and see the Publisher detail with month and year in desktop device", () => {
	assets.content_form = "MI";
	assets.title = "AQA";
	assets.publisher = "test";
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={false}
			toggleWidth={toggleWidth}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(4).text()).toBe("test. Published December 2018.");
});

test("when user viewing the magazine and see the Publisher detail with month and year in mobile device", () => {
	assets.content_form = "MI";
	assets.title = "AQA";
	assets.publisher = "test";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={true} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").childAt(4).text()).toBe("test. Published December 2018.");
});

test("when user viewing the book and see the Publisher detail with year in desktop device", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={false} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").childAt(4).text()).toBe("OUP Oxford. Published 2018.");
});

test("when user viewing the book and see the Publisher detail with year in mobile device", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	const item = shallow(
		<WorkResultDescription asset={assets} isMobile={true} toggleWidth={toggleWidth} isEditorFull={true} isPublisherFull={true} isTitleFull={true} />
	);
	expect(item.find("BookText").childAt(4).text()).toBe("OUP Oxford. Published 2018.");
});

test("User viewing the book when author and editor text are large than beside authors see the expanded icon", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	assets.authors = [
		{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "A" },
		{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "B" },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(1).text()).toBe("firstnamefirstnamefirstnamefir...<FontAwesomeIcon />");
	expect(item.find("BookText").childAt(2).text()).toBe("Edited by firstnamefirstnamefirstnamefir...<FontAwesomeIcon />");
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-down");
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-down");
});

test("User clicked on expand icon and seen the full details for author and editor when author and editor text are large", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	assets.authors = [
		{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "A" },
		{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "B" },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={false}
			toggleWidth={toggleWidth}
			isAuthorFull={true}
			isEditorFull={true}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(1).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
	expect(item.find("BookText").childAt(2).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});

test("when user viewing the book and see the author and editor detail in desktop device", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	assets.authors = [
		{ lastName: "lastname", firstName: "firstname", role: "A" },
		{ lastName: "lastname", firstName: "firstname", role: "B" },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(1).text()).toBe("firstname lastname");
	expect(item.find("BookText").childAt(2).text()).toBe("Edited by firstname lastname");
});

test("when user viewing the book and see the author and editor detail in mobille device", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	assets.authors = [
		{ lastName: "lastname", firstName: "firstname", role: "A" },
		{ lastName: "lastname", firstName: "firstname", role: "B" },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={true}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(1).text()).toBe("firstname lastname");
	expect(item.find("BookText").childAt(2).text()).toBe("Edited by firstname lastname");
});

test("when user viewing the Magazine and don't see the author and editor detail in desktop device", () => {
	assets.content_form = "MI";
	assets.title = "AQA";
	assets.authors = [
		{ lastName: "lastname", firstName: "firstname", role: "A" },
		{ lastName: "lastname", firstName: "firstname", role: "B" },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(1).text()).toBe("");
	expect(item.find("BookText").childAt(2).text()).toBe("");
});

test("when user viewing the magazine and  don't see the author and editor detail in mobille device", () => {
	assets.content_form = "MI";
	assets.title = "AQA";
	assets.authors = [
		{ lastName: "lastname", firstName: "firstname", role: "A" },
		{ lastName: "lastname", firstName: "firstname", role: "B" },
	];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={true}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
		/>
	);
	expect(item.find("BookText").childAt(1).text()).toBe("");
	expect(item.find("BookText").childAt(2).text()).toBe("");
});

test("User clicked on expand icon and seen the full details for translator when translator text are large", () => {
	assets.content_form = "BO";
	assets.title = "AQA";
	assets.authors = [{ lastName: "lastname".repeat(10), firstName: "firstname".repeat(10), role: "T" }];
	const item = shallow(
		<WorkResultDescription
			asset={assets}
			isMobile={false}
			toggleWidth={toggleWidth}
			isAuthorFull={false}
			isEditorFull={false}
			isPublisherFull={false}
			isTitleFull={false}
			isTranslatorFull={true}
		/>
	);
	item.find("BookText").childAt(3).simulate("click");
	expect(item.find("BookText").childAt(3).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookText").childAt(3).find("FontAwesomeIcon").props().icon.iconName).toBe("chevron-up");
});
