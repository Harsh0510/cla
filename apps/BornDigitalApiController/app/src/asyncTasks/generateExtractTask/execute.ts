import { TQuerier } from "../../common/TQuerier";
import IExtract from "../../common/IExtract";
import processExtract from "../../common/processExtract";

export default async (querier: TQuerier) => {
	const results = await (querier as TQuerier<IExtract>)(`
		SELECT
			id,
			isbn13 AS isbn,
			asset_id,
			pages,
			name
		FROM
			born_digital_extract
		WHERE
			status = 'unstarted'
			OR (
				status = 'running'
				AND date_began_running + INTERVAL '2 hours' < NOW()
			)
		ORDER BY
			id ASC
		LIMIT
			5
	`);
	const records = results.rows as IExtract[];
	for (const record of records) {
		try {
			await processExtract(querier, record);
		} catch (e) {
			const ee = e as Error;
			console.error(record, ee, ee.message, ee.stack);
			continue;
		}
	}
};
