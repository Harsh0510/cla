import React from "react";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import styled, { css } from "styled-components";
import Header from "../../widgets/Header";
import theme from "../../common/theme";
import WizardExtract from "../../widgets/WizardExtract";
import MessageBox from "../../widgets/MessageBox";
import messageType from "../../common/messageType";
import TextField from "../../widgets/TextField";
import SelectField from "../../widgets/SelectField";
import validationType from "../../common/validationType";
import reactCreateRef from "../../common/reactCreateRef";
import errorType from "../../common/errorType";
import RegExPatterns from "../../common/RegExPatterns";
import ExamBoards from "../../common/examBoards";
import extractIsbn from "../../common/extractIsbn";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import getPageOffsetString from "../../common/getPageOffsetString";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import FlyOutModal from "../../widgets/FlyOutModal";
import flyOutGuide from "./flyOutGuide";
import FlyOutHandler from "../../common/FlyOutHandler";
import Flyout from "../../widgets/Flyout";
import Loader from "../../widgets/Loader";
import staticValues from "../../common/staticValues";
import { colLg12, colLg3, colLg6, colLg8, colLg9, colMd6, colXl6 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { Button } from "../../widgets/Layout/Button";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import CheckBoxField from "../../widgets/CheckBoxField";
import date from "../../common/date";
import CopyConfirmDetails from "../../widgets/CopyConfirmDetails";

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
const SCREEN = flyOutGuide.screen;
const FLYOUT_INDEX_DEFAULT = -1; // user not seen any flyout for this screen
const FLYOUT_SECOND_INDEX = 0; // Index after first modal close
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count
const JUMP_TO_CONTENT_ID = "confirm-extract-page";
/** UsageForm Form */
const UsagePageForm = styled.form``;

const WrapUsagePageForm = styled.div`
	position: relative;
`;

const WrapDetailSection = styled.div`
	${(p) =>
		p.disabled === true &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

const WrapperLoader = styled.div`
	position: absolute;
	margin: 0 auto;
	width: 100%;
	height: 100%;
	z-index: 1;
`;

const FormHeader = styled.h2`
	text-align: left;
	margin: 1em 0;
	color: ${theme.colours.blueMagenta};
	font-size: 1.25em;
	font-weight: normal;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-bottom: 0;
		margin-top: 0;
		font-size: 1.125em;
	}
`;

const HelpText = styled.label`
	color: ${theme.colours.bgDarkPurple};
	margin-top: 0.5em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
	}
`;

const ConfirmButton = styled(Button)`
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	font-size: 0.875em;

	${(p) =>
		p.disabled === true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 0;
	}
