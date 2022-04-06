import { expect, test } from "@jest/globals";

import fetchValidPages from "../../../../src/routes/extract/lib/fetchValidPages";

const go = (roman: number, arabic: number, pageCount: number, ...pages: (string | number)[]) => {
	return fetchValidPages(
		{ page_offset_roman: roman, page_offset_arabic: arabic, page_count: pageCount },
		new Set([...pages])
	);
};

test("errors", () => {
	expect(() => go(0, 0, 100, 5, 10, 515)).toThrow("Page exceeds asset page count");
	expect(() => go(5, 10, 100, 5, 10, "m")).toThrow("Roman page exceeds Roman count");
	expect(() => go(5, 10, 100, 5, 10, "M")).toThrow("Arabic page exceeds Arabic count");
});

test("success", () => {
	expect(go(0, 0, 100, 5, 10, 15)).toEqual([4, 9, 14]);
	expect(go(5, 10, 100, 5, "ii", "v", "C", 10, 15)).toEqual([1, 4, 7, 14, 19, 24]);
});
