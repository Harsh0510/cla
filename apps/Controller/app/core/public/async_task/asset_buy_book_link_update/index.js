const pushTask = require("./pushTask");

const getFirstWorkingLink = require("./getFirstWorkingLink");

async function fetchSingleAssetLink(asset, assetGroupRules, imprintRules, publisherRules) {
	let foundLink = await getFirstWorkingLink(asset.buy_book_rules, asset);
	if (!foundLink) {
		foundLink = await getFirstWorkingLink(assetGroupRules, asset);
	}
	if (!foundLink) {
		foundLink = await getFirstWorkingLink(imprintRules, asset);
	}
	if (!foundLink) {
		foundLink = await getFirstWorkingLink(publisherRules, asset);
	}
	return foundLink;
}

async function updateAssets(querier) {
	const assetResults = await querier(`
		SELECT
			id,
			buy_book_rules,
			isbn13,
			pdf_isbn13,
			publisher_id,
			imprint_id,
			parent_asset_group_id,
			parent_asset_group_identifier_log,
			doi,
			title
		FROM
			asset
		WHERE
			(
				buy_book_link_last_updated IS NULL
				OR buy_book_link_last_updated < (NOW() - interval '2 weeks')
			)
			AND (
				buy_book_link_began_updating IS NULL
				OR buy_book_link_began_updating < (NOW() - interval '1 day')
			)
		ORDER BY
			id ASC
		LIMIT
			10
	`);
	if (!assetResults.rowCount) {
		return;
	}
	const assetIds = assetResults.rows.map((row) => row.id);
	await querier(`
		UPDATE
			asset
		SET
			buy_book_link_began_updating = NOW(),
			date_edited = NOW()
		WHERE
			id IN (${assetIds.join(",")})
	`);
	try {
		const assetGroupIdsRaw = assetResults.rows.map((row) => row.parent_asset_group_id);
		const assetGroupIds = [...new Set(assetGroupIdsRaw)]; // remove duplicates
		const assetGroupRules = await querier(`SELECT id, buy_book_rules FROM asset_group WHERE id IN (${assetGroupIds.join(",")})`);
		const assetGroupRulesById = Object.create(null);
		for (const row of assetGroupRules.rows) {
			if (Array.isArray(row.buy_book_rules) && row.buy_book_rules.length) {
				assetGroupRulesById[row.id] = row.buy_book_rules;
			}
		}
		const imprintIdsRaw = assetResults.rows.map((row) => row.imprint_id);
		const imprintIds = [...new Set(imprintIdsRaw)]; // remove duplicates
		const imprintRules = await querier(`SELECT id, buy_book_rules FROM imprint WHERE id IN (${imprintIds.join(",")})`);
		const imprintRulesById = Object.create(null);
		for (const row of imprintRules.rows) {
			if (Array.isArray(row.buy_book_rules) && row.buy_book_rules.length) {
				imprintRulesById[row.id] = row.buy_book_rules;
			}
		}
		const publisherIdsRaw = assetResults.rows.map((row) => row.publisher_id);
		const publisherIds = [...new Set(publisherIdsRaw)]; // remove duplicates
		const publisherRules = await querier(`SELECT id, buy_book_rules FROM publisher WHERE id IN (${publisherIds.join(",")})`);
		const publisherRulesById = Object.create(null);
		for (const row of publisherRules.rows) {
			if (Array.isArray(row.buy_book_rules) && row.buy_book_rules.length) {
				publisherRulesById[row.id] = row.buy_book_rules;
			}
		}
		const values = [];
		const binds = [];
		for (const asset of assetResults.rows) {
			const link = await fetchSingleAssetLink(
				asset,
				assetGroupRulesById[asset.parent_asset_group_id],
				imprintRulesById[asset.imprint_id],
				publisherRulesById[asset.publisher_id]
			);
			values.push(`(${asset.id}, $${binds.push(link)})`);
		}
		await querier(
			`
				UPDATE
					asset
				SET
					buy_book_link = v.link,
					buy_book_link_began_updating = NULL,
					buy_book_link_last_updated = NOW(),
					date_edited = NOW()
				FROM
					(VALUES ${values.join(",")})
					AS v(id, link)
				WHERE
					asset.id = v.id
			`,
			binds
		);
	} catch (e) {
		await querier(`
			UPDATE
				asset
			SET
				buy_book_link_began_updating = NULL,
				date_edited = NOW()
			WHERE
				asset.id IN (${assetIds.join(",")})
		`);
		throw e;
	}
}

module.exports = async function (taskDetails) {
	try {
		//get assets which assets's cache hasn't been updated in at least a week
		await updateAssets(taskDetails.query.bind(taskDetails));
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 5 minutes.
		await pushTask(taskDetails);
	}
};
