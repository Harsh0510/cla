import React from "react";
import styled, { css } from "styled-components";
import CheckBoxField from "../../widgets/CheckBoxField";
import MultiRowTextField from "../../widgets/MultiRowTextField";
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
} from "../../widgets/AdminStyleComponents";

const ACTION_EDIT = "edit";

const WrapCheckBox = styled.div`
	.checkbox {
		padding: 0;
	}
`;

export default class PublisherAddEdit extends React.PureComponent {
	checkBox = React.createRef();

	state = {
		buy_book_rules_value: [],
		buy_book_rules_valid: [],
		temp_unlock_opt_in: false,
	};

	buyBookIsValid() {
		for (const v of this.state.buy_book_rules_valid) {
			if (!v) {
				return false;
			}
		}
		return true;
	}

	componentDidMount() {
		const rules = this.props.fields.buy_book_rules || [];
		this.setState({
			buy_book_rules_value: rules,
			buy_book_rules_valid: rules.map((_) => true),
			temp_unlock_opt_in: this.props.fields.temp_unlock_opt_in,
		});
	}

	componentDidUpdate(prevProps) {
		if (this.props.fields.buy_book_rules !== prevProps.fields.buy_book_rules) {
			const rules = this.props.fields.buy_book_rules || [];
			this.setState({
				buy_book_rules_value: rules,
				buy_book_rules_valid: rules.map((_) => true),
			});
		}
		if (this.props.fields.temp_unlock_opt_in !== prevProps.fields.temp_unlock_opt_in) {
			this.setState({
				temp_unlock_opt_in: this.props.fields.temp_unlock_opt_in,
			});
		}
	}

	onBuyBooksChange = (name, value, valid) => {
		this.setState({
			buy_book_rules_value: value,
			buy_book_rules_valid: valid,
		});
	};

	doCheckInputFieldChange = (name, value, valid) => {
		this.setState({ temp_unlock_opt_in: value });
	};

	doSubmit = (e) => {
		e.preventDefault();
		const data = {
			id: this.props.fields.id,
			buy_book_rules: this.state.buy_book_rules_value,
			temp_unlock_opt_in: this.state.temp_unlock_opt_in,
		};
		this.props.handleSubmit(data);
	};

	render() {
		const { cancelAddEdit, message, fields, action } = this.props;
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
							<FormInput id="name" type="text" name="name" placeholder="Name" defaultValue={fields.name} disabled={true} required />
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="external_identifier">External Identifier: </label>
							<FormInput
								id="external_identifier"
								type="text"
								name="external_identifier"
								placeholder="External Identifier"
								defaultValue={fields.external_identifier}
								disabled={true}
								required
							/>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="contact_name">Contact Name: </label>
							<FormInput
								id="contact_name"
								type="text"
								name="contact_name"
								placeholder="Contact Name"
								defaultValue={fields.contact_name}
								disabled={true}
								required
							/>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="printing_opt_out"> Printing Status: </label>
							<WrapCheckBox>
								<CheckBoxField checked={fields.printing_opt_out} onChange={null} disable={true} disabled={true} required={true} isValid={true} />
							</WrapCheckBox>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label>Buy Book Rules: </label>
							<MultiRowTextField
								value={this.state.buy_book_rules_value}
								valid={this.state.buy_book_rules_valid}
								type="template"
								name="buy_book_rules"
								onChange={this.onBuyBooksChange}
							/>
						</FormContainerHalf>
						<FormContainerHalf>
							<label htmlFor="temp_unlock_opt_in"> Temporary Unlock Opt-In: </label>
							<WrapCheckBox>
								<CheckBoxField
									name="temp_unlock_opt_in"
									onChange={this.doCheckInputFieldChange}
									checked={!!this.state.temp_unlock_opt_in}
									isValid={true}
									isRequired={false}
								/>
							</WrapCheckBox>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerButton>
						{action === ACTION_EDIT ? (
							<FormSaveButton type="submit" name="update-publisher" value="update-publisher" disabled={!this.buyBookIsValid()}>
								Update
							</FormSaveButton>
						) : null}
					</FormContainerButton>
				</FormBodyContainer>
			</FormWrapAddEdit>
		);
	}
}
