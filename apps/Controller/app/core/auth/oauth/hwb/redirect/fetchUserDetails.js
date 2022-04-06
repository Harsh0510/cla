const jwt = require("jsonwebtoken");

const env = require("../common/env");

module.exports = async (querier, idToken) => {
	let deets;
	if (env.idTokenSymmetricKey) {
		deets = jwt.verify(idToken, env.idTokenSymmetricKey);
	} else {
		deets = jwt.decode(idToken);
	}
	if (!deets) {
		return null;
	}
	let schoolId = null;
	if (deets.physicalDeliveryOfficeName) {
		const result = await querier(
			`
				SELECT
					id
				FROM
					school
				WHERE
					hwb_identifier = $1
			`,
			[deets.physicalDeliveryOfficeName]
		);
		if (!result.rowCount) {
			return null;
		}
		schoolId = result.rows[0].id;
	}
	return {
		identifier: deets.oid,
		title: "Ms",
		first_name: deets.given_name,
		last_name: deets.family_name,
		email: deets.upn.trim().toLowerCase(),
		school_id: schoolId,
	};
};
