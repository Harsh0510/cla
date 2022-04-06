// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import GetPageList from "../GetPageList";

let currentPage, pageCount, neighbours;
/**
 * Reset function
 */
function resetAll() {
	currentPage = 1;
	pageCount = 10;
	neighbours = 2;
}

beforeEach(resetAll);
afterEach(resetAll);

/** function renders correctly */
test("function renders correctly", async () => {
	const item = GetPageList(currentPage, pageCount, neighbours);
	expect(item).toEqual([
		{ active: false, index: 0, type: "NUMBER" },
		{ active: true, index: 1, type: "NUMBER" },
		{ active: false, index: 2, type: "NUMBER" },
		{ active: false, index: 3, type: "NUMBER" },
		{ type: "DOTS" },
		{ active: false, index: 9, type: "NUMBER" },
	]);
});

/** Component renders correctly */
test("Component renders with currentPage value more than Neighbours value", async () => {
	currentPage = 100;
	neighbours = 1;
	const item = GetPageList(currentPage, pageCount, neighbours);
	expect(item).toEqual([{ active: false, index: 0, type: "NUMBER" }, { type: "DOTS" }]);
});

/** function renders correctly when all parameter values are 0 */
test("function renders correctly when all parameter values are 0", async () => {
	currentPage = 0;
	pageCount = 0;
	neighbours = 0;
	const item = GetPageList(currentPage, pageCount, neighbours);
	expect(item).toEqual([]);
});

/** function renders correctly when currentPage value is 0*/
test("function renders correctly when currentPage value is 0", async () => {
	currentPage = 0;
	pageCount = 5;
	neighbours = 1;
	const item = GetPageList(currentPage, pageCount, neighbours);
	expect(item).toEqual([
		{ type: "NUMBER", index: 0, active: true },
		{ type: "NUMBER", index: 1, active: false },
		{ type: "DOTS" },
		{ type: "NUMBER", index: 4, active: false },
	]);
});

/** function renders correctly when currentPage value is 0*/
test("function renders correctly when all parameter values are null", async () => {
	currentPage = null;
	pageCount = null;
	neighbours = null;
	const item = GetPageList(currentPage, pageCount, neighbours);
	expect(item).toEqual([]);
});

/** function renders correctly when currentPage value is 0*/
test("function renders correctly when currentpage greated than neighbours filed value", async () => {
	currentPage = 2;
	pageCount = 10;
	neighbours = 1;
	const item = GetPageList(currentPage, pageCount, neighbours);
	expect(item).toEqual([
		{ type: "NUMBER", index: 0, active: false },
		{ type: "NUMBER", index: 1, active: false },
		{ type: "NUMBER", index: 2, active: true },
		{ type: "NUMBER", index: 3, active: false },
		{ type: "DOTS" },
		{ type: "NUMBER", index: 9, active: false },
	]);
});
