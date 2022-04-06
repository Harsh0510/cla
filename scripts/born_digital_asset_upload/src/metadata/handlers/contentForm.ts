import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> ContentForm:not(:empty)
	`);
	if (node) {
		const text = node.getInnerText();
		if (text) {
			const trimmed = text.trim().toUpperCase();
			if (trimmed) {
				product["contentForm"] = trimmed;
			}
		}
	}
}
