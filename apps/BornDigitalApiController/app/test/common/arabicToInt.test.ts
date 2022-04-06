import { expect, test } from "@jest/globals";

import arabicToInt from "../../src/common/arabicToInt";

test("error", () => {
	expect(() => arabicToInt("3")).toThrow("Invalid Arabic letter '3'");
	expect(() => arabicToInt("A.")).toThrow("Invalid Arabic letter '.'");
	expect(() => arabicToInt("Ab£")).toThrow("Invalid Arabic letter '£'");
});

test("success", () => {
	expect(arabicToInt("A")).toBe(1);
	expect(arabicToInt("a")).toBe(1);

	expect(arabicToInt("B")).toBe(2);
	expect(arabicToInt("b")).toBe(2);

	expect(arabicToInt("J")).toBe(10);
	expect(arabicToInt("j")).toBe(10);

	expect(arabicToInt("Z")).toBe(26);
	expect(arabicToInt("z")).toBe(26);

	expect(arabicToInt("aa")).toBe(27);
	expect(arabicToInt("aA")).toBe(27);
	expect(arabicToInt("AA")).toBe(27);

	expect(arabicToInt("AT")).toBe(46);
	expect(arabicToInt("CD")).toBe(82);
	expect(arabicToInt("BCD")).toBe(1434);
});
