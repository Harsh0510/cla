const fields = ["user_id", "user_email", "school_id", "school_name", "isbn", "status", "asset_id", "event", "oid", "asset_title", "publisher_name"];

const getObj = (values) => {
	const formatedUnlockAttemptValues = Object.create(null);
	for (const key of fields) {
		formatedUnlockAttemptValues[key] = values[key];
	}
	return formatedUnlockAttemptValues;
};

module.exports = {
	fields,
	getObj,
};
