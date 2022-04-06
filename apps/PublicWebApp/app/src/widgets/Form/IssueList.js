import Issue from "./Issue";

export default class IssueList {
	byType = Object.create(null);
	byTypeArray = Object.create(null);
	byName = Object.create(null);
	array = [];

	hasError() {
		return this.byType.error;
	}

	addIssue(issue, field) {
		issue.field = field;
		if (!this.byType[issue.type]) {
			this.byType[issue.type] = Object.create(null);
			this.byTypeArray[issue.type] = [];
		}
		this.byType[issue.type][field.name] = issue;
		this.byTypeArray[issue.type].push(issue);
		this.byName[field.name] = issue;
		this.array.push(issue);
	}
}
