import React from "react";
import { FormDeleteButton, FormConfirmBox, FormConfirmBoxText, FormConfirmBoxButtonNo } from "../../widgets/AdminStyleComponents";

export default class Confirmbox extends React.PureComponent {
	doDismissRejectDialog = (e) => {
		e.preventDefault();
		this.props.onCancle();
	};

	doConfirm = (e) => {
		e.preventDefault();
		this.props.onConfirm();
	};

	render() {
		const confirmBoxText = {
			added: "Are you sure you want to schedule a new rollover '" + this.props.rolloverJobName + "'?",
			new: "Are you sure you want to schedule a new rollover '" + this.props.rolloverJobName + "'?",
			edit: "This action is irreversible. Please be sure you wish to delete '" + this.props.rolloverJobName + "'",
		};
		let confirmBox = false;
		if (this.props.isShow) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>{confirmBoxText[this.props.action]}</FormConfirmBoxText>
					<FormDeleteButton type="button" onClick={this.doConfirm}>
						Confirm
					</FormDeleteButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog}>
						Cancel
					</FormConfirmBoxButtonNo>
				</FormConfirmBox>
			);
		}

		return confirmBox;
	}
}
