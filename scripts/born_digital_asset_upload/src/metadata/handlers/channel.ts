import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:equals(CLA: Channel)
		)
		> SubjectHeadingText
	`);
	if (!node) {
		return;
	}
	const txt = node.getInnerText();
	if (!txt) {
		return;
	}
	product["channel"] = txt.trim().toUpperCase();
}
