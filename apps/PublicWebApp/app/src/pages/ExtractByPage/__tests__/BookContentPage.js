import React from "react";
import { shallow } from "enzyme";
import BookContentPage from "../BookContentPage";
import MockWorks from "../../../mocks/MockWorks";
import MockSliderItems from "../../../mocks/MockSliderItems";

let props,
	resultData,
	mockHandleEvents,
	mockOnEventListenerCalled,
	mockHighlightPage,
	mockAddSelectedPage,
	mockSetNumColumns,
	mockgoToPageNumber,
	mockPassEvents,
	mockElements,
	isPageShow,
	isLabelShow;

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: mockPassEvents,
		};
	};
});

jest.mock("../../../common/customDocumentClassList", () => {
	return function (e, elementCSS) {
		if (mockElements === elementCSS) {
			return true;
		} else {
			return false;
		}
	};
});

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockOnEventListenerCalled = () => {};
	resultData = MockWorks[2];
	mockHandleEvents = jest.fn();
	mockHighlightPage = jest.fn();
	mockAddSelectedPage = jest.fn();
	mockSetNumColumns = jest.fn();
	mockgoToPageNumber = jest.fn();
	props = {
		isTableOfContent: true,
		isbn: resultData.isbn13,
		workData: resultData,
		highlighted: 1,
		selectedPagesMap: [],
		highlightPage: mockHighlightPage,
		addSelectedPage: mockAddSelectedPage,
		itemsCountPerPage: 5,
		loading: false,
		numColumns: 2,
		setNumColumns: mockSetNumColumns,
		sliderItems: MockSliderItems,
		handleEvents: mockHandleEvents,
		goToPageNumber: mockgoToPageNumber,
		images: { 1: "1", 2: "2", 3: "3", 12: "12" },
	};
	mockPassEvents = {
		addEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
		removeEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component render correctly */
test(`Component render correctly`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("BookTableContent").length).toBe(1);
});

/** Hide the table of content section */
test(`Hide the table of content section`, async () => {
	props.isTableOfContent = false;
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("TableContent").length).toBe(0);
});

/** Show the table of content section */
test(`Show the table of content section`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("TableContent").length).toBe(1);
});

test(`Show the table of content section and focus on the bookScreen`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("TableContent").length).toBe(1);
	item.instance().onFocusBookScreen();
	expect(item.state("focused")).toEqual(true);
});

test(`Show the table of content section and Remove focus on the bookScreen`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("TableContent").length).toBe(1);
	item.instance().onBlurBookScreen();
	expect(item.state("focused")).toEqual(false);
});

/** User clicks on toggle button for the hide the table of content */
test(`User clicks on toggle button for the hide the table of content`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	await wait(20);
	const btnClose = item.find("ButtonClose");
	btnClose.simulate("click");
	expect(mockHandleEvents).toHaveBeenCalled();
});

/** User clicks on toggle button for the show the table of content */
test(`User clicks on toggle button for the hide the table of content`, async () => {
	props.isTableOfContent = false;
	const item = shallow(<BookContentPage {...props} />);
	await wait(20);
	const btnOpen = item.find("TabMenu");
	btnOpen.simulate("click");
	expect(mockHandleEvents).toHaveBeenCalled();
});

/** User display the page preview section */
test(`User display the page preview section`, async () => {
	props.highlighted = props.workData.page_count + 1;
	const item = shallow(<BookContentPage {...props} />);
	await wait(20);
	expect(item.find("#SliderBody").length).toBe(1);
});

/** User Display the two page layout */
test(`User Display the two page layout`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	await wait(20);
	const previewPageCount = item.find("SliderPage").length;
	expect(previewPageCount).toBe(2);
});

/** User Display the one page layout */
test(`User Display the one page layout`, async () => {
	props.numColumns = 1;
	const item = shallow(<BookContentPage {...props} />);
	await wait(20);
	const previewPageCount = item.find("SliderPage").length;
	expect(previewPageCount).toBe(1);
});

/** User display the slider page section */
test(`User display the slider page section`, async () => {
	props.workData.page_count = 16;
	const item = shallow(<BookContentPage {...props} />);
	await wait(50);
	expect(item.find("SliderPage").length).toBe(2);
});

/** Render addEventListener method have been called */
test(`Render addEventListener method have been called`, async () => {
	mockOnEventListenerCalled = jest.fn();
	const item = shallow(<BookContentPage {...props} />);
	await wait(50);
	expect(mockOnEventListenerCalled).toBeCalled();
});

