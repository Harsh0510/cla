const { getUsersForSchool } = require("../../../../../common/wonde/wonde.js");
const sendEmail = require("../../../../../common/sendEmail");
const sendActivateEmail = require("../../../../auth/common/sendActivateEmail");
const wait = require("../../../../../common/wait");
const { getFilteredRecords, getExcludedWondeIdentifiers } = require("./getFilteredRecords");
const upsertWondeUsers = require("./upsertWondeUsers");

module.exports = async (querier, wondeSchoolIdentifier, localSchoolDbId, localSchoolName) => {
	const excludedWondeIdentifiers = await getExcludedWondeIdentifiers(querier);
	let currPage = 1;
	while (true) {
		const wondeUserResult = await getUsersForSchool(wondeSchoolIdentifier, currPage);
		const wondeData = getFilteredRecords(excludedWondeIdentifiers, wondeUserResult.data);
		if (wondeData.length) {
			const upsertedUsers = await upsertWondeUsers(querier, localSchoolDbId, wondeData);

			for (const user of upsertedUsers) {
				if (user.did_register) {
					await sendActivateEmail(sendEmail, user.email, user.activation_token, user.title, user.last_name, localSchoolName);
				}
			}
		}
		if (!wondeUserResult.has_more) {
			break;
		}
		currPage++;
		await wait(100);
	}
};
