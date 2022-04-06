import React from "react";
import { shallow } from "enzyme";
import WorkResultDescription from "../WorkResultDescription";
import MockBookCover from "../../../mocks/MockBookCover";

let props;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
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
		create_copy_links: {
			MAX_TITLE_LENGTH: 27,
			MAX_CONTRIBUTOR_LENGTH: 5,
			MAX_PUBLISHER_LENGTH: 8,
		},
	};
});

function resetAll() {
	props = {
		asset: MockBookCover[0],
		isShowBookInfo: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<WorkResultDescription {...props} />);

	expect(item.find("BookText").length).toBe(1);
	expect(item.find("BookInfo").length).toBe(1);
});

/** User expanded the Book Information */
test("Component renders correctly", async () => {
	props.isShowBookInfo = true;
	const item = shallow(<WorkResultDescription {...props} />);

	expect(item.find("BookText").length).toBe(1);
	expect(item.find("BookInfo").length).toBe(1);
	expect(item.find("BookInfo").props().isShowBookInfo).toEqual(props.isShowBookInfo);
});

/** User getting the Book authors and editors information */
test("User getting the Book authors and editors information", async () => {
	props.isShowBookInfo = true;
	//props.asset.work_authors = [];
	const item = shallow(<WorkResultDescription {...props} />);
	let paragraphItems = item.find("Ptag");
	expect(paragraphItems.first().find("FontAwesomeIcon").length).toBe(1);
	expect(paragraphItems.at(1).find("FontAwesomeIcon").length).toBe(1);
});

/** User view magazine and not getting the authors and editors information */
test("User view magazine and not getting the authors and editors information", async () => {
	props.isShowBookInfo = true;
	props.asset.work_content_form = "MI";
	const item = shallow(<WorkResultDescription {...props} />);
	let paragraphItems = item.find("Ptag");
	expect(paragraphItems.first().find("FontAwesomeIcon").length).toBe(0);
	expect(paragraphItems.at(1).find("FontAwesomeIcon").length).toBe(0);
});

/** User not getting the book authors data  */
test("User not getting the book authors data", async () => {
	props.isShowBookInfo = true;
	props.asset.work_authors = [];
	const item = shallow(<WorkResultDescription {...props} />);
	let paragraphItems = item.find("Ptag");

	expect(paragraphItems.first().text()).toBe("");
	expect(paragraphItems.at(1).text()).toBe("");
});

/** User not getting the published year  */
test("User not getting the published year", async () => {
	props.isShowBookInfo = true;
	props.asset.work_publication_date = null;
	const item = shallow(<WorkResultDescription {...props} />);
	let paragraphItems = item.find('[className="mb-0"]');
});

/** User not getting the edition even when book edition is 1 */
test("User not getting the edition even when book edition is 1", async () => {
	props.isShowBookInfo = true;
	props.asset.edition = null;
	props.asset.work_publication_date = null;
	const item = shallow(<WorkResultDescription {...props} />);
	let paragraphItems = item.find('[className="mb-0"]');
});

/** User getting the book edition when book edition > 1 */
test("User getting the book edition when book edition > 1", async () => {
	props.isShowBookInfo = true;
	props.asset.edition = 2;
	props.asset.work_publication_date = null;
	const item = shallow(<WorkResultDescription {...props} />);
	let paragraphItems = item.find('[className="mb-0"]');
});

/** When Title,Author,publication is larger chevron appears and clicking on it displays full width */
test("When Title,Author,publication is larger chevron appears", async () => {
	props.isShowBookInfo = true;
	props.asset.work_content_form = "BO";
	props.asset.edition = 2;
	props.asset.work_publication_date = "2019-08-29";
	props.toggleWidth = toggleWidth;
	props.isPublisherFull = true;
	props.isEditorFull = true;
	props.isAuthorFull = true;
	props.isTitleFull = true;
	props.isTranslatorFull = true;
	props.asset.work_authors = [
		{
			role: "A",
			lastName: "Brodie",
			firstName: "Andrew",
		},
		{
			role: "A",
			lastName: "Testino",
			firstName: "Andrew",
		},
		{
			role: "B",
			lastName: "Bill B",
			firstName: "Gest",
		},
		{
			role: "B",
			lastName: "Bill C",
			firstName: "Jest",
		},
		{
			role: "T",
			lastName: "Trans",
			firstName: "Jest",
		},
	];
	const item = shallow(<WorkResultDescription {...props} />);

	expect(item.find("BookText").find("WorkTitle").find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").find("Paragraph").childAt(0).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").find("Paragraph").childAt(1).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").find("Paragraph").childAt(2).find("FontAwesomeIcon").length).toBe(1);
	expect(item.find("BookInfo").find("Paragraph").childAt(3).find("FontAwesomeIcon").length).toBe(1);
	item.find("BookText").childAt(0).simulate("click");
	item.find("BookInfo").find("Paragraph").childAt(0).simulate("click");
	item.find("BookInfo").find("Paragraph").childAt(1).simulate("click");
	item.find("BookInfo").find("Paragraph").childAt(2).simulate("click");
	item.find("BookInfo").find("Paragraph").childAt(3).simulate("click");
	expect(isTitleFull).toBe(true);
	expect(isAuthorFull).toBe(true);
	expect(isEditorFull).toBe(true);
	expect(isPublisherFull).toBe(true);
	expect(isTranslatorFull).toBe(true);
});

/** When Title,Author,publication is smaller, chevron doesn't appears*/
test("When Title,Author,publication is larger chevron appears", async () => {
	props.isShowBookInfo = true;
	props.asset.edition = 1;
	props.toggleWidth = toggleWidth;
	props.asset.work_authors = [
		{
			role: "A",
			lastName: "B",
			firstName: "A",
		},
	];
	props.asset.work_publisher = "E";
	props.asset.work_publication_date = null;
	props.asset.work_title = "small Title";

	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("BookText").find("WorkTitle").find("FontAwesomeIcon").length).toBe(0);
});

test("User have a option to create note", async () => {
	props.asset.did_create = true;
	props.isNoteDisplay = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("SelectNoteDropDown").length).toBe(2);
});

test("User have not an option to Add note in responsive", async () => {
	props.asset.did_create = true;
	props.isNoteDisplay = false;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("SelectNoteDropDown").length).toBe(0);
});

test("User have a option to create highlight", async () => {
	props.asset.did_create = true;
	props.isNoteDisplay = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("SelectDropDownSection").length).toBe(1);
});

test("User not seen options to create highlight and note", async () => {
	props.asset.did_create = true;
	props.isNoteDisplay = true;
	props.asset.expired = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("SelectDropDownSection").length).toBe(0);
	expect(item.find("SelectNoteDropDown").length).toBe(0);
});

test(`User see citation link`, async () => {
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("CitationTool").length).toBe(1);
});
