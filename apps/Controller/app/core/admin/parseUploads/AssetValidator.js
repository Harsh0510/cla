/**
 * AssetValidator.
 * Handles fetching the entries of a directory, parsing/validating any ONIX files contained inside, and linking them up with the appropriate PDFs.
 * Does not handle inserting into the database - this merely fetches information and validates.
 */
module.exports = class {
	setMetadataFileFetcher(metadataFileFetcher) {
		this.metadataFileFetcher = metadataFileFetcher;
	}

	setPdfBinaryFileFetcher(pdfBinaryFileFetcher) {
		this.pdfBinaryFileFetcher = pdfBinaryFileFetcher;
	}

	setReadStreamCreator(readStreamCreator) {
		this.readStreamCreator = readStreamCreator;
	}

	setHandlers(handlers) {
		this.handlers = handlers;
	}

	setGeneralErrorChecker(generalErrorChecker) {
		this.generalErrorChecker = generalErrorChecker;
	}

	/**
	 * Specify the XML parser to be used for this validator.
	 * The parser must follow the interface of the nodejs `sax` XML parser module.
	 *
	 * @example
	 * const sax = require('sax');
	 * validator.setXmlParser(sax);
	 *
	 */
	setXmlParser(xmlParser) {
		this.xmlParser = xmlParser;
	}

	/**
	 * Specify the callback invoked when a closing </Product> tag is encountered and it's time to validate the product.
	 * The callback is provided the product object and is expected to return an array of error messages (or an empty array if there are no errors).
	 */
	setProductErrorCheckFunction(productErrorCheck) {
		this.productErrorCheck = productErrorCheck;
	}

	setPdfPageCounter(pdfPageCounter) {
		this.pdfPageCounter = pdfPageCounter;
	}

	/**
	 * Process and validate a single XML ONIX file.
	 */
	async _processOne(xmlEntry) {
		let generalError = null;
		const products = [];

		try {
			const stream = this.readStreamCreator(xmlEntry);
			const root = await this.xmlParser.parse(stream);
			this.generalErrorChecker(root);
			const allProductNodes = root.query(`:root > Product`);
			for (const productNode of allProductNodes) {
				const product = Object.create(null);
				for (const handler of this.handlers) {
					try {
						handler(product, productNode);
					} catch (e) {
						if (!product._errors) {
							product._errors = [];
						}
						let msg = "";
						if (handler._NAME_ && typeof handler._NAME_ === "string") {
							msg = `Internal handler error with handler '` + handler._NAME_ + `': `;
						}
						msg += e.toString();
						if (e.stack && typeof e.stack === "string") {
							msg += " [" + e.stack + "]";
						}
						product._errors.push(msg);
					}
				}
				if (product.issnId && !product.isbn13 && !product.pdfIsbn13) {
					product.pdfIsbn13 = product.isbn13 = product.issnId;
				}
				products.push(product);
			}
		} catch (e) {
			let msg = e.toString();
			if (e.stack && typeof e.stack === "string") {
				msg += " [" + e.stack + "]";
			}
			generalError = msg;
		}
		if (generalError) {
			return {
				name: xmlEntry,
				errors: [generalError],
				products: [],
			};
		}

		for (const product of products) {
			product.errors = this.productErrorCheck(product);
		}

		return {
			name: xmlEntry,
			errors: [],
			products: products,
		};
	}

	/**
	 * The primary work-horse of the AssetValidator.
	 * Parse and validate the contents of an entire directory and return the results.
	 */
	async process(dir) {
		const metadataFiles = await this.metadataFileFetcher(dir);
		return Promise.all(metadataFiles.map(this._processOne.bind(this)));
	}
};
