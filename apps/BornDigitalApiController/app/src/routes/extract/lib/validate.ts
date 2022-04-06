import assert from "http-assert";
import TJsonValue from "../../../common/TJsonValue";

export default (params: Record<string, TJsonValue>): { asset_id: number; pages: Set<string | number> } => {
	assert(typeof params["asset_id"] === "number", 400, "asset_id must be a number");
	assert(params["asset_id"] > 0, 400, "asset_id must be positive");
	assert(Number.isInteger(params["asset_id"]), 400, "asset_id must be an integer");

	assert(Array.isArray(params["pages"]), 400, "pages must be an array");
	assert(params["pages"].length > 0, 400, "pages must have at least one element");
	assert(params["pages"].length <= 2000, 400, "cannot copy more than 2000 pages");
	const pages = new Set<string | number>();
	for (const pg of params["pages"]) {
		assert(typeof pg === "string" || typeof pg === "number", 400, "page must be a string or number");
		const finalPage = typeof pg === "number" ? pg : pg.trim();
		if (typeof finalPage === "number") {
			assert(finalPage > 0, 400, "page must be positive");
			assert(finalPage < 20000, 400, "page too large");
			assert(Number.isInteger(finalPage), 400, "page must be an integer");
		} else {
			assert(finalPage, 400, "page cannot be empty");
			assert(finalPage.length <= 6, 400, "page too large");
		}
		assert(!pages.has(finalPage), 400, "pages must be unique");
		pages.add(finalPage);
	}

	return {
		asset_id: params["asset_id"],
		pages: pages,
	};
};
