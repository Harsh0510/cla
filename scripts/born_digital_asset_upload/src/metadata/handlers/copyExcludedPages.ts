import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

const parsePageString = (str?: string | null | undefined) => {
	if (!str) {
		return [];
	}
	if (typeof str !== "string") {
		return [];
	}
	const parts = str.trim().replace(/\s+/g, "").split(",");
	if (!parts.length) {
		return [];
	}
	const ret = [];
	for (const part of parts) {
		let matches;
		matches = part.match(/^[0-9]+$/);
		if (matches) {
			// plain number
			ret.push(parseInt(part, 10));
			continue;
		}
		matches = part.match(/^([0-9]+)[–—-]([0-9]+)$/);
		if (matches) {
			// 12-16
			const firstNum = parseInt(matches[1] as string, 10);
			const lastNum = parseInt(matches[2] as string, 10);
			if (firstNum > lastNum) {
				continue;
			}
			for (let i = firstNum; i <= lastNum; ++i) {
				ret.push(i);
			}
			continue;
		}
	}
	const uniqued = [...new Set(ret)];
	uniqued.sort((a, b) => a - b);
	return uniqued;
};

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOne(`
		> PublishingDetail
		> CopyingDeclaration:has(
			> DeclarationScope:equals(01)
		):has(
			> DeclarationType:equals(00)
		):has(
			> DeclarationReason:equals(00)
		) > DeclarationUnit:has(
			> DeclarationUnitType:equals(01)
		) > DeclarationUnitValue:not(:empty)
	`);
	if (node) {
		const pages = parsePageString(node.getInnerText());
		if (pages.length) {
			product["copyExcludedPages"] = pages;
		}
	}
}
