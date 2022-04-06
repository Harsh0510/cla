import React from "react";
import { shallow } from "enzyme";
import ImageWrapComponent from "../ImageWrapComponent";

let props,
	mockWidth = null,
	mockHeight = null,
	mockFunction,
	mockIsCallAddEventListerMethod = false,
	mockIsCallRemoveEventListerMethod = false,
	mockImgIsReady = false,
	mockRef;

function resetAll() {
	mockWidth = 80;
	mockHeight = 100;
	mockFunction = jest.fn();
	mockIsCallAddEventListerMethod = false;
	mockIsCallRemoveEventListerMethod = false;
	props = {
		is_current: true,
		image_alt: "Image",
		image_draggable: false,
		image_src: "https://dummyimage.com/1200x1000/ee0000/333.png&text=85",
		onDoubleClick: mockFunction,
		onDragStart: mockFunction,
		onWheel: mockFunction,
		pageEl: {
			accessKey: "",
			classList: ["ril-image-current", "ril__image"],
			className: "ril-image-current ril__image",
			clientHeight: 1000,
			clientLeft: 0,
			clientTop: 0,
			clientWidth: 1200,
			complete: true,
			contentEditable: "inherit",
			crossOrigin: null,
			currentSrc: "https://dummyimage.com/1200x1000/ee0000/333.png&text=13",
			height: 1000,
			hidden: false,
			id: "",
			innerHTML: "",
			innerText: "",
			inputMode: "",
			isConnected: true,
			isContentEditable: false,
			isMap: false,
			lang: "",
			lastChild: null,
			lastElementChild: null,
			loading: "auto",
			localName: "img",
			longDesc: "",
			lowsrc: "",
			name: "",
			namespaceURI: "http://www.w3.org/1999/xhtml",
			naturalHeight: 1000,
			naturalWidth: 1200,
			getBoundingClientRect: () => {
				return {
					height: 100,
					width: 100,
					left: 20,
					top: 20,
					right: 20,
					bottom: 20,
				};
			},
			addEventListener: () => {
				return;
			},
			removeEventListener: () => {
				mockIsCallRemoveEventListerMethod = true;
				return;
			},
		},
		extraData: {
			did_create: true,
			handleHiglightDelete: mockFunction,
			handleNoteClick: mockFunction,
			handleNoteClose: mockFunction,
			handleNoteContentChange: mockFunction,
			handleNoteOnMoveOrResize: mockFunction,
			handleNoteSelection: mockFunction,
			onHighlightDraw: mockFunction,
			highlightPageInfo: [
				{
					first_highlight_date: "2020-11-09T06:12:48.903Z",
					first_highlight_name: "Mr. Admin",
					page: 1,
				},
			],
			isNoteDisplay: true,
			highlights: [
				{
					colour: "#FFFF00",
					date_created: "2020-11-09T13:07:48.788Z",
					height: 30,
					oid: "0dad626ae3c3d1461ea3f546169f6ebae1e2",
					page: 1,
					position_x: 7.5,
					position_y: 7.5,
					width: 30,
				},
				{
					colour: "#FFFF00",
					date_created: "2020-11-09T13:07:48.788Z",
					height: 30,
					oid: "0dad626ae3c3d1461ea3f546169f6ebae1e2",
					page: 1,
					position_x: 7.5,
					position_y: 7.5,
					width: 30,
				},
			],
			notes: [
				{
					colour: "#dc78e2",
					content: "test",
					date_created: "2020-10-27T11:49:58.683Z",
					oid: "0143dd7ad8a72f1c720cbcb95116e20dbfbf",
					page: 1,
					position_x: 38.41,
					position_y: 14.133,
					width: 460.264,
					height: 462.942,
					zindex: 5,
				},
			],
			page: 1,
			teacher: "Mr. Teacher",
			did_create: true,
			selectedNote: {
				colour: "#99f997",
				key: "#option2",
				text: "Green",
				toolTip: "note content in green",
				value: "#99f997",
			},
			selectedHighlight: {
				colour: "#99f997",
				key: "#option2",
				text: "Green",
				toolTip: "Highlight content in green",
				value: "#99f997",
			},
			selectedNoteOid: null,
		},
		mockImgIsReady: true,
	};
	mockRef = {
		focus: jest.fn(),
		value: "",
		width: mockWidth,
		height: mockHeight,
		addEventListener: (event, cb, flag) => {
			//if (event === "mousedown") {
			mockIsCallAddEventListerMethod = true;
			//}
			return;
		},
		removeEventListener: (event, cb, flag) => {
			mockIsCallRemoveEventListerMethod = true;
			return;
		},
	};
}

jest.mock("../../../widgets/ExtractNote/Manager", () => {
	return "Note manager component";
});

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: mockRef,
		};
	};
});

jest.mock("../../../common/imgIsReady", () => {
	return function () {
		return mockImgIsReady;
	};
});

