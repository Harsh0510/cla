import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import styled, { css } from "styled-components";
import CustomDropzone from "../../widgets/Dropzone";
import Header from "../../widgets/Header";
import theme from "../../common/theme";
import UserRole from "../../common/UserRole";
import XLSX from "xlsx";
const moment = require("moment");
import messageType from "../../common/messageType";
import reactCreateRef from "../../common/reactCreateRef";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import staticValues from "../../common/staticValues";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import CreateBulkUsersList from "./CreateBulkUsersList";
import { WrapperDiv } from "../../widgets/AdminStyleComponents";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import { colLg12, colLg9, colMd12, colMd5, colMd7 } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
const NO_FILE_SELECTED = staticValues.noFileSelected;
const NO_SCHOOL_SELECTED = staticValues.noSchoolSelected;
const JUMP_TO_CONTENT_ID = "main-content";

// Make sure that: id === name.replace(/\W+/g, '_').toLowerCase()
const spreadsheetColumns = [
	{
		id: "email",
		name: "Email",
	},
	{
		id: "title",
		name: "Title",
	},
	{
		id: "first_name",
		name: "First Name",
	},
	{
		id: "last_name",
		name: "Last Name",
	},
	{
		id: "job_title",
		name: "Job Title",
	},
];

// /** Remove top */
// const PageWrapContent = styled(PageWrap)`
// 	padding: 1em 2em 1em 2em;
// `;

/** UsageForm Form */
const CreateBulkUsersForm = styled.form`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	margin: 0 auto;
	margin-top: 15%;
	margin-bottom: 8%;
	@media screen and (max-width: ${theme.breakpoints.desktop}) {
		margin-top: 8%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 0;
		margin-bottom: 3%;
	}
`;

const FormHeader = styled.h2`
	font-weight: 300;
	margin-bottom: 1em;
	font-size: 22px;
	color: ${theme.colours.headerButtonSearch};
`;

const FormSubmit = styled.button`
	background-color: ${theme.colours.headerButtonSearch};
	color: ${theme.colours.white};
	padding: 5px;
	margin-top: 1em;
	border: none;
	-webkit-appearance: none;
	font-weight: bold;
	width: 100px;
	margin: 10px auto;
	${(p) =>
		p.disabled == true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

const ButtonLink = styled.button`
	background: none;
	text-decoration: underline;
	color: ${theme.colours.btnLinkTextColor};
`;

const Container = styled.div`
	overflow-x: auto;
	min-height: 400px;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		min-height: auto;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: auto;
	}
`;

const CustomSelectSchool = styled.div`
	margin-bottom: 0.5em;
	.selectschool {
		border: ${(p) => (p.isValid ? "1px solid " + theme.colours.primary + "!important" : "2px solid " + theme.colours.messageError + " !important")};
		background-color: transparent !important;
		border-radius: 1px !important;
		color: ${theme.colours.primary} !important;
	}
`;

const DownloadLinkSection = styled.div`
	margin-top: 1em;
`;

const DownloadLink = styled.a`
	font-size: 15px;
	text-decoration: underline;
	font-weight: 500;
`;

const UnlockSection = styled.div`
	margin-bottom: 1.5rem;
	padding-bottom: 1.5rem;
	padding-right: 1rem;
	:after {
		content: "";
		width: 1px;
		height: 82%;
		position: absolute;
		background: ${theme.colours.lightGray};
		display: inline-block;
		top: 0;
		right: 0;
	}
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		padding-right: 3rem;
		padding-bottom: 0;
		margin-bottom: 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		:after {
			width: 60%;
			height: 1px;
			top: auto;
			left: 0;
			right: 0;
			bottom: 0;
			margin: 0px auto;
		}
	}
	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		:after {
			content: "";
			width: 1px;
			height: 82%;
			position: absolute;
			background: ${theme.colours.lightGray};
			display: inline-block;
			top: 0;
			right: 0;
			left: 100%;
		}
	}
	${colMd7}
`;

const SubTitle = styled.p`
	font-size: 16px;
	color: ${theme.colours.inputText};
`;

const PageWrapper = styled(Row)`
	justify-content: center;
	color: ${theme.colours.inputText};
