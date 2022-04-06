import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> ProductIdentifier:has(> ProductIDType:equals(01)):has(> IDTypeName:equals(CLA content identifier))
		> IDValue:not(:empty)
	`);
	if (node) {
		product["issnId"] = node.getInnerText() || null;
	}
}
