import React from "react";
import { shallow, mount } from "enzyme";
import SocialMedia from "../index";
const getUrl = require("../../../../../../Controller/app/common/getUrl");

let props;

function resetAll() {
	props = {
		url: getUrl(`/works/TestBook?c=1`),
		fbText: "Education Platform - I created a copy of Test",
		twitterText: "I just shared a copy of Test on the #educationplatform",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<SocialMedia {...props} />);
	expect(item.find("Title").length).toBe(1);
});
