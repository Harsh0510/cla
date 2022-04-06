import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> PublishingDetail
		> Imprint
		> ImprintName:not(:empty)
	`);
	if (node) {
		product["imprint"] = (node.getInnerText() || "").trim();
	}
}
