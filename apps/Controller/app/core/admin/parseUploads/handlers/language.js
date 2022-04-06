const allowedLanguages = Object.create(null);
allowedLanguages.eng = true;
allowedLanguages.wel = true;

module.exports = function (product, productNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Language:has(
			> LanguageRole:equals(01)
		)
		> LanguageCode
	`);
	if (Array.isArray(nodes) && nodes.length) {
		const langMap = Object.create(null);
		for (const node of nodes) {
			let text = node.getInnerText();
			if (!text) {
				continue;
			}
			text = text.toLowerCase().trim();
			if (!text) {
				continue;
			}
			if (text === "cym") {
				text = "wel";
			}
			if (text !== "eng" && text !== "wel") {
				text = "eng";
			}
			langMap[text] = true;
		}
		product.language = Object.keys(langMap);
	}
	if (!product.language || !product.language.length) {
		product.language = ["eng"];
	}
	product.language.sort();
};
