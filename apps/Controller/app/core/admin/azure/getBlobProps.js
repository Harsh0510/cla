const mime = require("mime-types");

module.exports = (props, filePath) => {
	if (!props && !filePath) {
		return;
	}
	const ret = {};
	if (props) {
		if (props.cacheControl) {
			ret.blobCacheControl = props.cacheControl;
		}
		if (props.contentType) {
			ret.blobContentType = props.contentType;
		} else if (filePath) {
			const mt = mime.lookup(filePath);
			if (mt) {
				ret.blobContentType = mt;
			}
		}
	} else if (filePath) {
		const mt = mime.lookup(filePath);
		if (mt) {
			ret.blobContentType = mt;
		}
	}
	return {
		blobHTTPHeaders: ret,
	};
};
