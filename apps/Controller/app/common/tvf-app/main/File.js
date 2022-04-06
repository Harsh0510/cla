module.exports = class File {
	constructor(file) {
		this.size = file.size;
		this.name = file.name;
		this.path = file.path;
		this.type = file.type;
	}
};
