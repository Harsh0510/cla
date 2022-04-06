const { getRevokedSchoolIds } = require("../../../../../common/wonde/wonde.js");
const consoleLog = require("../../../../../common/consoleLog");
const wait = require("../../../../../common/wait");

module.exports = async (querier) => {
	let currPage = 1;
	while (true) {
		consoleLog("syncWondeSchoolData", "getRevokedSchoolIds", currPage);
		/**
		 * Fetch one page at a time to preserve memory.
		 * Some API calls return 40k+ objects, which can easily exhaust memory on resource-constrained cloud servers.
		 */
		const revokedSchools = await getRevokedSchoolIds(null, currPage);
		if (!revokedSchools.data.length) {
			break;
		}
		const values = [];
		const binds = [];

		for (const wondeSchoolIdentifier of revokedSchools.data) {
			values.push("$" + binds.push(wondeSchoolIdentifier));
		}

		await querier(
			`
				UPDATE 
					school
				SET 
					wonde_approved = FALSE,
					date_edited = NOW()
				WHERE
					school.wonde_identifier IN (${values.join(", ")})
			`,
			binds
		);

		if (!revokedSchools.has_more) {
			break;
		}

		currPage++;
		await wait(100);
	}
};
