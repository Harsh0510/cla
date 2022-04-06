const getPercentage = (envName, defaultValue) => {
	const raw = process.env[envName];
	if (!raw) {
		return defaultValue;
	}
	const v = parseInt(raw, 10);
	if (!v) {
		return defaultValue;
	}
	return Math.max(0, Math.min(100, v));
};

const DEFAULT_SCHOOL_EXTRACT_LIMIT_PERCENTAGE = getPercentage("DEFAULT_SCHOOL_EXTRACT_LIMIT_PERCENTAGE", 20);
const DEFAULT_CLASS_EXTRACT_LIMIT_PERCENTAGE = getPercentage("DEFAULT_CLASS_EXTRACT_LIMIT_PERCENTAGE", 5);

module.exports = async function (querier, value, assetDbField = "pdf_isbn13") {
	const result = await querier(
		`
			SELECT
				CASE WHEN asset.can_copy_in_full THEN 100 ELSE COALESCE(publisher.class_extract_limit_percentage, ${DEFAULT_CLASS_EXTRACT_LIMIT_PERCENTAGE}) END AS class,
				CASE WHEN asset.can_copy_in_full THEN 100 ELSE COALESCE(publisher.school_extract_limit_percentage, ${DEFAULT_SCHOOL_EXTRACT_LIMIT_PERCENTAGE}) END AS school
			FROM
				publisher
			INNER JOIN asset
				ON publisher.id = asset.publisher_id
			WHERE
				asset.${assetDbField} = $1
		`,
		[value]
	);
	if (result.rowCount === 1) {
		return {
			class: result.rows[0].class * 0.01,
			school: result.rows[0].school * 0.01,
		};
	}
	return {
		class: DEFAULT_CLASS_EXTRACT_LIMIT_PERCENTAGE * 0.01,
		school: DEFAULT_SCHOOL_EXTRACT_LIMIT_PERCENTAGE * 0.01,
	};
};
