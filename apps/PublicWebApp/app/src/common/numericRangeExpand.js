const getNumber = (str) => {
	str = str.trim();
	if (!str) {
		return null;
	}
	if (str.match(/^\d+$/)) {
		return parseInt(str, 10);
	}
	return null;
};

export default function (rangeExpr, maxSize) {
	maxSize = maxSize || 500;
	const numbers = new Set();
	const parts = rangeExpr.split(/,/g);
	for (const range of parts) {
		const rangeTrimmed = range.trim();
		const bits = rangeTrimmed.split("-");
		if (bits.length === 1) {
			// single number
			const numeral = getNumber(bits[0]);
			if (!numeral) {
				return null;
			}
			numbers.add(numeral);
		} else if (bits.length === 2) {
			// a number range (e.g. '7-12')
			const lhs = getNumber(bits[0]);
			if (!lhs) {
				return null;
			}
			const rhs = getNumber(bits[1]);
			if (!rhs) {
				return null;
			}
			if (lhs >= rhs) {
				return null;
			}
			if (rhs > lhs + maxSize) {
				return null;
			}
			for (let i = lhs; i <= rhs; ++i) {
				numbers.add(i);
			}
		} else {
			return null;
		}
	}
	return [...numbers];
}
