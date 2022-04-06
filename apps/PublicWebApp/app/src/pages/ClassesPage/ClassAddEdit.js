import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faSave, faTrash, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
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

export default class ClassAddEdit extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show_confirm_dialog: CONFIRM_DIALOG_NONE,
			number_field_error: null,
			title_field_error: true,
			year_group: true,
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
				number_field_error: null,
				year_group: true,
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
		this.props.deleteClass();
	};

	schoolsDropdown(fieldsDisabled) {
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
					api={this.props.api}
					requestApi={staticValues.api.schoolRequestApi}
					name="school"
					title="Institution:"
					value={selectedSchool}
					placeholder="Select"
					onChange={this.props.handleDrpChange}
					minQueryLength={3}
					labelIsOnTop={true}
					disabled={fieldsDisabled}
					required={true}
					showDefaultToolTipOnError={true}
				/>
			</div>
		);
	}

	doNameInputFieldChange(inputFieldValue, inputFieldName, isValid) {
		switch (inputFieldName) {
			case "title":
				this.setState({ title_field_error: isValid });
				break;
			case "year_group":
				this.setState({ year_group: isValid });
				break;
		}
		this.props.handleNameInputField(inputFieldValue, inputFieldName);
	}

	render() {
		const { cancelAddEdit, message, fields, action, examBoards, keyStages } = this.props;
		let confirmBox = false;

		if (this.state.show_confirm_dialog === CONFIRM_DIALOG_DELETE) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>This action is irreversible. Please be sure you wish to delete '{fields.title}'.</FormConfirmBoxText>
					<FormDeleteButton type="button" onClick={this.doDelete}>
						Confirm
					</FormDeleteButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog}>
						Cancel
					</FormConfirmBoxButtonNo>
				</FormConfirmBox>
			);
		}

		let fieldsDisabledMessage = null;
		if (action === ACTION_EDIT) {
			if (this.props.userRole === "teacher" && !fields.is_own) {
				fieldsDisabledMessage = `You may not edit a class you did not create.`;
			} else if (fields.extract_count > 0) {
				fieldsDisabledMessage = `Cannot edit this class because it has active copies.`;
			}
		}

		const fieldsDisabled = fieldsDisabledMessage !== null;

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
					{fieldsDisabledMessage && (
						<FormFieldsDisabledMessage>
							<FontAwesomeIcon icon={faInfoCircle} size="lg" /> {fieldsDisabledMessage}
						</FormFieldsDisabledMessage>
					)}
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="title">Name: </label>
							<NameInputField
								id="title"
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("title"))}
								name="title"
								placeholder="Name"
								defaultValue={fields.title}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={200}
								fieldName={"name"}
								isRequired={true}
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="key_stage">Key Stage: </label>
							<FormCustomSelect
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("key_stage"))}
								name="key_stage"
								defaultValue={fields.key_stage}
							>
								<option key="_select" value="">
									Select Key Stage
								</option>
								{keyStages.map((item) => (
									<option key={item} value={item}>
										{item}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="year_group">Year Group: </label>
							<NameInputField
								id="year_group"
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("year_group"))}
								name="year_group"
								placeholder="Year group"
								defaultValue={fields.year_group}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={200}
								fieldName={"year group"}
								isRequired={false}
							/>
						</FormContainerHalf>

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
					</FormContainerFull>

					<FormContainerFull>
						{this.props.currentUserRole === "cla-admin" ? <FormContainerHalf>{this.schoolsDropdown(fieldsDisabled)}</FormContainerHalf> : ""}

						<FormContainerHalf>
							<label htmlFor="exam_board">Exam Board: </label>
							<FormCustomSelect
								disabled={fieldsDisabled || (!fields.can_edit_blocked_fields && this.props.blockedFields.has("exam_board"))}
								name="exam_board"
								defaultValue={fields.exam_board}
							>
								<option key="_select" value="">
									Select exam-board
								</option>
								{examBoards.map((item) => (
									<option key={item} value={item}>
										{item}
									</option>
								))}
							</FormCustomSelect>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerButton>
						{action === ACTION_NEW || action === ACTION_ADDED ? (
							<FormSaveButton
								type="submit"
								name="create-class"
								value="create-class"
								disabled={!this.state.title_field_error || !this.state.year_group ? true : false}
							>
								Create class
							</FormSaveButton>
						) : action === ACTION_EDIT ? (
							<>
								<FormSaveButton
									type="submit"
									hide={!!confirmBox}
									name="update-class"
									value="update-class"
									disabled={!this.state.title_field_error || !this.state.year_group || fieldsDisabled}
								>
									Update
								</FormSaveButton>

								<FormDeleteButton type="button" hide={!!confirmBox} onClick={this.doShowConfirmDelete} disabled={fieldsDisabled}>
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
