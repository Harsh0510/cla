const dummyAsset = {
	id: 123,
	isbn13: "123456",
	pdf_isbn13: "2345678",
	parent_asset_group_identifier_log: "3456789",
	doi: "abc",
	title: "This is a test",
};

module.exports = function (rules, asset = dummyAsset) {
	const ret = [];
	for (let i = 0, len = rules.length; i < len; ++i) {
		const rule = rules[i];
		if (!(rule && typeof rule === "string")) {
			throw new Error(`Rule ${i + 1} not a string`);
		}
		const rendered = rule.replace(/\{\{asset\.([^}]+)\}\}/g, (_, m1) => {
			switch (m1) {
				case "isbn13":
					return encodeURIComponent((asset.isbn13 || "").toString());
				case "pdf_isbn13":
					return encodeURIComponent((asset.pdf_isbn13 || "").toString());
				case "publisher_id":
					return encodeURIComponent((asset.publisher_id || "").toString());
				case "imprint_id":
					return encodeURIComponent((asset.imprint_id || "").toString());
				case "parent_identifier":
					return encodeURIComponent((asset.parent_asset_group_identifier_log || "").toString());
				case "title":
					return encodeURIComponent((asset.title || "").toString());
				case "doi":
					return encodeURIComponent((asset.doi || "").toString());
				default:
					throw new Error(`Rule ${i + 1} not a valid template`);
			}
		});
		if (rendered.match(/\{\{[^}]+\}\}/)) {
			throw new Error(`Rule ${i + 1} not a valid template`);
		}
		ret.push(rendered);
	}
	return ret;
};
