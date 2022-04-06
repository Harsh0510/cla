/**
 * Returns an array without empty string values.
 *
 * @param arr
 * @returns
 */

const getNoneEmptyValueArray = (arr) => {
	let noneEmptyArr = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] !== "") {
			noneEmptyArr.push(arr[i]);
		}
	}
	return noneEmptyArr;
};

export default getNoneEmptyValueArray;
