import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> Extent:has(
			> ExtentType:equals(05),
			> ExtentType:equals(06),
			> ExtentType:equals(11),
			> ExtentType:equals(00)
		):has(
			> ExtentUnit:equals(03)
		) > ExtentValue
	`);
	if (node) {
		const extent = parseInt(node.getInnerText() || "", 10);
		if (!Number.isNaN(extent)) {
			product["extent"] = extent;
		}
	}
}
