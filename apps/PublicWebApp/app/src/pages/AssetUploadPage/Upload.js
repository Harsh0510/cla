import React from "react";
import withApiConsumer from "../../common/withApiConsumer";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import StepFlow from "./StepFlow";
import { STEPS } from "./constants";
import { Container } from "../../widgets/Layout/Container";
import Dropzone from "../../widgets/Dropzone";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { FormBodyContainer, FormContainerHalf, FormInput, FormWrapAddEdit, FormError } from "../../widgets/AdminStyleComponents";
import queryString from "query-string";
import NameInputField from "../../widgets/NameInputField";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import staticValues from "../../common/staticValues";
import numericRangeExpand from "../../common/numericRangeExpand";
import Loader from "../../widgets/Loader";
import { ISBN } from "../../common/isbn";
import getPageOffsetString from "../../common/getPageOffsetString";
import extractIsbn from "../../common/extractIsbn";
import Modal from "../../widgets/Modal";
import { Button } from "../../widgets/Layout/Button";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import CheckBoxField from "../../widgets/CheckBoxField";

const ACCEPT_FILE_TYPE = ".PDF";
const DROPZONE_ALTERNATE_TEXT = "Alternatively you can select the button below to select a file from your computer and upload that instead.";
const DROPZONE_DRAG_FIELD_TEXT = "PDF file here to upload your extract";
const ALLOWED_PERCENTAGE_FOR_COPY = 5;
const CREATE_A_COPY_CHECKBOX_NAME = "isSelectedCreateCopy";
const MANUAL_TYPE = "manual";
const SEARCH_TYPE = "search";

const ConatinerWrapper = styled.div`
	margin: 2rem 0;
`;

const Label = styled.div`
	font-size: 16px;
	margin-bottom: 10px;
`;

const CustomFormWrapAddEdit = styled(FormWrapAddEdit)`
	position: relative;
`;

const FormWrapper = styled.div`
	width: 90%;
	margin: 0 auto;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
	}
`;

const FormInner = styled.div`
	display: flex;
	flex-direction: column;
	${(p) => (p.isLoading ? "opacity: 0.3; pointer-events: none;" : null)}
`;

const LoaderWrap = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
`;

const FormMessage = styled.p`
	margin-bottom: 0.5em;
	margin-top: 25px;
	font-size: 16px;
	font-weight: normal;
`;

const UploadedFile = styled.span`
	margin-top: 1em;
	display: flex;
	position: relative;
	align-items: center;
`;

const BackButton = styled.button`
	background-color: ${theme.colours.headerButtonSearch};
	color: ${theme.colours.white};
	padding: 5px;
	margin-top: 1em;
	border: none;
	-webkit-appearance: none;
	appearance: none;
	font-weight: bold;
	width: 180px;
	margin: 10px auto;
`;

const FileIcon = styled.i`
	font-size: 50px;
	vertical-align: middle;
	margin-right: 10px;
	color: ${theme.colours.lightGray};
`;

const CheckBoxContainer = styled.div`
	margin: 0rem auto;
	display: flex;
	align-items: baseline;
`;

const CheckboxLabel = styled.span`
	font-size: 1rem;
	color: ${theme.colours.bgDarkPurple};
	pointer-events: none;
`;

const AjaxSearchableDropdownWrapper = styled.div`
	width: 30%;
	margin: 1rem auto;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
		padding: 0 1rem;
	}
`;

const TextContainer = styled.div`
	border: 1px solid ${theme.colours.inputBorder};
	margin-bottom: 2rem;
`;

const InfoText = styled.div`
	text-align: center;
	margin: 1rem 2rem;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin: 1rem;
	}
`;

const ResponseText = styled(InfoText)`
	font-style: normal;
	text-align: center;
	p {
		font-style: italic;
	}
	a {
		text-decoration: none;
		color: ${theme.colours.headerButtonSearch};
	}
	.not-found {
		font-style: italic;
	}
`;

const SubtitleInfoText = styled(InfoText)`
	text-align: left;
`;

const Error = styled.div`
	color: ${theme.colours.errorTextColor};
	text-align: center;
`;

const FormInputWrap = styled.div`
	margin: 1rem 0;
`;

const FieldWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 45%;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile4}) {
		input ::-webkit-input-placeholder {
			font-size: 12px;
		}
	}
`;

