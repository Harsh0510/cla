let ConstructorClass;

if (process.env.CLA_GOOGLE_CLOUD_CREDS) {
	ConstructorClass = require("./IsbnFromImageViaGoogleExtractor");
} else {
	ConstructorClass = class DummyIsbnFromImageViaGoogleExtractor {
		async parse() {
			return {
				isbn: null,
				error: null,
			};
		}
	};
}

module.exports = new ConstructorClass();
