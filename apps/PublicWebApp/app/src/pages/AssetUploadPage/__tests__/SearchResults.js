import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import SearchResults from "../SearchResults";

let props;
let mockResults;

jest.mock("../fetchAssets", () => {
	return () => {
		return new Promise((resolve, reject) => {
			return resolve(mockResults);
		});
	};
});

jest.mock("../../../assets/images/OnFlyoutModalBottom.png", () => true);
jest.mock("../../../assets/images/cover_img.png", () => true);

function resetAll() {
	props = {
		location: {
			search: "?title=test",
		},
		history: { push: jest.fn() },
	};
	mockResults = [
		{
			isbn: "9780545010221",
			page_count: 100,
			title: "Some title here: First",
			authors: ["Lake Johnson, Mary", "John Smith"],
			publication_year: 2007,
		},
		{
			isbn: "9780439139595",
			publisher: "Hodder",
			page_count: 150,
			title: "Another title goes here",
			authors: ["Elena Jenson"],
			publication_year: 2012,
		},
		{
			isbn: "9780307283672",
			publisher: "OUP",
			title: "Some third title",
			authors: ["Elena Jenson"],
			dewey_class: "567.123/Mon",
		},
		{
			isbn: "9780320037801",
			publisher: "OUP",
			page_count: 250,
			title: "Title the 4th",
			authors: ["Jamie Jackson", "Jamieson, Jack"],
		},
		{
			isbn: "9780320039324",
			publisher: "OUP",
			page_count: 300,
			title: "This is the fifth",
			authors: ["Rowling, J.K."],
			publication_year: 2002,
			dewey_class: "123",
		},
		{
			isbn: "9780320048388",
			publisher: "Cambridge University Press",
			page_count: 350,
			title: "Some 6th title here",
			publication_year: 2020,
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders successfully", async () => {
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("HeadTitle").length).toBe(1);
});

test("Component renders successfully when isbn is passed in url", async () => {
	props.location.search = "?isbn=9780050666319";
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("HeadTitle").length).toBe(1);
});

test("When user selects asset from results", async () => {
	props.location.search = `?isbn=9780141032733`;
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	item.find("StyledButton").at(1).simulate("click");
	expect(props.history.push).toHaveBeenCalled();
	expect(props.history.push.mock.calls[0][0]).toEqual(
		"/asset-upload/upload-content?title=Another%20title%20goes%20here&isbn=9780439139595&author=%5B%22Elena%20Jenson%22%5D&publisher=Hodder&publicationYear=2012&pageCount=150&type=search&search=9780141032733"
	);
});

test("When user selects asset from results aseet does not have publication year", async () => {
	props.location.search = `?isbn=12345678`;
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	item.find("StyledButton").at(2).simulate("click");
	expect(props.history.push).toHaveBeenCalled();
	expect(props.history.push.mock.calls[0][0]).toEqual(
		"/asset-upload/upload-content?title=Some%20third%20title&isbn=9780307283672&author=%5B%22Elena%20Jenson%22%5D&publisher=OUP&type=search&search=12345678"
	);
});

test("When user selects asset from results but result has no publisher value", async () => {
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	item.find("StyledButton").at(0).simulate("click");
	expect(item.find("ManualEntry").length).toBe(1);
});

test("When user selects none of these are right button", async () => {
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	item.instance().doEnterDataManually();
	expect(item.find("ManualEntry").length).toBe(1);
});

test(`Test componentWillUnmount method`, async () => {
	const item = shallow(<SearchResults {...props} />);
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();
	await wait(50);
	expect(item.instance()._isMounted).toBe(undefined);
});

test(`When api returns only one result`, async () => {
	mockResults = [
		{
			isbn: "9780439139595",
			publisher: "Hodder",
			page_count: 150,
			title: "Another title goes here",
			authors: ["Elena Jenson"],
			publication_year: 2012,
		},
	];
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("SingleAsset").length).toBe(1);
});

test(`When one result is displayed and user clicks on yes buton`, async () => {
	mockResults = [
		{
			isbn: "9780439139595",
			publisher: "Hodder",
			page_count: 150,
			title: "Another title goes here",
			authors: ["Elena Jenson"],
			publication_year: 2012,
		},
	];
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("SingleAsset").length).toBe(1);
	item.find("ConfirmationButton").first().simulate("click");
	expect(props.history.push).toHaveBeenCalled();
	expect(props.history.push.mock.calls[0][0]).toEqual(
		"/asset-upload/upload-content?title=Another%20title%20goes%20here&isbn=9780439139595&author=%5B%22Elena%20Jenson%22%5D&publisher=Hodder&publicationYear=2012&pageCount=150&type=search&search=test"
	);
});

test(`When one result is displayed and user clicks on long title to display`, async () => {
	mockResults = [
		{
			isbn: "9780439139595",
			publisher: "Hodder",
			page_count: 150,
			title: "Another title goes here for test this title is long",
			authors: ["Elena Jenson"],
			publication_year: 2012,
		},
	];
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("SingleAsset").length).toBe(1);
	expect(item.find("OverflowText").length).toBe(2);
	item.find("OverflowText").at(0).simulate("click");
	expect(item.state().isShowFullTitleMapping).toEqual({ 0: true });
});

test(`When greater than one result is displayed and user clicks on long title to display`, async () => {
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("OverflowText").length).toBe(12);
	item.find("OverflowText").at(10).simulate("click");
	expect(item.state().isShowFullTitleMapping).toEqual({ 5: true });
});

test(`When one result is displayed and user clicks on long author to display`, async () => {
	mockResults = [
		{
			isbn: "9780439139595",
			publisher: "Hodder",
			page_count: 150,
			title: "Another title goes here for test this title is long",
			authors: ["Elena Jenson", "Elena JensonElena Jenson"],
			publication_year: 2012,
		},
	];
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("SingleAsset").length).toBe(1);
	expect(item.find("OverflowText").length).toBe(2);
	item.find("OverflowText").at(1).simulate("click");
	expect(item.state().isShowFullAuthorMapping).toEqual({ 0: true });
});

test(`When greater than one result is displayed and user clicks on long author to display`, async () => {
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("OverflowText").length).toBe(12);
	item.find("OverflowText").at(11).simulate("click");
	expect(item.state().isShowFullAuthorMapping).toEqual({ 5: true });
});

test("When user comes from upload your own extract page ", async () => {
	props.location.search = `?type=manual&search=test&isbn=9781784617974&title=yy&author=%5B"test"%5D&publisher=Publisher&publicationYear=2012`;
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.state().isShowEnterDataManually).toEqual(true);
});

test("User see back button ", async () => {
	props.location.search = `?isbn=9780141032733`;
	const item = shallow(<SearchResults {...props} />);
	await wait(50);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("BackButton").text()).toBe("Back");
	expect(item.find("BackButton").props().to).toBe("/asset-upload/before-we-start?isbn=9780141032733");
});
