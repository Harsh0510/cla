module.exports = async (querier, currUserId, name) => {
	{
		const result = await querier(
			`
				INSERT INTO
					publisher
					(
						name,
						overall_name,
						modified_by_user_id,
						date_system_created,
						date_user_created
					)
				VALUES
					($1, $1, $2, NULL, NOW())
				ON CONFLICT
					(name)
				DO UPDATE SET
					date_edited = NOW(),
					date_user_created = COALESCE(publisher.date_user_created, NOW())
				RETURNING
					id
			`,
			[name, currUserId]
		);
		if (result.rowCount) {
			return result.rows[0].id;
		}
	}
	{
		const result = await querier(
			`
				SELECT
					id
				FROM
					publisher
				WHERE
					name = $1
			`,
			[name]
		);
		if (!result.rowCount) {
			throw new Error("unexpected error [1]");
		}
		return result.rows[0].id;
	}
};
