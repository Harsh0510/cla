/** Required to simulate window.matchMedia */
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Manager from "../Manager";
let props,
	mockFunction,
	mockZindex = null;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	mockZindex = 12;
	props = {
		notes: [
			{
				date_created: "2020-08-17T12:11:52.612Z",
				oid: "2asjb21783172hubsxb",
				width: 3,
				height: 5,
				position_x: 0.5,
				position_y: 0.9,
				content: "TestContent",
				zindex: mockZindex,
				colour: "#34652",
			},
		],
		onContentChange: mockFunction,
		onMoveOrResize: mockFunction,
		onClose: mockFunction,
		teacher: mockFunction,
		did_create: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<Manager {...props} />);
	expect(item.find("Note").length).toBe(1);
});

test(`User select note`, async () => {
	props.notes[0].zindex = 0;
	const item = shallow(<Manager {...props} />);
	item.setState({ selectedNoteOid: "2asjb21783172hubsxb" });
	expect(item.find("Note").length).toBe(1);
	await wait(50);
	expect(item.state("selectedNoteOid").length).not.toBe(null);
});

test(`User select note and selectedNoteOid matches with oid`, async () => {
	const item = shallow(<Manager {...props} />);
	item.setState({ selectedNoteOid: "2asjb21783172hubsxb" });
	expect(item.find("Note").length).toBe(1);
	await wait(50);
	expect(item.state("selectedNoteOid").length).not.toBe(null);
});

test(`User create an note and see last note as selected`, async () => {
	props.recentlyCreatedNoteId = "a".repeat(36);
	const item = shallow(<Manager {...props} />);
	item.setState({ selectedNoteOid: "2asjb21783172hubsxb" });
	expect(item.find("Note").length).toBe(1);
	await wait(50);
	expect(item.state("selectedNoteOid").length).not.toBe(null);
});
