const { getClassesForSchool } = require("../../../../../common/wonde/wonde.js");
const wait = require("../../../../../common/wait");
const bindInsertData = require("./bindInsertData");
const { getFilteredRecords, getExcludedWondeIdentifiers } = require("./getFilteredRecords");
const smartUpsert = require("../common/smartUpsert.js");

module.exports = async (querier, wondeSchoolIdentifier, localSchoolDbId) => {
	const excludedWondeIdentifiers = await getExcludedWondeIdentifiers(querier);
	let currPage = 1;
	while (true) {
		const wondeResult = await getClassesForSchool(wondeSchoolIdentifier, currPage);
		const wondeData = getFilteredRecords(excludedWondeIdentifiers, wondeResult.data);
		if (wondeData.length) {
			await smartUpsert(querier, wondeData, (rows) => bindInsertData(rows, localSchoolDbId));
		}
		if (!wondeResult.has_more) {
			break;
		}
		await wait(100);
		currPage++;
	}
};
