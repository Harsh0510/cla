import React from "react";
import theme from "../../common/theme";
import CustomFormData from "../../common/CustomFormData";
import RegExPatterns from "../../common/RegExPatterns";
import NameInputField from "../../widgets/NameInputField";
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
	FormCustomSelect,
	FormSaveButton,
	FormDeleteButton,
	FormResetButton,
	FormConfirmBox,
	FormConfirmBoxText,
	FormConfirmBoxButtonNo,
	FormFieldsDisabledMessage,
	FormSelectSearch,
	FormAutoSelect,
	FormHiddenSchool,
	formCustomStyles,
} from "../../widgets/AdminStyleComponents";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import staticValues from "../../common/staticValues";

const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";

const CONFIRM_DIALOG_NONE = "";
const CONFIRM_DIALOG_DELETE = "delete";
const CONFIRM_DIALOG_RESET_PASSWORD = "reset-password";

export default class UserAddEdit extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show_confirm_dialog: CONFIRM_DIALOG_NONE,
			firstNameisValid: true,
			lastNameisValid: true,
			setOption: {
				value: "",
				label: "",
			},
		};
		this.doNameInputFieldChange = this.doNameInputFieldChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.message !== prevProps.message) {
			this.setState({
				show_confirm_dialog: CONFIRM_DIALOG_NONE,
				firstNameisValid: true,
				lastNameisValid: true,
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

	doShowConfirmResetPassword = (e) => {
		e.preventDefault();
		this.setState({
			show_confirm_dialog: CONFIRM_DIALOG_RESET_PASSWORD,
		});
	};

	doDeleteUser = (e) => {
		e.preventDefault();
		this.props.deleteUser();
	};

	doResetPassword = (e) => {
		e.preventDefault();
		this.props.resetPassword();
	};

	/**School drop down */
	schoolsDropdown(fields) {
		let selectedSchool = Object.create(null);
		if (this.props.fields.school_id) {
			selectedSchool.value = this.props.fields.school_id;
			selectedSchool.label = this.props.fields.school_name;
		} else {
			selectedSchool = null;
		}

		return (
			<div style={{ marginBottom: "15px" }}>
				<AjaxSearchableDropdown
					name="school"
					title={"Institution:"}
					value={selectedSchool}
					placeholder="Select"
					onChange={this.props.handleDrpChange}
					requestApi={staticValues.api.schoolRequestApi}
					minQueryLength={3}
					labelIsOnTop={true}
					required={true}
					showDefaultToolTipOnError={true}
					api={this.props.api}
				/>
			</div>
		);
	}

	doHandleDrpRole = (e) => {
		e.preventDefault();
		this.props.handleDrpRole(e.target.value);
	};

	doNameInputFieldChange(inputFieldValue, inputFieldName, isValid) {
		switch (inputFieldName) {
			case "first_name":
				this.setState({ firstNameisValid: isValid });
				break;
			case "last_name":
				this.setState({ lastNameisValid: isValid });
				break;
		}
		this.props.handleNameInputField(inputFieldValue, inputFieldName);
	}

	render() {
		const { cancelAddEdit, message, fields, action, userRoles, userTitles } = this.props;

		let confirmBox = null;

		if (this.state.show_confirm_dialog === CONFIRM_DIALOG_DELETE) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>Are you sure you wish to delete this user? This action is irreversible, please be sure.</FormConfirmBoxText>
					<FormDeleteButton type="button" onClick={this.doDeleteUser}>
						Yes
					</FormDeleteButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog}>
						No
					</FormConfirmBoxButtonNo>
				</FormConfirmBox>
			);
		} else if (this.state.show_confirm_dialog === CONFIRM_DIALOG_RESET_PASSWORD) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>
						This user will be sent a new password link. They must activate the link in 24 hours. Click OK to continue.
					</FormConfirmBoxText>
					<FormResetButton type="button" onClick={this.doResetPassword}>
						OK
					</FormResetButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog}>
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
				{message ? <FormMessage className="message"> {message}</FormMessage> : null}
				<FormBodyContainer>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="role">Role: </label>
							<FormCustomSelect
								disabled={!fields.can_edit_blocked_fields && this.props.blockedFields.has("role")}
								name="role"
								required
								defaultValue={fields.role}
								onChange={this.doHandleDrpRole}
							>
								<option key="_select" value="">
									Select role
								</option>
								{userRoles.map((item) => (
									<option key={item.id} value={item.id}>
										{item.title}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="title">Title: </label>
							<FormCustomSelect
								disabled={!fields.can_edit_blocked_fields && this.props.blockedFields.has("title")}
								name="title"
								required
								defaultValue={fields.title}
							>
								<option key="_select" value="">
									Select title
								</option>
								{userTitles.map((item) => (
									<option key={item} value={item}>
										{item}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="first_name">First Name:</label>
							<NameInputField
								name="first_name"
								placeholder="First name"
								defaultValue={fields.first_name}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.name}
								minLength={1}
								maxLength={100}
								fieldName={"name"}
								isRequired={true}
								disabled={!fields.can_edit_blocked_fields && this.props.blockedFields.has("first_name")}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="last_name">Last Name:</label>
							<NameInputField
								name="last_name"
								placeholder="Last name"
								defaultValue={fields.last_name}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.name}
								minLength={1}
								maxLength={100}
								fieldName={"name"}
								isRequired={true}
								disabled={!fields.can_edit_blocked_fields && this.props.blockedFields.has("last_name")}
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="email">Email:</label>
							<FormInput
								disabled={!fields.can_edit_blocked_fields && this.props.blockedFields.has("role")}
								type="email"
								name="email"
								placeholder="Email"
								defaultValue={fields.email}
								required
							/>
						</FormContainerHalf>
						{/* Selecting a school from the drop-down is required, but only if the selected role is not CLA Admin. E.g. if the user selects a role of 'Teacher' then the school is required. If the user selects a role of 'CLA Admin' then the school is not required */}
						{this.props.currentUserRole === "cla-admin" && fields.role !== "cla-admin" ? (
							<FormContainerHalf>
								{action === ACTION_NEW || action === ACTION_ADDED ? (
									this.schoolsDropdown(fields)
								) : (
									<>
										<label htmlFor="school">Institution Name: </label>
										<FormInput
											disabled={!fields.can_edit_blocked_fields && this.props.blockedFields.has("school")}
											readOnly
											name="school"
											value={fields.school_name}
										/>
									</>
								)}
							</FormContainerHalf>
						) : (
							<FormContainerHalf hideInMobile={true}> &nbsp;</FormContainerHalf>
						)}
					</FormContainerFull>

					<FormContainerButton>
						{action === ACTION_NEW || action === ACTION_ADDED ? (
							<FormSaveButton
								type="submit"
								name="create-user"
								value="create-user"
								disabled={!this.state.firstNameisValid || !this.state.lastNameisValid ? true : false}
							>
								Create User
							</FormSaveButton>
						) : action === ACTION_EDIT ? (
							<>
								<FormSaveButton
									type="submit"
									hide={!!confirmBox}
									name="update-user"
									value="update-user"
									disabled={!this.state.firstNameisValid || !this.state.lastNameisValid ? true : false}
								>
									Update
								</FormSaveButton>

								<FormResetButton type="button" hide={!!confirmBox} onClick={this.doShowConfirmResetPassword}>
									Reset password
								</FormResetButton>

								<FormDeleteButton
									type="button"
									name="delete-user"
									hide={!!confirmBox}
									onClick={this.doShowConfirmDelete}
									disabled={this.props.loginUserEmail === this.props.fields.oid ? true : false}
								>
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
