import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> EditionNumber
	`);
	if (node && node.getInnerText()) {
		product["edition"] = parseInt(node.getInnerText() || "", 10);
	}
	if (!product["edition"]) {
		product["edition"] = 1;
	}
}
