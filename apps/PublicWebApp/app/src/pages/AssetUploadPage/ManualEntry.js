import React from "react";
import styled from "styled-components";
import NameInputField from "../../widgets/NameInputField";
import { FormWrapAddEdit, FormContainerButton, FormInput } from "../../widgets/AdminStyleComponents";
import { Button } from "../../widgets/Layout/Button";
import theme from "../../common/theme";
import { ISBN } from "../../../../../Controller/app/common/isbn";
import getSingular from "../../common/getSingular";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import queryString from "query-string";

const MIN_PUBLICATION_YEAR = "1000";
const MAX_PUBLICATION_YEAR = "2050";
const MANUAL_TYPE = "manual";

const SubTitle = styled.div`
	margin-bottom: 2rem;
`;

const FormBodyContainer = styled.div`
	width: 50%;
	margin: 0 auto;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 70%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 100%;
	}
`;

const InputWrapper = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	margin: 1rem auto;
`;

const Label = styled.label`
	width: 30%;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 35%;
	}
`;

const FieldWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 45%;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 55%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 60%;
	}
`;

const AsteriskSymbol = styled.div`
	color: ${theme.colours.red};
	width: 25%;
	padding: 0 5px;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 10%;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 5%;
	}
`;

const BackButton = styled(ButtonLink)`
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	font-size: 0.875em;
	margin-right: 1em;
	display: flex;
`;

const BackIcon = styled.i`
	margin-right: 0.5rem;
	margin-top: 0.2em;
`;

class ManualEntry extends React.PureComponent {
	constructor(props) {
		super(props);
		const { title, isbn, author, publisher, publicationYear, pageCount, image } = this.props;
		this.state = {
			isFormValid: false,
			fields: {
				title: title || "",
				isbn: isbn || "",
				author: author || "",
				publisher: publisher || "",
				publicationYear: publicationYear || "",
				pageCount: pageCount || 0,
				image: image || "",
			},
			valid: {
				title: { isValid: !!title, message: "" },
				isbn: { isValid: !!isbn, message: "" },
				author: { isValid: !!author, message: "" },
				publisher: { isValid: !!publisher, message: "" },
				publicationYear: { isValid: true, message: "" }, // no need to validate
				pageCount: { isValid: true, message: "" }, // no need to validate
				image: { isValid: true, message: "" }, // no need to validate
			},
		};
	}

	componentDidMount() {
		this.validateForm();
	}

	doInputFieldChange = (value, name) => {
		this.setState(
			{
				fields: {
					...this.state.fields,
					[name]: value,
				},
			},
			() => {
				this.validateField(name);
			}
		);
	};

	doNumberFieldChange = (e) => {
		const { name, value } = e.target;
		this.setState(
			{
				fields: {
					...this.state.fields,
					[name]: value,
				},
			},
			() => {
				this.validateField(name);
			}
		);
	};

	validateField = (key) => {
		let validFields = { ...this.state.valid };
		if (key === "isbn") {
			const validIsbn = ISBN.parse(this.state.fields[key].trim());
			if (validIsbn) {
				validFields[key].isValid = true;
				validFields[key].message = "";
			} else {
				if (!this.state.fields[key]) {
					validFields[key].message = `Please add an ISBN in this field.`;
				} else {
					validFields[key].message = "Please provide a valid ISBN.";
				}
				validFields[key].isValid = false;
			}
		} else if (key === "publicationYear" || key === "pageCount" || key === "image") {
			//no need to validate
			validFields[key].isValid = true;
			validFields[key].message = "";
		} else {
			if (this.state.fields[key]) {
				validFields[key].isValid = true;
				validFields[key].message = "";
			} else {
				let sigular = getSingular(key.toString());
				validFields[key].isValid = false;
				validFields[key].message = `Please add ${sigular.toLowerCase()} ${key === "isbn" ? key.toUpperCase() : key} in this field.`;
			}
		}

		this.setState({ valid: validFields }, this.validateForm);
	};

	validateForm = () => {
		let isFormValid = true;
		Object.keys(this.state.valid).forEach((fieldKey) => {
			if (!this.state.valid[fieldKey].isValid && isFormValid) {
				isFormValid = false;
			}
		});
		this.setState({ isFormValid: isFormValid });
	};

