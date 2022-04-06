module.exports = {
	getDefault(userTableName = "cla_user") {
		return `concat_ws('', ${userTableName}.title, '. ', ${userTableName}.last_name)`;
	},
	getFinal(userTableName = "cla_user") {
		return `COALESCE(${userTableName}.name_display_preference, ${this.getDefault(userTableName)})`;
	},
};
