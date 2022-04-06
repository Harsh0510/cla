import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> CollateralDetail
		> TextContent:has(> TextType:equals(04))
		> Text[textformat="05"]
		> div.toc
	`);
	if (node) {
		const toc = node.getInnerXml();
		if (toc) {
			product["toc"] = toc.trim().replace(/\s+/g, " ");
		}
	}
}
