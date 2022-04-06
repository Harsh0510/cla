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
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import UnlockList from "./UnlockList";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import { WrapperDiv } from "../../widgets/AdminStyleComponents";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import staticValues from "../../common/staticValues";
import { colLg12, colLg9, colMd12, colMd5, colMd7 } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";

const NO_FILE_SELECTED = staticValues.noFileSelected;
const NO_SCHOOL_SELECTED = staticValues.noSchoolSelected;
const JUMP_TO_CONTENT_ID = "main-content";

/** UsageForm Form */
const UnlockContentForm = styled.form`
	width: 100%;
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
	margin-bottom: 0.4em;
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
		border: ${(p) =>
			p.isValid ? "1px solid " + theme.colours.headerButtonSearch + "!important" : "2px solid " + theme.colours.messageError + " !important"};
		background-color: transparent !important;
		border-radius: 1px !important;
		color: ${theme.colours.headerButtonSearch} !important;
	}
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
const FormMessage = styled.p`
	margin-bottom: 0.5em;
	margin-top: 25px;
	font-size: 16px;
	font-weight: normal;
	color: ${theme.colours.black};
`;

const SubTitle = styled.p`
	font-size: 16px;
	color: ${theme.colours.inputText};
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

const FileIcon = styled.i`
	font-size: 50px;
	vertical-align: middle;
	margin-right: 10px;
	color: ${theme.colours.lightGray};
`;

const DonloadLink = styled.a`
	text-decoration: underline;
`;

const PageWrapper = styled(Row)`
	color: ${theme.colours.inputText};
	justify-content: center;
`;
const UploadFormWrap = styled.div`
	padding-left: 1rem;
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		padding-left: 1.5rem;
	}
	${colMd5}
`;

const FormHeaderWrap = styled.div`
	${colMd12}
`;

const UnlockFormSection = styled(FormHeaderWrap)`
	${colLg9}
`;