`;

const FormMessage = styled.p`
	margin-bottom: 0.5em;
	margin-top: 25px;
	font-size: 16px;
	font-weight: normal;
	color: ${theme.colours.black};
`;

const UploadedFile = styled.span`
	margin-top: 1em;
	display: flex;
	position: relative;
	display: -webkit-box;
	display: -webkit-flex;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-align: center;
	-webkit-align-items: center;
	-ms-flex-align: center;
	align-items: center;
`;

const FileIcon = styled.i`
	font-size: 50px;
	vertical-align: middle;
	margin-right: 10px;
	color: ${theme.colours.lightGray};
`;

const ReportMessage = styled.span`
	padding-bottom: 20px;
`;

const ReportLink = styled.a`
	text-decoration: underline;
`;

const DownloadNoteSection = styled.div`
	margin-top: 0.7em;
	ul {
		padding-left: 1.5em;
	}
`;
const FormWrap = styled.div`
	${colMd5}
	padding-left: 1rem;
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		padding-left: 1.5rem;
	}
`;

const Section = styled.div`
	${colMd12}
	${colLg9}
`;

const FormHeaderWrap = styled.div`
	${colMd12}
`;

const SuccessMessage = styled.div`
	${colMd12}
	${colLg12}
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true, "school-admin": true },
	withApiConsumer(
		class createBulkUsers extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					accept: ".XLS, .XLSX, .ODT, .ODS, .CSV, .TXT",
					selectFile: null,
					schoolData: [],
					setOption: {
						value: "",
						label: "",
					},
					school_id: "",
					successData: null,
					errorsData: null,
					showSuccessList: false,
					message: null,
					messageType: messageType.error,
					school: "",
					valid: {
						school: { isValid: true, message: "" },
						selectFile: { isValid: true, message: "" },
					},
					userUploadedFiles: null,
					isSubmitButtonDisabled: true,
					errorMessage: null,
				};
				this.ref_school = reactCreateRef();
				this.handleUpload = this.handleUpload.bind(this);
				this.handleSubmit = this.handleSubmit.bind(this);
				this.onClick = this.onClick.bind(this);
			}

			componentDidMount() {}

			handleUpload(files) {
				if (files && files[0]) {
					let valid = Object.assign({}, this.state.valid);
					valid["selectFile"].isValid = true;
					this.setState({
						selectFile: files[0],
						valid: valid,
						successData: null,
						errorsData: null,
						showSuccessList: false,
						userUploadedFiles: files[0],
						isSubmitButtonDisabled: false,
						message: null,
					});
				}
			}

			handleSubmit(e) {
				e.preventDefault();
				let valid = Object.assign({}, this.state.valid);
				if (!this.state.school && this.ref_school.current) {
					valid["school"].isValid = this.ref_school.current.isValid();
				}
				if (!this.state.selectFile) {
					valid["selectFile"].isValid = false;
				}
				this.setState({ valid: valid, message: null }, () => {
					if (!this.isFormValid().status) {
						return false;
					} else {
						this.loadFile(this.state.selectFile);
					}
				});
			}

			loadFile(file) {
				const reader = new FileReader();
				const rABS = !!reader.readAsBinaryString;
				let isValidFile = true;
				reader.onload = (e) => {
					// TODO: This needs to be refactored out into a generic separate function that parses XLSX files into an array
					const wb = XLSX.read(e.target.result, { type: rABS ? "binary" : "array" });
					const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

					if (!Array.isArray(data) || data.length === 0) {
						this.setState({ isValidFile: isValidFile, message: "Spreadsheet must have at least one row" });
						return;
					}

					const processedData = data.map((datum) => {
						const ret = Object.create(null);
						for (const k in datum) {
							if (datum.hasOwnProperty(k)) {
								ret[k.trim().toLowerCase().replace(/\W+/g, "_")] = datum[k];
							}
						}
						return ret;
					});

					this.createBulkUsers(processedData);
				};

				if (rABS) {
					reader.readAsBinaryString(file);
				} else {
					reader.readAsArrayBuffer(file);
				}
			}

			createBulkUsers = (users) => {
				this.setState({ selectFile: null });
				const schoolId = parseInt(this.state.school.value, 10);
				if (schoolId > 0) {
					users.forEach((user) => {
						user.school_id = schoolId;
						user.role = "teacher";
					});
				} else {
					users.forEach((user) => {
						user.role = "teacher";
					});
				}
				this.props
					.api("/auth/user-create-bulk", {
						items: users,
					})
					.then((result) => {
						const errors = [];
						const successes = [];
						for (let i = 0, len = result.results.length; i < len; ++i) {
							const item = result.results[i];
							if (item.success) {
								successes.push({
									index: i,
									origUser: users[i],
									item: item,
								});
							} else {
								errors.push({
									index: i,
									origUser: users[i],
									message: item.message,
								});
							}
						}
						let count = successes.length;
						let message = "You have successfully created " + count + " user(s).";
						this.setState({
							message: message,
							successData: successes,
							errorsData: errors,
							messageType: messageType.success,
							showSuccessList: successes.length > 0 ? true : false,
						});
					})
					.catch((error) => {
						this.setState({ message: error.toString(), messageType: messageType.error });
					});
			};

			onClick() {
				let toggle = this.state.showSuccessList;
				this.setState({ showSuccessList: !toggle });
			}

			doDownloadSpreadsheet = (e) => {
				e.preventDefault();
				const wb = XLSX.utils.book_new();
				{
					const exportData = this.state.successData.map((item) => {
						const ret = {};
						for (const col of spreadsheetColumns) {
							ret[col.name] = item.origUser[col.id];
						}
						return ret;
					});
					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Success");
				}
				{
					const exportData = this.state.errorsData.map((item) => {
						const ret = {};
						for (const col of spreadsheetColumns) {
							ret[col.name] = item.origUser[col.id];
						}
						ret.Error = item.message;
						return ret;
					});
					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Errors");
				}

				/* generate an XLSX file */
				XLSX.writeFile(wb, "Education Platform - User Create Bulk Report - " + moment().format("YYYY-MM-DD") + ".xlsx");
			};

			/** handle school dropdown change event*/
			handleDrpChange = (name, select_school, valid) => {
				let formValid = Object.assign({}, this.state.valid);
				formValid[name] = valid;
				this.setState({ school: select_school, valid: formValid, message: null, successData: null, showSuccessList: false });
			};

			/** check form input validation */
			isFormValid() {
				let status = true;
				let message = "";
				let fieldsToCheck = [];
				if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
					fieldsToCheck.push("school");
				}
				fieldsToCheck.push("selectFile");

				fieldsToCheck.forEach((field) => {
					const result = this.state.valid[field];
					if (result && !result.isValid && status) {
						status = false;
						switch (field) {
							case "school":
								message = NO_SCHOOL_SELECTED;
								break;
							case "selectFile":
								message = NO_FILE_SELECTED;
								break;
						}
					}
				});
				const result = { status: status, message: message };
				return result;
			}

			/**Download sample template for upload */
			doDownloadTemplate = (e) => {
				e.preventDefault();
				const wb = XLSX.utils.book_new();
				{
					const datum = {};
					for (const col of spreadsheetColumns) {
						datum[col.name] = "";
					}
					const exportData = [datum];
					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Sample");
				}
				/* generate an XLSX file */
				XLSX.writeFile(wb, "UserCreateBulk_Template.csv");
			};

			invalidateFileUpload = () => {
				let valid = Object.assign({}, this.state.valid);
				this.setState({
					userUploadedFiles: null,
					isSubmitButtonDisabled: true,
					message: null,
				});
			};

			render() {
				let successData;
				let userAgent = window.navigator.userAgent;
				const showDragDropArea = userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1 ? false : true;
				let downoloadSection = (
					<DownloadLinkSection>
						To upload users to the Education Platform, you must use the following template.&nbsp;
						<br />
						<DownloadNoteSection>
							<span>Please ensure that: </span>
							<ul>
								<li>all fields are completed</li>
								<li>only valid email addresses are included</li>
								<li>
									titles are written with a capital letter and do not include any full stops (The only valid options are: Mr, Mrs, Ms, Miss, Mx, and
									Dr)
								</li>
								<li>that the column headings are delivered exactly as they are in the template.</li>
							</ul>
							<DownloadLink href="#" onClick={this.doDownloadTemplate}>
								Download the template.
							</DownloadLink>
						</DownloadNoteSection>
					</DownloadLinkSection>
				);

				if (this.state.successData) {
					successData = (
						<>
							<WrapperDiv>
								<span>
									You have successfully created{" "}
									<ButtonLink onClick={this.onClick} title="Click here to view a full report">
										{this.state.successData.length}
									</ButtonLink>{" "}
									user(s).
								</span>
								{this.state.successData.length !== 0 || this.state.errorsData.length !== 0 ? (
									<AdminPageFilterMessage>
										<ReportMessage>
											You may also download a{" "}
											<ReportLink href="#" onClick={this.doDownloadSpreadsheet}>
												report
											</ReportLink>{" "}
											of the created users and any failures.
										</ReportMessage>
									</AdminPageFilterMessage>
								) : null}
								{this.state.showSuccessList ? <CreateBulkUsersList tableData={this.state.successData} /> : ""}
							</WrapperDiv>
						</>
					);
				}

				let errorMessage,
					disabled = false;
				errorMessage = this.state.message ? this.state.message : null;
				const formValidation = this.isFormValid();
				if (formValidation && !formValidation.status) {
					disabled = true;
					errorMessage = formValidation.message ? formValidation.message : ERROR_MESSAGE;
				}

				return (
					<>
						<HeadTitle title={PageTitle.createBulkUsers} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={this.state.successData ? "Uploaded Users" : ""} id={JUMP_TO_CONTENT_ID}>
							<PageWrapper>
								{!this.state.successData ? (
									<Section>
										<CreateBulkUsersForm onSubmit={this.handleSubmit}>
											<Row>
												<FormHeaderWrap>
													<FormHeader>Bulk Create Users</FormHeader>
												</FormHeaderWrap>
											</Row>
											<Row>
												<UnlockSection>
													<SubTitle>Upload your users...</SubTitle>

													{this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin ? (
														<>
															<CustomSelectSchool isValid={this.state.valid.school.isValid}>
																<AjaxSearchableDropdown
																	ref={this.ref_school}
																	api={this.props.api}
																	requestApi={staticValues.api.schoolRequestApi}
																	title={"Name of institution"}
																	name="school"
																	placeholder="Select institution"
																	onChange={this.handleDrpChange}
																	valid={this.state.valid.school.isValid}
																	value={this.state.school}
																	multiple={false}
																	customWidth={"100%"}
																	minQueryLength={3}
																	labelIsOnTop={true}
																	required={true}
																	highlightOnError={true}
																/>
															</CustomSelectSchool>
														</>
													) : (
														""
													)}
													<CustomDropzone
														accept={this.state.accept}
														multiple={false}
														handleUpload={this.handleUpload}
														showDragDropArea={showDragDropArea}
														isValid={this.state.valid.selectFile.isValid}
														alternateText={downoloadSection}
														errorMessage={errorMessage}
														errorType={errorMessage ? messageType.error : null}
														isButtonColourful={true}
														buttonTitle="Choose File"
														showCustomUploadFiles={true}
														invalidateFileUpload={this.invalidateFileUpload}
														dragFieldText="an XLS, XLSX, ODT, TXT, ODS or CSV file containing your users. You can also use the choose file button below."
													/>
												</UnlockSection>
												<FormWrap>
													<span>Submit them to the Platform!</span>
													<FormMessage className="message">Uploaded file:</FormMessage>
													{this.state.valid["selectFile"].isValid ? (
														this.state.userUploadedFiles ? (
															<UploadedFile>
																<FileIcon className="far fa-file"></FileIcon>
																{this.state.userUploadedFiles.name}
															</UploadedFile>
														) : (
															""
														)
													) : null}
													<FormSubmit className="submit" type="submit" disabled={this.state.isSubmitButtonDisabled || !formValidation.status}>
														Submit
													</FormSubmit>
												</FormWrap>
											</Row>
										</CreateBulkUsersForm>
									</Section>
								) : (
									<SuccessMessage>
										<Container>{successData}</Container>
									</SuccessMessage>
								)}
							</PageWrapper>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
