// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import AssetDescriptionString from "../AssetDescriptionString";
import MockCoverPage from "../../../mocks/MockCoverPage";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const data = MockCoverPage.data;
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.find("Fragment").length).toBe(1);
});

/** When book have multiple editors details */
test("When book have multiple editors details", async () => {
	let data = MockCoverPage.data;
	data["work_authors"] = [
		{ role: "B", lastName: "Holdstock", firstName: "Naomi" },
		{ role: "B", lastName: "Adam", firstName: "Williams" },
	];
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.find("span").children().debug().toString().replace(/\s+/g, " ")).toEqual("Naomi Holdstock and Williams Adam , eds . ");
});

/** When book have only single editor */
test("When book have only single editor", async () => {
	let data = MockCoverPage.data;
	data["work_authors"] = [{ role: "B", lastName: "Holdstock", firstName: "Naomi" }];
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.find("span").children().debug().toString().replace(/\s+/g, " ")).toEqual("Naomi Holdstock , ed . ");
});

/** When work authors data are empty */
test("When work authors data are empty", async () => {
	let data = MockCoverPage.data;
	data["work_authors"] = [];
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.debug().toString().replace(/\s+/g, " ")).toEqual(
		"<Fragment> <em> AQA A Level Maths: Year 1 + Year 2 Statistics Student Workbook . </em> 2nd ed. OUP Oxford, 2018. The Education Platform. </Fragment>"
	);
});

/** When authors data not contain any authors and editors */
test("When authors data not contain any authors and editors", async () => {
	let data = MockCoverPage.data;
	data["work_authors"] = [{ active: true }];
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.debug().toString().replace(/\s+/g, " ")).toEqual(
		"<Fragment> <em> AQA A Level Maths: Year 1 + Year 2 Statistics Student Workbook . </em> 2nd ed. OUP Oxford, 2018. The Education Platform. </Fragment>"
	);
});

/** When authors and editors have single record*/
test("When authors and editors have single record", async () => {
	let data = MockCoverPage.data;
	data.work_authors = [
		{ role: "A", lastName: "Powell", firstName: "Ray" },
		{ role: "B", lastName: "Adam", firstName: "Williams" },
	];

	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.debug().toString().replace(/\s+/g, " ")).toEqual(
		"<Fragment> <span> Ray Powell . </span> <em> AQA A Level Maths: Year 1 + Year 2 Statistics Student Workbook . </em> <span> Ed . Williams Adam . </span> 2nd ed. OUP Oxford, 2018. The Education Platform. </Fragment>"
	);
});

/** When authors data correctly with edition 1*/
test("When authors data correctly with edition 1", async () => {
	let data = MockCoverPage.data;
	data.edition = 1;
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.find("Fragment").length).toBe(1);
});

/** When work publication date is blank*/
test("When work publication date is blank", async () => {
	let data = MockCoverPage.data;
	data.work_publication_date = "";
	const item = shallow(<AssetDescriptionString {...data} />);
	expect(item.find("Fragment").length).toBe(1);
});
