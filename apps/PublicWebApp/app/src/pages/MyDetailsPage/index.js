import React from "react";
import styled, { css } from "styled-components";
const deepEqual = require("deep-equal");
import googleEvent from "../../common/googleEvent";
import theme from "../../common/theme";
import withApiConsumer from "../../common/withApiConsumer";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import Header from "../../widgets/Header";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import reactCreateRef from "../../common/reactCreateRef";
import MainTitle from "../../widgets/MainTitle";
import TextField from "../../widgets/TextField";
import SelectTitleField from "../../widgets/SelectTitleField";
import MessageBox from "../../widgets/MessageBox";
import messageType from "../../common/messageType";
import RegExPatterns from "../../common/RegExPatterns";
import userDidChange from "../../common/userDidChange";
import validationType from "../../common/validationType";
import CheckBoxField from "../../widgets/Form/fields/CheckboxField";
import CheckboxSetField from "./CheckboxSetField";
import userTitles from "../../common/userTitles";
import ConfirmModal from "../../widgets/ConfirmModal";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";
import staticValues from "../../common/staticValues";

const EMAIL_NOTIFICATION_CATEGORIES = staticValues.emailNotificationCategories;

const CONFIRM_TITLE = "Are you sure?";
const CONFIRM_SUBTITLE =
	"This will turn on the guided tour of the Education Platform for first time users. Please make sure that you select Update at the bottom of page to save these changes.";

const nameDisplayPreference = require("../../../../../Controller/app/common/nameDisplayPreference/obj");

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
const JUMP_TO_CONTENT_ID = "main-content";
const NOTE_FOR_EMAIL_NOTIFICATION_CHANGED = "Please note that it may take up to 24 hours for these changes to come into effect.";

/** UsageForm Form */
const PageForm = styled.form`
	max-width: 100%;
	min-height: 490px;
	padding: 1em 0 2em 0;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 3em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 200px;
		padding: 2em 0;
	}
`;

const FormBodyContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	max-width: 100%;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		.hide {
			display: none;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		.hide {
			display: none;
		}
	}
`;

const FormContainerButton = styled.div`
	width: 100%;
	padding: 1em 0 1em 0;
`;

const Button = styled.button`
	background-color: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	padding: 0.5em;
	margin-top: 0em;
	border: none;
	border-radius: 0;
	font-size: 24px;
	min-width: 220px;
	display: block;
	transform: opacity 100ms;

	${(p) =>
		p.disabled == true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}

	${(p) =>
		p.hide == true &&
		css`
			display: none;
		`}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
	}
`;

const NotificationsHeader = styled.h2`
	font-size: 1.2em;
	margin-bottom: 0.5em;
	margin-top: 1em;
`;

const CheckboxList = styled.div`
	margin-top: 1em;
	margin-bottom: 1em;
	${(p) =>
		p.removeMarginBottom == true &&
		css`
			margin-bottom: 0em;
		`}
	${(p) =>
		p.removeMarginTop == true &&
		css`
			margin-top: 0em;
		`}
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const Annotation = styled.div``;

