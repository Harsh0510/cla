// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import BackgroundWorms from "../index";

// Mock import
jest.mock("../../../common/withApiConsumer", () => {
	const withApiConsumer = require("../../../mocks/withApiConsumer");
	return withApiConsumer;
});

jest.mock("../3b.png", () => jest.fn());
jest.mock("../1b.png", () => jest.fn());
jest.mock("../2b.png", () => jest.fn());

/** Component renders correctly pass with 30 breakpoint*/
test("Component renders correctly pass with 30 breakpoint", async () => {
	const item = shallow(<BackgroundWorms breakpoint={30} />).dive();

	expect(item.find("Wrap").length).toBe(1);
});

/** Component renders correctly pass with 10 breakpoint*/
test("Component renders correctly pass with 10 breakpoint", async () => {
	const item = shallow(<BackgroundWorms breakpoint={10} />).dive();

	expect(item.find("div").length).toBe(1);
});