	doSubmit = () => {
		const { title, isbn, author, publisher, publicationYear, pageCount, image } = this.state.fields;
		const publicationYearString = publicationYear ? `&publicationYear=${publicationYear}` : "";
		const pageCountString = pageCount ? `&pageCount=${pageCount}` : "";
		const imageString = image ? `&image=${encodeURIComponent(image)}` : "";
		const search = queryString.parse(this.props.location.search);
		const query = search.title ? `&search=${encodeURIComponent(search.title)}` : `&search=${search.isbn}`;
		this.props.history.push(
			`/asset-upload/upload-content?title=${encodeURIComponent(title)}&isbn=${isbn}&author=${encodeURIComponent(
				JSON.stringify(author.split(","))
			)}&publisher=${encodeURIComponent(publisher)}${publicationYearString}${pageCountString}${imageString}&type=${MANUAL_TYPE}${query}`
		);
	};

	getBackRedirectUrl = () => {
		let { search, isbn, title } = queryString.parse(this.props.location.search);
		let query = "";
		if (search) {
			const validIsbn = ISBN.parse(search.trim());
			if (validIsbn) {
				query = `isbn=${search}`;
			} else {
				query = `title=${encodeURIComponent(search)}`;
			}
		} else {
			query = title ? `title=${encodeURIComponent(title)}` : `isbn=${isbn}`;
		}

		const url = "/asset-upload/before-we-start?" + query;
		return url;
	};

	render() {
		const { isFormValid, fields } = this.state;
		const { title, isbn, author, publisher, publicationYear } = fields;

		return (
			<>
				<FormWrapAddEdit onSubmit={this.doSubmit}>
					<FormBodyContainer>
						{this.props.isShowNotFoundTitle && <SubTitle>We were unable to find your title, please manually submit your details</SubTitle>}
						<InputWrapper>
							<Label htmlFor="title">Title:</Label>
							<FieldWrapper>
								<NameInputField
									name="title"
									value={title}
									minLength={1}
									maxLength={255}
									fieldName="title"
									isRequired={true}
									doNameInputFieldChange={this.doInputFieldChange}
									error={this.state.valid.title.message}
								/>
							</FieldWrapper>
							<AsteriskSymbol>*</AsteriskSymbol>
						</InputWrapper>
						<InputWrapper>
							<Label htmlFor="isbn">ISBN:</Label>
							<FieldWrapper>
								<NameInputField
									name="isbn"
									value={isbn}
									minLength={1}
									maxLength={255}
									fieldName="ISBN"
									isRequired={false}
									doNameInputFieldChange={this.doInputFieldChange}
									error={this.state.valid.isbn.message}
								/>
							</FieldWrapper>
							<AsteriskSymbol>*</AsteriskSymbol>
						</InputWrapper>
						<InputWrapper>
							<Label htmlFor="author">Author:</Label>
							<FieldWrapper>
								<NameInputField
									name="author"
									value={author}
									minLength={1}
									maxLength={255}
									fieldName="author"
									isRequired={true}
									doNameInputFieldChange={this.doInputFieldChange}
									error={this.state.valid.author.message}
								/>
							</FieldWrapper>
							<AsteriskSymbol>*</AsteriskSymbol>
						</InputWrapper>
						<InputWrapper>
							<Label htmlFor="publisher">Publisher:</Label>
							<FieldWrapper>
								<NameInputField
									name="publisher"
									value={publisher}
									minLength={1}
									maxLength={255}
									fieldName="publisher"
									isRequired={true}
									doNameInputFieldChange={this.doInputFieldChange}
									error={this.state.valid.publisher.message}
								/>
							</FieldWrapper>
							<AsteriskSymbol>*</AsteriskSymbol>
						</InputWrapper>
						<InputWrapper>
							<Label htmlFor="publicationYear">Publication year:</Label>
							<FieldWrapper>
								<FormInput
									type="number"
									name="publicationYear"
									value={publicationYear}
									min={MIN_PUBLICATION_YEAR}
									max={MAX_PUBLICATION_YEAR}
									required={false}
									onChange={this.doNumberFieldChange}
								/>
							</FieldWrapper>
						</InputWrapper>
					</FormBodyContainer>
					<FormContainerButton>
						<div>
							<BackButton title="Back" to={this.getBackRedirectUrl()}>
								<BackIcon className="fal fa-chevron-left"></BackIcon>Back
							</BackButton>
						</div>
						<div>
							<Button type="submit" disabled={!isFormValid} data-ga-user-extract="metadata-search-results-manual-confirm">
								This is what I copied from
							</Button>
						</div>
					</FormContainerButton>
				</FormWrapAddEdit>
			</>
		);
	}
}

export default ManualEntry;
