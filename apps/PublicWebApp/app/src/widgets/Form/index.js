import React from "react";
import styled, { css } from "styled-components";
import DefaultIssueReportComponent from "./DefaultIssueReportComponent";
import Fields from "./Fields";
import DefaultActionsComponent from "./DefaultActionsComponent";
import IssueList from "./IssueList";
import Issue from "./Issue";
import debounce from "../../common/debounce";

const FormWrap = styled.form`
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
			opacity: 0.5;
		`}
`;

const FieldsWrap = styled.div``;

const Button = styled.button`
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
		`}
`;

function getValidatorsForField(field, allValidators) {
	let funcs;
	if (typeof allValidators[field.name] === "function") {
		funcs = [allValidators[field.name]];
	} else if (Array.isArray(allValidators[field.name])) {
		funcs = allValidators[field.name];
	}
	return funcs;
}

function getValidationIssueForField(field, allValidators, allValues) {
	const validators = getValidatorsForField(field, allValidators);
	if (!validators) {
		return null;
	}
	for (let i = 0, len = validators.length; i < len; ++i) {
		let issue = validators[i](allValues[field.name], field);
		if (!issue) {
			continue;
		}
		if (typeof issue === "string") {
			return new Issue(issue, "error");
		}
		return new Issue(issue.message, issue.type || "error");
	}
	return null;
}

export default class Form extends React.PureComponent {
	changedFields = Object.create(null);

	_getValidationIssues(values) {
		const issues = new IssueList();
		if (!this.props.validators) {
			return issues;
		}
		for (let i = 0, len = this.props.fields.length; i < len; ++i) {
			const field = this.props.fields[i];
			const issue = getValidationIssueForField(field, this.props.validators, values);
			if (issue) {
				issues.addIssue(issue, field);
			}
		}
		return issues;
	}

	constructor(...args) {
		super(...args);
		const values = {};
		for (const f of this.props.fields) {
			values[f.name] = this.props.values[f.name] || "";
		}
		this.state = {
			values: values,
			issues: new IssueList(),
		};
	}

	componentDidMount() {
		const newState = {};
		newState.values = {};
		if (this.props.values) {
			Object.assign(newState.values, this.props.values);
		}
		newState.issues = this._getValidationIssues(newState.values);
		this.setState(newState);
	}

	onSubmit = (e) => {
		if (e) {
			e.preventDefault();
		}
		if (this.props.disabled) {
			return;
		}
		const issues = this._getValidationIssues(this.state.values);
		this.setState({ issues: issues });
		if (issues.byType.error) {
			return;
		}
		if (typeof this.props.onSubmit === "function") {
			this.props.onSubmit(this.state.values);
		}
	};

	debouncedOnChange = debounce(() => {
		const issues = this._getValidationIssues(this.state.values);
		this.setState({ issues: issues });
		if (!issues.byType.error) {
			if (typeof this.props.onChange === "function") {
				this.props.onChange(this.state.values, this.changedFields);
			}
			this.changedFields = Object.create(null);
		}
	}, 150);

	onChange = (value, idx) => {
		const newValues = Object.assign({}, this.state.values);
		newValues[this.props.fields[idx].name] = value;
		this.changedFields[this.props.fields[idx].name] = value;
		this.setState({ values: newValues }, this.debouncedOnChange);
	};

	render() {
		const p = this.props;
		const IssueReportComponent = p.IssueReportComponent || DefaultIssueReportComponent;
		const FormWrapComponent = p.FormWrapComponent || FormWrap;
		const FieldsWrapComponent = p.FieldsWrapComponent || FieldsWrap;
		const ButtonComponent = p.ButtonComponent || Button;
		const ActionsComponent = p.ActionsComponent || DefaultActionsComponent;
		const actionsProps = p.actionProps || {};
		return (
			<FormWrapComponent onSubmit={this.onSubmit} disabled={p.disabled}>
				<IssueReportComponent issues={this.state.issues} />
				<FieldsWrapComponent>
					<Fields
						wrap={p.FieldWrapComponent}
						fields={p.fields}
						values={this.state.values}
						onChange={this.onChange}
						issues={this.state.issues.byName}
					/>
				</FieldsWrapComponent>
				<ActionsComponent
					ButtonComponent={ButtonComponent}
					disabled={p.disabled || this.state.issues.byType.error}
					submit_text={p.submit_text}
					{...actionsProps}
				/>
			</FormWrapComponent>
		);
	}
}
