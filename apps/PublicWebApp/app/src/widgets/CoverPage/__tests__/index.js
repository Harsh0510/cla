// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import CoverPage from "../index";
import MockCoverPage from "../../../mocks/MockCoverPage";

let isCalledSetDefaultCoverImage;

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

function resetAll() {
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Function renders correctly", async () => {
	const item = shallow(<CoverPage data={MockCoverPage.data} />);

	expect(item.find("PrintCoverPage").length).toBe(1);
});

/** Function renders correctly with single page values */
test("Function renders correctly with single page values", async () => {
	MockCoverPage.data.pages = [1];
	const item = shallow(<CoverPage data={MockCoverPage.data} />);

	expect(item.find("PrintCoverPage").length).toBe(1);
});

/** Function renders correctly without the page_offset */
test("Function renders correctly without the page_offset", async () => {
	delete MockCoverPage.data.page_offset_arabic;
	delete MockCoverPage.data.page_offset_roman;
	const item = shallow(<CoverPage data={MockCoverPage.data} />);

	expect(item.find("PrintCoverPage").length).toBe(1);
});

/** Function renders correctly with single page values */
test("Function renders correctly when some props value is empty", async () => {
	MockCoverPage.data.work_authors = [];
	MockCoverPage.data.work_publication_date = "";
	MockCoverPage.data.work_title = "";
	MockCoverPage.data.work_publisher = "";
	const item = shallow(<CoverPage data={MockCoverPage.data} />);

	expect(item.find("PrintCoverPage").length).toBe(1);
});

/** Function renders correctly without expired date */
test("Function renders correctly without expired date", async () => {
	MockCoverPage.data.date_expired = "";
	const item = shallow(<CoverPage data={MockCoverPage.data} />);

	expect(item.find("PrintCoverPage").length).toBe(1);
});

test(`When asset does not have cover image`, async () => {
	const item = shallow(<CoverPage data={MockCoverPage.data} />);
	item.find("BookImage").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
