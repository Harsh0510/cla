import React from "react";
import styled, { css } from "styled-components";
import CustomFormData from "../../common/CustomFormData";
import MultiRowTextField from "../../widgets/MultiRowTextField";
import CheckBoxField from "../../widgets/Form/fields/CheckboxField";
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

const CheckboxContainer = styled.div`
	margin-top: 0.5em;
`;

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

		const fd = CustomFormData(e.target);

		const data = {
			id: this.props.fields.id,
			buy_book_rules: this.state.buy_book_rules_value,
			active: !!fd.get("active"),
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
							<label htmlFor="title">Title: </label>
							<FormInput type="text" name="title" placeholder="Title" defaultValue={fields.title} disabled={true} />
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="publisher">Publisher: </label>
							<FormInput type="text" name="publisher" placeholder="Publisher" defaultValue={fields.publisher_name_log} disabled={true} />
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="isbn13">ISBN: </label>
							<FormInput type="text" name="isbn13" placeholder="ISBN" defaultValue={fields.isbn13} disabled={true} />
						</FormContainerHalf>
						<FormContainerHalf>
							<label htmlFor="pdf_isbn13">PDF ISBN: </label>
							<FormInput type="text" name="pdf_isbn13" placeholder="PDF ISBN" defaultValue={fields.pdf_isbn13} disabled={true} />
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="imprint">Imprint: </label>
							<FormInput type="text" name="imprint" placeholder="Imprint" defaultValue={fields.imprint} disabled={true} />
						</FormContainerHalf>
						<FormContainerHalf>
							<label htmlFor="active">Active? </label>
							<CheckboxContainer>{<CheckBoxField value={!!fields.active} onChange={null} disable={true} name="active" />}</CheckboxContainer>
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