const PageRangeFieldWrapper = styled.div`
	display: flex;
`;

const FormContainerHalfWrapper = styled(FormContainerHalf)`
	color: ${theme.colours.bgDarkPurple};
	${(p) =>
		p.side === "left" &&
		css`
			margin-right: 25px;
		`}
	${(p) =>
		p.side === "right" &&
		css`
			max-width: calc(50% - 25px);

			@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
				margin: 1rem 0;
			}
		`}

	:first-child {
		padding-right: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
		max-width: 100%;
		margin-bottom: 0px;
		padding-top: 0px;
		margin-right: 0px;
	}
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

const FormLabel = styled.div`
	margin-bottom: 2px;
`;

const FieldInfoText = styled.div`
	font-style: italic;
	margin-top: 5px;
`;

const PercentageCopied = styled.div`
	padding: 5px 0 0 5px;
	font-weight: bold;

	${(p) =>
		p.percentageCopied > ALLOWED_PERCENTAGE_FOR_COPY
			? css`
					color: ${theme.colours.errorTextColor};
			  `
			: css`
					color: ${theme.colours.fgColorSuccess};
			  `}
`;

const PageRangeExceedLabel = styled.div`
	font-weight: bold;
	font-size: 1rem;
	color: ${theme.colours.bgDarkPurple};
	pointer-events: none;
`;

const IconWrapper = styled.span`
	display: inline-block;
	margin-left: 0.25em;
	color: ${theme.colours.primary};
`;

const ModalBody = styled.div`
	margin: 2rem 6rem;
	text-align: center;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 2rem;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile3}) {
		margin: 1rem 0;
	}
`;

const ModalButonContainer = styled.div`
	margin-top: 2rem;
`;

const ButtonWrap = styled.div`
	width: 100%;
	display: flex;
	box-sizing: border-box;
	justify-content: center;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		padding: 0;
		flex-direction: column;
	}
`;

const BackButtonLink = styled(ButtonLink)`
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	font-size: 0.875em;
	margin-right: 1em;
	display: flex;
`;

const BackIcon = styled.i`
	margin-right: 0.5rem;
	margin-top: 0.2em;
	pointer-events: none;
`;

const AssetInfoData = styled.div`
	display: flex;
	flex-wrap: nowrap;
`;

const Span = styled.span`
	min-width: 150px;
`;

const BottomContainer = styled.div`
	margin: 2rem 0 1rem;
	width: 100%;
	display: flex;
	flex-direction: column;
	border: 1px solid ${theme.colours.inputBorder};
