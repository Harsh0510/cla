const emitEvent = (name, category, action, label, userId) => {
	const data = {};
	if (name) {
		data.event = name;
	}
	if (category) {
		data.eventCategory = category;
	}
	if (action) {
		data.eventAction = action;
	}
	if (label) {
		data.eventLabel = label;
	}
	if (userId) {
		data.userId = userId;
	}
	window.dataLayer.push(data);
};

export default emitEvent;
