const getExtractExpiryDate = require(`./getExtractExpiryDate`);
/**
 * Update the extract expiry date when temporarily unlock asset is fully unlocked
 * @param {*} client
 * @param {*} assetId
 * @param {*} schoolId
 * @param {*} academicYearEndMonth
 * @param {*} academicYearEndDay
 */
module.exports = async function (client, assetId, schoolId, academicYearEndMonth, academicYearEndDay, modifiedByUserId) {
	const assetExtracts = await client.query(
		`
			SELECT
				id AS extract_id,
				date_created AS date_created
			FROM
				extract
			WHERE
				asset_id = $1
				AND school_id = $2
				AND archive_date IS NULL
		`,
		[assetId, schoolId]
	);

	if (assetExtracts && assetExtracts.rows && assetExtracts.rows.length) {
		const extractData = assetExtracts.rows;
		for (const extract of extractData) {
			const dateExpired = getExtractExpiryDate(extract.date_created, academicYearEndMonth, academicYearEndDay);
			await client.query(
				`
					UPDATE
						extract
					SET
						date_expired = $2,
						modified_by_user_id = $3,
						date_edited = NOW()
					WHERE
						id = $1
				`,
				[extract.extract_id, dateExpired, modifiedByUserId]
			);
		}
	}
};
