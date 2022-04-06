const googleVisionClient = require("./googleVisionImageAnnotatorClient");

const ISBN = require("./isbn").ISBN;

/**
 * Remove duplicates from a string/number array non-destructively.
 * @param {(string|number)[]} arr The source array
 * @returns {array} A shallow duplicate of arr with duplicates removed.
 */
const uniq = (arr) => {
	const seen = Object.create(null);
	const ret = [];
	for (const value of arr) {
		if (seen[value]) {
			continue;
		}
		seen[value] = true;
		ret.push(value);
	}
	return ret;
};

/**
 * Extract any ISBNs found in `text`. More than one may be found, or none may be found.
 * @param {string} text The text to search.
 * @param {RegExp} regex The approximate regexp for ISBN 10s or ISBN13s.
 * @returns {string[]} The unique ISBN13s found. All ISBNs - even ISBN10s - are converted to ISBN 13s.
 */
const getIsbn13sExplicit = (text, regex) => {
	const isbn13s = [];
	const standaloneDigitRegex = /(^|[^0-9])[0-9]/g;
	while (true) {
		if (!standaloneDigitRegex.exec(text)) {
			break;
		}
		regex.lastIndex = standaloneDigitRegex.lastIndex - 1;
		const result = regex.exec(text);
		if (!result) {
			continue;
		}
		const pisbn = ISBN.parse(result[0].replace(/[^0-9X]+/gi, ""));
		if (!pisbn) {
			continue;
		}
		const pisbn13 = pisbn.asIsbn13();
		if (!pisbn13) {
			continue;
		}
		isbn13s.push(pisbn13);
	}
	return uniq(isbn13s);
};

/**
 * Extract any ISBN13s found in `text`.
 * @param {string} text
 * @returns {string[]}
 */
const getIsbn13s = (text) => getIsbn13sExplicit(text, /(([0-9]\W{0,2}){12}[0-9X])($|[^0-9])/gi);

/**
 * Extract any ISBN10s in `text`, converting them to ISBN13s.
 * @param {string} text
 * @returns {string[]}
 */
const getIsbn10s = (text) => getIsbn13sExplicit(text, /(([0-9]\W{0,2}){9}[0-9X])($|[^0-9])/gi);

/**
 * Extract any ISBN13s found in `text`.
 * First tries to find ISBN13s, then falls back to ISBN10s.
 * @param {string} text Haystack to search.
 * @returns {{exit?: boolean, found?: string, error_message?: string}} The result.
 * If `exit` is true, the parser should exit immediately - it indicates the user might be trying to game the system.
 * In this case, `error_message` is provided.
 * If a syntactically valid ISBN is found, then `found` is set to that ISBN.
 */
const parseFromText = (text) => {
	const isbn13s = getIsbn13s(text);
	if (isbn13s.length > 1) {
		// More than one ISBN is not allowed - what if the user is trying to game the platform?
		return {
			exit: true, // tell the parser to exit immediately
			found: null,
			error_message: `More than one ISBN13 found`,
		};
	}
	if (isbn13s.length === 1) {
		return {
			exit: false,
			found: isbn13s[0],
		};
	}
	const isbn10s = getIsbn10s(text);
	if (isbn10s.length > 1) {
		// More than one ISBN is not allowed - what if the user is trying to game the platform?
		return {
			exit: true, // tell the parser to exit immediately
			found: null,
			error_message: `More than one ISBN10 found`,
		};
	}
	if (isbn10s.length === 1) {
		return {
			exit: false,
			found: isbn10s[0],
		};
	}
	// Nope, couldn't find anything.
	return {
		exit: false,
		found: null,
	};
};

/**
 * Extract any ISBN13s found in `text`.
 * If no ISBNs are found in `text`, it tries some common permutations (replacing 'O' with '0', etc.).
 * @param {string} text Haystack to search.
 * @returns {{error?: string, isbn?: string}} If successful, `isbn` is populated. Otherwise `error` is populated.
 */
