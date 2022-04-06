import React from "react";
import { shallow } from "enzyme";
import Page from "../Page";

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
				style: {},
				getContext: jest.fn(),
			},
		};
	};
});

let props;

function resetAll() {
	props = {
		width: 1024,
		pageNumber: 2,
		pdf: {
			getPage: () => {
				return new Promise((resolve, reject) => {
					resolve({
						getViewport: () => jest.fn(),
						getTextContent: () => {
							return new Promise((resolve, reject) => {
								resolve("Page Content");
							});
						},
						render: jest.fn(),
					});
				});
			},
		},
		onOpen: jest.fn(),
		zoomLevel: 1,
		rotateDegree: 0,
	};
	window.pdfjsLib = {
		renderTextLayer: () => {
			return true;
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const item = shallow(<Page {...props} />);
	await wait(50);
	expect(item.find("Canvas").length).toBe(1);
	expect(item.find("TextLayer").props().className).toEqual("textLayer");
});

test("Component renders correctly when user on mobile device", async () => {
	props.width = 425;
	const item = shallow(<Page {...props} />);
	await wait(50);
	expect(item.find("Canvas").length).toBe(1);
	expect(item.find("TextLayer").props().className).toEqual("textLayer");
});

test("When user clicks on page to open in full screen", async () => {
	props.annotationsData = {
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
			2: [
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
	};
	props.width = 1040;
	const item = shallow(<Page {...props} />);
	await wait(50);
	item.find("Wrap").at(0).simulate("click");
	expect(props.onOpen).toHaveBeenCalled();
});

test("Component renders correctly when width is not provided", async () => {
	delete props.width;
	const item = shallow(<Page {...props} />);
	await wait(50);
	item.find("Wrap").at(0).simulate("click");
	expect(props.onOpen).toHaveBeenCalled();
});

test("When user changes the screen width", async () => {
	const item = shallow(<Page {...props} />);
	item.setProps({ width: 720 });
	await wait(50);
	item.find("Wrap").at(0).simulate("click");
	expect(props.onOpen).toHaveBeenCalled();
});

test("Component renders correctly without zoom level passed in props", async () => {
	delete props.zoomLevel;
	const item = shallow(<Page {...props} />);
	await wait(50);
	expect(item.find("Canvas").length).toBe(1);
	expect(item.find("TextLayer").props().className).toEqual("textLayer");
});

test("Component renders correctly with rotate degree 90", async () => {
	props.rotateDegree = 90;
	const item = shallow(<Page {...props} />);
	await wait(50);
	expect(item.find("Canvas").length).toBe(1);
	expect(item.find("TextLayer").props().className).toEqual("textLayer");
});

/* Called componentWillUnmount */
test("Called componentWillUnmount", async () => {
	const item = shallow(<Page {...props} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});
