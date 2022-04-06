import romanToArabic from "../common/romanToArabic";

export default function getPageSequenceNumber(stringValue, page_offset_roman, page_offset_arabic) {
	let pageSequenceNumber = 0;
	let numericValue = 0;
	const value = stringValue ? stringValue.toString() : "";
	if (value.match(/^\[[0-9]*]$/)) {
		numericValue = value.replace(/[\[\]]+/g, "");
		pageSequenceNumber = parseInt(numericValue, 10);
	} else if (value.match(/^[m,d,c,l,x,v,i]+$/i)) {
		numericValue = romanToArabic(value);
		pageSequenceNumber = page_offset_roman + parseInt(numericValue, 10);
	} else if (value.match(/^[0-9]+$/)) {
		numericValue = parseInt(value, 10);
		pageSequenceNumber = page_offset_arabic + numericValue;
	} else {
		pageSequenceNumber = 0;
	}
	return pageSequenceNumber;
}
