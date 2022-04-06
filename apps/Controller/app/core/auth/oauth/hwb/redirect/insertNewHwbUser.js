const crypto = require("crypto");
const util = require("util");

const genRandomBytes = util.promisify(crypto.randomBytes);

const hideEmail = require("./hideEmail");

const generateRandomEmail = async () => {
	const rand = (await genRandomBytes(16)).toString("hex");
	return "hwb_" + rand + "@hwb.com";
};

module.exports = async (querier, azureUserDetails, matchedUser, matchType) => {
	const sql = `
			INSERT INTO
				cla_user
				(
					role,
					school_id,
					email,
					title,
					first_name,
					last_name,
					source,
					status,
					hwb_user_identifier,
					hwb_default_merge_user_id,
					hwb_match_type,
					hwb_email,
					date_status_changed,
					date_last_registration_activity,
					activation_token,
					activation_token_expiry,
					hwb_match_email
				)
			VALUES
				(
					'teacher',
					$1,
					$2,
					$3,
					$4,
					$5,
					'hwb',
					'unverified',
					$6,
					$7,
					$8,
					$9,
					NOW(),
					NOW(),
					encode(gen_random_bytes(18), 'hex'),
					NOW() + interval '10 years',
					$10
				)
			RETURNING
				id
		`;
	const binds = [
		azureUserDetails.school_id,
		azureUserDetails.email,
		azureUserDetails.title,
		azureUserDetails.first_name,
		azureUserDetails.last_name,
		azureUserDetails.identifier,
		matchedUser ? matchedUser.id : null,
		matchType,
		azureUserDetails.email,
		matchType === "email" ? azureUserDetails.email : matchType === "fuzzy" ? hideEmail(matchedUser.email) : null,
	];
	try {
		return (await querier(sql, binds)).rows[0].id;
	} catch (e) {
		if (e.message.indexOf("violates unique constraint") >= 0 && e.message.indexOf("email") >= 0) {
			binds[1] = await generateRandomEmail();
			return (await querier(sql, binds)).rows[0].id;
		}
		throw e;
	}
};
