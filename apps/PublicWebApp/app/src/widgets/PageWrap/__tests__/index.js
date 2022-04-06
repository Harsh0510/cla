// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import PageWrap from "../index";

/** Component renders correctly */
test("Component renders correctly with padding value is true", async () => {
	const item = mount(<PageWrap padding={true} />);

	expect(item.find("PageWrapOuter").length).toBe(1);
});

/** Component renders correctly */
test("Component renders correctly with padding value is false", async () => {
	const item = mount(<PageWrap padding={false} />);

	expect(item.find("PageWrapOuter").length).toBe(1);
});
