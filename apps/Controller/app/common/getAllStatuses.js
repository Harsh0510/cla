let all_available_status = [
	{
		id: "unverified",
		name: "Unverified",
	},
	{
		id: "pending",
		name: "Pending",
	},
	{
		id: "approved",
		name: "Approved",
	},
	{
		id: "registered",
		name: "Registered",
	},
];

let statusById = Object.create(null);
for (const status of all_available_status) {
	statusById[status.id] = status.id;
}

let statusByName = Object.create(null);
for (const status of all_available_status) {
	statusByName[status.id] = status.name;
}

module.exports = {
	listStatusArr: all_available_status,
	statusById: statusById,
	statusByName: statusByName,
};
