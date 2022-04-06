import db from "../../../common/db";
import IAsset from "./IAsset";

export default async (assetId: number): Promise<IAsset | null> => {
	const result = await db.query(
		`
			SELECT
				id,
				pdf_isbn13,
				page_offset_roman,
				page_offset_arabic,
				page_count
			FROM
				asset
			WHERE
				id = $1
				AND active_born_digital
				AND is_born_digital
		`,
		[assetId]
	);
	if (!result.rowCount) {
		return null;
	}
	return result.rows[0];
};
