import React from "react";
import CustomFormData from "../../common/CustomFormData";
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
	FormConfirmBox,
	FormConfirmBoxText,
	FormConfirmBoxButtonNo,
} from "../../widgets/AdminStyleComponents";
import RegExPatterns from "../../common/RegExPatterns";
import CheckBoxField from "../../widgets/CheckBoxField";

const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";

const CONFIRM_DIALOG_NONE = "";
const CONFIRM_DIALOG_DELETE = "delete";

export default class SchoolAddEdit extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show_confirm_dialog: CONFIRM_DIALOG_NONE,
			number_field_error: null,
			name: true,
			identifier: true,
			address1: true,
			address2: true,
			city: true,
			post_code: true,
			local_authority: true,
			isFormValid: true,
			enable_wonde_user_sync: true,
			enable_wonde_class_sync: true,
		};
		this.doNameInputFieldChange = this.doNameInputFieldChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.message !== prevProps.message) {
			this.setState({
				show_confirm_dialog: CONFIRM_DIALOG_NONE,
				name: true,
				identifier: true,
				address1: true,
				address2: true,
				city: true,
				post_code: true,
				local_authority: true,
				isFormValid: true,
				enable_wonde_user_sync: true,
				enable_wonde_class_sync: true,
			});
		}
	}

	doSubmit = (e) => {
		e.preventDefault();

		const fd = CustomFormData(e.target);
		const data = Object.create(null);
		const fields = this.props.fields;
		for (const item of fd.entries()) {
			data[item[0]] = item[1];
		}
		data.enable_wonde_class_sync = fields.enable_wonde_class_sync;
		data.enable_wonde_user_sync = fields.enable_wonde_user_sync;
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

	/**
	 * Handles the form submission and attempts to add a new user to the database
	 */
	handleNumericInputChange = (e) => {
		// Clone the fields object in state.

		const raw = e.target.value;
		let number;
		if (raw.match(/^[1-9][0-9]*$/g)) {
			number = parseInt(raw, "", 10);
			if (number > 10000) {
				number = 9999;
			}
		}
		if (!number) {
			number = "";
		}
		const newState = {
			number_field_error: null,
		};
		if (raw === number.toString()) {
			newState.number_field_error = null;
		} else {
			newState.number_field_error = "The number of students must be a number between 1 and 9999";
		}

		e.target.value = number.toString();

		this.setState(newState);
	};

	doDelete = (e) => {
		e.preventDefault();
		this.props.deleteSchool();
	};

	doCheckInputFieldChange = (name, value, isValid) => {
		switch (name) {
			case "enable_wonde_user_sync":
				this.setState({ enable_wonde_user_sync: isValid });
				break;
			case "enable_wonde_class_sync":
				this.setState({ enable_wonde_class_sync: isValid });
				break;
		}
		this.props.handleNameInputField(value, name);
	};

	doNameInputFieldChange(inputFieldValue, inputFieldName, isValid) {
		this.setState({ isFormValid: isValid });
		switch (inputFieldName) {
			case "name":
				this.setState({ name: isValid });
				break;
			case "identifier":
				this.setState({ identifier: isValid });
				break;
			case "address1":
				this.setState({ address1: isValid });
				break;
			case "address2":
				this.setState({ address2: isValid });
				break;
			case "city":
				this.setState({ city: isValid });
				break;
			case "post_code":
				this.setState({ post_code: isValid });
				break;
			case "local_authority":
				this.setState({ local_authority: isValid });
				break;
		}
		this.props.handleNameInputField(inputFieldValue, inputFieldName);
	}

	render() {
		const { cancelAddEdit, message, fields, action, territories, schoolLevels, schoolTypes, schoolData, currentUserRole } = this.props;
		let confirmBox = false;
		if (this.state.show_confirm_dialog === CONFIRM_DIALOG_DELETE) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>Are you sure you wish to delete this institution? This action is irreversible, please be sure.</FormConfirmBoxText>
					<FormDeleteButton type="button" onClick={this.doDelete}>
						Confirm
					</FormDeleteButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog}>
						Cancel
					</FormConfirmBoxButtonNo>
				</FormConfirmBox>
			);
		}
		const fieldsDisabled = fields.extract_count > 0;
		const checkBoxWondeUserSync = "Enable Wonde user sync";
		const checkBoxWondeClassSync = "Enable Wonde class sync";

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
							<label htmlFor="name">Name: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("name"))}
								name="name"
								placeholder="Name"
								defaultValue={fields.name}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.common}
								maxLength={200}
								fieldName={"name"}
								isRequired={true}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="identifier">Identifier: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("identifier")) || action === ACTION_EDIT}
								name="identifier"
								placeholder="Identifier"
								defaultValue={fields.identifier}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={100}
								fieldName={"identifier"}
								isRequired={action === ACTION_NEW}
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="address1">Address line 1: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("address1"))}
								name="address1"
								placeholder="Address line 1"
								defaultValue={fields.address1}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.common}
								maxLength={200}
								fieldName={"address line 1"}
								isRequired={true}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="address2">Address line 2: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("address2"))}
								name="address2"
								placeholder="Address line 2"
								defaultValue={fields.address2}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.common}
								maxLength={200}
								fieldName={"address line 2"}
								isRequired={false}
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="city">Town/City: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("city"))}
								name="city"
								placeholder="Town/City"
								defaultValue={fields.city}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.common}
								maxLength={200}
								fieldName={"town/city"}
								isRequired={true}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="post_code">Postcode: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("post_code"))}
								name="post_code"
								placeholder="Post code"
								defaultValue={fields.post_code}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.alphaNumeric}
								maxLength={8}
								fieldName={"post code"}
								isRequired={true}
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="county">County: </label>
							<FormInput
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("county"))}
								id="county"
								type="text"
								name="county"
								placeholder="County"
								defaultValue={fields.county}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="territory">Territory: </label>
							<FormCustomSelect
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("territory"))}
								name="territory"
								defaultValue={fields.territory}
								required
							>
								<option key="_select" value="">
									Select territory
								</option>
								{territories.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="local_authority">Local Authority: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("local_authority"))}
								name="local_authority"
								placeholder="Local authority"
								defaultValue={fields.local_authority}
								doNameInputFieldChange={this.doNameInputFieldChange}
								patterns={RegExPatterns.name}
								maxLength={100}
								fieldName={"local authority"}
								isRequired={true}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="school_level">Level: </label>
							<FormCustomSelect
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("school_level"))}
								name="school_level"
								defaultValue={fields.school_level}
								required
							>
								<option key="_select" value="">
									Select Level
								</option>
								{schoolLevels.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="school_type">Type: </label>
							<FormCustomSelect
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("school_type"))}
								name="school_type"
								defaultValue={fields.school_type}
							>
								<option key="_select" value="">
									Select Type
								</option>
								{schoolTypes.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="school_home_page">Home Page: </label>
							<FormInput
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("school_home_page"))}
								id="school_home_page"
								type="text"
								name="school_home_page"
								placeholder="Home Page"
								defaultValue={fields.school_home_page}
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="number_of_students">Number of Students: </label>
							<FormInput
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("number_of_students"))}
								error={this.state.number_field_error}
								type="text"
								name="number_of_students"
								placeholder="Number of Students"
								defaultValue={fields.number_of_students}
								onChange={this.handleNumericInputChange}
							/>
							{this.state.number_field_error ? <FormError>{this.state.number_field_error}</FormError> : null}
						</FormContainerHalf>
						<FormContainerHalf>
							<label htmlFor="nide">Nide: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("nide"))}
								name="nide"
								placeholder="Nide"
								defaultValue={fields.nide}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={200}
								fieldName={"nide"}
								isRequired={false}
							/>
						</FormContainerHalf>
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="hwb_identifier">Hwb Identifier: </label>
							<NameInputField
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("hwb_identifier"))}
								name="hwb_identifier"
								placeholder="Hwb Identifier"
								defaultValue={fields.hwb_identifier}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={200}
								fieldName={"hwb_identifier"}
								isRequired={false}
							/>
						</FormContainerHalf>
						{action === ACTION_EDIT && (
							<FormContainerHalf>
								<label htmlFor="gsg">Gsg: </label>
								<NameInputField
									disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("gsg"))}
									name="gsg"
									placeholder="Gsg"
									defaultValue={fields.gsg}
									doNameInputFieldChange={this.doNameInputFieldChange}
									maxLength={200}
									fieldName={"gsg"}
									isRequired={false}
								/>
							</FormContainerHalf>
						)}
					</FormContainerFull>
					{action === ACTION_EDIT ? (
						<>
							<FormContainerFull>
								<FormContainerHalf>
									<label htmlFor="dfe">Dfe: </label>
									<NameInputField
										disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("dfe"))}
										name="dfe"
										placeholder="Dfe"
										defaultValue={fields.dfe}
										doNameInputFieldChange={this.doNameInputFieldChange}
										maxLength={200}
										fieldName={"dfe"}
										isRequired={false}
									/>
								</FormContainerHalf>
								<FormContainerHalf>
									<label htmlFor="seed">Seed: </label>
									<NameInputField
										disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("seed"))}
										name="seed"
										placeholder="Seed"
										defaultValue={fields.seed}
										doNameInputFieldChange={this.doNameInputFieldChange}
										maxLength={200}
										fieldName={"seed"}
										isRequired={false}
									/>
								</FormContainerHalf>
							</FormContainerFull>
							<FormContainerFull>
								<FormContainerHalf>
									<CheckBoxField
										name="enable_wonde_user_sync"
										title={checkBoxWondeUserSync}
										isRequired={false}
										disabled={!fields.wonde_approved || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("enable_wonde_user_sync"))}
										isValid={true}
										checked={fields.enable_wonde_user_sync}
										onChange={this.doCheckInputFieldChange}
									/>
								</FormContainerHalf>
								<FormContainerHalf>
									<CheckBoxField
										name="enable_wonde_class_sync"
										title={checkBoxWondeClassSync}
										isRequired={false}
										disabled={!fields.wonde_approved || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("enable_wonde_class_sync"))}
										isValid={true}
										checked={fields.enable_wonde_class_sync}
										onChange={this.doCheckInputFieldChange}
									/>
								</FormContainerHalf>
							</FormContainerFull>
						</>
					) : (
						""
					)}
					<FormContainerButton>
						{action === ACTION_NEW || action === ACTION_ADDED ? (
							<FormSaveButton type="submit" name="create-school" value="create-school" disabled={!this.state.isFormValid ? true : false}>
								Create institution
							</FormSaveButton>
						) : action === ACTION_EDIT ? (
							<>
								<FormSaveButton
									type="submit"
									hide={!!confirmBox}
									name="update-school"
									value="update-school"
									disabled={!this.state.isFormValid ? true : false}
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
