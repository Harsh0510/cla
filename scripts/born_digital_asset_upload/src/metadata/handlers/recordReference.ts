import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`> RecordReference`);
	if (node) {
		product["recordReference"] = node.getInnerText() || null;
	}
}
