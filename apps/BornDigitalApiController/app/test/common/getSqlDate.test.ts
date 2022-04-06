import { expect, test } from "@jest/globals";

import getSqlDate from "../../src/common/getSqlDate";

const go = (y: number, m: number, d: number, h: number, i: number, s: number, mm: number) =>
	getSqlDate(new Date(y, m, d, h, i, s, mm));

test("works", () => {
	expect(go(2025, 0, 1, 5, 6, 7, 8)).toBe("2025-01-01 05:06:07.008");
	expect(go(2021, 11, 5, 15, 26, 37, 638)).toBe("2021-12-05 15:26:37.638");
});
