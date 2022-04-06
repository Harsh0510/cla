import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> TitleDetail:has(> TitleType:equals(01))
		> TitleStatement
	`);
	if (node) {
		product["title"] = node.getInnerText() || null;
	}
}
