import React from "react";
import { shallow } from "enzyme";
import PdfReader from "../index";
import CoverPageWrapper from "../../CoverPage/CoverPageWrapper";

let props;
let mockWindowWidth;

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
				style: {},
				getContext: jest.fn(),
				getBoundingClientRect: () => {
					return {
						width: mockWindowWidth,
					};
				},
			},
		};
	};
});

jest.mock("../../../common/loadPdfJs", () => {
	return {
		load: () => {
			return new Promise((resolve, reject) => {
				resolve(true);
			});
		},
	};
});

jest.mock("../../../assets/images/cover_img.png", () => true);

function resetAll() {
	props = {
		numberOfPagesToDisplay: 2,
		pdfUrl: "dummy/pdf/url",
		onOpen: jest.fn(),
		annotationsData: {
			allHighlightPageInfo: { 2: [{ page: 2, first_highlight_name: "Mr. Joshi", first_highlight_date: "2022-02-17T09:51:57.412Z" }] },
			allHighlights: {
				2: [
					{
						colour: "#99f997",
						date_created: "2022-02-17T09:51:57.416Z",
						height: 8.47458,
						oid: "511c6940c0ea65f1eb3c8dabee04654b14bc",
						page: 2,
						position_x: 53.1106,
						position_y: 37.7119,
						width: 38.6371,
					},
				],
			},
			allNotes: {
				1: [
					{
						colour: "#fbf99b",
						content: "",
						date_created: "2022-02-17T09:51:48.152Z",
						height: 26.2713,
						oid: "20b7773bd5f8a00377eb57928650ae497b05",
						page: 1,
						position_x: 17.4204,
						position_y: 27.7542,
						width: 46.1683,
						zindex: 1,
					},
				],
			},
			did_create: true,
			handleHiglightDelete: jest.fn(),
			handleNoteClick: jest.fn(),
			handleNoteClose: jest.fn(),
			handleNoteContentChange: jest.fn(),
			handleNoteOnMoveOrResize: jest.fn(),
			handleNoteSelection: jest.fn(),
			isNoteDisplay: true,
			onHighlightDraw: jest.fn(),
			page_index: 0,
			selectedHighlight: null,
			selectedNote: null,
			selectedNoteOid: null,
			teacher: "Mr. Joshi",
		},
		enableKeyNavigation: true,
	};
	window.pdfjsLib = {
		getDocument: () => {
			return {
				promise: new Promise((resolve, reject) => {
					resolve({
						numPages: 4,
					});
				}),
			};
		},
	};
	mockWindowWidth = 1024;
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(1);
	expect(pages.at(1).props().pageNumber).toBe(2);
});

test("When user not pass number of page to display in props", async () => {
	delete props.numberOfPagesToDisplay;
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(1);
	expect(pages.at(1).props().pageNumber).toBe(2);
});

test("When user clicks on next button", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.instance().onClickNext();
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(3);
	expect(pages.at(1).props().pageNumber).toBe(4);
});

test("When user clicks on next button when user on last page", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.setState({ currentPage: 3 });
	item.instance().onClickNext();
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(1);
	expect(pages.at(1).props().pageNumber).toBe(2);
});

test("When user clicks on prev button", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.setState({ currentPage: 3 });
	item.instance().onClickPrev();
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(1);
	expect(pages.at(1).props().pageNumber).toBe(2);
});

test("When user clicks on prev button when user on the first page", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.instance().onClickPrev();
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(3);
	expect(pages.at(1).props().pageNumber).toBe(4);
});

test("When user change window size to mobile", async () => {
	mockWindowWidth = 320;
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.instance().onChangeWindowSize();
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(1);
});

test("When user change window size to desktop", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.instance().onChangeWindowSize();
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(1);
	expect(pages.at(1).props().pageNumber).toBe(2);
});

test("When user clicks on any page to open full screen", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.find("Page").at(0).props().onOpen();
	expect(props.onOpen).toHaveBeenCalled();
});

test("When user clicks on right arrow from keyboard", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.instance().onKeyDown({ keyCode: 39 });
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(3);
});

test("When user clicks on left arrow from keyboard", async () => {
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	item.instance().onKeyDown({ keyCode: 37 });
	const pages = item.find("Page");
	expect(pages.length).toBe(2);
	expect(pages.at(0).props().pageNumber).toBe(3);
});

test("When coverpage is available", async () => {
	props.data = {
		asset_url: "https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf",
		course_name: "Class 4",
		course_oid: "3393f1bf1db01d86a46750b43315d9ce2f81",
		date_created: "2019-08-26T08:02:12.675Z",
		date_expired: "2019-11-26T08:02:12.674Z",
		did_create: true,
		edition: 1,
		exam_board: "CCEA",
		expired: false,
		imprint: "Taylor and Francis",
		oid: "9ea37106583786e4b87f6ff04a5fca339e57",
		page_count: 1,
		pages: [1],
		school_name: "AVM Mandir (AVM-65)",
		students_in_course: 19,
		teacher: "Mrs Salina Joes",
		title: "Behaviour 4 My Future 19 to 21",
		user_id: 642,
		work_authors: [{ role: "A", lastName: "Davis", firstName: "Susie" }],
		work_isbn13: "9781351698962",
		work_publication_date: "2008-10-06T00:00:00.000Z",
		work_publisher: "Taylor and Francis",
		work_title: "Behaviour 4 My Future",
		year_group: "y12",
	};
	const item = shallow(<PdfReader {...props} />);
	await wait(50);
	expect(item.containsMatchingElement(<CoverPageWrapper />)).toBe(true);
});
