const { getApprovedSchoolIds } = require("../../../../../common/wonde/wonde.js");
const consoleLog = require("../../../../../common/consoleLog");
const wait = require("../../../../../common/wait");

module.exports = async (querier) => {
	let currPage = 1;
	while (true) {
		consoleLog("syncWondeSchoolData", "getApprovedSchoolIds", currPage);
		/**
		 * Fetch one page at a time to preserve memory.
		 * Some API calls return 40k+ objects, which can easily exhaust memory on resource-constrained cloud servers.
		 */
		const approvedSchools = await getApprovedSchoolIds(null, currPage);
		if (!approvedSchools.data.length) {
			break;
		}
		const values = [];
		const binds = [];

		for (const wondeSchoolIdentifier of approvedSchools.data) {
			values.push("$" + binds.push(wondeSchoolIdentifier));
		}

		await querier(
			`
				UPDATE 
					school
				SET 
					wonde_approved = TRUE,
					date_edited = NOW()
				WHERE
					school.wonde_identifier IN (${values.join(", ")})
			`,
			binds
		);

		if (!approvedSchools.has_more) {
			break;
		}

		currPage++;
		await wait(100);
	}
};