`;

const SubmitButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

export default withApiConsumer(
	class Upload extends React.PureComponent {
		constructor(props) {
			super(props);
			this.state = {
				isFormValid: true,
				fields: {
					title: "",
					isbn: "",
					author: [],
					publisher: "",
					publicationYear: "",
					pages: "",
					pagesArray: [],
					pageCount: 0,
					assetPdfFile: "",
					selectedClass: "",
					image: "",
					uploadName: "",
				},
				valid: {
					title: { isValid: true, message: "" },
					isbn: { isValid: true, message: "" },
					author: { isValid: true, message: "" },
					publisher: { isValid: true, message: "" },
					publicationYear: { isValid: true, message: "" },
					pages: { isValid: true, message: "" },
					pagesArray: { isValid: true, message: "" },
					pageCount: { isValid: true, message: "" },
					assetPdfFile: { isValid: true, message: "" },
					selectedClass: { isValid: true, message: "" },
					image: { isValid: true, message: "" },
					uploadName: { isValid: true, message: "" },
				},
				isSelectedCreateCopy: false,
				error: null,
				loading: true,
				isCopyingFullChapter: false,
				isOwned: false,
				isDisabledPageCount: false,
				isShowModal: false,
				schoolLimit: null,
				classLimitExceeded: false,
				schoolLimitExceeded: false,
				assetPermissionStatus: "",
			};
		}

		componentDidMount() {
			this._isMounted = true;
			this.updateState();
			const { isbn } = queryString.parse(this.props.location.search);
			this.fetchWork(isbn);
			this.checkAssetPermission(isbn);
			this.fetchSchoolExtentLimit(isbn);
		}

		componentWillUnmount() {
			delete this._isMounted;
		}

		componentDidUpdate(prevProps) {
			if (this.props.location.search !== prevProps.location.search) {
				this.updateState();
				const oldQuery = queryString.parse(prevProps.location.search);
				const newQuery = queryString.parse(this.props.location.search);
				if (oldQuery.isbn !== newQuery.isbn) {
					this.fetchSchoolExtentLimit(newQuery.isbn);
					this.fetchWork(newQuery.isbn);
					this.checkAssetPermission(newQuery.isbn);
				}
			}
		}

		checkAssetPermission = (isbn) => {
			if (!isbn) {
				this.setState({
					assetPermissionStatus: null,
				});
				return;
			}
			this.props
				.api("/public/asset-check-permissions", { isbn: isbn })
				.then((result) => {
					this.setState({ assetPermissionStatus: result.status });
				})
				.catch((err) => {
					console.log(err);
					this.setState({ assetPermissionStatus: "Error" });
				})
				.finally(() => {
					this.setState({ loading: false });
				});
		};

		fetchWork = (isbn) => {
			const isbn13 = extractIsbn(isbn);
			if (isbn13) {
				this.props.api("/public/asset-get-one", { isbn13 }).then((result) => {
					this.setState(
						{
							fields: {
								...this.state.fields,
								pageCount: (result && result.result && result.result.page_count) || this.state.fields.pageCount,
							},
							isDisabledPageCount: this.state.isDisabledPageCount || (result && result.result),
						},
						this.validateForm
					);
				});
			}
		};

		updateState() {
			const { title, isbn, author, publisher, publicationYear, pageCount, image, course } = queryString.parse(this.props.location.search);
			const decodedTitle = decodeURIComponent(title || "");
			const decodedPublisher = decodeURIComponent(publisher || "");
			const decodedAuthor = (() => {
				if (!author) {
					return [];
				}
				const v = decodeURIComponent(author);
				if (!v) {
					return [];
				}
				let arr;
				try {
					arr = JSON.parse(v);
				} catch (e) {
					arr = [];
				}
				if (!Array.isArray(arr)) {
					return [];
				}
				return arr;
			})();
			const decodedImage = decodeURIComponent(image || "");
			const locationState = this.props.location.state;

			const params = {};
			if (locationState) {
				params.pages = locationState.params.pages;
				params.uploadName = locationState.params.upload_name;
				params.selectedClass = locationState.params.select_class;
				params.pagesArray = locationState.params.pages;
				params.assetPdfFile = locationState.file;
			}

			this.setState(
				{
					fields: {
						...this.state.fields,
						title: decodedTitle || "",
						isbn: isbn || "",
						author: decodedAuthor,
						publisher: decodedPublisher || "",
						publicationYear: publicationYear || "",
						pageCount: pageCount || 0,
						image: decodedImage || undefined,
						...params,
					},
					isSelectedCreateCopy: course ? true : false,
					isOwned: course ? true : false,
					isDisabledPageCount: parseInt(pageCount, 10) > 0,
				},
				this.validateForm
			);
		}

		validateForm = () => {
			let validFields = { ...this.state.valid };
			Object.keys(this.state.fields).forEach((key) => {
				if (key === "selectedClass") {
					if (this.state.isSelectedCreateCopy) {
						validFields = this.validateFieldBasedOnValue(key, validFields);
					} else {
						validFields[key].isValid = true;
					}
				} else if (key === "pagesArray") {
					if (!this.state.fields.pagesArray || !this.state.fields.pagesArray.length) {
						validFields[key].isValid = false;
						validFields[key].message = "Please provide valid page range";
					} else {
						validFields[key].isValid = true;
						validFields[key].message = null;
					}
				} else if (key === "pageCount") {
					if (this.state.fields.pageCount < 1) {
						validFields[key].isValid = false;
						validFields[key].message = "Please enter the total number of pages in the book";
					} else {
						validFields[key].isValid = true;
						validFields[key].message = null;
					}
				} else if (["publicationYear"].includes(key)) {
					validFields[key].isValid = true;
					validFields[key].message = null;
				} else if (key === "image") {
					validFields[key].isValid = true;
					validFields[key].message = null;
				} else {
					validFields = this.validateFieldBasedOnValue(key, validFields);
				}
			});

			this.setState({ valid: validFields }, () => {
				let isFormValid = true;
				Object.keys(validFields).forEach((key) => {
					if (!validFields[key].isValid && isFormValid) {
						isFormValid = false;
					}
				});
				this.setState({ isFormValid: isFormValid });
			});
		};

		validateFieldBasedOnValue = (fieldKey, validFormResult) => {
			if (this.state.fields[fieldKey]) {
				validFormResult[fieldKey].isValid = true;
				validFormResult[fieldKey].message = null;
			} else {
				validFormResult[fieldKey].isValid = false;
				validFormResult[fieldKey].message = `Required ${fieldKey}`;
			}
			return validFormResult;
		};

		doUpdateFieldsValue = (name, value, isValid = null, updateFields = null) => {
			const fields = { ...this.state.fields };
			const valid = { ...this.state.valid };
			if (updateFields) {
				this.setState({ fields: updateFields }, this.validateForm);
			} else {
				fields[name] = value;
				if (isValid != null) {
					valid[name] = isValid;
				}
				this.setState({ fields, valid }, this.validateForm);
			}
		};

		handleFileUpload = (files, name) => {
			let uploadedFile = null;
			if (files && files[0]) {
				uploadedFile = files[0];
			} else {
				uploadedFile = null;
			}
			this.doUpdateFieldsValue(name, uploadedFile);
		};

		invalidateFileUpload = () => {
			this.doUpdateFieldsValue("assetPdfFile", null);
		};

		handlePagesChange = (value, name, isValid) => {
			const fields = { ...this.state.fields };
			const pagesArray = numericRangeExpand(value);
			fields[name] = value;
			fields.pagesArray = pagesArray;
			this.doUpdateFieldsValue(null, null, isValid, fields);
			this.setState({ isCopyingFullChapter: false }, this.updateSchoolLimitExceeded);
		};

		handleInputNumberChange = (e) => {
			const { name, value } = e.target;
			this.doUpdateFieldsValue(name, value);
			this.setState({ isCopyingFullChapter: false }, this.updateSchoolLimitExceeded);
		};

		doNameInputFieldChange = (inputFieldValue, inputFieldName) => {
			this.doUpdateFieldsValue(inputFieldName, inputFieldValue);
		};

		handleCheckboxChange = (name, value) => {
			this.setState({ [name]: value }, () => {
				this.validateForm();
				if (name === CREATE_A_COPY_CHECKBOX_NAME) {
					this.updateSchoolLimitExceeded();
				}
			});
		};

		handleClassChange = (name, selectedClass, valid) => {
			this.doUpdateFieldsValue(name, selectedClass, valid);
			if (selectedClass && !this.state.schoolLimitExceeded) {
				this.props
					.api("/public/get-extract-limits", {
						course_oid: selectedClass.id,
						work_isbn13: this.state.fields.isbn,
					})
					.then((result) => {
						const extractLimitForCourse = result.course.limit;
						const extractLimitForSchool = result.school.limit;
						this.setState({
							classLimitExceeded: result.course.extracted.length >= extractLimitForCourse,
							schoolLimitExceeded: result.school.extracted.length >= extractLimitForSchool,
						});
					})
					.catch(() => {
						this.setState({
							classLimitExceeded: false,
							schoolLimitExceeded: false,
						});
					});
			} else {
				this.setState({ classLimitExceeded: false });
			}
		};

		onSubmit = (e) => {
			e.preventDefault();
			const { fields, isSelectedCreateCopy, isCopyingFullChapter } = this.state;
			const { title, isbn, publicationYear, pageCount, pagesArray, author, publisher, assetPdfFile, selectedClass, image, uploadName } = fields;

			const percentageCopied = this.getCopiedPercentage();
			if (!isCopyingFullChapter && percentageCopied > 20) {
				this.setState({ isShowModal: true });
				return;
			}

			const pageRange = getPageOffsetString(pagesArray);
			const requestFile = {
				binary: true,
				files: {
					asset: assetPdfFile,
				},
			};
			const publicationDate = publicationYear ? Math.floor(new Date(publicationYear, 0, 2).getTime() / 1000) : undefined;
			let isbn13 = ISBN.parse(isbn);
			if (isbn13) {
				isbn13 = isbn13.asIsbn13();
			} else {
				this.setState({ error: "ISBN not valid" });
				return;
			}
			const requestParams = {
				title,
				isbn: isbn13,
				publication_date: publicationDate,
				page_count: parseInt(pageCount),
				pages: pagesArray,
				authors: author,
				publisher: publisher,
				page_range: pageRange,
				image,
				upload_name: uploadName,
				is_copying_full_chapter: isCopyingFullChapter,
				is_created_extract: !isSelectedCreateCopy ? true : false,
				publication_year: publicationYear,
			};
			if (isSelectedCreateCopy) {
				if (!selectedClass) {
					this.setState({ error: "Please select a class" });
					return;
				}
				requestParams.course_oid = selectedClass.id;
				this.setState({ error: null });
			}

			this.setState(
				{
					loading: true,
				},
				() => {
					{
						this.props
							.api("/public/user-asset-upload", requestParams, requestFile)
							.then((result) => {
								if (!this._isMounted) {
									return;
								}
								if (!isSelectedCreateCopy) {
									this.props.history.push("/profile/my-copies?q_mine_only=1");
								} else {
									const { search, type } = queryString.parse(this.props.location.search);
									this.props.history.push({
										pathname: `/asset-upload/copy-confirm`,
										search: `?isbn13=${requestParams.isbn}&course=${selectedClass.id}&selected=${pagesArray.join("-")}&search=${search}&type=${type}`,
										state: { requestParams: requestParams, publicationYear: publicationYear, requestFile: requestFile },
									});
								}
							})
							.catch((err) => {
								if (!this._isMounted) {
									return;
								}
								this.setState({ error: err }, () => {
									this.fetchWork(isbn13);
								});
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
		};

		getCopiedPercentage = () => {
			const { pageCount, pagesArray } = this.state.fields;
			let percentageCopied = 0;
			if (pageCount > 0 && pagesArray && pagesArray.length) {
				percentageCopied = Math.round((pagesArray.length / pageCount) * 100 * 10) / 10;
			}
			return percentageCopied;
		};

		doCloseModal = () => {
			this.setState({ isShowModal: false });
		};

		fetchSchoolExtentLimit = (isbn) => {
			if (!isbn) {
				this.setState({
					schoolLimit: null,
				});
				return;
			}
			this.props
				.api("/public/get-extract-limits", { work_isbn13: isbn })
				.then((result) => {
					this.setState({
						schoolLimit: result.school,
					});
				})
				.catch((e) => {
					console.error(e);
				});
		};

		updateSchoolLimitExceeded = () => {
			if (!this.state.isSelectedCreateCopy) {
				this.setState({
					schoolLimitExceeded: false,
				});
				return;
			}
			const percentageCopied = this.getCopiedPercentage();
			if (percentageCopied > staticValues.allowedPercentageForUserUploadedCopy) {
				this.setState({ schoolLimitExceeded: true });
				return;
			}
			if (!this.state.schoolLimit) {
				this.setState({
					schoolLimitExceeded: false,
				});
				return;
			}
			const alreadyExtracted = new Set(this.state.schoolLimit.extracted);
			if (Array.isArray(this.state.fields.pagesArray)) {
				for (const pg of this.state.fields.pagesArray) {
					alreadyExtracted.add(pg);
				}
			}
			this.setState({
				schoolLimitExceeded: alreadyExtracted.size >= this.state.schoolLimit.limit,
			});
		};

		backToAssetSearch = () => {
			this.props.history.push("/asset-upload/before-we-start");
		};

		getBackRedirectUrl = () => {
			let { title, isbn, search, type, author, publisher, publicationYear } = queryString.parse(this.props.location.search);
			let query = "";
			if (type === MANUAL_TYPE) {
				const publicationYearString = publicationYear ? `&publicationYear=${publicationYear}` : "";
				query =
					`&isbn=` +
					isbn +
					`&title=` +
					encodeURIComponent(title) +
					`&author=` +
					encodeURIComponent(author) +
					`&publisher=` +
					encodeURIComponent(publisher) +
					publicationYearString;
			}
			if (type === SEARCH_TYPE) {
				const validIsbn = ISBN.parse(search.trim());
				if (validIsbn) {
					query = `&isbn=${search}`;
				} else {
					query = `&title=${encodeURIComponent(search)}`;
				}
			}

			const url = "/asset-upload/search?type=" + type + "&search=" + search + query;
			return url;
		};

		render() {
			const {
				isSelectedCreateCopy,
				error,
				isFormValid,
				isCopyingFullChapter,
				isOwned,
				isDisabledPageCount,
				isShowModal,
				classLimitExceeded,
				schoolLimitExceeded,
			} = this.state;
			const { title, isbn, author, publisher, publicationYear, pages, pageCount, selectedClass, uploadName } = this.state.fields;
			let userAgent = window.navigator.userAgent;
			const showDragDropArea = userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1 ? false : true;

			const pageInfoText = `Thank you for telling us what you copied from.`;
			const pageInfoSubTitleText = `This helps us ensure the right rightsholder is paid for your re-use of their content. We've checked that this title is covered by your CLA
		Education Licence. The final step is to tell us what page range you have copied and select your file.`;

			const assetNotFoundText =
				"Please note that we couldn't automatically check that the work is covered by the CLA Education Licence. We will be in touch via email if our manual checks find that this is not covered.";
			const assetExcludedResponse = "Unfortunately this work is Excluded from the CLA Schools Licence and cannot be uploaded";
			const assetExcludedHelp =
				"For more information about your CLA Licence and excluded publications, have a read of the following Knowledge Base article: ";

			const errorMessage =
				"Unfortunately we could not get the licence coverage status from the information provided. Please get in touch with us about this at ";

			const percentageCopied = this.getCopiedPercentage();
			const infoHoverText = `A record for this title already exists with a page count of ${pageCount}. If you believe this is incorrect, please contact support@educationplatform.zendesk.com.`;
			let copyInfoText = "By clicking submit, a copy will be created with the class you have chosen for the PDF you have uploaded.";
			if (schoolLimitExceeded) {
				copyInfoText = (
					<Error>
						You have reached the copying allowance for this book. You can still upload your PDF to use in a future academic year. To proceed, please
						uncheck the above box.
					</Error>
				);
			} else if (classLimitExceeded) {
				copyInfoText = (
					<Error>
						You have reached the copying allowance for this book. You can still upload your PDF to use for another class, or in a future academic
						year. To proceed, please uncheck the above box or select a different class.
					</Error>
				);
			}
			return (
				<>
					<HeadTitle title={PageTitle.extractUpload} />
					<StepFlow steps={STEPS} selectedStep={3} />
					<ConatinerWrapper>
						<Container>
							<CustomFormWrapAddEdit onSubmit={this.onSubmit}>
								<FormInner isLoading={this.state.loading}>
									<FormWrapper>
										<TextContainer>
											{this.state.assetPermissionStatus === "Excluded" || this.state.assetPermissionStatus === "Error" ? (
												<></>
											) : (
												<>
													<InfoText>{pageInfoText}</InfoText>
													<SubtitleInfoText>{pageInfoSubTitleText}</SubtitleInfoText>
												</>
											)}
											{this.state.assetPermissionStatus === "Not Found" ? (
												<ResponseText>
													<p>{assetNotFoundText}</p>
												</ResponseText>
											) : (
												<></>
											)}
											{this.state.assetPermissionStatus === "Excluded" ? (
												<>
													<ResponseText>
														<h3>{assetExcludedResponse}</h3>
														<p>
															<IconWrapper>
																<i className="fas fa-question-circle" title={infoHoverText} />
															</IconWrapper>
															{assetExcludedHelp}
															<a
																target="_blank"
																rel="nofollow"
																href="https://claedqueries.zendesk.com/hc/en-us/articles/360018445918-Check-Permissions-excluded-publications-editions-and-categories"
															>
																Excluded publications, editions and categories
															</a>
														</p>
													</ResponseText>
												</>
											) : (
												<></>
											)}
											{this.state.assetPermissionStatus === "Error" ? (
												<ResponseText>
													<p>
														{errorMessage}
														<a href="mailto:support@educationplatform.zendesk.com">support@educationplatform.zendesk.com</a>
													</p>
												</ResponseText>
											) : (
												<></>
											)}
										</TextContainer>
										<FormBodyContainer>
											<FormContainerHalfWrapper side="left">
												<AssetInfoData>
													<Span>Title:</Span>
													<div>{title}</div>
												</AssetInfoData>
												<AssetInfoData>
													<Span>ISBN:</Span>
													<div>{isbn}</div>
												</AssetInfoData>
												<AssetInfoData>
													<Span>Author:</Span>
													<div>{author.join(", ")}</div>
												</AssetInfoData>
												<AssetInfoData>
													<Span>Publisher:</Span>
													<div>{publisher}</div>
												</AssetInfoData>
												<AssetInfoData>
													<Span>Publication year:</Span>
													<div>{publicationYear}</div>
												</AssetInfoData>
											</FormContainerHalfWrapper>
											<FormContainerHalfWrapper
												side="right"
												disabled={this.state.assetPermissionStatus === "Excluded" || this.state.assetPermissionStatus === "Error"}
											>
												<Label>Upload your file</Label>
												<Dropzone
													accept={ACCEPT_FILE_TYPE}
													name={"assetPdfFile"}
													multiple={false}
													handleUpload={this.handleFileUpload}
													showDragDropArea={showDragDropArea}
													isValid={this.state.valid.assetPdfFile.isValid}
													alternateText={DROPZONE_ALTERNATE_TEXT}
													errorMessage={null}
													errorType={null}
													isButtonColourful={true}
													buttonTitle="Choose File"
													showCustomUploadFiles={true}
													invalidateFileUpload={this.invalidateFileUpload}
													dragFieldText={DROPZONE_DRAG_FIELD_TEXT}
													dropAreaGaAttribute={{ "data-ga-user-extract": "upload-extract-upload-file-box" }}
													chooseFileGaAttribute={{ "data-ga-user-extract": "upload-extract-upload-file-button" }}
												/>
												<div>
													{this.state.valid.assetPdfFile.isValid ? (
														this.state.fields.assetPdfFile ? (
															<>
																<FormMessage>Uploaded file:</FormMessage>
																<UploadedFile>
																	<FileIcon className="far fa-file"></FileIcon>
																	{this.state.fields.assetPdfFile.name}
																</UploadedFile>
															</>
														) : (
															""
														)
													) : null}
												</div>
											</FormContainerHalfWrapper>
										</FormBodyContainer>
									</FormWrapper>

									<FormWrapper>
										<FormInputWrap>
											<FormLabel htmlFor="uploadName">Upload name:</FormLabel>
											<FieldWrapper>
												<NameInputField
													name="uploadName"
													placeholder="Please give your uploaded chapter/extract a name"
													value={uploadName}
													minLength={1}
													maxLength={255}
													fieldName="upload name"
													isRequired={true}
													doNameInputFieldChange={this.doNameInputFieldChange}
													disabled={this.state.assetPermissionStatus === "Excluded" || this.state.assetPermissionStatus === "Error"}
												/>
											</FieldWrapper>
										</FormInputWrap>
										<FormInputWrap>
											<FormLabel htmlFor="pages">Page range:</FormLabel>
											<PageRangeFieldWrapper>
												<FieldWrapper>
													<NameInputField
														name="pages"
														placeholder="Enter the page range in your extract"
														value={pages}
														minLength={1}
														maxLength={255}
														fieldName="page range"
														isRequired={true}
														doNameInputFieldChange={this.handlePagesChange}
														error={this.state.valid.pagesArray.message}
														disabled={this.state.assetPermissionStatus === "Excluded" || this.state.assetPermissionStatus === "Error"}
													/>
												</FieldWrapper>
												{percentageCopied > 0 ? <PercentageCopied percentageCopied={percentageCopied}>{percentageCopied}%</PercentageCopied> : null}
											</PageRangeFieldWrapper>
											<FieldInfoText>
												Tell us the page range you're uploading. You can copy up to 5% or one chapter, whichever is the greater
											</FieldInfoText>
										</FormInputWrap>
										{percentageCopied > ALLOWED_PERCENTAGE_FOR_COPY ? (
											<CheckBoxContainer>
												<CheckBoxField
													name="isCopyingFullChapter"
													extraText={
														<>
															<PageRangeExceedLabel>
																The entered page range exceeds 5%. If you are copying one full chapter, please check this box.
															</PageRangeExceedLabel>
														</>
													}
													checked={isCopyingFullChapter}
													onChange={this.handleCheckboxChange}
													isValid={true}
													gaAttribute={{
														"data-ga-user-extract": "upload-extract-chapter-check",
													}}
												/>
											</CheckBoxContainer>
										) : null}
										<FormInputWrap>
											<FormLabel htmlFor="pageCount">
												Total number of pages in original content (such as the book copied from)
												{isDisabledPageCount ? (
													<IconWrapper>
														<i className="fas fa-question-circle" title={infoHoverText} />
													</IconWrapper>
												) : null}
												:
											</FormLabel>
											<FieldWrapper>
												<FormInput
													type="number"
													name="pageCount"
													value={pageCount}
													required={true}
													onChange={this.handleInputNumberChange}
													disabled={
														this.state.isDisabledPageCount ||
														this.state.assetPermissionStatus === "Excluded" ||
														this.state.assetPermissionStatus === "Error"
													}
												/>
												{this.state.valid.pageCount.message ? <FormError>{this.state.valid.pageCount.message}</FormError> : null}
											</FieldWrapper>
										</FormInputWrap>

										{this.state.assetPermissionStatus === "Excluded" ? (
											<BackButton onClick={this.backToAssetSearch}>Upload another title</BackButton>
										) : (
											<>
												<BottomContainer>
													<CheckBoxContainer>
														<CheckBoxField
															name={CREATE_A_COPY_CHECKBOX_NAME}
															extraText={<CheckboxLabel>Would you also like to create a copy?</CheckboxLabel>}
															checked={isSelectedCreateCopy}
															onChange={this.handleCheckboxChange}
															isValid={true}
															gaAttribute={{
																"data-ga-user-extract": "upload-extract-create-copy-check",
															}}
														/>
													</CheckBoxContainer>
													{isSelectedCreateCopy && (
														<>
															<AjaxSearchableDropdownWrapper>
																<AjaxSearchableDropdown
																	api={this.props.api}
																	name="selectedClass"
																	title="Class:"
																	value={selectedClass}
																	placeholder="Select a class"
																	onChange={this.handleClassChange}
																	minQueryLength={2}
																	requestApi={staticValues.api.classSearch}
																	performApiCallWhenEmpty={true}
																	highlightOnError={true}
																	required={isSelectedCreateCopy}
																	gaAttribute={{
																		"data-ga-user-extract": selectedClass ? "upload-extract-class-select" : "upload-extract-class-dropdown",
																	}}
																/>
															</AjaxSearchableDropdownWrapper>
															<InfoText>{copyInfoText}</InfoText>
														</>
													)}
												</BottomContainer>

												<SubmitButtonContainer>
													<CheckBoxContainer>
														<CheckBoxField
															name="isOwned"
															extraText={
																<CheckboxLabel>
																	Please confirm that the work you are copying from is owned by your institution (school/college)
																</CheckboxLabel>
															}
															checked={isOwned}
															onChange={this.handleCheckboxChange}
															isValid={true}
															gaAttribute={{
																"data-ga-user-extract": "upload-extract-ownership-check",
															}}
														/>
													</CheckBoxContainer>

													<ButtonWrap>
														<div>
															<BackButtonLink title="Back" to={this.getBackRedirectUrl()} data-ga-user-extract="upload-extract-back">
																<BackIcon className="fal fa-chevron-left"></BackIcon>Back
															</BackButtonLink>
														</div>
														<div>
															<Button
																type="submit"
																disabled={!isFormValid || this.state.loading || !isOwned || classLimitExceeded || schoolLimitExceeded}
																data-ga-user-extract="upload-extract-submit"
															>
																Submit
															</Button>
														</div>
													</ButtonWrap>
												</SubmitButtonContainer>
											</>
										)}
										<Error>{error}</Error>
									</FormWrapper>
								</FormInner>
								{this.state.loading ? (
									<LoaderWrap>
										<Loader />
									</LoaderWrap>
								) : null}
							</CustomFormWrapAddEdit>
						</Container>
					</ConatinerWrapper>

					{isShowModal && (
						<Modal show={true} modalWidth={"700px"} showCloseLink={false}>
							<ModalBody>
								<div>
									It looks like you've copied a large proportion of this title. Please check if the page range and total number of pages entered is
									correct. If you have any questions about this please contact support@educationplatform.zendesk.com
								</div>
								<ModalButonContainer>
									<Button onClick={this.doCloseModal}>I understand</Button>
								</ModalButonContainer>
							</ModalBody>
						</Modal>
					)}
				</>
			);
		}
	}
);
