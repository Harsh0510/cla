module.exports = async (querier, wondeDataRows, sqlFetcher) => {
	try {
		const res = await sqlFetcher(wondeDataRows);
		return (await querier(res.query, res.binds)).rows;
	} catch (e) {
		if (e.message.indexOf("violates unique constraint") === -1) {
			throw e;
		}
	}
	const ret = [];
	for (const userRow of wondeDataRows) {
		const res = await sqlFetcher([userRow]);
		try {
			const result = (await querier(res.query, res.binds)).rows;
			for (const r of result) {
				ret.push(r);
			}
		} catch (e) {
			if (e.message.indexOf("violates unique constraint") === -1) {
				throw e;
			}
		}
	}
	return ret;
};
