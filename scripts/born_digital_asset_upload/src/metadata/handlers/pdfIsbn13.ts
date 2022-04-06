import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

// Matches the PDF ISBN13 - i.e. the ISBN that should be used to match against the PDFs.
export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	const node = productNode.queryOneAsRoot(`
		> ProductIdentifier:has(> ProductIDType:equals(01)):has(> IDTypeName:equals(CLA: content file ISBN))
		> IDValue:not(:empty)
	`);
	if (node) {
		product["pdfIsbn13"] = node.getInnerText() || null;
	}
}
