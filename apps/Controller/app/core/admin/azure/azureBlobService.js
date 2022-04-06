const BlobService = require("./BlobService");

let bs;
try {
	bs = new BlobService();
} catch (e) {
	bs = null;
}

module.exports = bs;
