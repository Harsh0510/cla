/**
 * getPageOffsetObject
 * @param {*} data | {page_offset_roman: 0, page_offset_arabic: 0}
 * @returns | {roman: 0, arabic: 0}
 */
export default function getPageOffsetObject(data) {
	const page_offset_roman = data && data.page_offset_roman ? parseInt(data.page_offset_roman, 10) : 0;
	const page_offset_arabic = data && data.page_offset_arabic ? parseInt(data.page_offset_arabic, 10) : 0;
	const page_offset = {
		roman: page_offset_roman,
		arabic: page_offset_arabic,
	};
	return page_offset;
}
