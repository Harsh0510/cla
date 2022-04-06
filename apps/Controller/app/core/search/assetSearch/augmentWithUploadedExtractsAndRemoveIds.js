module.exports = async (querier, results, searchQuery) => {
	const binds = [];
	const whereClauses = [];
	const orderBy = [];
	whereClauses.push(`(asset_id IN (${results.map((a) => "$" + binds.push(a.id))}))`);
	if (searchQuery) {
		const idx = binds.push(searchQuery);
		whereClauses.push(`(keywords @@ plainto_tsquery($${idx}))`);
		orderBy.push(`ts_rank_cd(keywords, plainto_tsquery($${idx})) DESC`);
	}
	orderBy.push(`id DESC`);

	const uploadedExtracts = (
		await querier(
			`
				SELECT
					asset_id,
					upload_name,
					pages,
					oid
				FROM
					asset_user_upload
				WHERE
					${whereClauses.join(" AND ")}
				ORDER BY
					${orderBy.join(", ")}
			`,
			binds
		)
	).rows;
	const assetsById = Object.create(null);
	for (const result of results) {
		assetsById[result.id] = result;
		delete result.id;
	}
	for (const extract of uploadedExtracts) {
		if (!assetsById[extract.asset_id].uploadedExtracts) {
			assetsById[extract.asset_id].uploadedExtracts = [];
		}
		const retExtract = {
			title: extract.upload_name,
			page_range: extract.pages,
			oid: extract.oid,
		};
		assetsById[extract.asset_id].uploadedExtracts.push(retExtract);
	}
};
