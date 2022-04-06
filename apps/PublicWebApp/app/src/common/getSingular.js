const VOWELS = ["a", "e", "i", "o", "u"];

const vowelsByName = Object.create(null);
for (const vowel of VOWELS) {
	vowelsByName[vowel] = true;
}

/**
 * get singular 'a' or 'an' from the field name
 * @param {*} fieldName
 */
export default function (fieldName) {
	let result = "";
	if (fieldName !== "" && fieldName !== null) {
		if (vowelsByName[fieldName.charAt(0).toLowerCase()]) {
			result = "An";
		} else {
			result = "A";
		}
	}
	return result;
}
