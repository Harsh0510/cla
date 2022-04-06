import assert from "http-assert";
import db from "../../common/db";
import blobService from "../../common/blobService";
import TJsonValue from "../../common/TJsonValue";

interface IDbAuthor {
	role: string;
	firstName: string;
	lastName: string;
}

interface IDbAsset {
	id: number;
	isbn: string;
	authors: { first_name: string; last_name: string }[];
	publisher: string;
	publication_date: number; // timestamp
	page_count: number;
	cover_image: string;
	ocr: boolean;
	color_scale: "monochrome" | "greyscale" | "color";
	withdrawn: boolean;
	change_counter: number;
	page_offset_roman: number;
	page_offset_arabic: number;
}

const int64max = 2n ** 63n - 1n;

export default async (params: Record<string, TJsonValue>): Promise<{ has_more: boolean; records: IDbAsset[] }> => {
	if (typeof params["modified_since"] !== "undefined") {
		assert(
			typeof params["modified_since"] === "number" || typeof params["modified_since"] === "bigint",
			400,
			"modified_since must be a number"
		);
		if (typeof params["modified_since"] === "bigint") {
			assert(params["modified_since"] >= 0n, 400, "modified_since must not be negative");
			assert(params["modified_since"] <= int64max, 400, "modified_since too large");
		} else {
			assert(params["modified_since"] >= 0, 400, "modified_since must not be negative");
			assert(Number.isInteger(params["modified_since"]), 400, "modified_since must be an integer");
		}
	}
	const limit: number = (() => {
		if (typeof params["limit"] === "undefined") {
			return 2000;
		}
		assert(typeof params["limit"] === "number", 400, "limit must be a number");
		assert(params["limit"] > 0, 400, "limit must be positive");
		assert(params["limit"] <= 10000, 400, "limit must not exceed 10000");
		assert(Number.isInteger(params["limit"]), 400, "limit must be an integer");
		return params["limit"];
	})();
	const modifiedSince: number | BigInt = params["modified_since"] || 0;

	const results = await db.query(
		`
			SELECT
				id,
				pdf_isbn13 AS isbn,
				title,
				authors_log AS authors,
				publisher_name_log AS publisher,
				EXTRACT(EPOCH FROM publication_date) AS publication_date,
				page_count,
				ocr,
				color_scale,
				born_digital_withdrawn AS withdrawn,
				born_digital_change_counter AS change_counter,
				page_offset_roman,
				page_offset_arabic
			FROM
				asset
			WHERE
				active_born_digital
				AND is_born_digital
				AND born_digital_change_counter > $1
			ORDER BY
				born_digital_change_counter ASC
			LIMIT
				$2
		`,
		[modifiedSince, limit + 1]
	);

	for (const record of results.rows) {
		record.authors = Array.isArray(record.authors)
			? record.authors
					.filter((auth: IDbAuthor) => auth.role === "A")
					.map((auth: IDbAuthor) => ({
						first_name: auth.firstName,
						last_name: auth.lastName,
					}))
			: [];
		record.cover_image = blobService.url + "coverpages/" + record.isbn + ".png";
	}

	const hasMore = results.rowCount === limit + 1;
	if (hasMore) {
		results.rows.pop();
	}

	return {
		records: results.rows,
		has_more: hasMore,
	};
};