/** User wants to see another page in page preview section */
/** `on_highlighted_page_change` event called*/
test(`User wants to see another page in page preview section`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	item.instance().on_highlighted_page_change(2);
	await wait(30);
	expect(mockHighlightPage).toHaveBeenCalled();
	item.setProps({ highlighted: 2 });
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.instance().props.highlighted).toBe(2);
});

/** User wants to see another page in page preview section */
/** `doOnImagePress` and also called `onPressPage` event called*/
test(`User clicks on page image in slider section`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	item.instance().onPressPage(2);
	await wait(30);
	expect(mockHighlightPage).toHaveBeenCalled();
	item.setProps({ highlighted: 2 });
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.instance().props.highlighted).toBe(2);
});

/** User wants to select the page for copy */
/** 'handleChange' called when user click checkbox */
test(`User wants to select the page for copy in slider section`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	item.instance().handleChange(2);
	await wait(30);
	expect(mockAddSelectedPage).toHaveBeenCalled();
	item.setProps({ highlighted: 3 });
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.instance().props.highlighted).toBe(3);
	expect(mockAddSelectedPage).toHaveBeenCalled();
});

/** When component render in componentWillUnmount*/
test(`Component redener componentWillUnmount with removeEventListener events`, async () => {
	mockOnEventListenerCalled = jest.fn();
	const item = shallow(<BookContentPage {...props} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
	expect(mockOnEventListenerCalled).toBeCalled();
});

/** When component render in componentWillUnmount but tocRef null*/
test(`Component redener componentWillUnmount but tocRef value is null`, async () => {
	mockPassEvents = null;
	mockOnEventListenerCalled = jest.fn();
	const item = shallow(<BookContentPage {...props} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
	expect(mockOnEventListenerCalled).not.toBeCalled();
});

/** User clicks on table of content index and see page in highlighted section */
/** 'doTocClick' called when user click in table of content page index */
test(`User clicks on table of content index and see page in highlighted section`, async () => {
	mockElements = "page";
	const item = shallow(<BookContentPage {...props} />);
	item.instance().doTocClick({ preventDefault: jest.fn(), target: { innerText: "10" } });
	await wait(30);
	expect(mockgoToPageNumber).toHaveBeenCalled();
});

/** User clicks on table of content index and not see page in highlighted section */
test(`User clicks on table of content index and not see page in highlighted section`, async () => {
	mockElements = "page";
	const item = shallow(<BookContentPage {...props} />);
	item.instance().doTocClick({ preventDefault: jest.fn(), target: { innerText: "79" } });
	await wait(30);
	expect(mockgoToPageNumber).not.toHaveBeenCalled();
});

/**Todo : User clicks on label from table of content index and see page in highlighted section */
/** 'doTocClick' called when user click on label from table of content page index using lable */
test(`User clicks on label from table of content index and see page in highlighted section`, async () => {
	mockElements = "label";
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("span");
	spanElement.classList.add("page");
	spanElement.innerText = "3";
	await wait(30);
	item.instance().doTocClick({
		preventDefault: jest.fn(),
		target: { innerText: 10, nextElementSibling: spanElement },
	});

	expect(mockgoToPageNumber).toBeCalled();
});

/**User click outside on label from table of content index and not see page in highlighted section */
/** 'doTocClick' called when user click on around the table of content */
test(`User click outside on label from table of content index and not see page in highlighted section`, async () => {
	mockElements = "parentclass";
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("div");
	spanElement.classList.add("test");
	spanElement.innerText = "3";
	await wait(30);
	item.instance().doTocClick({
		preventDefault: jest.fn(),
		target: { innerText: 10, nextElementSibling: spanElement },
	});

	expect(mockgoToPageNumber).not.toBeCalled();
});

/**User click on label from table of content index and not see page in highlighted section */
/** 'doTocClick' called when user click on around the table of content */
test(`User click on label from table of content index and not see page in highlighted section`, async () => {
	mockElements = "label";
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("span");
	spanElement.classList.add("test");
	spanElement.innerText = "3";
	await wait(30);
	item.instance().doTocClick({
		preventDefault: jest.fn(),
		target: { innerText: 10, nextElementSibling: spanElement },
	});

	expect(mockgoToPageNumber).not.toBeCalled();
});

/** User clicks on table of content index and when click wrong wrong number */
/** 'doTocClick' called when user click in table of content page index is passed with -1*/
test(`User clicks on table of content index and see page in highlighted section when page index is passed with -1`, async () => {
	const item = shallow(<BookContentPage {...props} />);
	item.instance().doTocClick({ preventDefault: jest.fn(), target: { innerText: -1 } });
	await wait(30);
	expect(mockgoToPageNumber).not.toHaveBeenCalled();
});

/** User clicks on table of content index and when getting wrong page number -2*/
test(`User clicks on table of content index and when getting wrong page number -5`, async () => {
	mockElements = "label";
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("span");
	spanElement.classList.add("page");
	spanElement.innerText = "-2";
	await wait(30);
	item.instance().doTocClick({
		preventDefault: jest.fn(),
		target: { innerText: 10, nextElementSibling: spanElement },
	});

	expect(mockgoToPageNumber).not.toBeCalled();
});

test(`User clicks on table of content index and when getting wrong page number i`, async () => {
	mockElements = "label";
	resultData = MockWorks[1];
	props.workData = resultData;
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("span");
	spanElement.classList.add("page");
	spanElement.innerText = "i";
	await wait(30);
	item.instance().doTocClick({
		preventDefault: jest.fn(),
		target: { innerText: "i", nextElementSibling: spanElement },
	});

	expect(mockgoToPageNumber).toBeCalled();
});

test(`Not redirect to the page if the page number is wrong`, async () => {
	mockElements = "label";
	resultData = MockWorks[1];
	props.workData = resultData;
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("span");
	spanElement.classList.add("page");
	spanElement.innerText = "i";
	await wait(30);
	item.instance().goToPage({ preventDefault: jest.fn() }, -10);
	expect(mockgoToPageNumber).not.toBeCalled();
});

test(`User clicks on label from table of content index and not redirected the page due to invalid index`, async () => {
	props.workData = MockWorks[0];
	mockElements = "label";
	const item = shallow(<BookContentPage {...props} />);
	var spanElement = document.createElement("span");
	spanElement.classList.add("page");
	spanElement.innerText = "0-300";
	await wait(30);
	item.instance().doTocClick({
		preventDefault: jest.fn(),
		target: { innerText: "0-300", nextElementSibling: spanElement },
	});
	expect(mockgoToPageNumber).not.toBeCalled();
});

test(`Test _onKeyDown event listener`, async () => {
	const mockFunction = jest.fn();
	const e = {
		preventDefault: mockFunction,
	};
	const item = shallow(<BookContentPage {...props} />);

	item.instance().bookScreenRef = {
		current: false,
	};
	item.instance()._onKeyDown(e);
	expect(mockFunction).not.toBeCalled();

	item.instance().bookScreenRef = {
		current: {
			parentElement: {
				contains: () => true,
			},
		},
	};
	item.instance()._onKeyDown(e);
	expect(mockFunction).toBeCalled();

	item.instance().bookScreenRef = {
		current: {
			parentElement: {
				contains: () => false,
			},
			getBoundingClientRect: () => {
				return {
					left: 50,
					right: 56.2,
					top: 52.8,
					bottom: 56.6,
				};
			},
		},
	};
	item.instance()._onKeyDown(e);
	expect(mockFunction).toBeCalled();

	item.instance().bookScreenRef = {
		current: {
			parentElement: {
				contains: () => false,
			},
			getBoundingClientRect: () => {
				return {
					left: 0,
					right: 56.2,
					top: 0,
					bottom: 56.6,
				};
			},
		},
	};
	item.instance()._onKeyDown(e);
	expect(mockFunction).toBeCalled();
});

test(`Test _updateMousePosition event listener`, async () => {
	const e = {
		clientX: 2,
		clientY: 3,
	};
	const item = shallow(<BookContentPage {...props} />);

	item.instance()._updateMousePosition(e);
	expect(item.instance()._cursorPosition).toEqual({ x: 2, y: 3 });
});

test(`User see message on table of content when an asset don't have table of content`, async () => {
	props.workData.table_of_contents = null;
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("TableOfContentNull").text()).toBe("Table of Contents not yet available for this title");
});

test(`User see epub message for epub when extract created from epub asset`, async () => {
	props.workData.file_format = "epub";
	const item = shallow(<BookContentPage {...props} />);
	expect(item.find("PTag").length).toBe(1);
	expect(item.find("PTag").text()).toEqual(
		"The page numbers in the digital version of this book may not match the ones in your physical copy so please select your pages carefully."
	);
});
