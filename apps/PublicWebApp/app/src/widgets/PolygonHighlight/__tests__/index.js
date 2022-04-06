// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import PolygonHighlight from "../index";

let props;

function resetAll() {
	props = {
		points: [23, 34],
		className: "btn btn-primary",
		title: "Test Password",
		style: "dummy-1",
		fill: "dummy-2",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<PolygonHighlight {...props} />);
	item.setProps({ fill: "dummy" });
	expect(item.find("svg").length).toBe(1);
	expect(item.find("polygon").length).toBe(1);
});

/** Component renders correctly */
test("Component renders correctly when size is changed", async () => {
	const item = shallow(<PolygonHighlight {...props} />);
	item.setProps({ points: [12, 19] });
	expect(item.find("svg").length).toBe(1);
	expect(item.find("polygon").length).toBe(1);
});
