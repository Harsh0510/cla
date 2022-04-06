import * as cheerio from "cheerio";
import TJsonValue from "../TJsonValue";
import ITocItem from "./ITocItem";

export default (toc?: TJsonValue | undefined): ITocItem[] | null => {
	if (!toc) {
		return null;
	}
	if (typeof toc !== "string") {
		return null;
	}
	const $ = cheerio.load(toc);
	if (!$) {
		return null;
	}
	const ret: ITocItem[] = [];
	$("li").each((_i, elem) => {
		const $this = $(elem);
		const $label = $this.find("span.label");
		if ($label.length !== 1) {
			return;
		}
		const $firstLabel = $label.first();
		const label = ($firstLabel.text() || "").trim().replace(/\s+/g, " ");
		if (!label) {
			return;
		}
		const $page = $this.find("span.page");
		if ($page.length !== 1) {
			return;
		}
		const pageStr = ($page.first().text() || "").trim();
		if (!pageStr) {
			return;
		}
		const page = parseInt(pageStr, 10);
		if (!page) {
			return;
		}
		if (page <= 0) {
			return;
		}
		const description = (() => {
			let raw = $firstLabel.attr("title");
			if (!raw) {
				return null;
			}
			raw = raw.trim().replace(/\s+/g, " ");
			if (!raw) {
				return null;
			}
			return raw;
		})();
		ret.push({ label, description, page });
	});
	return ret;
};
