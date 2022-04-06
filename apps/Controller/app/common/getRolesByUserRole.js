module.exports = function (userRole) {
	let resultRoles = [];

	if (userRole === "cla-admin") {
		resultRoles = [
			{
				id: "teacher",
				name: "User",
			},
			{
				id: `cla-admin`,
				name: `CLA Admin`,
			},
			{
				id: "school-admin",
				name: "Institution Admin",
			},
		];
	} else if (userRole === "school-admin") {
		resultRoles = [
			{
				id: "teacher",
				name: "User",
			},
			{
				id: "school-admin",
				name: "Institution Admin",
			},
		];
	}
	return resultRoles;
};
