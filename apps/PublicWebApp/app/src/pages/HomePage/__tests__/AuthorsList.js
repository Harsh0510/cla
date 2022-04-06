// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AuthorsList from "../AuthorsList";

let authors;
/**
 * Reset function
 */
function resetAll() {
	authors = [];
}

beforeEach(resetAll);
afterEach(resetAll);

/** */
test("Component renders correctly", async () => {
	const item = mount(<AuthorsList authors={authors} />);
	expect(item.find("ItemAuthors").length).toBe(0);
});

test("Component renders correctly only authors", async () => {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
	];
	const item = mount(<AuthorsList authors={authors} />);
	expect(item.find("ItemAuthors").length).toBe(1);
});

test("Component renders correctly only editors", async () => {
	authors = [
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = mount(<AuthorsList authors={authors} />);
	expect(item.find("ItemAuthors").length).toBe(1);
});

test("Component renders correctly with both authors and editors details", async () => {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	const item = mount(<AuthorsList authors={authors} />);
	expect(item.find("ItemAuthors").length).toBe(2);
});
