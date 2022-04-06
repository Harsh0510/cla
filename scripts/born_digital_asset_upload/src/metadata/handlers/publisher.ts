import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const publisherNameNode = productNode.queryOne(`
		> DescriptiveDetail
		> Subject:has(> SubjectSchemeIdentifier:equals(24)):has(> SubjectSchemeName:equals(CLA: Publisher))
		> SubjectHeadingText
	`);
	if (publisherNameNode) {
		product["publisher"] = publisherNameNode.getInnerText() || null;
	}
}
