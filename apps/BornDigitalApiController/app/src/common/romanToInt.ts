import assert from "http-assert";

const romanToNumberMap = {
	I: 1,
	V: 5,
	X: 10,
	L: 50,
	C: 100,
	D: 500,
	M: 1000,
};

const romanToInt = (str: string): number => {
	let result = 0;
	let current = 0;
	let previous = 0;

	const strU = str.toUpperCase();

	for (let i = strU.length - 1; i >= 0; --i) {
		assert(romanToNumberMap.hasOwnProperty(strU[i] as string), 400, "Unknown Roman symbol: " + str[i]);
		const char = strU[i] as "I" | "V" | "X" | "L" | "C" | "D" | "M";
		current = romanToNumberMap[char];
		if (current >= previous) {
			result += current;
		} else {
			result -= current;
		}
		previous = current;
	}

	return result;
};

export default romanToInt;
