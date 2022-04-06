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
	FormInput,
	FormSaveButton,
	FormDeleteButton,
	FormConfirmBox,
	FormConfirmBoxText,
	FormConfirmBoxButtonNo,
	FormError,
} from "../../widgets/AdminStyleComponents";
import CheckBoxField from "../../widgets/CheckBoxField";
import RegExPatterns from "../../common/RegExPatterns";

const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";

const CONFIRM_DIALOG_NONE = "";
const CONFIRM_DIALOG_DELETE = "delete";

export default class CarouselAddEdit extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show_confirm_dialog: CONFIRM_DIALOG_NONE,
			nameisValid: true,
			number_field_error: null,
			enabled: true,
			setOption: {
				value: "",
				label: "",
			},
		};
		this.doNameInputFieldChange = this.doNameInputFieldChange.bind(this);
		this.doCheckInputFieldChange = this.doCheckInputFieldChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.message !== prevProps.message) {
			this.setState({
				show_confirm_dialog: CONFIRM_DIALOG_NONE,
				nameisValid: true,
				number_field_error: null,
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
		data.enabled = fields.enabled;
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
	handleFloatNumericInputChange = (e) => {
		// Clone the fields object in state.

		const raw = e.target.value;
		let number;

		//check for float numeric characters
		if (raw.match(RegExPatterns.floatNumeric)) {
			if (raw >= 0) {
				number = raw;
			}
		}

		const newState = {
			number_field_error: null,
		};
		if (raw === number) {
			newState.number_field_error = null;
		} else {
			newState.number_field_error = "The sort order must be a numeric value";
		}

		this.setState(newState);
	};

	doDeletePanel = (e) => {
		e.preventDefault();
		this.props.deleteCarousel();
	};

	doNameInputFieldChange(inputFieldName, inputFieldValue, isValid) {
		switch (inputFieldName) {
			case "name":
				this.setState({ nameisValid: isValid });
				break;
		}
		this.props.handleNameInputField(inputFieldValue, inputFieldName);
	}
	doCheckInputFieldChange(name, value, isValid) {
		switch (name) {
			case "enabled":
				this.setState({ enabled: isValid });
				break;
		}
		this.props.handleNameInputField(value, name);
	}

	render() {
		const { cancelAddEdit, message, fields, action } = this.props;
		let confirmBox = null;

		if (this.state.show_confirm_dialog === CONFIRM_DIALOG_DELETE) {
			confirmBox = (
				<FormConfirmBox>
					<FormConfirmBoxText>Are you sure you wish to delete this panel? This action is irreversible, please be sure.</FormConfirmBoxText>
					<FormDeleteButton type="button" onClick={this.doDeletePanel}>
						Yes
					</FormDeleteButton>
					<FormConfirmBoxButtonNo type="button" onClick={this.doDismissRejectDialog}>
						No
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
							<label htmlFor="name">Panel Name:</label>
							<NameInputField
								name="name"
								placeholder="Panel name"
								defaultValue={fields.name}
								doNameInputFieldChange={this.doNameInputFieldChange}
								minLength={1}
								maxLength={255}
								fieldName={"name"}
								isRequired={true}
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="image_url">Image:</label>
							<NameInputField
								name="image_url"
								placeholder="Image"
								defaultValue={fields.image_url}
								doNameInputFieldChange={this.doNameInputFieldChange}
								fieldName={"Image"}
							/>
						</FormContainerHalf>
						<FormContainerHalf>
							<label htmlFor="image_alt_text">Alt-text:</label>
							<FormInput type="text" name="image_alt_text" placeholder="Alt Text" defaultValue={fields.image_alt_text} />
						</FormContainerHalf>
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="link_url">Link:</label>
							<FormInput type="text" name="link_url" placeholder="Link" defaultValue={fields.link_url} />
						</FormContainerHalf>
						<FormContainerHalf>
							<label htmlFor="sort_order">Sort Order: </label>
							<FormInput
								error={this.state.number_field_error}
								type="text"
								name="sort_order"
								placeholder="Sort Order"
								defaultValue={fields.sort_order}
								onChange={this.handleFloatNumericInputChange}
								required={true}
							/>
							{this.state.number_field_error ? <FormError>{this.state.number_field_error}</FormError> : null}
						</FormContainerHalf>
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<CheckBoxField
								name="enabled"
								title="Enabled"
								isRequired={false}
								isValid={true}
								checked={fields.enabled}
								value={false}
								onChange={this.doCheckInputFieldChange}
							/>
						</FormContainerHalf>
					</FormContainerFull>
					<FormContainerButton>
						{action === ACTION_NEW || action === ACTION_ADDED ? (
							<FormSaveButton type="submit" name="create-panel" value="create-panel" disabled={!this.state.nameisValid ? true : false}>
								Create Panel
							</FormSaveButton>
						) : action === ACTION_EDIT ? (
							<>
								<FormSaveButton
									type="submit"
									hide={!!confirmBox}
									name="update-panel"
									value="update-panel"
									disabled={!this.state.nameisValid ? true : false}
								>
									Update
								</FormSaveButton>
								<FormDeleteButton type="button" name="delete-panel" hide={!!confirmBox} onClick={this.doShowConfirmDelete}>
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
