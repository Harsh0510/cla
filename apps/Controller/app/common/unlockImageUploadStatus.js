let unlock_image_status = [
	{
		id: "pending",
		name: "Pending",
	},
	{
		id: "awaiting",
		name: "Awaiting",
	},
	{
		id: "rejected",
		name: "Rejected",
	},
	{
		id: "approved",
		name: "Approved",
	},
	{
		id: "approved-pending",
		name: "Approved (Pending)",
	},
];

let statusById = Object.create(null);
for (const status of unlock_image_status) {
	statusById[status.id] = status.id;
}

let statusByName = Object.create(null);
for (const status of unlock_image_status) {
	statusByName[status.id] = status.name;
}

module.exports = {
	imageUploadStatus: unlock_image_status,
	statusById: statusById,
	statusByName: statusByName,
};
