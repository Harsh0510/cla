// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Overview from "../Overview";
import MockWorks from "../../../mocks/MockWorks";

let props;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

function resetAll() {
	props = {
		hasContents: true,
		resultData: {
			description: MockWorks.description,
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<Overview {...props} />);
	expect(item.find("Container").length).toBe(1);
	expect(item.find("h3").text()).toEqual(`Overview`);
});

/** When assest have n't any description  */
test(`When assest have n't any description`, async () => {
	props.resultData.description = null;
	const item = shallow(<Overview {...props} />);
	expect(item.find("StyleSectionText").children("div").text()).toEqual("");
});
