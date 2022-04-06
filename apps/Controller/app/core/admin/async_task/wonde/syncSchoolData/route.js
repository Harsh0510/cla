const pushTask = require("./pushTask");
const { syncFor, fetchLastExecutedDate, addSyncLog } = require("../../../../../common/wondeSyncLog");
const updateSchools = require("./updateSchools");
const updateRevokedSchools = require("./updateRevokedSchools");
const updateApprovedSchools = require("./updateApprovedSchools");
const fetchEnvSettings = require("../../../../../common/fetchEnvSettings");

const SYNC_LOG_TYPE = syncFor.school;

module.exports = async function (taskDetails) {
	const pool = taskDetails.getAppDbPool();
	const querier = pool.query.bind(pool);
	try {
		const envData =
			(await fetchEnvSettings(querier, [
				"wonde_school_sync__disable_filtering",
				"wonde_school_sync__only_approved",
				"wonde_school_sync__fetch_all_schools",
				"wonde_school_sync__page_range",
			])) || {};
		let lastExecuted;
		if (!envData.wonde_school_sync__fetch_all_schools) {
			lastExecuted = await fetchLastExecutedDate(taskDetails, SYNC_LOG_TYPE);
		}

		await updateSchools(querier, lastExecuted, {
			disable_filtering: envData.wonde_school_sync__disable_filtering,
			page_range: envData.wonde_school_sync__page_range,
			only_approved: envData.wonde_school_sync__only_approved,
		});
		await updateApprovedSchools(querier);
		await updateRevokedSchools(querier);

		//add oe update sync log for add executed date in wonde_sync_log table for school
		await addSyncLog(taskDetails, SYNC_LOG_TYPE);
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
