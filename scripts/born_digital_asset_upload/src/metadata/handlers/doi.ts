import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> ProductIdentifier:has(> ProductIDType:equals(06))
		> IDValue:not(:empty)
	`);
	if (node) {
		const text = (node.getInnerText() || "").trim();
		if (text) {
			product["doi"] = text;
		}
	}
}
