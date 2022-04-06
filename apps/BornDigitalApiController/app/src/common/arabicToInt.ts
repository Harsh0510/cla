import assert from "http-assert";

const charA = "A".charCodeAt(0);
const charZ = "Z".charCodeAt(0);

const arabicToInt = (str: string): number => {
	str = str.toUpperCase();
	let ret = 0;
	for (let i = 0, len = str.length; i < len; ++i) {
		const cc = str.charCodeAt(i);
		assert(cc >= charA && cc <= charZ, 400, "Invalid Arabic letter '" + str[i] + "'");
		const num = cc - charA + 1;
		ret = ret * 26 + num;
	}
	return ret;
};

export default arabicToInt;
