import TJsonValue from "../TJsonValue";

export default (product: Record<string, TJsonValue>): string[] => {
	const productErrors: string[] = [];
	if (!(product["issnId"] || (product["isbn13"] && product["pdfIsbn13"]))) {
		if (!product["isbn13"]) {
			productErrors.push("Print ISBN13 not found");
		}
		if (!product["pdfIsbn13"]) {
			productErrors.push("PDF ISBN13 not found");
		}
		productErrors.push("ISSN ID not found");
	}
	if (!product["title"]) {
		productErrors.push("Title not found");
	}
	if (!product["publisher"]) {
		productErrors.push("Publisher not found");
	}
	if (Array.isArray(product["_errors"])) {
		for (const err of product["_errors"]) {
			productErrors.push(err as string);
		}
	}
	return productErrors;
};
