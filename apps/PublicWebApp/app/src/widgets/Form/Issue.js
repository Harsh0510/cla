export default class Issue {
	constructor(message, type) {
		this.message = message;
		this.type = type;
	}
	isEmpty() {
		return !this.type;
	}
	hasError() {
		return this.type === "error";
	}
	getError() {
		return this.hasError() ? this.message : null;
	}
}
