import React from "react";
import { shallow, mount } from "enzyme";
import SliderPage from "../SliderPage";

let currentPage, mockHighlightPage, mockAddSelectedPage, mockSetNumColumns, props, mockFunction;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	currentPage = 4;
	mockHighlightPage = jest.fn();
	mockAddSelectedPage = jest.fn();
	mockSetNumColumns = jest.fn();
	mockFunction = jest.fn();
	props = {
		key: Number(currentPage),
		isbn: "4871836482365",
		pageNumber: currentPage,
		highlighted: 1,
		checked: false,
		numColumns: 1,
		highlightPage: mockHighlightPage,
		addSelectedPage: mockAddSelectedPage,
		setNumColumns: mockSetNumColumns,
		currentIndex: 1,
		onOpen: mockFunction,
		doShowFlyout: false,
		onFlyoutClose: mockFunction,
		copyExcludedPagesMap: { 1: true, 2: true, 3: true, 12: true },
		contentForm: "BO",
		imageSrc: ["https://occclastagestorage.blob.core.windows.net/pagepreviews/9781841462400/0.png?sas token", `788d73e5baaea4a7c19e83ce00602280.png`],
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component render correctly */
test(`Component render correctly`, async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("CustomControl").first().length).toBe(1);
	expect(item.find("#SliderPage-Select-4").length).toBe(1);
	expect(item.find("PreventRightClick").exists()).toBe(true);
});

/** When dispaly Page in 1 page layout*/
test(`When dispaly Page in 1 page layout`, async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("Wrapper").props().numColumns).toEqual(1);
});

/** When dispaly Page in 2 page layout*/
test(`When dispaly Page in 2 page layout`, async () => {
	props.numColumns = 2;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("Wrapper").props().numColumns).toEqual(2);
});

/** If page layout one then display active one page layout */
test(`If page layout one then display active one page layout`, async () => {
	props.currentIndex = 0;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("BookGrid").children().first().props().className).toEqual("selected");
});

/** If page layout two then display active two page layout */
test(`If page layout two then display active two page layout`, async () => {
	props.numColumns = 2;
	props.currentIndex = 1;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("BookGrid").children().last().props().className).toEqual("selected");
});

/** When user click on one layout button */
test(`When user click on one layout button`, async () => {
	props.numColumns = 2;
	props.currentIndex = 1;
	const item = shallow(<SliderPage {...props} />);
	const btnOneLayout = item.find("BookGrid").children().first();
	btnOneLayout.simulate("click");
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.props.numColumns).not.toEqual(1);
	expect(mockSetNumColumns).toHaveBeenCalled();
});

/** When user click on one layout button */
test(`When user click on two layout button`, async () => {
	props.currentIndex = 0;
	const item = shallow(<SliderPage {...props} />);
	const btnOneLayout = item.find("BookGrid").children().first();
	btnOneLayout.simulate("click");
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.props.numColumns).not.toEqual(2);
	expect(mockSetNumColumns).toHaveBeenCalled();
});

/** Page in highlighted and active mode*/
// test('User see page in highlighted mode', async () => {
// 	props.pageNumber = 2;
// 	const event = {target: {name: "PDFPage2"}};
// 	const item = shallow( <SliderPage {...props}/>);
// 	const img = item.find('CustomControl').children().find('#PDFPage2');
// 	img.simulate('click', event);
// 	await wait(30);
// 	item.update();
// 	item.instance().forceUpdate();
// 	expect(item.props.highlighted).not.toEqual(2);
// 	expect(mockHighlightPage).toHaveBeenCalled();
// });

/** User clicks on checkbox*/
test("User clicks on checkbox", async () => {
	const event = { target: { name: "SliderPage-Select-1", value: "1" } };
	const item = shallow(<SliderPage {...props} />);
	const checkbox = item.find("BookHeader").children().find("CustomControlInput");
	checkbox.simulate("change", event);
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	expect(mockAddSelectedPage).toHaveBeenCalled();
});

test("User seen the flyout on first page in view screen and click on checkbox", async () => {
	props.currentIndex = 0;
	props.doShowFlyout = true;
	const event = { target: { name: "SliderPage-Select-1", value: "1" } };
	const item = shallow(<SliderPage {...props} />);
	const checkbox = item.find("BookHeader").children().find("CustomControlInput");
	checkbox.simulate("change", event);
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	expect(mockAddSelectedPage).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
});

test(`User view magazine and show blank page as"page not available for copy" in 1 page layout`, async () => {
	props.contentForm = "MI";
	delete props.imageSrc;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("AssetPageNotAvailable").length).toBe(1);
	expect(item.find("Wrapper").props().numColumns).toEqual(1);
});

test('User view magazine and show blank page as"page not available for copy" in 2 page layout.', async () => {
	props.contentForm = "MI";
	props.numColumns = 2;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("Wrapper").props().numColumns).toEqual(2);
});

test("User click on page to see page in full screen mode", async () => {
	props.pageNumber = 2;
	props.imageSrc = "https://occclastagestorage.blob.core.windows.net/pagepreviews/9781841462400/0.png?sas token";
	const event = { target: { name: "PDFPage2" } };
	const item = shallow(<SliderPage {...props} />);
	const img = item.find("Wrapper").children().find("#PDFPage2");
	img.simulate("click", event);
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	expect(mockFunction).toHaveBeenCalled();
});
