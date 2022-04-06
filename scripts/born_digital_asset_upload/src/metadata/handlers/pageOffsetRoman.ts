import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	product["pageOffsetRoman"] = 0;
	const node = productNode.queryOne(`
		> CollateralDetail
		> TextContent:has(> TextType:equals(04))
		> Text[textformat="05"]
		> span.pageOffsetRoman
	`);
	if (!node) {
		return;
	}
	const value = parseInt((node.getInnerText() || "").trim(), 10) || 0;
	if (value < 0) {
		return;
	}
	product["pageOffsetRoman"] = value;
}
