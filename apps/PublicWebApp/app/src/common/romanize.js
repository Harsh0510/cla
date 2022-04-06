/**
 * get roman value from integer
 * @param {*} num
 * @param {*} islower
 */
export default function romanize(num, islower = true) {
	let lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
	let roman = "";
	let i;
	for (i in lookup) {
		while (num >= lookup[i]) {
			roman += i;
			num -= lookup[i];
		}
	}
	const result = islower && roman ? roman.toLocaleLowerCase() : roman;
	return result;
}
