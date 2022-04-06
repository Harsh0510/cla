/**
 * return the page offset for display the real page number
 * @param currentPage
 * @param page_offset_roman
 * @param page_offset_arabic
 */
import romanize from "./romanize.js";

export default function getPageOffset(currentPage, page_offset_roman, page_offset_arabic) {
	let return_value = "";
	if (currentPage <= page_offset_roman) {
		//return non arabic value
		return_value = "[" + currentPage + "]";
	} else if (currentPage <= page_offset_arabic) {
		//return roman value
		return_value = romanize(currentPage - page_offset_roman);
	} else if (currentPage > page_offset_arabic) {
		//return arabic values
		return_value = currentPage - page_offset_arabic;
	}
	return return_value;
}
