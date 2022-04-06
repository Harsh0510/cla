module.exports = {
	getDefault(obj) {
		return obj.title + ". " + obj.last_name;
	},
	getFinal(obj) {
		if (obj.name_display_preference) {
			return obj.name_display_preference;
		}
		return this.getDefault(obj);
	},
};
