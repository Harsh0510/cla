const loginUserFields = require("../common/loginUserFields");

const fetchUserByHwbId = async (querier, hwbId) => {
	return (
		await querier(
			`
			SELECT
				${loginUserFields},
				cla_user.status AS status
			FROM
				cla_user
			LEFT JOIN school
				ON cla_user.school_id = school.id
			WHERE
				cla_user.hwb_user_identifier = $1
		`,
			[hwbId]
		)
	).rows[0];
};

const fetchMatchingUserByEmail = async (querier, email) => {
	return (
		await querier(
			`
				SELECT
					id,
					oid,
					email
				FROM
					cla_user
				WHERE
					email = $1
					AND status = 'registered'
					AND hwb_user_identifier IS NULL
			`,
			[email]
		)
	).rows[0];
};

const fetchMatchingUserByFuzzyMatch = async (querier, firstName, lastName, schoolId) => {
	return (
		await querier(
			`
				SELECT
					id,
					oid,
					email
				FROM
					cla_user
				WHERE
					first_name = $1
					AND last_name = $2
					AND school_id = $3
					AND status = 'registered'
					AND hwb_user_identifier IS NULL
			`,
			[firstName, lastName, schoolId]
		)
	).rows[0];
};

const fetchUserById = async (querier, userDbId) => {
	return (
		await querier(
			`
				SELECT
					${loginUserFields},
					cla_user.status AS status
				FROM
					cla_user
				LEFT JOIN school
					ON cla_user.school_id = school.id
				WHERE
					cla_user.id = $1
			`,
			[userDbId]
		)
	).rows[0];
};

const fetchMatchingUser = async (querier, azureUserDetails) => {
	let matchedUser = await fetchMatchingUserByEmail(querier, azureUserDetails.email);
	if (matchedUser) {
		return [matchedUser, "email"];
	}
	matchedUser = await fetchMatchingUserByFuzzyMatch(querier, azureUserDetails.first_name, azureUserDetails.last_name, azureUserDetails.school_id);
	if (matchedUser) {
		return [matchedUser, "fuzzy"];
	}
	return [null, "none"];
};

module.exports = {
	fetchUserByHwbId,
	fetchUserById,
	fetchMatchingUser,
};
