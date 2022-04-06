module.exports = async (querier, currUserId, normalizedAuthors) => {
	if (!normalizedAuthors.length) {
		return [];
	}
	const values = [];
	const binds = [];
	const userBindIdx = binds.push(currUserId);
	for (const author of normalizedAuthors) {
		values.push(`($${binds.push(author.firstName)}, $${binds.push(author.lastName)}, $${userBindIdx}, NULL, NOW())`);
	}
	return (
		await querier(
			`
				INSERT INTO
					author
					(
						first_name,
						last_name,
						modified_by_user_id,
						date_system_created,
						date_user_created
					)
				VALUES
					${values.join(", ")}
				ON CONFLICT
					(first_name, last_name)
				DO UPDATE SET
					date_edited = NOW(),
					date_user_created = COALESCE(author.date_user_created, NOW())
				RETURNING
					id,
					first_name,
					last_name
			`,
			binds
		)
	).rows;
};
