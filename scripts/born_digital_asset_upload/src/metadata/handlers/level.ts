import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

import uppercaseFirstLetter from "./lib/uppercaseFirstLetter";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:equals(CLA: Level)
		)
		> SubjectHeadingText
	`);
	product["level"] = nodes
		.map((node) => uppercaseFirstLetter(node.getInnerText()))
		.filter((value) => !!value) as string[];
}
