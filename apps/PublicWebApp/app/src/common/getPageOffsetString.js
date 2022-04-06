import ConsecutiveString from "../widgets/ConsecutiveString";
import getPageOffset from "./getPageOffset";

export default function getPageOffsetString(strArray, page_offset_roman = 0, page_offset_arabic = 0, separator = ",") {
	const numericString = ConsecutiveString(strArray, separator);
	let pageOffsetString = "";
	if (numericString) {
		const spiltArray = numericString.split(separator);
		spiltArray.forEach((element) => {
			const array = element.split("-");
			let currentPage = array[0];
			let pageOffset = getPageOffset(currentPage, page_offset_roman, page_offset_arabic);
			pageOffsetString = pageOffsetString ? pageOffsetString + separator + " " + pageOffset : pageOffset;

			if (array.length == 2) {
				currentPage = array[1];
				pageOffset = getPageOffset(currentPage, page_offset_roman, page_offset_arabic);
				pageOffsetString = pageOffsetString + "-" + pageOffset;
			}
		});
	}
	return pageOffsetString;
}
