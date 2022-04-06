import React from "react";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import queryString from "query-string";
import styled, { css } from "styled-components";
import MessageBox from "../../widgets/MessageBox";
import theme from "../../common/theme";
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
import { STEPS } from "./constants";
import StepFlow from "./StepFlow";
import Loader from "../../widgets/Loader";
import staticValues from "../../common/staticValues";
import { colLg12, colLg3, colLg6, colLg8, colLg9, colMd6, colXl6 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { Button } from "../../widgets/Layout/Button";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import CopyConfirmDetails from "../../widgets/CopyConfirmDetails";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import getPageOffsetString from "../../common/getPageOffsetString";

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
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
	pointer-events: none;
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const ConfirmIconButton = styled.i`
	margin-left: 0.5rem;
	pointer-events: none;
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

const DropDownContainer = styled.div`
	${colMd6}
	${colLg9}
`;

const ClassLabel = styled.label`
	margin-bottom: 0;
	margin-top: 0.5em;
`;

const ContactSupportLink = styled.a`
	text-decoration: underline;
	color: ${theme.colours.primary};
	:hover {
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
						upload_name: "",
					},
					examBoards: ExamBoards,
					message: null,
					workData: null,
					extractOid: null,
					courseOid: null,
					selected: [],
					isbn13: null,
					valid: {
						extract_title: { isValid: true, message: "" },
						number_of_students: { isValid: true, message: "" },
						exam_board: { isValid: true, message: "" },
					},
					classLimitExceeded: false,
					schoolLimitExceeded: false,
					isLoading: true,
					selectedClass: null,
					assetUserUploadOid: null,
					courses: [],
				};
				this.ref_extract_title = reactCreateRef();
				this.ref_number_of_students = reactCreateRef();
				this.ref_exam_board = reactCreateRef();
				this.handleSubmit = this.handleSubmit.bind(this);
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
				const parsed = queryString.parse(this.props.location.search);
				const isbn13 = parsed.isbn13;
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

							const extractLimitForCourse = Math.ceil(this.state.workData.page_count * staticValues.allowedPercentageForUserUploadedCopy * 0.01);
							const pagesAllowedForCourse = extractLimitForCourse - extractPageForCourseAttemptCount;

							const extractLimitForSchool = result.school.limit;
							const pagesAllowedForSchool = extractLimitForSchool - extractPageForSchoolAttemptCount;

							let classLimitExceeded = result.course.extracted.length >= result.course.limit;
							let schoolLimitExceeded = result.school.extracted.length >= extractLimitForSchool;
							if (extractPageForCourseAttemptCount === result.course.extracted.length) {
								classLimitExceeded = false;
								schoolLimitExceeded = false;
							}

							const newState = {
								extractedPagesForCourseMap: extractedPagesForCourseMap,
								extractedPagesForSchoolMap: extractedPagesForSchoolMap,

								pagesAllowedForCourse: pagesAllowedForCourse,
								pagesAllowedForSchool: pagesAllowedForSchool,

								extractLimitForCourse: extractLimitForCourse,
								extractLimitForSchool: extractLimitForSchool,

								extractPageForCourseAttemptCount: extractPageForCourseAttemptCount,
								extractPageForSchoolAttemptCount: extractPageForSchoolAttemptCount,

								classLimitExceeded: classLimitExceeded,
								schoolLimitExceeded: schoolLimitExceeded,
							};

							if (pagesAllowedForCourse < 0 || pagesAllowedForSchool < 0) {
								newState.canExtract = false;
								newState.extractErrorMessage = "You have exceeded the maximum number of pages";
							} else {
								newState.canExtract = true;
								newState.extractErrorMessage = "";
							}
							this.setState(newState);
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
				this._isMounted = true;
				const fields = Object.assign({}, this.state.fields);

				const userDetails = this.props.withAuthConsumer_myUserDetails;
				const parsed = queryString.parse(this.props.location.search);
				const isbn13 = parsed.isbn13;
				const locationState = this.props.location.state;
				const reqParams = locationState ? locationState.requestParams : {};
				fields.upload_name = fields.extract_title = parsed.upload_name || reqParams.upload_name || "";
				fields.school = userDetails.school;
				fields.course_oid = parsed.course;

				//update the isbn number and asset user upload oid
				this.setState({ isbn13: isbn13, assetUserUploadOid: parsed.asset_user_upload_oid });

				this.fetchWork(isbn13);

				// // Convert selected pages to an array of numbers
				const selectedArray = parsed.selected && parsed.selected.split("-").map((item) => parseInt(item, 10));

				this.setState({
					fields: fields,
					courseOid: parsed.course,
					selected: selectedArray,
				});

				this.props
					.api("/public/course-get-all-for-school", {
						include_extra_data: true,
					})
					.then((result) => {
						this.setState({ courses: result.result }, this.updateState);
					});
			}

			componentDidUpdate(prevProps) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			/** Update component state to match query string */
			updateState = () => {
				const parsed = queryString.parse(this.props.location.search);

				const fields = Object.assign({}, this.state.fields);
				const isbn13 = parsed.isbn13;
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

				const currentCourse = this.state.courses.find((item) => item.oid === parsed.course);
				let selectedClass = null;
				let courseNumberOfStudents = 0;
				if (currentCourse && currentCourse.oid) {
					fields.course_oid = currentCourse.oid;
					fields.course_name = currentCourse.title;
					courseNumberOfStudents = currentCourse.number_of_students ? currentCourse.number_of_students : "";
					fields.number_of_students = courseNumberOfStudents;
					fields.exam_board = currentCourse.exam_board ? currentCourse.exam_board : "";
					selectedClass = this.getSelectedClass(currentCourse.oid, currentCourse.title);
				} else {
					fields.course_oid = null;
					fields.course_name = ""; //currentCourse.title;
					fields.number_of_students = "";
					fields.exam_board = "";
				}

				this.setState(
					{
						selectedPagesMap: selectedPagesMap,
						fields: fields,
						selected: selectedArray,
						courseOid: parsed.course,
						courseNumberOfStudents: courseNumberOfStudents,
						selectedClass: selectedClass,
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
				} else if (this.state.assetUserUploadOid) {
					const { isbn13, fields, selected } = this.state;
					const requestParams = {
						work_isbn13: isbn13,
						course_oid: fields.course_oid,
						students_in_course: parseInt(fields.number_of_students, 10),
						exam_board: fields.exam_board,
						extract_title: fields.extract_title,
						pages: selected,
						asset_user_upload_oid: this.state.assetUserUploadOid,
					};
					this.setState(
						{
							isLoading: true,
						},
						() => {
							this.props
								.api("/public/extract-create", requestParams)
								.then((result) => {
									if (!this._isMounted) {
										return;
									}
									this.setState(
										{
											extractOid: result.extract.oid,
											isLoading: false,
										},
										() => {
											this.props.history.push(`/profile/management/${result.extract.oid}?action=created`);
										}
									);
								})
								.catch((err) => {
									if (!this._isMounted) {
										return;
									}
									this.setState({ error: err, isLoading: false });
								})
								.finally(() => {
									if (!this._isMounted) {
										return;
									}
									this.setState({
										loading: false,
									});
								});
						}
					);
				} else {
					const fields = this.state.fields;
					const requestParams = {
						...this.props.location.state.requestParams,
						is_created_copy: true,
						is_created_extract: true,
						course_oid: fields.course_oid,
						students_in_course: parseInt(fields.number_of_students, 10),
						exam_board: fields.exam_board,
					};
					const requestFile = this.props.location.state.requestFile;
					this.setState(
						{
							isLoading: true,
						},
						() => {
							{
								this.props
									.api("/public/user-asset-upload", requestParams, requestFile)
									.then((result) => {
										if (!this._isMounted) {
											return;
										}
										this.setState(
											{
												extractOid: result.extract_oid,
												isLoading: false,
											},
											() => {
												this.props.history.push(`/profile/management/${result.extract_oid}?action=created`);
											}
										);
									})
									.catch((err) => {
										if (!this._isMounted) {
											return;
										}
										this.setState({ error: err, isLoading: false });
									})
									.finally(() => {
										if (!this._isMounted) {
											return;
										}
										this.setState({
											loading: false,
										});
									});
							}
						}
					);
				}
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

			getExtractBackRedirectUrl = () => {
				const p = queryString.parse(this.props.location.search);
				if (p.back_url && p.back_url[0] === "/") {
					return p.back_url;
				}
				if (this.state.assetUserUploadOid) {
					return "/profile/admin/my-uploads";
				}

				let { requestParams, requestFile, publicationYear } = this.props.location.state;
				requestParams.select_class = this.state.selectedClass;
				const publicationYearString = publicationYear ? `&publicationYear=${publicationYear}` : "";
				const pageCountString = requestParams["page_count"] ? `&pageCount=${requestParams["page_count"]}` : "";
				const { search, type } = queryString.parse(this.props.location.search);

				return {
					pathname: `/asset-upload/upload-content`,
					search:
						"?title=" +
						encodeURIComponent(requestParams.title) +
						`&isbn=` +
						requestParams.isbn +
						`&author=` +
						encodeURIComponent(JSON.stringify(requestParams.authors)) +
						`&publisher=` +
						encodeURIComponent(requestParams.publisher) +
						`&course=` +
						this.state.courseOid +
						publicationYearString +
						pageCountString +
						`&search=` +
						search +
						`&type=` +
						type,
					state: { params: requestParams, file: requestFile.files.asset },
				};
			};

			getSelectedClass = (courseId, courseName) => {
				return { value: courseId, label: courseName, key: courseId, id: courseId };
			};

			handleDrpChange = (name, select_class, valid) => {
				const parsed = queryString.parse(this.props.location.search);
				parsed.course = select_class ? select_class.id : null;
				this.props.history.push({
					pathname: `/asset-upload/copy-confirm`,
					search: `?${queryString.stringify(parsed)}`,
					state: this.props.location.state,
				});
			};

			render() {
				const { fields, examBoards, isbn13, message, error, workData, selected } = this.state;
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
				let limitMessage = "";

				if (this.state.courseOid) {
					if (this.state.pagesAllowedForCourse < this.state.pagesAllowedForSchool) {
						pagesUsed = this.state.extractPageForCourseAttemptCount;
						pagesMax = this.state.extractLimitForCourse;
					} else {
						pagesUsed = this.state.extractPageForSchoolAttemptCount;
						pagesMax = this.state.extractLimitForSchool;
					}

					limitMessage = (
						<HelpText>
							This will use {pagesUsed} of the {pagesMax} total pages you can copy.
						</HelpText>
					);

					if (pageOffsetString === "") {
						disabled = true;
					}

					if (
						this.state.extractPageForCourseAttemptCount > this.state.extractLimitForCourse ||
						this.state.extractPageForSchoolAttemptCount > this.state.extractLimitForSchool
					) {
						disabled = true;
						limitMessage = <HelpText>{this.state.extractErrorMessage}</HelpText>;
					} else if (this.state.schoolLimitExceeded) {
						disabled = true;
						limitMessage = (
							<HelpText>
								The copying allowance for this book has already been reached. Please{" "}
								<ContactSupportLink href="mailto:support@educationplatform.zendesk.com">contact support</ContactSupportLink> for further
								clarification.
							</HelpText>
						);
					} else if (this.state.classLimitExceeded) {
						disabled = true;
						limitMessage = (
							<HelpText>
								You have exceeded the copying allowance for this class. If this class was selected in error, please change your selection. If you've{" "}
								selected the correct class, please{" "}
								<ContactSupportLink href="mailto:support@educationplatform.zendesk.com">contact support</ContactSupportLink> for further
								clarification.
							</HelpText>
						);
					}
				}

				const classesDropdown = () => {
					return (
						<AjaxSearchableDropdown
							api={this.props.api}
							name="class"
							value={this.state.selectedClass}
							placeholder="Select..."
							onChange={this.handleDrpChange}
							minQueryLength={2}
							requestApi={staticValues.api.classSearch}
							performApiCallWhenEmpty={true}
							highlightOnError={true}
							customControlStyle={{ padding: "4px", border: 0 }}
							required={true}
							gaAttribute={{ "data-ga-user-extract": this.state.selectedClass ? "confirmation-class-select" : "confirmation-class-dropdown" }}
						/>
					);
				};

				return (
					<>
						<HeadTitle title={PageTitle.usageForm} suffix={fields.work_title + " : Education Platform"} hideSuffix={true} />
						<StepFlow steps={STEPS} selectedStep={4} />
						{workData && fields ? (
							<>
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
														selected={selected}
														pageOffsetString={pageOffsetString}
														userUploadedAsset={true}
													/>

													<DetailsSection marginTop={"2em"}>
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
																	</FullWrap>
																</Row>
																<Row>
																	<DropDownContainer>
																		<ClassLabel>Class</ClassLabel>
																		{classesDropdown()}
																	</DropDownContainer>
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
																</Row>
																<Row>
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
																<Row>
																	<HalfWrap>
																		<ButtonWrap>
																			<div>
																				<BackButton
																					title="Back"
																					to={this.getExtractBackRedirectUrl()}
																					disabled={this.state.isLoading}
																					data-ga-user-extract="confirmation-back"
																				>
																					<BackIcon className="fal fa-chevron-left"></BackIcon>Back
																				</BackButton>
																			</div>
																			<div>
																				<ConfirmButton
																					title="Confirm"
																					type="submit"
																					disabled={disabled || this.state.isLoading}
																					data-ga-user-extract="confirmation-confirm"
																				>
																					Confirm <ConfirmIconButton className="fal fa-chevron-right"></ConfirmIconButton>
																				</ConfirmButton>
																			</div>
																		</ButtonWrap>
																	</HalfWrap>
																</Row>
																{error && (
																	<Row>
																		<FullWrap>
																			<HelpText>{error}</HelpText>
																		</FullWrap>
																	</Row>
																)}
															</UsagePageForm>
														</DetailsWrap>
													</DetailsSection>
												</WrapDetailSection>
											</WrapUsagePageForm>
										</PageContainer>
									</Container>
								</BackGroundLime>
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
