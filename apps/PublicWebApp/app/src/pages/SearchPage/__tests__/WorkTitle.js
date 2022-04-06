import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import WorkTitle from "../WorkTitle";
import MockSearchResults from "../../../mocks/MockSearchResults";

let props;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withPageSize", () => mockPassthruHoc);

/**
 * Reset function
 */
function resetAll() {
	props = {
		isLoggedIn: true,
		asset: MockSearchResults.results[0],
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("When user is logged in but assets have fragments", async () => {
	props.asset.fragments = [{ title: "test1", start_page: 4 }];
	const item = shallow(<WorkTitle {...props} />);

	expect(item.find("TitleLink").length).toBe(2);
});

test("When user is logged in but assets dont have fragments", async () => {
	props.asset.fragments = null;
	const item = shallow(<WorkTitle {...props} />);

	expect(item.find("TitleLink").length).toBe(1);
});

test("When user is not logged in but assets dont have fragments", async () => {
	props.isLoggedIn = false;
	props.asset.fragments = [{ title: "test1", start_page: 4 }];
	const item = shallow(<WorkTitle {...props} />);

	expect(item.find("TitleLink").length).toBe(2);
});

test("When user is logged in but assets have more then 1 fragments", async () => {
	props.asset.fragments = [
		{ title: "test1", start_page: 4 },
		{ title: "test2", start_page: 5 },
	];
	const item = shallow(<WorkTitle {...props} />);

	expect(item.find("TitleLink").length).toBe(1);
	expect(item.find("span").length).toBe(1);
});

test("When user is logged in but assets dont have fragments", async () => {
	props.asset.fragments = [];
	const item = shallow(<WorkTitle {...props} />);

	expect(item.find("TitleLink").length).toBe(1);
});
