import sanitize from "sanitize-html";

import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

function getContent(productNode: XmlNode, textType: string) {
	const node = productNode.queryOne(`
		> CollateralDetail
		> TextContent:has(> TextType:equals(${textType})):has(> ContentAudience:not(:equals(02)))
		> Text
	`);
	if (node) {
		const inner = node.getInnerXml();
		if (inner) {
			const text = sanitize(inner.trim(), {
				allowedTags: [
					"a",
					"b",
					"blockquote",
					"code",
					"del",
					"dd",
					"dt",
					"em",
					"h1",
					"h2",
					"h3",
					"h4",
					"h5",
					"h6",
					"i",
					"img",
					"kbd",
					"li",
					"ol",
					"p",
					"pre",
					"s",
					"sup",
					"sub",
					"strong",
					"strike",
					"ul",
					"br",
					"hr",
					"table",
					"thead",
					"tbody",
					"tfoot",
					"tr",
					"td",
					"th",
				],
			});
			return text;
		}
	}
	return null;
}

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const toTry = ["03", "02", "01"];
	for (const t of toTry) {
		const value = getContent(productNode, t);
		if (value) {
			product["description"] = value;
		}
	}
}
