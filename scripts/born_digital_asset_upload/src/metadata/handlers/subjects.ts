import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> Subject:has(> SubjectSchemeIdentifier:equals(12))
		> SubjectCode
	`);
	if (node && node.getInnerText()) {
		product["subjects"] = (node.getInnerText() || "")
			.trim()
			.split(/\s*,\s*/)
			.map((subject) => subject.toUpperCase())
			.filter((subject) => subject.length < 10);
	} else {
		product["subjects"] = [];
	}
}
