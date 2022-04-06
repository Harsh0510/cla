const sendEmailChunk = require("./sendEmailChunk");
const doRollover = require("./doRollover");

const sendFirstEmail = require("./emailSenderFirst");
const sendSecondEmail = require("./emailSenderSecond");
const sendThirdEmail = require("./emailSenderLast");

const actions = Object.create(null);

// happens (typically) 14 days before target execution date (but depends on value of '../lib/rolloverIntervalForFirstEmail.js')
actions["scheduled"] = async (querier, rolloverJobId, targetExecutionDate) => {
	// send the first rollover email and then set status to 'rollover-email-1'
	await sendEmailChunk(
		querier,
		rolloverJobId,
		targetExecutionDate,
		"rollover-email-1",
		"rollover-email-1",
		"target_execution_date - INTERVAL '1 day'",
		sendFirstEmail
	);
};

// happens 1 day before target execution date
actions["rollover-email-1"] = async (querier, rolloverJobId, targetExecutionDate) => {
	// send the second rollover email and then set status to 'rollover-email-2'
	await sendEmailChunk(querier, rolloverJobId, targetExecutionDate, "rollover-email-2", "rollover-email-2", "target_execution_date", sendSecondEmail);
};

// happens ON the target execution date
actions["rollover-email-2"] = async (querier, rolloverJobId) => {
	// actually do the rollover and then set status to 'rolled-over'
	await doRollover(querier, rolloverJobId);

	await querier(
		`
			UPDATE
				rollover_job
			SET
				status = 'rolled-over',
				next_execution_date = target_execution_date + INTERVAL '2 weeks'
			WHERE
				id = $1
		`,
		[rolloverJobId]
	);
};

// happens 14 days after the target execution date
actions["rolled-over"] = async (querier, rolloverJobId, targetExecutionDate) => {
	// send the third rollover email and then set status to 'completed' AND next_execution_date to NULL
	await sendEmailChunk(querier, rolloverJobId, targetExecutionDate, "rollover-email-3", "completed", "NULL", sendThirdEmail);
};

module.exports = actions;
