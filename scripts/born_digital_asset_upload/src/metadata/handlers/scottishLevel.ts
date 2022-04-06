import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

import enc from "../enc";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:matches2(${enc(`^CLA: Level \\\(Scotland\\\)$`)})
		)
		> SubjectHeadingText
	`);
	product["scottishLevel"] = nodes.map((node) => (node.getInnerText() || "").trim()).filter((value) => !!value);
}