jest.mock(`resize-observer-polyfill`, () => {
	return class {
		constructor() {}
		observe(el) {
			return;
		}
		disconnect() {
			return;
		}
	};
});

beforeEach(resetAll);
afterEach(resetAll);

/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

// mock MutationObserver class
global.MutationObserver = class {
	constructor(callback) {}
	disconnect() {}
	observe(element, initObject) {}
};

const elementMock = { addEventListener: jest.fn() };
jest.spyOn(window, "addEventListener").mockImplementation(() => elementMock);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);

	//Image load
	item.instance()._onImageLoad();
	await wait(100);
	expect(item.find("div").length).toBe(1);
	expect(item.find("HighlightDrawer").length).toBe(1);
	expect(item.find("ExtractPageHighlighterInfo").length).toBe(1);
	expect(item.state("pageNaturalDimensions")).toEqual({ height: 1000, width: 1200 });
});

test(`When user change the screen size`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);
	item.setProps({
		pageEl: {
			accessKey: "",
			naturalHeight: 1000,
			naturalWidth: 1200,
			getBoundingClientRect: () => {
				return {
					height: 100,
					width: 100,
					left: 20,
					top: 20,
					right: 20,
					bottom: 20,
				};
			},
			addEventListener: () => {
				return;
			},
			removeEventListener: () => {
				mockIsCallRemoveEventListerMethod = true;
				return;
			},
		},
	});
	expect(mockIsCallRemoveEventListerMethod).toBe(true);
});

test(`when user move to another page`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);
	item.instance().componentWillUnmount();
	expect(mockIsCallRemoveEventListerMethod).toBe(true);
});

test(`When user move down with mouse`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);
	const e = { clientX: 23, clientY: 13 };
	const spy = jest.spyOn(item.instance(), "_onImagePointerDown");
	item.instance()._onImageMouseDown(e);
	expect(spy).toHaveBeenCalled();
});

test(`When user move image in screeen`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);
	const e = { touches: [{ clientX: 23, clientY: 13 }] };
	const spy = jest.spyOn(item.instance(), "_onImagePointerDown");
	item.instance()._onImageTouchStart(e);
	expect(spy).toHaveBeenCalled();
});

test(`Test detachObservers method`, async () => {
	delete props.pageEl;
	const item = shallow(<ImageWrapComponent {...props} />);
	item.instance().detachObservers();
	expect(mockIsCallRemoveEventListerMethod).toBe(false);
});

test(`User click on note to create`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);
	const e = { target: mockRef, clientX: 23, clientY: 13 };
	item.instance()._updateImageBoundingBox();
	item.instance()._onImagePointerDown(23, 13);
	item.instance()._updateImageNaturalDimensions();
	item.instance().handleCreateNoteClick(e);
	expect(item.state("pageNaturalDimensions")).toEqual({ height: 1000, width: 1200 });
});

test(`User unable to create note`, async () => {
	const item = shallow(<ImageWrapComponent {...props} />);
	const e = { target: mockRef, clientX: 23, clientY: 13 };
	item.instance().handleCreateNoteClick(e);
	expect(item.state("pageNaturalDimensions")).toEqual(null);
});

test(`Component renders correctly with pdf page`, async () => {
	mockImgIsReady = true;
	props.pageEl = {
		accessKey: "",
		classList: ["Canvas-sc-1ed9qg8-1", "gFdChp"],
		className: "Canvas-sc-1ed9qg8-1 gFdChp",
		clientHeight: 1000,
		clientLeft: 0,
		clientTop: 0,
		clientWidth: 1200,
		complete: true,
		contentEditable: "inherit",
		height: 1000,
		width: 1200,
		hidden: false,
		id: "",
		innerHTML: "",
		innerText: "",
		inputMode: "",
		isConnected: true,
		isContentEditable: false,
		lang: "",
		lastChild: null,
		lastElementChild: null,
		localName: "canvas",
		namespaceURI: "http://www.w3.org/1999/xhtml",
		nodeName: "CANVAS",
		nodeType: 1,
		nodeValue: null,
		outerHTML: '<canvas width="365.5882352941177" height="565" class="Canvas-sc-1ed9qg8-1 gFdChp" style="width: 365.588px; height: 565px;"></canvas>',
		outerText: "",
		getBoundingClientRect: () => {
			return {
				height: 100,
				width: 100,
				left: 20,
				top: 20,
				right: 20,
				bottom: 20,
			};
		},
	};
	props.extraData.did_create = false;
	props.extraData.highlights = [];
	const item = shallow(<ImageWrapComponent {...props} />);
	item.instance()._onImageLoad();
	await wait(100);
	expect(item.find("div").length).toBe(1);
	expect(item.find("HighlightDrawer").length).toBe(0);
	expect(item.find("ExtractPageHighlighterInfo").length).toBe(0);
	expect(item.state("pageNaturalDimensions")).toEqual({ height: undefined, width: undefined });
});
