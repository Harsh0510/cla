import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import NameInputField from "../../widgets/NameInputField";
import RegExPatterns from "../../common/RegExPatterns";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import reactCreateRef from "../../common/reactCreateRef";

import AdminPageWrap from "../../widgets/AdminPageWrap";
import {
	FormWrapAddEdit,
	FormMessage,
	FormBodyContainer,
	FormContainerFull,
	FormContainerButton,
	FormContainerHalf,
	FormError,
	FormInput,
	FormCustomSelect,
	FormSaveButton,
} from "../../widgets/AdminStyleComponents";
const SCHOOLLEVELS = require("../../../../../Controller/app/common/school-levels");
const JUMP_TO_CONTENT_ID = "main-content";

export default withAdminAuthRequiredConsumer(
	{ "school-admin": true },
	withApiConsumer(
		class SchoolPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					countryData: null,
					fields: {
						name: "",
						address1: "",
						address2: "",
						city: "",
						post_code: "",
						country: "",
						local_authority: "",
						school_level: "",
						school_home_page: "",
						number_of_students: "",
					},
					blockedFields: new Set(),
					schoolLevels: SCHOOLLEVELS,
					success: false,
					message: null,
					dbSchoolData: null,
					valid: {
						name: true,
						identifier: true,
						address1: true,
						address2: true,
						city: true,
						post_code: true,
						local_authority: true,
					},
				};
				this.doNameInputFieldChange = this.doNameInputFieldChange.bind(this);

				this.ref_name = reactCreateRef();
				this.ref_identifier = reactCreateRef();
				this.ref_address1 = reactCreateRef();
				this.ref_address2 = reactCreateRef();
				this.ref_city = reactCreateRef();
				this.ref_post_code = reactCreateRef();
				this.ref_local_authority = reactCreateRef();

				this.handleSubmit = this.handleSubmit.bind(this);
			}

			//Load country data from api
			fetchCountries = () => {
				this.props
					.api("/auth/get-countries")
					.then((result) => {
						this.setState({
							countryData: result.result,
						});
					})
					.catch((result) => {
						this.setState({
							message: result,
						});
					});
			};

			//get my school info
			fetchSchoolInfo = (_) => {
				const fields = Object.assign({}, this.state.fields);
				this.props
					.api("/auth/get-my-school-details", {})
					.then((result) => {
						if (result) {
							const schoolData = result.result[0];
							fields.name = schoolData.name || "";
							fields.address1 = schoolData.address1 || "";
							fields.address2 = schoolData.address2 || "";
							fields.city = schoolData.city || "";
							fields.post_code = schoolData.post_code || "";
							fields.country = schoolData.country || "";
							fields.local_authority = schoolData.local_authority || "";
							fields.school_home_page = schoolData.school_home_page || "";
							fields.number_of_students = schoolData.number_of_students || "";
							fields.school_level = schoolData.school_level || "";
							fields.can_edit_blocked_fields = schoolData.can_edit_blocked_fields;
							this.setState({
								fields: fields,
								dbSchoolData: fields,
								blockedFields: new Set(fields.can_edit_blocked_fields ? [] : result.blocked_fields),
							});
						}
					})
					.catch((result) => {
						this.setState({
							message: result,
						});
					});
			};

			// Get single course info from the database based on the id in the url
			componentDidMount() {
				this.fetchCountries();
				this.fetchSchoolInfo();
			}

			/**
			 * Handles changes in input fields and updates the component state to reflect them
			 * @param {Event} e change event
			 */
			handleChange = (e) => {
				// Clone the fields object in state.
				let fields = Object.assign({}, this.state.fields);
				const target = e.target;
				fields[target.name] = target.value;
				this.setState({ fields: fields });
			};

			/**
			 * Handles changes in input fields(check numeric values) and updates the component state to reflect them
			 * @param {Event} e change event
			 */
			handleNumericInputChange = (e) => {
				// Clone the fields object in state.
				let fields = Object.assign({}, this.state.fields);

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
					fields: fields,
				};
				if (raw === number.toString()) {
					newState.number_field_error = null;
					newState.fields.number_of_students = number.toString();
				} else {
					newState.number_field_error = "The number of students must be a number between 1 and 9999";
				}

				e.target.value = number.toString();

				this.setState(newState);
			};

			/**
			 * Handles the form submission and attempts to add a new course to the database
			 * @param {Event} e submit event
			 */
			handleSubmit = (e) => {
				e.preventDefault();
				let isValid = true;
				//check with all form input  fields
				let valid = Object.assign({}, this.state.valid);
				Object.keys(valid).forEach((field) => {
					switch (field) {
						case "name":
							valid[field] = this.ref_name.current.isValid();
							break;
						case "address1":
							valid[field] = this.ref_address1.current.isValid();
							break;
						case "address2":
							valid[field] = this.ref_address2.current.isValid();
							break;
						case "city":
							valid[field] = this.ref_city.current.isValid();
							break;
						case "post_code":
							valid[field] = this.ref_post_code.current.isValid();
							break;
						case "local_authority":
							valid[field] = this.ref_local_authority.current.isValid();
							break;
					}

					if (!valid[field]) {
						isValid = false;
					}
				});
				this.setState({ valid: valid }, () => {
					this.submitFormRequest(isValid);
				});
			};

			submitFormRequest = (isValid) => {
				if (!isValid) {
					return;
				}
				const fields = this.state.fields;
				const params = this.getFieldValuesForUpdate(this.state.dbSchoolData, fields);
				this.props
					.api("/auth/school-edit", params)
					.then((result) => {
						if (result) {
							this.setState({
								message: "Institution information edited successfully",
								dbSchoolData: fields,
							});
							this.props.withAuthConsumer_attemptReauth();
						}
					})
					.catch((result) => {
						this.setState({
							message: result,
						});
					});
			};

			/**
			 * Get fileds which require need to be update
			 * @param {dbSchoolData} dbSchoolData existing user value
			 * @param {updatedSchoolData} updatedSchoolData User Updated Detail values
			 */
			getFieldValuesForUpdate = (dbSchoolData, updatedSchoolData) => {
				let params = Object.create(null);

				if (dbSchoolData.name !== updatedSchoolData.name) {
					params.name = updatedSchoolData.name;
				}

				if (dbSchoolData.school_level !== updatedSchoolData.school_level) {
					params.school_level = updatedSchoolData.school_level;
				}

				if (dbSchoolData.address1 !== updatedSchoolData.address1) {
					params.address1 = updatedSchoolData.address1;
				}

				if (dbSchoolData.address2 !== updatedSchoolData.address2) {
					params.address2 = updatedSchoolData.address2;
				}

				if (dbSchoolData.city !== updatedSchoolData.city) {
					params.city = updatedSchoolData.city;
				}

				if (dbSchoolData.post_code !== updatedSchoolData.post_code) {
					params.post_code = updatedSchoolData.post_code;
				}

				if (dbSchoolData.country !== updatedSchoolData.country) {
					params.country = updatedSchoolData.country;
				}

				if (dbSchoolData.local_authority !== updatedSchoolData.local_authority) {
					params.local_authority = updatedSchoolData.local_authority;
				}

				if (dbSchoolData.number_of_students !== updatedSchoolData.number_of_students) {
					params.number_of_students = parseInt(updatedSchoolData.number_of_students, 10);
				}

				if (dbSchoolData.school_home_page !== updatedSchoolData.school_home_page) {
					params.school_home_page = updatedSchoolData.school_home_page;
				}

				return params;
			};

			doNameInputFieldChange(inputFieldValue, inputFieldName, isValid) {
				let fields = Object.assign({}, this.state.fields);
				let valid = Object.assign({}, this.state.valid);
				fields[inputFieldName] = inputFieldValue;
				valid[inputFieldName] = isValid;
				this.setState({ fields: fields, valid: valid });
			}

			render() {
				const { fields, message, countryData, schoolLevels } = this.state;
				const countryOptions = countryData
					? countryData.map((item, index) => (
							<option key={index} value={item.id}>
								{item.name}
							</option>
					  ))
					: null;
				const schoolLevelOptions = schoolLevels
					? schoolLevels.map((item, index) => (
							<option key={index} value={item.id}>
								{item.name}
							</option>
					  ))
					: null;
				let isDisabled = false;
				if (
					!this.state.valid.name ||
					!this.state.valid.address1 ||
					!this.state.valid.address2 ||
					!this.state.valid.city ||
					!this.state.valid.post_code ||
					!this.state.valid.local_authority
				) {
					isDisabled = true;
				}

				return (
					<>
						<HeadTitle title={PageTitle.school} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Edit Institution"} backURL="/profile/admin" id={JUMP_TO_CONTENT_ID}>
							<FormWrapAddEdit tableList={false} onSubmit={(e) => this.handleSubmit(e)}>
								<FormMessage className="message">{message}</FormMessage>
								<FormBodyContainer>
									<FormContainerFull>
										<FormContainerHalf>
											<label htmlFor="name">Name:</label>
											<NameInputField
												name="name"
												placeholder="Name"
												value={fields.name}
												doNameInputFieldChange={this.doNameInputFieldChange}
												patterns={RegExPatterns.common}
												maxLength={200}
												ref={this.ref_name}
												fieldName="name"
												isRequired={true}
												disabled={this.state.blockedFields.has("name")}
											/>
										</FormContainerHalf>

										<FormContainerHalf>
											<label htmlFor="school_level">Institution Level: </label>
											<FormCustomSelect
												name="school_level"
												value={fields.school_level}
												onChange={this.handleChange}
												required
												disabled={this.state.blockedFields.has("school_level")}
											>
												<option key={0} value="">
													Select institution level
												</option>
												{schoolLevelOptions}
											</FormCustomSelect>
										</FormContainerHalf>
									</FormContainerFull>

									<FormContainerFull>
										<FormContainerHalf>
											<label htmlFor="address1">Address line 1:</label>
											<NameInputField
												name="address1"
												placeholder="Address line 1"
												value={fields.address1}
												doNameInputFieldChange={this.doNameInputFieldChange}
												patterns={RegExPatterns.common}
												maxLength={200}
												ref={this.ref_address1}
												fieldName={"address line 1"}
												isRequired={true}
												disabled={this.state.blockedFields.has("address1")}
											/>
										</FormContainerHalf>

										<FormContainerHalf>
											<label htmlFor="address2">Address line 2: </label>
											<NameInputField
												name="address2"
												placeholder="Address line 2"
												value={fields.address2}
												doNameInputFieldChange={this.doNameInputFieldChange}
												patterns={RegExPatterns.common}
												maxLength={200}
												ref={this.ref_address2}
												fieldName={"address line 2"}
												isRequired={false}
												disabled={this.state.blockedFields.has("address2")}
											/>
										</FormContainerHalf>
									</FormContainerFull>

									<FormContainerFull>
										<FormContainerHalf>
											<label htmlFor="city">Town/City: </label>
											<NameInputField
												name="city"
												placeholder="Town/City"
												value={fields.city}
												doNameInputFieldChange={this.doNameInputFieldChange}
												patterns={RegExPatterns.common}
												maxLength={200}
												ref={this.ref_city}
												fieldName={"town/city"}
												isRequired={true}
												disabled={this.state.blockedFields.has("city")}
											/>
										</FormContainerHalf>

										<FormContainerHalf>
											<label htmlFor="post_code">Postcode: </label>
											<NameInputField
												name="post_code"
												placeholder="Post code"
												value={fields.post_code}
												doNameInputFieldChange={this.doNameInputFieldChange}
												patterns={RegExPatterns.alphaNumeric}
												maxLength={255}
												ref={this.ref_post_code}
												fieldName={"post code"}
												isRequired={true}
												disabled={this.state.blockedFields.has("post_code")}
											/>
										</FormContainerHalf>
									</FormContainerFull>

									<FormContainerFull>
										<FormContainerHalf>
											<label htmlFor="country">Country: </label>
											<FormCustomSelect name="country" value={fields.country} onChange={this.handleChange} required>
												<option key={0} value="">
													Select country{" "}
												</option>
												{countryOptions}
											</FormCustomSelect>
										</FormContainerHalf>

										<FormContainerHalf>
											<label htmlFor="local_authority">Local authority: </label>
											<NameInputField
												name="local_authority"
												placeholder="Local Authority"
												value={fields.local_authority}
												doNameInputFieldChange={this.doNameInputFieldChange}
												patterns={RegExPatterns.name}
												maxLength={100}
												ref={this.ref_local_authority}
												fieldName={"local authority"}
												isRequired={true}
												disabled={this.state.blockedFields.has("local_authority")}
											/>
										</FormContainerHalf>
									</FormContainerFull>

									<FormContainerFull>
										<FormContainerHalf>
											<label htmlFor="school_home_page">Institution Home Page: </label>
											<FormInput type="text" name="school_home_page" value={fields.school_home_page} onChange={this.handleChange} />
										</FormContainerHalf>

										<FormContainerHalf>
											<label htmlFor="number_of_students">Number of students: </label>
											<FormInput
												error={this.state.number_field_error}
												type="text"
												name="number_of_students"
												placeholder="Number of Students"
												value={fields.number_of_students}
												onChange={this.handleNumericInputChange}
												disabled={this.state.blockedFields.has("number_of_students")}
											/>
											{this.state.number_field_error ? <FormError>{this.state.number_field_error}</FormError> : null}
										</FormContainerHalf>
									</FormContainerFull>

									<FormContainerButton>
										<FormSaveButton type="submit" name="create-user" value="update" disabled={isDisabled}>
											Update
										</FormSaveButton>
									</FormContainerButton>
								</FormBodyContainer>
							</FormWrapAddEdit>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
