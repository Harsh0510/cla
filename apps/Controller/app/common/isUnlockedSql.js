const sql = `(
	asset.auto_unlocked
	OR (
		COALESCE(asset_school_info.is_unlocked, FALSE)
		AND (
			asset_school_info.expiration_date IS NULL
			OR asset_school_info.expiration_date > NOW()
		)
	)
)::boolean`;

module.exports = (isLoggedIn) => (!isLoggedIn ? "FALSE" : sql);
