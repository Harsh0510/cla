// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import HelpLink from "../HelpLink";

let props;

function resetAll() {
	props = {
		title: "Need help?",
		link: "/faq",
		isInfoIcon: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Help Link render with 'Need Help' title */
test(`Help Link render with 'Need Help' title`, async () => {
	const item = shallow(<HelpLink {...props} />);
	expect(item.find("a").length).toBe(1);
	expect(item.find("a").text().indexOf("Need Help").length != -1).toBe(true);
	expect(item.find("i").length).toBe(1);
});

/** Help Link render with 'Why might this be' title */
test(`Help Link render with 'Why might this be' title`, async () => {
	props.title = "Why might this be?";
	const item = shallow(<HelpLink {...props} />);
	expect(item.find("a").text().indexOf("Why might this be").length != -1).toBe(true);
	expect(item.find("i").length).toBe(1);
});

/** Help Link render without pass title and hide icon*/
test(`Help Link render with 'Why might this be' title`, async () => {
	props.title = null;
	props.isInfoIcon = false;
	const item = shallow(<HelpLink {...props} />);
	expect(item.find("a").text().indexOf("Need Help").length != -1).toBe(true);
	expect(item.find("i").length).toBe(0);
});
