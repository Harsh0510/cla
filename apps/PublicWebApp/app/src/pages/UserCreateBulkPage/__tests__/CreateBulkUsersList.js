// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import CreateBulkUsersList from "../CreateBulkUsersList";
import mockCreateBulkUsersList from "../../../mocks/mockCreateBulkUsersList";

let props;

function resetAll() {
	props = {
		tableData: mockCreateBulkUsersList,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly with props data`, async () => {
	const item = shallow(<CreateBulkUsersList {...props} />);
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(1);
});

test(`Component renders correctly without props data`, async () => {
	const item = shallow(<CreateBulkUsersList />);
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});

test(`Component render correctly when unlocked list as null`, async () => {
	const item = shallow(<CreateBulkUsersList />);
	props.unlockedData = null;
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});

test(`Component render correctly when unlocked list as blank array`, async () => {
	const item = shallow(<CreateBulkUsersList />);
	props.unlockedData = [];
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});
