// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import CreateBulkClassesList from "../CreateBulkClassesList";
import mockCreateBulkClasseList from "../../../mocks/mockCreateBulkClasseList";

let props;

function resetAll() {
	props = {
		tableData: mockCreateBulkClasseList,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component render succesfully`, async () => {
	const item = shallow(<CreateBulkClassesList {...props} />);
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(1);
});

test(`Component renders correctly without props data`, async () => {
	const item = shallow(<CreateBulkClassesList />);
	expect(item.find("WrapperSection").length).toBe(1);
	expect(item.find("TableGrid").length).toBe(0);
	expect(item.text()).toBe("");
});