`;

const BackButton = styled(ButtonLink)`
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	font-size: 0.875em;
	margin-right: 1em;

	${(p) =>
		p.disabled === true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`};
`;

const ButtonWrap = styled.div`
	display: flex;
	justify-content: flex-start;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		justify-content: space-between;
	}
`;

const PageContainer = styled.div`
	padding-bottom: 2em;
	min-height: 600px;
`;

const DetailsSection = styled(Row)`
	justify-content: center;

	${(p) =>
		p.marginTop &&
		css`
			margin-top: 3em;
			@media screen and (max-width: ${theme.breakpoints.mobile}) {
				margin-top: 1em;
			}
		`};
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0.875em;
	}
`;

const BackIcon = styled.i`
	margin-right: 0.5rem;
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const ConfirmIconButton = styled.i`
	margin-left: 0.5rem;
`;

const FullWrap = styled.div`
	${colLg12}
`;

const DetailsWrap = styled.div`
	${colLg8}
	${colXl6}
`;

const TextFieldWrap = styled.div`
	${colMd6}
	${colLg3}
`;

const SelectFieldWrap = styled.div`
	${colMd6}
	${colLg9}
`;

const HalfWrap = styled.div`
	${colLg6}
`;

const EditMessageWrap = styled.div`
	margin-top: 2em;
	font-style: italic;
	font-weight: 600;
	margin-bottom: -2em;
`;

const TitleMessage = styled.div`
	font-style: italic;
`;

const CopyEditInfoLink = styled.a`
	color: ${theme.colours.primary};
	margin-left: 2px;
	:hover {
		color: ${theme.colours.primary};
		cursor: pointer;
	}
`;

export default withAuthRequiredConsumer(
	withApiConsumer(
		class UsageFormPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					courseNumberOfStudents: null,
					fields: {
						extract_title: "",
						school: "",
						course_oid: "",
						course_name: "",
						work_title: "",
						number_of_students: "",
						exam_board: "",
					},
					isUserUploadedExtract: null,
					examBoards: ExamBoards,
					success: false,
					message: null,
					workData: null,
					formRedirect: false,
					extractOid: null,
					courseOid: null,
					initial_url: {
						course_oid: "",
						selected_pages: [],
					},
					number_field_error: null,
					selected: [],
					currentStep: 3,
					isbn13: null,
					valid: {
						extract_title: { isValid: true, message: "" },
						number_of_students: { isValid: true, message: "" },
						exam_board: { isValid: true, message: "" },
					},
					classLimitExceeded: false,
					schoolLimitExceeded: false,
					notificationCount: 0,
					isLoading: true,
					rolloverReviewOid: null,
					isRolloverReviewExtractExpired: false,
					setCourseDefaultNoOfStudent: false, //when user confirm to update the course number of student value at a time of review the extract
					expiryDate: null,
					action: null,
					cloneFromExtractOid: null,
				};
				this.ref_extract_title = reactCreateRef();
				this.ref_number_of_students = reactCreateRef();
				this.ref_exam_board = reactCreateRef();
				this.notificationRef = React.createRef(null);
				this.handleSubmit = this.handleSubmit.bind(this);
				this._flyOutHandler = new FlyOutHandler(this, this.props.api, SCREEN);
				this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
				this._flyOutHandlerOnCloseBound = this._flyOutHandler.onClose.bind(this._flyOutHandler);
				this._flyOutNotificationOnCloseBound = this._flyOutHandlerNotification.onCloseNotification.bind(this._flyOutHandlerNotification);
			}

			/* Get data for a single work from the database */
			fetchWork = (isbn) => {
				const isbn13 = extractIsbn(isbn);

				this.props.api("/public/asset-get-one", { isbn13 }).then((result) => {
					result = result.result;
					const fields = Object.assign({}, this.state.fields);
					fields.work_title = result.title;
					this.setState({
						workData: result,
						fields: fields,
						isLoading: false,
					});
				});
			};

			updateExtractPageLimit = (_) => {
				const isbn13 = this.props.match.params.isbn;
				const selectedPagesMap = this.state.selectedPagesMap;
				const courseOid = this.state.courseOid;
				const extractOid = this.state.extractOid || null;

				if (courseOid != null && courseOid != undefined && courseOid != "") {
					this.props
						.api("/public/get-extract-limits", {
							course_oid: courseOid,
							work_isbn13: isbn13,
							extract_oid: extractOid,
						})
						.then((result) => {
							const extractedPagesForCourseMap = Object.create(null);
							for (const page of result.course.extracted) {
								extractedPagesForCourseMap[page] = true;
							}
							const extractedPagesForSchoolMap = Object.create(null);
							for (const page of result.school.extracted) {
								extractedPagesForSchoolMap[page] = true;
							}

							let extractPageForCourseAttemptCount = result.course.extracted.length;
							let extractPageForSchoolAttemptCount = result.school.extracted.length;
							for (const page in selectedPagesMap) {
								if (selectedPagesMap[page]) {
									if (!extractedPagesForCourseMap[page]) {
										extractPageForCourseAttemptCount++;
									}
									if (!extractedPagesForSchoolMap[page]) {
										extractPageForSchoolAttemptCount++;
									}
								}
							}
							const extractLimitForCourse = result.course.limit;
							const pagesAllowedForCourse = extractLimitForCourse - extractPageForCourseAttemptCount;

							const extractLimitForSchool = result.school.limit;
							const pagesAllowedForSchool = extractLimitForSchool - extractPageForSchoolAttemptCount;

							const newState = {
								extractedPagesForCourseMap: extractedPagesForCourseMap,
								extractedPagesForSchoolMap: extractedPagesForSchoolMap,

								pagesAllowedForCourse: pagesAllowedForCourse,
								pagesAllowedForSchool: pagesAllowedForSchool,

								extractLimitForCourse: extractLimitForCourse,
								extractLimitForSchool: extractLimitForSchool,

								extractPageForCourseAttemptCount: extractPageForCourseAttemptCount,
								extractPageForSchoolAttemptCount: extractPageForSchoolAttemptCount,

								classLimitExceeded: result.course.extracted.length >= extractLimitForCourse,
								schoolLimitExceeded: result.school.extracted.length >= extractLimitForSchool,
							};

							if (pagesAllowedForCourse < 0 || pagesAllowedForSchool < 0) {
								newState.canExtract = false;
								newState.extractErrorMessage = "You have exceeded the maximum number of pages";
							} else {
								newState.canExtract = true;
								newState.extractErrorMessage = "";
							}
							this.setState(newState, () => {
								this.getExtract;
							});
						});
				} else {
					const newState = {
						canExtract: false,
						extractErrorMessage: "You do not have extract limit",
					};
					this.setState(newState);
				}
			};

			// Get single course info from the database based on the id in the url
			componentDidMount() {
				const fields = Object.assign({}, this.state.fields);
				const isbn13 = this.props.match.params.isbn;
				const userDetails = this.props.withAuthConsumer_myUserDetails;
				const parsed = queryString.parse(this.props.location.search);

				fields.school = userDetails.school;

				//update the isbn number
				this.setState({ isbn13: isbn13 });

				this.fetchWork(isbn13);

				// // Convert selected pages to an array of numbers
				const selectedArray = parsed.selected && parsed.selected.split("-").map((item) => parseInt(item, 10));

				//first load the url data
				const initial_url_data = Object.assign({}, this.state.initial_url);
				initial_url_data.course_oid = parsed.course;
				initial_url_data.selected_pages = parsed.selected;
				let expiredDate;
				let action = "updated";
				if (!parsed.extract_oid) {
					expiredDate = new Date(Date.now() + staticValues.extractEditableGracePeriodLimit * 24 * 60 * 60 * 1000);
					action = "created";
				}
				this.setState({
					fields: fields,
					courseOid: parsed.course,
					selected: selectedArray,
					initial_url: initial_url_data,
					expiryDate: expiredDate,
					action: action,
				});

				this.props
					.api("/public/course-get-all-for-school", {
						include_extra_data: true,
						oid: parsed.course,
						extractOid: parsed.extract_oid || null,
					})
					.then((result) => {
						result = result.result;

						const currentCourse = result.find((item) => item.oid === parsed.course);

						const fields = Object.assign({}, this.state.fields);
						let courseNumberOfStudents = 0;
						if (currentCourse && currentCourse.oid) {
							fields.course_oid = currentCourse.oid;
							fields.course_name = currentCourse.title;
							courseNumberOfStudents = currentCourse.number_of_students ? currentCourse.number_of_students : "";
							fields.number_of_students = courseNumberOfStudents;
							fields.exam_board = currentCourse.exam_board ? currentCourse.exam_board : "";
						} else {
							fields.course_oid = null;
							fields.course_name = ""; //currentCourse.title;
						}

						this.setState(
							{
								courseNumberOfStudents: courseNumberOfStudents,
								fields: fields,
							},
							() => {
								this.updateState();
							}
						);
					});

				/* -- Check if User has selected for Flyout --- */
				const userDetail = this.props.withAuthConsumer_myUserDetails;
				if (userDetail && userDetail.flyout_enabled) {
					this._flyOutHandler.getSeen();
					this._flyOutHandlerNotification.getSeenNotification();
				}
			}

			componentDidUpdate(prevProps, prevState) {
				if (this.props.location.search !== prevProps.location.search) {
					//this.updateState();
				}
				if (prevState.rolloverReviewOid !== this.state.rolloverReviewOid && this.state.rolloverReviewOid) {
					this.getExtract();
				}

				if (prevState.extractOid !== this.state.extractOid && this.state.extractOid) {
					this.getExtract();
				}

				if (prevState.cloneFromExtractOid !== this.state.cloneFromExtractOid && this.state.cloneFromExtractOid) {
					this.getExtract();
				}
			}

			componentWillUnmount() {
				this._flyOutHandler.destroy();
				this._flyOutHandlerNotification.destroy();
				delete this._flyOutHandler;
				delete this._flyOutHandlerNotification;
			}

			/** Update component state to match query string */
			updateState = () => {
				const parsed = queryString.parse(this.props.location.search);

				const fields = Object.assign({}, this.state.fields);
				const isbn13 = this.props.match.params.isbn;
				const userDetails = this.props.withAuthConsumer_myUserDetails;

				this.fetchWork(isbn13);

				fields.school = userDetails.school;

				// // Convert selected pages to an array of numbers
				const selectedArray = parsed.selected && parsed.selected.split("-").map((item) => parseInt(item, 10));

				let selectedPagesArray;
				let selectedPagesMap = Object.create(null);

				if (parsed.selected) {
					selectedPagesArray = parsed.selected.split("-");
					for (const key of selectedPagesArray) {
						selectedPagesMap[key] = true;
					}
				}

				this.setState(
					{
						selectedPagesMap: selectedPagesMap,
						fields: fields,
						selected: selectedArray,
						courseOid: parsed.course,
						rolloverReviewOid: parsed.rollover_review_oid,
						extractOid: parsed.extract_oid,
						cloneFromExtractOid: parsed.clone_from_copy_oid,
					},
					this.updateExtractPageLimit
				);
			};

			/**
			 * Handles the form submission and attempts to add a new course to the database
			 * @param {Event} e submit event
			 */
			handleSubmit = (e) => {
				e.preventDefault();
				//check with all form input fields
				let valid = Object.assign({}, this.state.valid);
				Object.keys(valid).forEach((field) => {
					switch (field) {
						case "extract_title":
							valid[field].isValid = this.ref_extract_title.current.isValid();
							break;
						case "number_of_students":
							valid[field].isValid = this.ref_number_of_students.current.isValid();
							break;
					}
				});
				this.setState({ valid: valid, message: null }, this.submitFormRequest);
			};

			submitFormRequest = (e) => {
				if (!this.isFormValid().status) {
					return false;
				} else {
					const fields = this.state.fields;
					const isbn13 = extractIsbn(this.props.match.params.isbn);

					const params = {
						course_oid: fields.course_oid,
						work_isbn13: isbn13,
						students_in_course: parseInt(fields.number_of_students, 10),
						exam_board: fields.exam_board,
						extract_title: fields.extract_title,
						pages: this.state.selected,
						setCourseDefaultNoOfStudent: this.state.setCourseDefaultNoOfStudent,
						rollover_review_oid: this.state.rolloverReviewOid,
						extract_oid: this.state.extractOid,
						clone_from_extract_oid: this.state.cloneFromExtractOid,
					};
					this.setState({
						isLoading: true,
					});
					if (this.state.extractOid) {
						this.submitExtract("/public/extract-update", params);
					} else {
						this.submitExtract("/public/extract-create", params);
					}
				}
			};

			submitExtract = (apiUrl, params) => {
				this.props
					.api(apiUrl, params)
					.then((result) => {
						this.setState({
							cloneFromExtractOid: null,
							rolloverReviewOid: null,
							extractOid: result.extract.oid,
							formRedirect: true,
							isLoading: false,
						});
					})
					.catch((result) => {
						this.setState({
							message: result,
							isLoading: false,
						});
					});
			};

			/** handle text input change event*/
			handleInputChange = (name, value, valid) => {
				// Clone the fields object in state.
				let fields = Object.assign({}, this.state.fields);
				let formValid = Object.assign({}, this.state.valid);

				fields[name] = value;
				formValid[name] = valid;

				this.setState({
					fields: fields,
					valid: formValid,
					message: null,
				});
			};

			setNotificationCount = (count) => {
				this.setState({
					notificationCount: count,
				});
			};

			/** check form input validation */
			isFormValid() {
				let status = true;
				let message = "";

				Object.keys(this.state.valid).forEach((field) => {
					const result = this.state.valid[field];
					if (result && !result.isValid && status) {
						status = false;
						const errorMessage = result.message;
						switch (field) {
							case "extract_title":
								message = ERROR_MESSAGE;
								break;
							case "number_of_students":
								message = result.message;
								if (result.errorType === errorType.validation) {
									message = "The Number of Students must be a number between 1 and 10000.";
								} else if (result.errorType === errorType.required) {
									message = "This is a required field.";
								} else {
									message = errorMessage;
								}
								break;
						}
					}
				});
				const result = { status: status, message: message };
				return result;
			}

			getExtract = () => {
				if (this.state.rolloverReviewOid || this.state.extractOid || this.state.cloneFromExtractOid) {
					this.props
						.api("/public/extract-search", { extract_oid: this.state.rolloverReviewOid || this.state.extractOid || this.state.cloneFromExtractOid })
						.then((result) => {
							if (result.extracts.length) {
								const extract = result.extracts[0];
								const fields = Object.assign({}, this.state.fields);
								fields.extract_title = extract.title;
								fields.exam_board = extract.exam_board;
								fields.number_of_students = extract.students_in_course;
								fields.school = extract.school_name;
								this.setState({
									fields: fields,
									isUserUploadedExtract: !!extract.asset_url,
									isRolloverReviewExtractExpired: extract.expired,
									expiryDate: new Date(extract.grace_period_end),
								});
							} else {
								this.setState({ rolloverReviewOid: null, isUserUploadedExtract: null, extractOid: null, cloneFromExtractOid: null });
							}
						});
				}
			};

			handleInputCheckbox = (name, value, isValid) => {
				this.setState({ setCourseDefaultNoOfStudent: !this.state.setCourseDefaultNoOfStudent });
			};

			getExtractBackRedirectUrl = () => {
				const url =
					"/works/" +
					this.props.match.params.isbn +
					"/extract/?course=" +
					this.state.initial_url.course_oid +
					"&selected=" +
					this.state.initial_url.selected_pages;
				if (this.state.rolloverReviewOid) {
					return url + "&rollover_review_oid=" + this.state.rolloverReviewOid;
				}
				if (this.state.cloneFromExtractOid) {
					return url + "&clone_from_copy_oid=" + this.state.cloneFromExtractOid;
				}

				if (this.state.extractOid) {
					return url + "&extract_oid=" + this.state.extractOid;
				}

				return url;
			};

			render() {
				const { courseNumberOfStudents, fields, examBoards, formRedirect, extractOid, isbn13, message, selected, workData } = this.state;

				if (formRedirect) {
					return <Redirect to={`/profile/management/${extractOid}?action=${this.state.action}`} />;
				}
				const pageOffsetObject = getPageOffsetObject(workData);
				const pageOffsetString = getPageOffsetString(selected, pageOffsetObject.roman, pageOffsetObject.arabic);
				let errorMessage,
					customMessage,
					title = "",
					disabled;

				if (message && message.length > 0) {
					disabled = true;
					errorMessage = <MessageBox type={messageType.error} title={title} message={message} />;
				} else {
					const formValidation = this.isFormValid();
					if (!formValidation.status) {
						disabled = true;
						customMessage = <div>{formValidation.message ? formValidation.message : ERROR_MESSAGE}</div>;
						errorMessage = <MessageBox type={messageType.error} title={title} message={customMessage} />;
					}
				}

				let pagesUsed;
				let pagesMax;
				if (this.state.pagesAllowedForCourse < this.state.pagesAllowedForSchool) {
					pagesUsed = this.state.extractPageForCourseAttemptCount;
					pagesMax = this.state.extractLimitForCourse;
				} else {
					pagesUsed = this.state.extractPageForSchoolAttemptCount;
					pagesMax = this.state.extractLimitForSchool;
				}

				let limitMessage = (
					<HelpText>
						This will use {pagesUsed} of the {pagesMax} total pages you can copy.
					</HelpText>
				);

				if (
					pageOffsetString === "" ||
					this.state.extractPageForCourseAttemptCount > this.state.extractLimitForCourse ||
					this.state.extractPageForSchoolAttemptCount > this.state.extractLimitForSchool
				) {
					disabled = true;
				}

				if (this.state.classLimitExceeded) {
					limitMessage = (
						<HelpText>You have reached the copying limit for this class but you can still copy pages that have previously been copied.</HelpText>
					);
				} else if (this.state.schoolLimitExceeded) {
					limitMessage = (
						<HelpText>You have reached the copying limit for this book but you can still copy pages that have previously been copied.</HelpText>
					);
				}

				let closing =
					this.state.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION && this.state.notificationCount > NOTIFICATION_COUNT_DEFAULT
						? false
						: true;

				const expiredDate = date.rawToNiceDate(this.state.expiryDate);

				return (
					<>
						<HeadTitle title={PageTitle.usageForm} suffix={fields.work_title + " : Education Platform"} hideSuffix={true} />
						<Header
							flyOutIndexNotification={this.state.flyOutIndexNotification}
							setNotificationCount={this.setNotificationCount}
							onClose={this._flyOutNotificationOnCloseBound}
							notificationRef={this.notificationRef}
							jumpToContentId={JUMP_TO_CONTENT_ID}
						/>
						{workData && fields ? (
							<>
								<WizardExtract step={this.state.currentStep} unlocked={workData.is_unlocked} />
								<BackGroundLime>
									<Container>
										<PageContainer>
											<WrapUsagePageForm id={JUMP_TO_CONTENT_ID}>
												{this.state.isLoading ? (
													<WrapperLoader>
														<Loader />
													</WrapperLoader>
												) : (
													""
												)}
												<WrapDetailSection disabled={this.state.isLoading}>
													<CopyConfirmDetails
														isbn13={isbn13}
														workData={workData}
														fields={fields}
														selected={this.state.selected}
														pageOffsetString={pageOffsetString}
														userUploadedAsset={false}
													/>

													{this.state.expiryDate ? (
														<DetailsSection>
															<DetailsWrap>
																<Row>
																	<FullWrap>
																		<EditMessageWrap>
																			You can edit this copy at any time before {expiredDate}, or until you print or share it.{" "}
																			<CopyEditInfoLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4404469418257" target="_blank">
																				<i className="fas fa-info-circle"></i>
																			</CopyEditInfoLink>
																		</EditMessageWrap>
																	</FullWrap>
																</Row>
															</DetailsWrap>
														</DetailsSection>
													) : null}

													<DetailsSection marginTop={"3em"}>
														<DetailsWrap>
															<Row>
																<FullWrap>
																	<FormHeader> Additional Required Details </FormHeader>
																	{errorMessage}
																</FullWrap>
															</Row>
															<UsagePageForm onSubmit={this.handleSubmit}>
																<Row>
																	<FullWrap>
																		<TextField
																			ref={this.ref_extract_title}
																			name="extract_title"
																			title="Copy Title"
																			value={this.state.fields.extract_title}
																			isValid={this.state.valid.extract_title.isValid}
																			placeHolder={""}
																			onChange={this.handleInputChange}
																			onBlur={this.handleInputChange}
																			isRequired={true}
																			maxLength={250}
																			patterns={RegExPatterns.copyTitle}
																			validationType={validationType.string}
																		/>
																		{(this.state.rolloverReviewOid || this.state.cloneFromExtractOid) && (
																			<TitleMessage>
																				Remember to change your Copy Name, unless you would like to use the same name{" "}
																				{this.state.rolloverReviewOid ? "as last year" : "for this copy"}.
																			</TitleMessage>
																		)}
																	</FullWrap>
																</Row>
																<Row>
																	<TextFieldWrap>
																		<TextField
																			ref={this.ref_number_of_students}
																			name="number_of_students"
																			title="# of Students"
																			value={this.state.fields.number_of_students}
																			isValid={this.state.valid.number_of_students.isValid}
																			placeHolder={""}
																			onChange={this.handleInputChange}
																			onBlur={this.handleInputChange}
																			isRequired={true}
																			minValue={1}
																			maxValue={10000}
																			validationType={validationType.number}
																		/>
																	</TextFieldWrap>
																	<SelectFieldWrap>
																		<SelectField
																			ref={this.ref_exam_board}
																			name="exam_board"
																			title="Exam Board (optional)"
																			value={this.state.fields.exam_board}
																			isValid={this.state.valid.exam_board.isValid}
																			options={examBoards}
																			onChange={this.handleInputChange}
																			onBlur={this.handleInputChange}
																			isRequired={false}
																			isDefaultSelectText={true}
																		/>
																	</SelectFieldWrap>
																</Row>
																<Row>
																	<FullWrap>{limitMessage}</FullWrap>
																</Row>
																{this.state.rolloverReviewOid && !courseNumberOfStudents && this.state.isRolloverReviewExtractExpired && (
																	<Row>
																		<FullWrap>
																			<CheckBoxField
																				name="changeCourseNoOfStudent"
																				title="Do you want to save this number of students for this class?"
																				isRequired={false}
																				isValid={true}
																				value={false}
																				checked={this.state.setCourseDefaultNoOfStudent}
																				onChange={this.handleInputCheckbox}
																			/>
																		</FullWrap>
																	</Row>
																)}
																<Row>
																	<HalfWrap>
																		<ButtonWrap>
																			{this.state.isUserUploadedExtract ? null : (
																				<div>
																					<BackButton title="Back" to={this.getExtractBackRedirectUrl()} disabled={this.state.isLoading}>
																						<BackIcon className="fal fa-chevron-left"></BackIcon> Back
																					</BackButton>
																				</div>
																			)}
																			<div>
																				<ConfirmButton title="Confirm" type="submit" disabled={disabled || this.state.isLoading}>
																					Confirm <ConfirmIconButton className="fal fa-chevron-right"></ConfirmIconButton>
																				</ConfirmButton>
																			</div>
																		</ButtonWrap>
																	</HalfWrap>
																</Row>
															</UsagePageForm>
														</DetailsWrap>
													</DetailsSection>
												</WrapDetailSection>
											</WrapUsagePageForm>
										</PageContainer>
									</Container>
								</BackGroundLime>
								{this.state.flyOutIndex === FLYOUT_INDEX_DEFAULT && (
									<FlyOutModal
										handleShowMe={this._flyOutHandlerOnCloseBound}
										showButton={true}
										title={flyOutGuide.popupTitle}
										subTitle={flyOutGuide.popupSubTitle}
										buttonText={flyOutGuide.buttonText}
										closeBackgroundImmediately={closing}
									/>
								)}
								{this.state.flyOutIndex === FLYOUT_SECOND_INDEX &&
								this.state.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
								this.state.notificationCount > NOTIFICATION_COUNT_DEFAULT ? (
									<Flyout
										width={350}
										height={110}
										onClose={this._flyOutNotificationOnCloseBound}
										target={this.notificationRef}
										side_preference={"bottom"}
									>
										{flyOutGuide.flyOutNotification}
									</Flyout>
								) : null}
							</>
						) : (
							""
						)}
					</>
				);
			}
		}
	)
);
