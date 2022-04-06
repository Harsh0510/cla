import React from "react";
import { shallow } from "enzyme";
import FullScreenReader from "../FullScreenReader";

let props;
let mockRef;

jest.mock("../../../common/loadPdfJs", () => {
	return {
		load: () => {
			return new Promise((resolve, reject) => {
				resolve(true);
			});
		},
	};
});

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return { current: mockRef };
	};
});

function resetAll() {
	props = {
		numberOfPagesToDisplay: 1,
		pdfUrl: "dummy/pdf/url",
		onClose: jest.fn(),
		currentPage: 1,
		onMoveNextRequest: jest.fn(),
		onMovePrevRequest: jest.fn(),
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
	};
	mockRef = {
		addEventListener: jest.fn(),
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
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(1);
});

test("When user not pass number of page to display in props", async () => {
	delete props.numberOfPagesToDisplay;
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(1);
});

test("When user clicks on next button", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onClickNext();
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(2);
});

test("When user clicks on next button when user on last page", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.setState({ currentPage: 4 });
	item.instance().onClickNext();
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(1);
});

test("When user clicks on prev button", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.setState({ currentPage: 3 });
	item.instance().onClickPrev();
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(2);
});

test("When user clicks on prev button when user on the first page", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onClickPrev();
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(4);
});

test("When user change window size to mobile", async () => {
	window.outerWidth = 540;
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onChangeWindowSize();
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(1);
});

test("When user clicks on close button", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.find("CloseIcon").simulate("click");
	expect(props.onClose).toHaveBeenCalled();
});

test("When user clicks on zoom in button", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onZoomIn();
	expect(item.state().zoomLevel).toEqual(1.5);
});

test("When user clicks on zoom out button", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	item.setState({ zoomLevel: 2.5 });
	await wait(50);
	item.instance().onZoomOut();
	expect(item.state().zoomLevel).toEqual(2);
});

test("When user scroll up with mouse scroll on pdf page", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	item.instance().onChangeMouseWheel({ preventDefault: jest.fn(), deltaY: -53 });
	await wait(50);
	expect(item.state().zoomLevel).toEqual(1.2);
});

test("When user scroll down with mouse scroll on pdf page", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	item.setState({ zoomLevel: 2 });
	item.instance().onChangeMouseWheel({ preventDefault: jest.fn(), deltaY: 53 });
	await wait(50);
	expect(item.state().zoomLevel).toEqual(1.6666666666666667);
});

test("When user clicks on rotate right", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onRotateRight();
	expect(item.state().rotateDegree).toEqual(90);
});

test("When user clicks on rotate right and degree is 270", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	item.setState({ rotateDegree: 270 });
	await wait(50);
	item.instance().onRotateRight();
	expect(item.state().rotateDegree).toEqual(0);
});

test("When user clicks on rotate left", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onRotateLeft();
	expect(item.state().rotateDegree).toEqual(-90);
});

test("When user clicks on rotate left and degree is -270", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	item.setState({ rotateDegree: -270 });
	await wait(50);
	item.instance().onRotateLeft();
	expect(item.state().rotateDegree).toEqual(0);
});

test("When user clicks on right arrow from keyboard", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onKeyDown({ keyCode: 39 });
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(2);
});

test("When user clicks on left arrow from keyboard", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onKeyDown({ keyCode: 37 });
	const pages = item.find("Page");
	expect(pages.length).toBe(1);
	expect(pages.at(0).props().pageNumber).toBe(4);
});

test("When note or highlight mode is on rotation are disabled", async () => {
	props.annotationsData.selectedNote = { colour: "#99f997", key: "#option2", text: "Green", toolTip: "Add a green note", value: "#99f997" };
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	const ToolBarButton = item.find("ToolBarButton");
	expect(ToolBarButton.length).toBe(5);
	expect(ToolBarButton.at(0).props().disabled).not.toBeFalsy();
	expect(ToolBarButton.at(1).props().disabled).not.toBeFalsy();
});

test(`Test componentDidUpdate method`, async () => {
	let prevProps = {
		pdfUrl: "new/dummy/pdf/url",
	};
	let prevState = {
		currentPage: 1,
		rotateDegree: 0,
	};
	const item = shallow(<FullScreenReader {...props} />);
	item.instance().componentDidUpdate(prevProps, prevState);
	await wait(50);
	expect(item.state("pdf")).toEqual({ numPages: 4 });
});

test("When user clicks on esc key from keyboard", async () => {
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().onKeyDown({ keyCode: 27 });
	expect(props.onClose).toHaveBeenCalled();
});

test("When user clicks outside of page", async () => {
	const e = {
		target: mockRef,
	};
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().doCloseFullScreen(e);
	expect(props.onClose).toHaveBeenCalled();
});

test("When user clicks on page", async () => {
	const e = {
		target: null,
	};
	const item = shallow(<FullScreenReader {...props} />);
	await wait(50);
	item.instance().doCloseFullScreen(e);
	expect(props.onClose).not.toHaveBeenCalled();
});
