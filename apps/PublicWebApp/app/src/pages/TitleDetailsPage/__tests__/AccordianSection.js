// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AccordianSection from "../AccordianSection";

let resultData, mockQuerySelector;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer.js", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer.js", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer.js", () => mockPassthruHoc);
jest.mock("../../../common/getDocumentQuerySelectorAll", () => {
	return function () {
		return mockQuerySelector;
	};
});

function resetAll() {
	mockQuerySelector = [
		{
			innerText: "",
			parentElement: {
				querySelector() {
					return {
						classList: {
							add() {
								/**add class */
							},
						},
					};
				},
			},
		},
		{
			innerText: "test",
			parentElement: {
				querySelector() {
					return {
						classList: {
							add() {
								/**add class */
							},
						},
					};
				},
			},
		},
	];
	resultData = {
		authors: [
			{ lastName: "Clayton", firstName: "Dan" },
			{ lastName: "Kolaric", firstName: "Angie" },
		],
		description:
			"Combining the latest English Language research with up-to-date source texts and activities, this revision workbook for AQA AS/A Level English Language offers students a practical approach to preparing for their AS and A Level assessments, and can be used alongside the AQA AS/A Level English Language Student Book. Structured around the exam papers, so that students know exactly what they need to do for each section of the exam, this workbook provides tips and revision strategies to↵support students as they revise along with practice questions to familiarise them with the requirements of the exam.",
		edition: 1,
		id: 970,
		is_unlocked: true,
		page_count: 172,
		publication_date: "2018-12-20T00:00:00.000Z",
		publisher: "OUP Oxford",
		sub_title: null,
		subject_code: "C",
		subject_name: "Language",
		table_of_contents: null,
		title: "AQA A Level English Language: AQA A Level English Language Revision Workbook",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AccordianSection resultData={resultData} />);

	expect(item.find("AccordionSection").length).toBe(1);
});

/** Dont display collapsed icon for lock book */
test("Dont display collapsed icon for lock book", async () => {
	resultData.is_unlocked = false;
	const item = shallow(<AccordianSection resultData={resultData} />);

	expect(item.find("Collapsed").length).toBe(0);
});

/** Display collapsed icon for unlocked book */
test("Display collapsed icon for unlocked book", async () => {
	resultData.is_unlocked = true;
	const item = shallow(<AccordianSection resultData={resultData} />);
	expect(item.find("Collapsed").length).toBe(2);
});

/** Display collapsed icon for unlocked book */
test("Display collapsed icon for unlocked book", async () => {
	resultData.is_unlocked = true;
	const item = shallow(<AccordianSection resultData={resultData} />);

	expect(item.find("Collapsed").length).toBe(2);
});

test("User seen the message like 'Table of Contents not yet available for this title'", async () => {
	resultData.is_unlocked = true;
	resultData.table_of_contents = null;
	const item = shallow(<AccordianSection resultData={resultData} />);
	expect(item.find("Collapsed").length).toBe(2);
	expect(item.find("CollapseButton").length).toBe(2);
	const tocTitle = item.find("CollapseButton").first();
	tocTitle.simulate("onClick", { preventDefault: jest.fn() });
	const tocBody = item.find("CardBody");
	expect(tocBody.find("div").first().text()).toBe("Table of Contents not yet available for this title");
});

test("Display TOC & Overview", async () => {
	resultData.is_unlocked = true;
	resultData.table_of_contents = `<ul style="list-style-type:none">
			<li><strong>Part 1 Algebra and functions</strong></li>
			<ul style="list-style-type:none">
				<li>Algebraic fractions</li>
				<li>Functions and mappings</li>
				<li>Composite functions</li>
				<li>Inverse functions</li>
			</ul>
		</ul>`;
	const item = shallow(<AccordianSection resultData={resultData} />);
	expect(item.find("Collapsed").length).toBe(2);
});

test("User Collapsed and uncollapsed the Overview", async () => {
	resultData.is_unlocked = true;
	resultData.table_of_contents = `<ul style="list-style-type:none">
			<li><strong>Part 1 Algebra and functions</strong></li>
			<ul style="list-style-type:none">
				<li>Algebraic fractions</li>
				<li>Functions and mappings</li>
				<li>Composite functions</li>
				<li>Inverse functions</li>
			</ul>
		</ul>`;
	const item = shallow(<AccordianSection resultData={resultData} />);

	expect(item.find("Collapsed").length).toBe(2);
	let default_isExapand = item.state().isExpand;
	item.instance().doContentVisibility({ preventDefault: jest.fn() });

	expect(item.state().isExpand).not.toBe(default_isExapand);
});

test("User seen the message like 'An overview is not yet available for this title.'", async () => {
	resultData.is_unlocked = true;
	resultData.description = null;
	const item = shallow(<AccordianSection resultData={resultData} />);
	expect(item.find("Collapsed").length).toBe(2);
	expect(item.find("CollapseButton").length).toBe(2);
	const tocTitle = item.find("CollapseButton").at(1);
	tocTitle.simulate("onClick", { preventDefault: jest.fn() });
	const tocBody = item.find("CardBody");
	expect(tocBody.find("div").at(1).text()).toBe("An overview is not yet available for this title.");
});
