const util = Object.create(null);

util.getFlattenedProductsRaw = function (data) {
	const ret = [];
	for (const xmlFileData of data) {
		if (!Array.isArray(xmlFileData.products)) {
			continue;
		}
		for (const product of xmlFileData.products) {
			const productClone = {};
			Object.assign(productClone, product);
			delete productClone.errors;
			ret.push(productClone);
		}
	}
	return ret;
};

util.getErrorsOnly = function (data) {
	const ret = [];
	for (const xmlFileData of data) {
		const d = {};
		Object.assign(d, xmlFileData);
		delete d.products;
		if (xmlFileData.errors.length) {
			ret.push({
				type: "xml_file_error",
				data: d,
			});
			continue;
		}
		for (const product of xmlFileData.products) {
			if (!product.errors.length) {
				continue;
			}
			ret.push({
				type: "product_error",
				xml: d,
				issnId: product.issnId,
				isbn13: product.isbn13,
				pdfIsbn13: product.pdfIsbn13,
				title: product.title,
				errors: product.errors,
			});
		}
	}
	return ret;
};

util.getFlattenedProducts = function (data) {
	const flattenedProductsByIsbn = Object.create(null);
	for (const xmlFileData of data) {
		if (xmlFileData.errors.length) {
			continue;
		}
		for (const product of xmlFileData.products) {
			if (product.errors.length) {
				continue;
			}
			const productClone = {};
			Object.assign(productClone, product);
			delete productClone.errors;
			flattenedProductsByIsbn[productClone.pdfIsbn13] = productClone;
		}
	}
	return Object.values(flattenedProductsByIsbn);
};

module.exports = util;