const UnlockDataWrap = styled(FormHeaderWrap)`
	${colLg12}
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true, "school-admin": true },
	withApiConsumer(
		class UnlockContent extends React.PureComponent {
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
					unlocked: null,
					showUnlockedList: false,
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
					valid["selectFile"].message = "";
					this.setState({
						selectFile: files[0],
						valid: valid,
						unlocked: null,
						showUnlockedList: false,
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
				if (!this.state.userUploadedFiles) {
					valid["selectFile"].isValid = false;
				}
				this.setState({ valid: valid, message: null }, () => {
					if (!this.isFormValid().status) {
						return false;
					} else {
						this.loadFile(this.state.userUploadedFiles);
					}
				});
			}

			loadFile(file) {
				const reader = new FileReader();
				const rABS = !!reader.readAsBinaryString;
				reader.onload = (e) => {
					const isbns = [];
					const locations = [];
					const bstr = e.target.result;
					const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
					/** loop  of the sheets*/
					//for(var i=0 ; i < wb.SheetNames.length ; i++){
					const wsname = wb.SheetNames[0];
					const ws = wb.Sheets[wsname];
					if (typeof ws["!ref"] !== "undefined") {
						var range = XLSX.utils.decode_range(ws["!ref"]);
						/** Cell range value*/
						for (var R = range.s.r; R <= range.e.r; ++R) {
							for (var C = range.s.c; C < 1; ++C) {
								var cell_address = { c: C, r: R };
								/* if an A1-style address is needed, encode the address */
								var cell_ref = XLSX.utils.encode_cell(cell_address);
								var cell = ws[cell_ref];
								if (typeof cell !== "undefined") {
									//check the isValidateISBN
									let isbn = this.isValidateISBN(cell.v.toString().trim());
									if (isbn) {
										isbns.push(isbn);
										locations.push(cell_ref);
									} else {
										continue;
									}
								} else {
									continue;
								}
							}
						}
					}
					//}
					/** Called api for unlock the books */
					this.unlockContent(isbns, locations);
				};

				if (rABS) reader.readAsBinaryString(file);
				else reader.readAsArrayBuffer(file);
				//reader.readAsBinaryString(file);
			}

			isValidateISBN = (isbnString) => {
				return isbnString.trim().slice(0, 32);
			};

			unlockContent = (isbns, locations) => {
				this.setState({ selectFile: null });
				this.props
					.api("/admin/unlock-bulk", {
						isbns: isbns,
						locations: locations,
						school_id: parseInt(this.state.school.value, 10),
					})
					.then((result) => {
						let unlockedData = result.result.unlocked;
						let count = unlockedData.length;
						let message = "You have successfully unlocked " + count + " titles.";
						this.setState({
							message: message,
							unlocked: unlockedData,
							unlockErrors: result.result.errors,
							messageType: messageType.success,
							showUnlockedList: unlockedData.length > 0 || result.result.errors.length,
						});
					})
					.catch((error) => {
						this.setState({ message: error.toString(), messageType: messageType.error });
					});
			};

			onClick() {
				let toggle = this.state.showUnlockedList;
				this.setState({ showUnlockedList: !toggle });
			}

			getAuthors(authors) {
				return authors ? authors.map((author) => author.firstName + " " + author.lastName).join(", ") : "";
			}

			doDownloadSpreadsheet = (e) => {
				e.preventDefault();
				const wb = XLSX.utils.book_new();

				{
					const exportData = this.state.unlocked.map((item) => ({
						eISBN: item.isbn13,
						"Print ISBN": item.pdf_isbn13,
						Title: item.title,
						Authors: this.getAuthors(item.authors),
					}));
					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Unlocked");
				}
				{
					const exportData = this.state.unlockErrors.map((item) => ({
						Value: item.value,
						Message: item.message,
						Location: item.location,
					}));
					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Errors");
				}

				/* generate an XLSX file */
				XLSX.writeFile(wb, "Education Platform - Unlock Report - " + moment().format("YYYY-MM-DD") + ".xlsx");
			};

			/** handle school dropdown change event*/
			handleDrpChange = (name, select_school, valid) => {
				let formValid = Object.assign({}, this.state.valid);
				formValid[name] = valid;
				this.setState({ school: select_school, valid: formValid, message: null, unlocked: null, showUnlockedList: false });
			};

			invalidateFileUpload = () => {
				let valid = Object.assign({}, this.state.valid);
				this.setState({
					userUploadedFiles: null,
					isSubmitButtonDisabled: true,
					message: null,
				});
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

			render() {
				let unlockedData;
				let userAgent = window.navigator.userAgent;
				const showDragDropArea = userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1 ? false : true;

				if (this.state.unlocked) {
					unlockedData = (
						<>
							<span>
								You have successfully unlocked{" "}
								<ButtonLink onClick={this.onClick} title="Click here to view a full report">
									{this.state.unlocked.length}
								</ButtonLink>{" "}
								titles
							</span>
							{this.state.showUnlockedList ? (
								<>
									<WrapperDiv>
										{this.state.unlocked.length || this.state.unlockErrors.length ? (
											<AdminPageFilterMessage>
												<span>
													{" "}
													You may also download a{" "}
													<DonloadLink href="#" onClick={this.doDownloadSpreadsheet}>
														report
													</DonloadLink>{" "}
													of the unlocked titles.
												</span>
											</AdminPageFilterMessage>
										) : null}

										<UnlockList unlockedData={this.state.unlocked} />
									</WrapperDiv>
								</>
							) : (
								""
							)}
						</>
					);
				}

				let errorMessage,
					disabled = true;
				errorMessage = this.state.message ? this.state.message : null;
				const formValidation = this.isFormValid();
				let formErrorMessage;
				if (!errorMessage && formValidation && !formValidation.status) {
					disabled = true;
					errorMessage = formValidation.message ? formValidation.message : "Something has been wrong!";
				}

				return (
					<>
						<HeadTitle title={PageTitle.unlockContent} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={this.state.unlocked ? "Unlocked titles" : null} id={JUMP_TO_CONTENT_ID}>
							<PageWrapper>
								{!this.state.unlocked ? (
									<UnlockFormSection>
										<UnlockContentForm onSubmit={this.handleSubmit}>
											<Row>
												<FormHeaderWrap>
													<FormHeader>Unlock Content</FormHeader>
												</FormHeaderWrap>
											</Row>
											<Row>
												<UnlockSection>
													<SubTitle>Upload your titles...</SubTitle>
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
																	limit={25}
																	minQueryLength={3}
																	labelIsOnTop={true}
																	required={true}
																	highlightOnError={true}
																	showDefaultToolTipOnError={false}
																/>
															</CustomSelectSchool>
														</>
													) : (
														""
													)}
													<CustomDropzone
														accept={this.state.accept}
														isMultiple={false}
														handleUpload={this.handleUpload}
														showDragDropArea={showDragDropArea}
														isValid={this.state.valid.selectFile.isValid}
														isButtonColourful={true}
														buttonTitle="Choose File"
														dragFieldText="an XLS, XLSX, ODT, TXT, ODS or CSV file containing ISBNs here to unlock content for your institution."
														errorMessage={errorMessage}
														errorType={errorMessage ? messageType.error : null}
														showCustomUploadFiles={true}
														alternateText="Alternatively you can select the button below to select a file from your computer and unlock that instead."
														invalidateFileUpload={this.invalidateFileUpload}
													/>
												</UnlockSection>
												<UploadFormWrap>
													<span>Unlock your titles!</span>
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
												</UploadFormWrap>
											</Row>
										</UnlockContentForm>
									</UnlockFormSection>
								) : (
									<UnlockDataWrap>
										<Container>{unlockedData}</Container>
									</UnlockDataWrap>
								)}
							</PageWrapper>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
