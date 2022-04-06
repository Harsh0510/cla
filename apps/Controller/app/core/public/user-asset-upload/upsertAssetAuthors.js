/**
 *
 * @param {*} querier
 * @param {number} currUserId
 * @param {number} assetId
 * @param {number[]} authorIds
 */
module.exports = async (querier, currUserId, assetId, authorIds) => {
	if (!authorIds.length) {
		return;
	}
	const binds = [];
	const values = [];
	const assetIdBindIdx = binds.push(assetId);
	const userBindIdx = binds.push(currUserId);
	let sortOrder = 0;
	for (const authorId of authorIds) {
		values.push(`($${assetIdBindIdx}, ${authorId}, ${sortOrder}, $${userBindIdx})`);
		++sortOrder;
	}
	await querier(
		`
			INSERT INTO
				asset_authors
				(
					asset_id,
					author_id,
					sort_order,
					modified_by_user_id
				)
			VALUES
				${values.join(", ")}
			ON CONFLICT
				DO NOTHING
		`,
		binds
	);
};
