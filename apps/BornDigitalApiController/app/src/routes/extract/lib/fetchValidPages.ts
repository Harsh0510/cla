import assert from "http-assert";
import arabicToInt from "../../../common/arabicToInt";
import romanToInt from "../../../common/romanToInt";

export default (
	asset: { page_offset_roman: number; page_offset_arabic: number; page_count: number },
	pages: Set<string | number>
): number[] => {
	const romanPages: number[] = [];
	const arabicPages: number[] = [];
	const numberPages: number[] = [];
	for (const page of pages) {
		if (typeof page === "number") {
			numberPages.push(page - 1);
		} else if (page.match(/^[A-Z]+$/)) {
			arabicPages.push(arabicToInt(page) - 1);
		} else {
			romanPages.push(romanToInt(page) - 1);
		}
	}
	romanPages.sort((a, b) => b - a);
	if (typeof romanPages[0] === "number") {
		assert(romanPages[0] < asset.page_offset_roman, 400, "Roman page exceeds Roman count");
	}
	arabicPages.sort((a, b) => b - a);
	if (typeof arabicPages[0] === "number") {
		assert(
			arabicPages[0] < asset.page_offset_arabic - asset.page_offset_roman,
			400,
			"Arabic page exceeds Arabic count"
		);
	}
	numberPages.sort((a, b) => b - a);
	if (typeof numberPages[0] === "number") {
		assert(numberPages[0] < asset.page_count - asset.page_offset_arabic, 400, "Page exceeds asset page count");
	}

	return romanPages
		.concat(arabicPages.map((v) => v + asset.page_offset_roman))
		.concat(numberPages.map((v) => v + asset.page_offset_arabic))
		.sort((a, b) => a - b);
};
