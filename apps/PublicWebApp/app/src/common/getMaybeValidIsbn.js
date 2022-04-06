/**
 * Returns a normalised ISBN, if what is passed in looks like it's possibly an
 * ISBN.
 *
 * This intentionally does not do a checksum calculation to check whether the
 * ISBN is syntactically valid because we want to allow users to make minor
 * typos when entering their ISBN and still have it classed as an ISBN.
 *
 * @param str
 * @returns
 */
const getMaybeValidIsbn = (str) => {
	if (!str) {
		return null;
	}
	if (str.length > 25) {
		return null;
	}
	str = str.replace(/[^0-9]+/g, "");
	if (str.length < 9) {
		return null;
	}
	return str;
};
export default getMaybeValidIsbn;