const parseFromTextWithFallbacks = (text) => {
	// Try extracting an ISBN from the original text.
	let v;
	v = parseFromText(text);
	if (v.exit) {
		return {
			error: v.error_message + ` [before replacement]`,
		};
	}
	if (v.found) {
		return {
			isbn: v.found,
		};
	}

	// Perform some common text replacements and try extracting an ISBN again.
	v = parseFromText(text.replace(/O/g, "0").replace(/[Y|]/g, "1"));
	if (v.exit) {
		return {
			error: v.error_message + ` [after replacement]`,
		};
	}
	if (v.found) {
		return {
			isbn: v.found,
		};
	}

	// Nope, no ISBN found.
	return {
		error: `No ISBN found`,
	};
};

module.exports = class IsbnFromImageViaGoogleExtractor {
	/**
	 * @param {object} [opts] Optional parameters.
	 * @param {{client_email: string, private_key: string}} [opts.creds] Optional credentials.
	 * Falls back to checking the `CLA_GOOGLE_CLOUD_CREDS` environment variable if not provided.
	 * @param {string} [opts.project_id] Optional project ID within the Google console.
	 * Falls back to checking `CLA_GOOGLE_CLOUD_PROJECT_ID` if opts.project_id is not provided.
	 * Otherwise uses the default project ID.
	 */
	constructor() {
		this._client = googleVisionClient;
	}

	/**
	 * Extract an ISBN from the provided image.
	 * @param {string} imageFilePath Path to the PNG or JPG image file.
	 * @returns {Promise<{error?: { message: string, code: number, text?: string }, isbn?: string}>} The search result.
	 * If successful, `isbn` is a valid ISBN13. Otherwise `error` is populated.
	 * The `error.text` field may be populated with the OCR-retrieved text, if it's available.
	 */
	async parse(imageFilePath) {
		let data;
		try {
			data = await this._client.annotateImage({
				image: {
					source: {
						filename: imageFilePath,
					},
				},
				features: [
					{
						type: "OBJECT_LOCALIZATION", // needed to check whether the image is a '1D barcode'
					},
					{
						type: "TEXT_DETECTION", // needed for optical character recognition
					},
				],
			});
		} catch (e) {
			return {
				error: {
					message: `Exception thrown: ` + e.message + ` [` + e.stack + `]`,
					code: 10,
				},
			};
		}
		if (!Array.isArray(data)) {
			// Should never be here - this indicates the Google API is messed up somehow.
			return {
				error: {
					message: "Unexpected response - the response is not an array",
					code: 20,
				},
			};
		}
		let items;
		items = data.filter((d) => d.fullTextAnnotation && d.fullTextAnnotation.text);
		if (!items.length) {
			// Might get here if no text is detected.
			return {
				error: {
					message: "No text detected",
					code: 30,
				},
			};
		}
		const text = items.map((d) => d.fullTextAnnotation.text).join(" ");
		items = items.filter((d) => Array.isArray(d.localizedObjectAnnotations));
		if (!items.length) {
			// Might happen if no tags could be detected for the image.
			return {
				error: {
					message: "Unexpected response - no localizedObjectAnnotations",
					code: 40,
					text: text,
				},
			};
		}
		items = items.filter((d) => d.localizedObjectAnnotations.find((loa) => loa.name === "1D barcode"));
		if (!items.length) {
			// The image is not a 1D barcode.
			return {
				error: {
					message: `No 1D barcodes found`,
					code: 50,
					text: text,
				},
			};
		}
		items = items.filter((d) => d.localizedObjectAnnotations.find((loa) => loa.score >= 0.8));
		if (!items.length) {
			// Google wasn't sure enough that the image contained a barcode.
			return {
				error: {
					message: `No 1D barcodes of sufficient confidence found`,
					code: 60,
					text: text,
				},
			};
		}

		const isbnResult = parseFromTextWithFallbacks(text);
		if (!isbnResult.isbn) {
			// Google is convinced the image is a barcode, but we can't extract a syntactically valid ISBN13 from it.
			// Or maybe we managed to extract more than one ISBN13, which is not allowed.
			return {
				error: {
					message: isbnResult.error,
					code: 70,
					text: text,
				},
			};
		}

		// We successfully managed to extract an ISBN13 from the image!
		return {
			isbn: isbnResult.isbn,
		};
	}
};
