import React from "react";
import { shallow, mount } from "enzyme";
import Video from "../Video";

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const goToPage = jest.fn();
	const item = mount(<Video current_page={1} last_page={5} go_to_page={goToPage} />);

	await wait(50);

	expect(item.find("Wrap").length).toBe(1);
});

test("Video plays when the play button is clicked", async () => {
	const goToPage = jest.fn();
	const item = shallow(<Video current_page={1} last_page={5} go_to_page={goToPage} />);

	await wait(50);

	item.simulate("click", {
		preventDefault: jest.fn(),
	});

	await wait(50);

	expect(item.find("ActualVideo").length).toBe(1);
});

test("Video plays when the play button is clicked", async () => {
	const goToPage = jest.fn();
	const item = shallow(<Video current_page={1} last_page={5} go_to_page={goToPage} />);

	await wait(50);
	item.setState({ begun_play: true });
	item.simulate("click", {
		preventDefault: jest.fn(),
	});

	await wait(50);
	expect(item.state("begun_play")).toEqual(true);
	expect(item.find("ActualVideo").length).toBe(1);
});
