import * as utils from "./utils";
function addedDiff(lhs, rhs) {
	if (lhs === rhs || !(0, utils.isObject)(lhs) || !(0, utils.isObject)(rhs)) return {};
	const l = lhs;
	const r = rhs;
	return Object.keys(r).reduce((acc, key) => {
		if ((0, utils.hasOwnProperty)(l, key)) {
			const difference = addedDiff(l[key], r[key]);
			if ((0, utils.isObject)(difference) && (0, utils.isEmpty)(difference)) return acc;
			acc[key] = difference;
			return acc;
		}

		acc[key] = r[key];
		return acc;
	}, {});
}

export default addedDiff;
