import { expect, test } from "@jest/globals";

import romanToInt from "../../src/common/romanToInt";

test("error", () => {
	expect(() => romanToInt("KKK")).toThrow("Unknown Roman symbol: K");
	expect(() => romanToInt(".")).toThrow("Unknown Roman symbol: .");
	expect(() => romanToInt("i/")).toThrow("Unknown Roman symbol: /");
});

test("success", () => {
	expect(romanToInt("i")).toBe(1);
	expect(romanToInt("ii")).toBe(2);
	expect(romanToInt("iii")).toBe(3);
	expect(romanToInt("iv")).toBe(4);
	expect(romanToInt("v")).toBe(5);
	expect(romanToInt("vi")).toBe(6);
	expect(romanToInt("vii")).toBe(7);
	expect(romanToInt("viii")).toBe(8);
	expect(romanToInt("ix")).toBe(9);
	expect(romanToInt("x")).toBe(10);
	expect(romanToInt("xi")).toBe(11);

	expect(romanToInt("I")).toBe(1);
	expect(romanToInt("II")).toBe(2);
	expect(romanToInt("III")).toBe(3);
	expect(romanToInt("IV")).toBe(4);
	expect(romanToInt("V")).toBe(5);
	expect(romanToInt("VI")).toBe(6);
	expect(romanToInt("VII")).toBe(7);
	expect(romanToInt("VIII")).toBe(8);
	expect(romanToInt("IX")).toBe(9);
	expect(romanToInt("X")).toBe(10);
	expect(romanToInt("XI")).toBe(11);

	expect(romanToInt("xli")).toBe(41);
	expect(romanToInt("lxxvii")).toBe(77);
	expect(romanToInt("DLXXIX")).toBe(579);
	expect(romanToInt("MMMCXIV")).toBe(3114);
});
