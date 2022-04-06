import React from "react";
import Form from "./Form.js";
import { Redirect } from "react-router-dom";

const FLYOUT_INDEX_ON_COURSE = 0; // flyout option index
const FLYOUT_INDEX_ON_SUBMIT = 1; // flyout option index

export default class CreateCopyForm extends React.PureComponent {
	state = {
		pages: "",
		errorMessage: true,
		redirectToCreateClass: false,
		selectedClass: null,
		isShowTooltip: false,
	};

	handlePagesChange = (e) => {
		const raw = e.target.value;
		const cleaned = raw.replace(/[^0-9,-]+/g, "");

		this.setState({
			pages: cleaned,
		});
	};

	handleDrpChange = (name, select_class, valid) => {
		this.setState({
			selectedClass: select_class,
			isShowTooltip: false,
		});

		//move to next flyout if any
		if (this.props.flyOutIndex === FLYOUT_INDEX_ON_COURSE) {
			this.props.onCloseFlyOut();
		}
	};

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.selectedClass === undefined || this.state.selectedClass === null) {
			this.setState({ errorMessage: false, isShowTooltip: true });
		} else {
			this.props.onCreateCopySubmit(this.state.selectedClass.value);
		}
		//move to next flyout if any
		if (this.props.flyOutIndex === FLYOUT_INDEX_ON_SUBMIT) {
			this.props.onCloseFlyOut();
		}
	};

	render() {
		const canCopy = this.props.userData ? this.props.userData.can_copy : false;
		const hasVerified = this.props.userData ? this.props.userData.has_verified : false;
		if (this.state.redirectToCreateClass) {
			return <Redirect to="/profile/admin/classes?action=new" />;
		}

		return (
			<Form
				pages={this.state.pages}
				selectedClass={this.state.selectedClass}
				handleSubmit={this.handleSubmit}
				handlePagesChange={this.handlePagesChange}
				fields={this.state.fields}
				handleCourseChange={this.handleDrpChange}
				errorMessage={this.state.errorMessage}
				canCopy={canCopy}
				hasVerified={hasVerified}
				isShowTooltip={this.state.isShowTooltip}
				{...this.props}
			/>
		);
	}
}
