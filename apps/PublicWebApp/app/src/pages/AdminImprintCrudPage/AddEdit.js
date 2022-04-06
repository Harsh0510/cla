import React from "react";
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
	FormInput,
	FormSaveButton,
} from "../../widgets/AdminStyleComponents";

const ACTION_EDIT = "edit";

export default class AddEdit extends React.PureComponent {
	state = {
		buy_book_rules_value: [],
		buy_book_rules_valid: [],
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
	}

	onBuyBooksChange = (name, value, valid) => {
		this.setState({
			buy_book_rules_value: value,
			buy_book_rules_valid: valid,
		});
	};

	doSubmit = (e) => {
		e.preventDefault();

		const data = {
			id: this.props.fields.id,
			buy_book_rules: this.state.buy_book_rules_value,
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
							<FormInput type="text" name="name" placeholder="Name" defaultValue={fields.name} disabled={true} required />
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="external_identifier">External Identifier: </label>
							<FormInput
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
							<label htmlFor="publisher_name_log">Publisher: </label>
							<FormInput
								type="text"
								name="publisher_name_log"
								placeholder="Publisher"
								defaultValue={fields.publisher_name_log}
								disabled={true}
								required
							/>
						</FormContainerHalf>

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
					</FormContainerFull>

					<FormContainerButton>
						{action === ACTION_EDIT ? (
							<FormSaveButton type="submit" name="update-item" value="update-item" disabled={!this.buyBookIsValid()}>
								Update
							</FormSaveButton>
						) : null}
					</FormContainerButton>
				</FormBodyContainer>
			</FormWrapAddEdit>
		);
	}
}
