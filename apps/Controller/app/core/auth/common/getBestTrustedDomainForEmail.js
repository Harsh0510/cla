module.exports = async function (email, querier) {
	const domainParts = email.split("@").pop().split(".");
	const emails = [];
	const bindIdxs = [];
	for (let i = 0, len = domainParts.length; i < len; ++i) {
		const bindIdx = emails.push(domainParts.slice(i).join("."));
		bindIdxs.push("$" + bindIdx);
	}
	const result = await querier(
		`
			SELECT
				id,
				domain
			FROM
				trusted_domain
			WHERE
				domain IN (${bindIdxs.join(",")})
			ORDER BY
				number_of_periods DESC
		`,
		emails
	);
	return result.rowCount ? result.rows[0] : null;
};
