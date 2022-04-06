import React from "react";
import { shallow } from "enzyme";
import Measures from "../Measures";

let props;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = {
		unlockedTitles: 1,
		copiedTitles: 5,
		copiesTotal: 2,
		studentViews: 54,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<Measures {...props} />);
	expect(item.find("Row").length).toBe(2);
});
