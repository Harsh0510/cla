// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import UnlockList from "../UnlockList";
import mockUnlockList from "../../../mocks/mockUnlockList";

let props;

function resetAll() {
	props = {
		unlockedData: mockUnlockList,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly with props data`, async () => {
	const item = shallow(<UnlockList {...props} />);
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(1);
});

test(`Component renders correctly without props data`, async () => {
	const item = shallow(<UnlockList />);
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});

test(`Component render correctly when unlocked list as null`, async () => {
	const item = shallow(<UnlockList />);
	props.unlockedData = null;
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});

test(`Component render correctly when unlocked list as blank array`, async () => {
	const item = shallow(<UnlockList />);
	props.unlockedData = [];
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});
