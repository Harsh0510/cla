import React from "react";
import theme from "../../common/theme";
import CustomFormData from "../../common/CustomFormData";
import {
	FormWrapAddEdit,
	FormMessage,
	FormBodyContainer,
	FormContainerFull,
	FormContainerButton,
	FormContainerHalf,
	FormTopCornerCancel,
	FormSectionTopRow,
	FormSectionHalf,
	FormError,
	FormInput,
	FormSaveButton,
	FormDeleteButton,
	FormConfirmBox,
	FormConfirmBoxText,
	FormConfirmBoxButtonNo,
} from "../../widgets/AdminStyleComponents";
import styled from "styled-components";

const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";

const CONFIRM_DIALOG_NONE = "";
const CONFIRM_DIALOG_DELETE = "delete";

const WrapDomain = styled(FormInput)`
	@media screen and (max-width: ${theme.breakpoints.desktop3}) {
		width: calc(100% - 78px);
	}
`;

export default class TrustedDomainAddEdit extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show_confirm_dialog: CONFIRM_DIALOG_NONE,
			setOption: {
				value: "",
				label: "",
			},
			domain_field_error: null,
		};

		this.handleDomainChange = this.handleDomainChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.message !== prevProps.message) {
			this.setState({
				show_confirm_dialog: CONFIRM_DIALOG_NONE,
				domain_field_error: null,
			});
		}
	}

	doSubmit = (e) => {
		e.preventDefault();
		const fd = CustomFormData(e.target);
		const data = Object.create(null);
		for (const item of fd.entries()) {
			data[item[0]] = item[1];
		}
		this.props.handleSubmit(data);
	};

	doDismissRejectDialog = (e) => {
		e.preventDefault();
		this.setState({
			show_confirm_dialog: CONFIRM_DIALOG_NONE,
		});
	};

	doShowConfirmDelete = (e) => {
		e.preventDefault();
		this.setState({
			show_confirm_dialog: CONFIRM_DIALOG_DELETE,
		});
	};

	doDelete = (e) => {
		e.preventDefault();
		this.props.deleteData();
	};

	handleDomainChange(e) {
		e.preventDefault();
		const raw = e.target.value;
		let valid = true;
		const newState = {
			domain_field_error: null,
		};

		if (raw.match(/^\s/)) {
			valid = false;
		}

		if (valid) {
			newState.domain_field_error = null;
		} else {
			newState.domain_field_error = "spaces not allowed";
		}

		this.setState(newState);
	}

	render() {
		const { cancelAddEdit, message, fields, action } = this.props;
		let confirmBox = false;

		if (this.state.show_confirm_dialog === CONFIRM_DIALOG_DELETE) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>This action is irreversible. Please be sure you wish to delete this item.</FormConfirmBoxText>
					<FormDeleteButton type="button" onClick={this.doDelete} name="delete-Confirm">
						Confirm
					</FormDeleteButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog} name="delete-Cancel">
						Cancel
					</FormConfirmBoxButtonNo>
				</FormConfirmBox>
			);
		}

		return (
			<FormWrapAddEdit onSubmit={this.doSubmit}>
				<FormSectionTopRow>
					<FormSectionHalf></FormSectionHalf>
					<FormSectionHalf>
						<FormTopCornerCancel type="button" to="/" title="Return to Top" className="close_btn" onClick={cancelAddEdit}>
							Return to Top
							<i className="fa fa-times" size="sm" />
						</FormTopCornerCancel>
					</FormSectionHalf>
				</FormSectionTopRow>

				{message ? <FormMessage className="message">{message}</FormMessage> : null}

				<FormBodyContainer>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="title">Domain ending in:</label>
							<div>
								example@
								<WrapDomain
									isLabel={true}
									id="domain"
									type="text"
									name="domain"
									placeholder="educationplatform.com"
									defaultValue={fields.domain}
									required
									onChange={this.handleDomainChange}
								/>
								{this.state.domain_field_error ? <FormError>{this.state.domain_field_error}</FormError> : null}
							</div>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerButton>
						{action === ACTION_NEW || action === ACTION_ADDED ? (
							<FormSaveButton
								type="submit"
								name="create-TrustedDomain"
								value="create-TrustedDomain"
								disabled={this.state.domain_field_error ? true : false}
							>
								Create Domain
							</FormSaveButton>
						) : action === ACTION_EDIT ? (
							<>
								<FormSaveButton
									type="submit"
									hide={!!confirmBox}
									name="update-TrustedDomain"
									value="update-TrustedDomain"
									disabled={this.state.domain_field_error ? true : false}
								>
									Update
								</FormSaveButton>

								<FormDeleteButton type="button" hide={!!confirmBox} onClick={this.doShowConfirmDelete}>
									Delete
								</FormDeleteButton>
							</>
						) : null}
						{confirmBox}
					</FormContainerButton>
				</FormBodyContainer>
			</FormWrapAddEdit>
		);
	}
}
