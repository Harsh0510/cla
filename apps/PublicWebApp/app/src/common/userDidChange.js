const deepEqual = require("deep-equal");

export default (props1, props2) => {
	const currUser = props1.withAuthConsumer_myUserDetails;
	const oldUser = props2.withAuthConsumer_myUserDetails;
	if (!deepEqual(currUser, oldUser)) {
		if (currUser && !oldUser) {
			return true;
		}
		if (oldUser && !currUser) {
			return true;
		}
		for (const key in currUser) {
			if (oldUser[key] !== currUser[key]) {
				return true;
			}
		}
	}
	return false;
};
