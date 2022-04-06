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
import CreateBulkClassesList from "./CreateBulkClassesList";
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
		spreadsheetId: "name",
		id: "title",
		name: "Name",
	},
	{
		id: "year_group",
		name: "Year group",
	},
	{
		id: "number_of_students",
		name: "Number of students",
	},
	{
		id: "exam_board",
		name: "Exam board",
	},
	{
		id: "key_stage",
		name: "Key stage",
	},
];

const getNumericIfPossible = (str) => {
	if (isNaN(str)) {
		return str;
	}
	const flt = parseFloat(str);
	if (isNaN(flt)) {
		return str;
	}
	return flt;
};

const fetchXlsxData = (wb) => {
	// We only want to read the first five columns (A-E) and ignore everything else.
	const ws = wb.Sheets[wb.SheetNames[0]];
	const columns = ["A", "B", "C", "D", "E"];

	const spreadsheetColummsById = Object.create(null);
	for (const col of spreadsheetColumns) {
		spreadsheetColummsById[col.spreadsheetId || col.id] = true;
	}

	// Extract headings from first row of spreadsheet.
	const headings = [];
	for (const column of columns) {
		const value = ws[column + "1"];
		if (!value) {
			return null;
		}
		if (!value.v) {
			return null;
		}
		/*
		 * Make sure they the heading matches one of the expected heading names
		 * and make sure it's not a duplicate heading.
		 */
		const heading = value.v.trim().toLowerCase().replace(/\W+/g, "_");
		if (!spreadsheetColummsById[heading]) {
			return null;
		}
		delete spreadsheetColummsById[heading];
		headings.push(heading);
	}
	if (headings.length !== spreadsheetColumns.length) {
		return null;
	}

	const data = [];

	// Read subsequent rows (after header row) one by one until we reach a completely blank row.
	let i = 2;
	while (true) {
		const row = Object.create(null);
		for (const heading of headings) {
			row[heading] = null;
		}
		let idx = 0;
		for (const column of columns) {
			const value = ws[column + i];
			if (value && typeof value.v !== "undefined") {
				row[headings[idx]] = getNumericIfPossible(value.v.toString().trim());
			}
			idx++;
		}
		let allEmpty = true;
		for (const k in row) {
			if (row[k] !== null) {
				allEmpty = false;
				break;
			}
		}
		if (allEmpty) {
			// All the cells are empty for this row, so we've reached the end - exit
			break;
		}
		data.push(row);
		i++;
	}

	return data;
};

// /** Remove top */
// const PageWrapContent = styled(PageWrap)`
// 	padding: 1em 2em 1em 2em;
// `;

/** UsageForm Form */
const CreateBulkClassesForm = styled.form`
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
		class CreateBulkClasses extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					accept: ".XLSX",
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
				reader.onload = (e) => {
					const wb = XLSX.read(e.target.result, { type: rABS ? "binary" : "array" });
					const data = fetchXlsxData(wb);

					if (!data) {
						this.setState({ message: "Spreadsheet invalid. Are you sure you followed the template correctly?" });
						return;
					}
					if (!data.length) {
						this.setState({ message: "Spreadsheet must have at least one row" });
						return;
					}

					const processedData = data.map((datum) => {
						const ret = { ...datum };
						ret.title = ret.name;
						delete ret.name;
						return ret;
					});

					this.createBulkClasses(processedData);
				};

				if (rABS) {
					reader.readAsBinaryString(file);
				} else {
					reader.readAsArrayBuffer(file);
				}
			}

			createBulkClasses = (classes) => {
				this.setState({ selectFile: null });
				const schoolId = parseInt(this.state.school.value, 10);
				this.props
					.api("/admin/class-create-bulk", {
						items: classes,
						school_id: schoolId,
					})
					.then((result) => {
						const errors = [];
						const successes = [];
						for (const idx of result.successfullyLoadedIndexes) {
							successes.push({
								index: idx,
								origClass: classes[idx],
								item: {
									success: true,
								},
							});
						}
						for (const err of result.errors) {
							errors.push({
								index: err.index,
								origClass: classes[err.index],
								message: err.message,
							});
						}
						const count = successes.length;
						const message = "You have successfully created " + count + " class" + (count !== 1 ? "es" : "") + ".";
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
							ret[col.name] = item.origClass[col.id];
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
							ret[col.name] = item.origClass[col.id];
						}
						ret.Error = item.message;
						return ret;
					});
					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Errors");
				}

				/* generate an XLSX file */
				XLSX.writeFile(wb, "Education Platform - Class Create Bulk Report - " + moment().format("YYYY-MM-DD") + ".xlsx");
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
				const userAgent = window.navigator.userAgent;
				const showDragDropArea = userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1 ? false : true;
				let downoloadSection = (
					<DownloadLinkSection>
						Alternatively, you can click the button below to select a file from your computer to create classes or courses in bulk.
						<br />
						<br />
						You must use our template to submit a bulk upload.
						<br />
						<br />
						<span>
							Please follow the guidance in the template, ensuring that all fields are completed correctly and words are written with a capital
							letter.
						</span>
						<br />
						<br />
						<DownloadLink href={process.env.ASSET_ORIGIN + "/misc/bulk_class_upload_template.xlsx"}>Download the template.</DownloadLink>
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
									class{this.state.successData.length !== 1 ? "es" : ""}.
								</span>
								{this.state.successData.length !== 0 || this.state.errorsData.length !== 0 ? (
									<AdminPageFilterMessage>
										<ReportMessage>
											You may also download a{" "}
											<ReportLink href="#" onClick={this.doDownloadSpreadsheet}>
												report
											</ReportLink>{" "}
											of the created classes and any failures.
										</ReportMessage>
									</AdminPageFilterMessage>
								) : null}
								{this.state.showSuccessList ? <CreateBulkClassesList tableData={this.state.successData} /> : ""}
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
						<HeadTitle title={PageTitle.createBulkClasses} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={this.state.successData ? "Uploaded Classes" : ""} id={JUMP_TO_CONTENT_ID}>
							<PageWrapper>
								{!this.state.successData ? (
									<Section>
										<CreateBulkClassesForm onSubmit={this.handleSubmit}>
											<Row>
												<FormHeaderWrap>
													<FormHeader>Bulk Create Classes</FormHeader>
												</FormHeaderWrap>
											</Row>
											<Row>
												<UnlockSection>
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
														dragFieldText="an XLSX file containing (Class) Name (mandatory), Key Stage, Year Group, Number of Students and Exam Board here to bulk create your classes or courses."
													/>
												</UnlockSection>
												<FormWrap>
													<span>Submit Classes to the Platform!</span>
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
										</CreateBulkClassesForm>
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