export default withAuthRequiredConsumer(
	withApiConsumer(
		class MyDetailsPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					message: null,
					hide: false,
					loading: false,
					categories: null,
					orig_disabled_categories: null,
					blockedFields: new Set(),
					fields: {
						title: "",
						first_name: "",
						last_name: "",
						email: "",
						job_title: "",
						name_display_preference: "",
						receive_marketing_emails: false,
						disabled_categories: [],
						flyout_enabled: true,
						email_opt_out: [],
					},
					valid: {
						title: { isValid: true, message: "" },
						first_name: { isValid: true, message: "" },
						last_name: { isValid: true, message: "" },
						email: { isValid: true, message: "" },
						job_title: { isValid: true, message: "" },
						name_display_preference: { isValid: true, message: "" },
						receive_marketing_emails: { isValid: true, message: "" },
						disabled_categories: { isValid: true, message: "" },
						flyout_enabled: { isValid: true, message: "" },
					},
					showConfirmationBox: false,
					isDeleteUserFlyoutSeen: false,
					isChangedEmailOptOut: false,
				};

				this.ref_title = reactCreateRef();
				this.ref_first_name = reactCreateRef();
				this.ref_last_name = reactCreateRef();
				this.ref_job_title = reactCreateRef();
				this.ref_name_display_preference = reactCreateRef();
				this.ref_tutorial_view = reactCreateRef();
				this.ref_ep_notification = reactCreateRef();
				this.ref_email_notification_categories = reactCreateRef();
			}

			componentDidMount() {
				this._isMounted = true;
				this.bindFormFields();
				this.props.api(`/auth/get-notification-categories`).then((result) => {
					this.setState({ categories: result.items });
				});
				this.props.api(`/auth/user-get-uneditable-fields`, { edit_self: true }).then((result) => {
					this.setState({
						blockedFields: new Set(result.fields),
					});
				});
			}

			componentDidUpdate(prevProps) {
				if (userDidChange(this.props, prevProps)) {
					this.bindFormFields();
				}
			}

			hideConfirmModel = () => {
				const fields = { ...this.state.fields };
				fields["flyout_enabled"] = false;
				this.setState({ fields, showConfirmationBox: false });
			};

			onConfirm = () => {
				this.setState({
					showConfirmationBox: false,
					isDeleteUserFlyoutSeen: true,
				});
			};

			bindFormFields() {
				this.props.api(`/auth/get-my-disabled-notification-categories`).then((result) => {
					const fields = { ...this.state.fields };
					for (const key in this.props.withAuthConsumer_myUserDetails) {
						if (this.props.withAuthConsumer_myUserDetails.hasOwnProperty(key)) {
							const value = this.props.withAuthConsumer_myUserDetails[key] || "";
							fields[key] = value;
						}
					}
					fields.disabled_categories = result.items;
					this.setState({ fields, orig_disabled_categories: result.items });
				});
			}

			componentWillUnmount() {
				if (this._timeout) {
					clearTimeout(this._timeout);
				}
				delete this._timeout;
				delete this._isMounted;
			}

			/** handle text input change event
			 * @name {input controller name}
			 * @value {input controller value}
			 * @valid {input controller validation object {valid: true/false, messageType : "", message=""}}
			 */
			handleInputChange = (name, value, valid) => {
				let fields = Object.assign({}, this.state.fields);
				let formValid = Object.assign({}, this.state.valid);
				let message = null;
				fields[name] = value;
				formValid[name] = valid;
				this.setState({ fields: fields, valid: formValid, message: message });
			};

			/** check form input validation */
			isFormValid = () => {
				let status = true;
				let message = "";
				let messageDisplayType = "";
				Object.keys(this.state.valid).forEach((field) => {
					const result = this.state.valid[field];
					if (result && !result.isValid && status) {
						status = false;
						const errorMessage = result.message;
						messageDisplayType = messageType.error;
						switch (field) {
							case "title":
								message = ERROR_MESSAGE;
								break;
							case "first_name":
								message = errorMessage;
								break;
							case "last_name":
								message = errorMessage;
								break;
							case "job_title":
								message = errorMessage;
								break;
							case "name_display_preference":
								message = errorMessage;
								break;
							case "flyout_enabled":
								message = ERROR_MESSAGE;
								break;
							case "receive_marketing_emails":
								message = errorMessage;
								break;
						}
					}
				});
				const result = { status: status, message: message, messageType: messageDisplayType };
				return result;
			};

			handleSubmit = (e) => {
				e.preventDefault();
				// Prevent accidental double-submission.
				this.setState({ loading: true, isChangedEmailOptOut: false });

				//check with all form input  fields
				let valid = Object.assign({}, this.state.valid);
				Object.keys(valid).forEach((field) => {
					switch (field) {
						case "title":
							valid[field].isValid = this.ref_title.current.isValid();
							break;
						case "first_name":
							valid[field].isValid = this.ref_first_name.current.isValid();
							break;
						case "last_name":
							valid[field].isValid = this.ref_last_name.current.isValid();
							break;
						case "job_title":
							valid[field].isValid = this.ref_job_title.current.isValid();
							break;
						case "name_display_preference":
							valid[field].isValid = this.ref_name_display_preference.current.isValid();
							break;
						case "receive_marketing_emails":
							valid[field].isValid = true;
							break;
						case "flyout_enabled":
							valid[field].isValid = true;
							break;
					}
				});
				this.setState({ valid: valid, message: null }, this.submitFormRequest);
			};

			submitFormRequest = () => {
				if (!this.isFormValid().status) {
					this.setState({ loading: false });
					return false;
				} else {
					const myDetails = { ...this.props.withAuthConsumer_myUserDetails };
					myDetails.disabled_categories = this.state.orig_disabled_categories;
					const params = this.getFieldValuesForUpdate(myDetails, this.state.fields);
					this.props
						.api("/auth/update-my-details", params)
						.then((result) => {
							if (result.result) {
								googleEvent("myAccount", "my account", "update details");
								this.setState({ message: `Successfully updated` });

								this.setState({
									hide: false,
									message: "Successfully updated",
									messageType: messageType.success,
								});
								this.props.withAuthConsumer_attemptReauth();
							} else {
								this.setState({
									message: `Something went wrong`,
									messageType: messageType.error,
								});
							}
						})
						.catch((result) => {
							this.setState({
								message: result.toString(),
								messageType: messageType.warning,
							});
						})
						.finally(() => {
							this._timeout = setTimeout(() => {
								if (this._isMounted) {
									this.setState({ loading: false });
								}
							}, 500);
						});
				}
			};

			onCategoriesChange = (values) => {
				values = values.map((v) => parseInt(v, 10));
				const fields = { ...this.state.fields };
				fields.disabled_categories = values;
				this.setState({ fields });
			};

			onEmailOptOutChange = (values) => {
				const fields = { ...this.state.fields };
				fields.email_opt_out = values;
				this.setState({ fields });
			};

			onReceiveMarketingEmailsChange = (value) => {
				const fields = { ...this.state.fields };
				fields.receive_marketing_emails = value;
				this.setState({ fields });
			};

			onTutorialViewChange = (value) => {
				const fields = { ...this.state.fields };
				fields.flyout_enabled = value;
				let isShowConfirmationBox = false;
				if (value) {
					isShowConfirmationBox = true;
				}
				this.setState({ fields: fields, showConfirmationBox: isShowConfirmationBox });
			};

			getFieldValuesForUpdate = (currentUser, updatedUserDetail) => {
				let params = Object.create(null);

				if (currentUser.title != updatedUserDetail.title) {
					params.title = updatedUserDetail.title;
				}

				if (currentUser.first_name != updatedUserDetail.first_name) {
					params.first_name = updatedUserDetail.first_name.trim();
				}

				if (currentUser.last_name != updatedUserDetail.last_name) {
					params.last_name = updatedUserDetail.last_name.trim();
				}

				if (currentUser.job_title != (updatedUserDetail.job_title || null)) {
					params.job_title = updatedUserDetail.job_title.trim();
				}

				if (currentUser.flyout_enabled != updatedUserDetail.flyout_enabled) {
					params.flyout_enabled = updatedUserDetail.flyout_enabled;
				}

				if (!params.name_display_preference && !currentUser.name_display_preference) {
					// do nothing - both are falsy
				} else if (currentUser.name_display_preference != updatedUserDetail.name_display_preference) {
					params.name_display_preference = updatedUserDetail.name_display_preference.trim();
				}

				if (currentUser.receive_marketing_emails != updatedUserDetail.receive_marketing_emails) {
					params.receive_marketing_emails = !!updatedUserDetail.receive_marketing_emails;
				}

				if (!deepEqual(currentUser.disabled_categories.sort(), updatedUserDetail.disabled_categories.sort())) {
					params.disabled_categories = updatedUserDetail.disabled_categories.slice(0);
				}

				if (!deepEqual(currentUser.email_opt_out.sort(), updatedUserDetail.email_opt_out.sort())) {
					params.email_opt_out = updatedUserDetail.email_opt_out.slice(0);
					this.setState({
						isChangedEmailOptOut: true,
					});
				}

				params.email = currentUser.email;
				return params;
			};

			render() {
				const message = this.state.message;
				let errorMessage,
					disabled = false;

				const formValidation = this.isFormValid();
				if (formValidation && !formValidation.status) {
					disabled = true;
					errorMessage = (
						<MessageBox type={formValidation.messageType} title="" message={formValidation.message ? formValidation.message : ERROR_MESSAGE} />
					);
				} else {
					errorMessage = message ? <MessageBox message={message} type={this.state.messageType} /> : null;
				}

				return (
					<>
						<HeadTitle title={PageTitle.myDetails} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<MainTitle title="Edit My Details" icon="fal fa-edit" id={JUMP_TO_CONTENT_ID} />
						<BackGroundLime>
							<Container>
								<WrapRow>
									<PageContentMedium>
										<Row>
											<PageLeftIconContent />
											<PageContentLarge>
												<PageForm name="pageInputForm">
													{errorMessage}
													{
														<FormBodyContainer>
															<SelectTitleField
																ref={this.ref_title}
																name="title"
																title="Title"
																value={this.state.fields.title}
																isValid={this.state.valid.title.isValid}
																onChange={this.handleInputChange}
																isRequired={true}
																inputWidth="195px"
																options={userTitles}
																disabled={this.state.blockedFields.has("title")}
															/>

															<TextField
																ref={this.ref_first_name}
																name="first_name"
																title="First name"
																value={this.state.fields.first_name}
																isValid={this.state.valid.first_name.isValid}
																placeHolder={"First name"}
																onChange={this.handleInputChange}
																isRequired={true}
																minLength={1}
																maxLength={100}
																patterns={RegExPatterns.name}
																validationType={validationType.string}
																inputWidth="350px"
																disabled={this.state.blockedFields.has("first_name")}
															/>

															<TextField
																ref={this.ref_last_name}
																name="last_name"
																title="Last name"
																value={this.state.fields.last_name}
																isValid={this.state.valid.last_name.isValid}
																placeHolder={"Last name"}
																onChange={this.handleInputChange}
																isRequired={true}
																minLength={1}
																maxLength={100}
																patterns={RegExPatterns.name}
																validationType={validationType.string}
																inputWidth="350px"
																disabled={this.state.blockedFields.has("last_name")}
															/>

															<TextField
																ref={this.ref_job_title}
																name="job_title"
																title="Job title"
																value={this.state.fields.job_title}
																isValid={this.state.valid.job_title.isValid}
																placeHolder={"Job title"}
																onChange={this.handleInputChange}
																isRequired={false}
																inputWidth="290px"
																maxLength="150"
																validationType={validationType.string}
																inputWidth="350px"
																disabled={this.state.blockedFields.has("job_title")}
															/>

															<TextField
																ref={this.ref_email}
																name="email"
																title="Work email address"
																value={this.state.fields.email}
																isReadonly={true}
																inputWidth="350px"
																disabled={this.state.blockedFields.has("email")}
															/>

															<TextField
																ref={this.ref_name_display_preference}
																name="name_display_preference"
																title="Name displayed on Copies"
																value={this.state.fields.name_display_preference || ""}
																isValid={this.state.valid.name_display_preference.isValid}
																placeHolder={
																	this.props.withAuthConsumer_myUserDetails
																		? nameDisplayPreference.getDefault(this.props.withAuthConsumer_myUserDetails)
																		: "Enter copy name"
																}
																onChange={this.handleInputChange}
																onBlur={this.handleInputChange}
																isRequired={false}
																maxLength={100}
																validationType={validationType.string}
																inputWidth="350px"
																disabled={this.state.blockedFields.has("name_display_preference")}
															/>

															<CheckboxList removeMarginBottom={true}>
																<CheckBoxField
																	content="View the guided tour of the Education Platform"
																	value={this.state.fields.flyout_enabled}
																	onChange={this.onTutorialViewChange}
																/>
															</CheckboxList>

															<CheckboxList removeMarginTop={true} removeMarginBottom={true}>
																<CheckBoxField
																	content="Register for the Education Platform Newsletter"
																	value={this.state.fields.receive_marketing_emails}
																	onChange={this.onReceiveMarketingEmailsChange}
																/>
															</CheckboxList>

															{EMAIL_NOTIFICATION_CATEGORIES && (
																<>
																	<NotificationsHeader>Emails</NotificationsHeader>
																	<CheckboxSetField
																		refGroup={this.ref_email_notification_categories}
																		options={EMAIL_NOTIFICATION_CATEGORIES}
																		onChange={this.onEmailOptOutChange}
																		value={this.state.fields.email_opt_out || []}
																	/>
																</>
															)}

															{Array.isArray(this.state.categories) && (
																<>
																	<NotificationsHeader>On-Platform Notifications</NotificationsHeader>
																	<CheckboxSetField
																		refGroup={this.ref_ep_notification}
																		options={this.state.categories}
																		onChange={this.onCategoriesChange}
																		value={this.state.fields.disabled_categories || []}
																	/>
																</>
															)}

															<FormContainerButton>
																<Button onClick={this.handleSubmit} disabled={disabled || this.state.loading} name="btnRegister">
																	{" "}
																	Update{" "}
																</Button>
															</FormContainerButton>
															{this.state.isChangedEmailOptOut && this.state.messageType === messageType.success && (
																<Annotation>{NOTE_FOR_EMAIL_NOTIFICATION_CHANGED}</Annotation>
															)}
														</FormBodyContainer>
													}
													{this.state.showConfirmationBox ? (
														<ConfirmModal
															title={CONFIRM_TITLE}
															subTitle={CONFIRM_SUBTITLE}
															onClose={this.hideConfirmModel}
															onConfirm={this.onConfirm}
															onCancel={this.hideConfirmModel}
														/>
													) : (
														""
													)}
												</PageForm>
											</PageContentLarge>
										</Row>
									</PageContentMedium>
								</WrapRow>
							</Container>
						</BackGroundLime>
					</>
				);
			}
		}
	)
);
