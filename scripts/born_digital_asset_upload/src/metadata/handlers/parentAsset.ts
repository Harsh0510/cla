import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

import enc from "../enc";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const parentAsset: Record<string, TJsonValue> = {};
	{
		// identifier
		const node = productNode.queryOne(`
			> DescriptiveDetail
			> Collection:has(
				> CollectionType:equals(10)
			)
			> CollectionIdentifier:has(
				> CollectionIDType:matches2(${enc(`^01|02$`)})
			)
			> IDValue:not(:empty)
		`);
		if (node) {
			parentAsset["identifier"] = (node.getInnerText() || "").trim();
		}
	}
	{
		// title
		const node = productNode.queryOne(`
			> DescriptiveDetail
			> Collection:has(
				> CollectionType:equals(10)
			)
			> TitleDetail:has(
				> TitleType:matches2(${enc(`^01|02$`)})
			)
			> TitleStatement:not(:empty)
		`);
		if (node) {
			parentAsset["title"] = (node.getInnerText() || "").trim();
		}
	}
	product["parentAsset"] = parentAsset;
}
