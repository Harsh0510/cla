import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
// import withAdminAuthRequiredConsumer from '../../mocks/withAdminAuthRequiredConsumer';
import withApiConsumer from "../../common/withApiConsumer";
// import withApiConsumer from '../../mocks/withApiConsumer';
import theme from "../../common/theme";
import styled, { css } from "styled-components";
import Header from "../../widgets/Header";
import UserRole from "../../common/UserRole";
import XLSX from "xlsx";
import date from "../../common/date";
import getUrl from "../../common/getUrl";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import LinkIcon from "./LinkIcon";
import { Row } from "../../widgets/Layout/Row";
import staticValues from "../../common/staticValues";

const moment = require("moment");

const JUMP_TO_CONTENT_ID = "adminContentInfoId";

const LinkSectionRow = styled(Row)`
	color: ${theme.colours.linkTextColor};
	margin-bottom: 3em;
	align-items: center;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-bottom: 2em;
	}
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true, "school-admin": true, teacher: true },
	withApiConsumer(
		class AdminPage extends React.PureComponent {
			state = {
				message: null,
			};

			componentDidMount() {
				const a = document.createElement("a");
				a.setAttribute("class", "cla-hidden");
				document.body.appendChild(a);
				this._aElement = a;
			}

			componentWillUnmount() {
				if (this._aElement) {
					document.body.removeChild(this._aElement);
					delete this._aElement;
				}
			}

			doUnlockAttemptSpreadsheetDownload = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.props
					.api("/admin/unlock-attempt-get-all")
					.then((result) => {
						this._aElement.setAttribute("href", result.uri);
						this._aElement.click();
						this.setState({ message: "Exported the Unlock-Attempt failed data successfully." });
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			getExportData = (resultData) => {
				let exportData = [];
				if (resultData.length > 0) {
					exportData = resultData.map((x) => {
						let row = {
							Username: x.user_email,
							School: x.school_name,
							"School ID": x.school_id,
							"Asset ID": x.asset_id,
							"Date of Unlock": date.rawToNiceDateForExcel(x.date_created),
							"Read ISBN": x.isbn,
							Status: x.status,
						};
						return row;
					});
				} else {
					let row = {
						Username: "",
						School: "",
						"School ID": "",
						"Asset ID": "",
						"Date of Unlock": "",
						"Read ISBN": "",
						Status: "",
					};
					exportData.push(row);
				}
				return exportData;
			};

			doExtractAccessSpreadsheetDownload = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.props
					.api("/admin/extract-access-get-all")
					.then((result) => {
						const resultData = result.result;
						const exportData = this.exportExtractAccessData(resultData);
						this.exportToExcel(exportData, "extract-access");
						this.setState({ message: "Exported the extract-access data successfully." });
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			doContentRequestSpreadsheetDownload = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.props
					.api("/admin/content-request-get-all")
					.then((result) => {
						const resultData = result.result;
						const exportData = this.exportContentRequestData(resultData);
						this.exportToExcel(exportData, "content_requests", "csv");
						this.setState({ message: "Exported content requests successfully." });
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			doEmailActivitySpreadsheetDownload = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.props
					.api("/admin/email-activity-get-url")
					.then((result) => {
						const resultData = result.url;
						this._aElement.setAttribute("href", resultData);
						this._aElement.setAttribute("download", true);
						this._aElement.click();
						this.setState({ message: "Exported the email list data successfully." });
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			exportExtractAccessData = (resultData) => {
				if (resultData.length > 0) {
					return resultData.map((x) => ({
						"Time/Date": date.rawToNiceDateForExcel(x.date_created),
						"Title of Work": x.title_of_work,
						"Title of Copy": x.title_of_copy,
						"Secure Link": getUrl(`/extract/${x.extract_oid}/${x.extract_share_oid}`),
						"IP Address": x.ip_address,
						"User-Agent (username)": x.user_agent,
						Referrer: x.referrer,
						"User ID": x.user_id,
					}));
				}
				return [
					{
						"Time/Date": "",
						"Title of Work": "",
						"Title of Copy": "",
						"Secure Link": "",
						"IP Address": "",
						"User-Agent (username)": "",
						Referrer: "",
						"User ID": "",
					},
				];
			};

			exportContentRequestData = (contentRequestData) => {
				let exportData = [];
				if (contentRequestData.length > 0) {
					contentRequestData.map((contentRequest) => {
						contentRequest.request_type.forEach((requestType) => {
							let row = {
								"DB ID": contentRequest.id,
								"User DB ID": contentRequest.user_id,
								"Institution ID": contentRequest.school_id,
								"Institution name": contentRequest.school_name_log,
								"Date created": date.rawToNiceDateForExcel(contentRequest.date_created),
							};
							if (requestType === staticValues.contentRequestType.bookRequest) {
								row["Request Type"] = requestType;
								row["Book title"] = contentRequest.book_title;
								row["ISBN"] = contentRequest.isbn;
								row["Author(s)"] = contentRequest.book_request_author;
								row["Publisher"] = contentRequest.book_request_publisher;
								row["Publication year"] = contentRequest.publication_year;
								row["URL"] = contentRequest.url;
								exportData.push(row);
							} else if (requestType === staticValues.contentRequestType.authorRequest) {
								row["Request Type"] = requestType;
								if (contentRequest.authors.length > 0) {
									for (const item of contentRequest.authors) {
										exportData.push({ ...row, Author: item });
									}
								}
							} else if (requestType === staticValues.contentRequestType.publisherRequest) {
								row["Request Type"] = requestType;
								if (contentRequest.publishers.length > 0) {
									for (const item of contentRequest.publishers) {
										exportData.push({ ...row, Publisher: item });
									}
								}
							} else if (requestType === staticValues.contentRequestType.contentTypeRequest) {
								row["Request Type"] = requestType;
								row["Content type notes"] = contentRequest.content_type_note;
								if (contentRequest.content_types.length > 0) {
									for (const item of contentRequest.content_types) {
										exportData.push({ ...row, "Content type": item });
									}
								}
							} else if (requestType === staticValues.contentRequestType.otherRequest) {
								row["Request Type"] = requestType;
								row["Other notes"] = contentRequest.other_note;
								exportData.push(row);
							}
						});
					});
				}
				return exportData;
			};

			exportToExcel = (exportData, fileName, fileFormat = "xlsx") => {
				/* make the worksheet */
				var ws = XLSX.utils.json_to_sheet(exportData);
				/* add to workbook */
				var wb = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(wb, ws, fileName);
				/* generate an XLSX file */
				let exportDate = new moment(Date.now());
				XLSX.writeFile(wb, fileName + "_" + exportDate.format("YYYY-MM-DD") + "." + fileFormat);
			};

			render() {
				const userDetails = this.props.withAuthConsumer_myUserDetails;

				return (
					<>
						<HeadTitle title={PageTitle.admin} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle="Administration" id={JUMP_TO_CONTENT_ID}>
							<LinkSectionRow>
								{userDetails.role === UserRole.claAdmin || userDetails.role === UserRole.schoolAdmin ? (
									<>
										<LinkIcon linkTitle={"Users"} iconClass={"fas fa-user-clock"} linkTo={"/profile/admin/users"} />
										<LinkIcon linkTitle={"Registration Queue"} iconClass={"fas fa-user-clock"} linkTo={"/profile/admin/registration-queue"} />
										<LinkIcon linkTitle={"Bulk User Creation"} iconClass={"fas fa-users-cog"} linkTo={"/profile/admin/user-create-bulk"} />
										<LinkIcon linkTitle={"Bulk Class Creation"} iconClass={"fas fa-chalkboard-teacher"} linkTo={"/profile/admin/class-create-bulk"} />
										<LinkIcon linkTitle={"Bulk Content Unlock"} iconClass={"fas fa-book"} linkTo={"/profile/admin/unlock-content"} />
									</>
								) : null}
								{userDetails.role === UserRole.schoolAdmin ? (
									<>
										<LinkIcon linkTitle={"Edit Institution Details"} iconClass={"fas fa-school"} linkTo={"/profile/admin/institution"} />
									</>
								) : null}
								{userDetails.role === UserRole.claAdmin || userDetails.role === UserRole.schoolAdmin || userDetails.role === UserRole.teacher ? (
									<>
										<LinkIcon linkTitle={"Classes"} iconClass={"fas fa-chalkboard-teacher"} linkTo={"/profile/admin/classes"} />
									</>
								) : null}
								{userDetails.role === UserRole.schoolAdmin || userDetails.role === UserRole.teacher ? (
									<>
										<LinkIcon linkTitle={"Reporting"} iconClass={"fas fa-user-chart"} linkTo={"/profile/admin/reporting"} />
										<LinkIcon linkTitle={"My Uploads"} iconClass={"far fa-cloud-upload"} linkTo={"/profile/admin/my-uploads"} />
									</>
								) : null}
								{userDetails.role === UserRole.claAdmin ? (
									<>
										<LinkIcon linkTitle={"Institutions"} iconClass={"fas fa-school"} linkTo={"/profile/admin/institutions"} />
										<LinkIcon
											linkTitle={"User Uploaded Extracts"}
											iconClass={"far fa-cloud-upload"}
											linkTo={"/profile/admin/user-uploaded-extracts"}
										/>
										<LinkIcon linkTitle={"Imprints"} iconClass={"fas fa-book-reader"} linkTo={"/profile/admin/imprints"} />
										<LinkIcon linkTitle={"Assets"} iconClass={"fas fa-books"} linkTo={"/profile/admin/assets"} />
										<LinkIcon linkTitle={"Serials"} iconClass={"fas fa-newspaper"} linkTo={"/profile/admin/asset-groups"} />
										<LinkIcon linkTitle={"Approved Domains"} iconClass={"fas fa-universal-access"} linkTo={"/profile/admin/approved-domains"} />
										<LinkIcon linkTitle={"Trusted Domains"} iconClass={"fas fa-check"} linkTo={"/profile/admin/trusted-domains"} />
										<LinkIcon linkTitle={"Publishers"} iconClass={"fas fa-book-user"} linkTo={"/profile/admin/publishers"} />
										<LinkIcon
											linkTitle={"Download list of attempted unlocks"}
											iconClass={"fas fa-file-download"}
											onButtonClick={this.doUnlockAttemptSpreadsheetDownload}
											isButtonType={true}
											width={"170px"}
										/>
										<LinkIcon
											linkTitle={"Download list of content accesses"}
											iconClass={"fas fa-file-download"}
											onButtonClick={this.doExtractAccessSpreadsheetDownload}
											isButtonType={true}
											width={"170px"}
										/>
										<LinkIcon
											linkTitle={"Download list of emails"}
											iconClass={"fas fa-file-download"}
											onButtonClick={this.doEmailActivitySpreadsheetDownload}
											isButtonType={true}
											width={"170px"}
										/>
										<LinkIcon
											linkTitle={"Awaiting Unlocks"}
											iconClass={"fas fa-unlock"}
											linkTo={"/profile/admin/unlock-via-image-upload"}
											width={"170px"}
										/>
										<LinkIcon linkTitle={"News Feed"} iconClass={"fas fa-rss-square"} linkTo={"/profile/admin/news-feed"} width={"170px"} />
										<LinkIcon linkTitle={"Carousel Admin"} iconClass={"fas fa-user-cog"} linkTo={"/profile/admin/carousel-admin"} width={"170px"} />
										<LinkIcon
											linkTitle={"Processing Log Admin"}
											iconClass={"fas fa-file-import"}
											linkTo={"/profile/admin/processing-log-admin"}
											width={"170px"}
										/>
										<LinkIcon
											linkTitle={"Rollover Management"}
											iconClass={"fas fa-sync"}
											linkTo={"/profile/admin/rollover-management"}
											width={"170px"}
										/>
										<LinkIcon
											linkTitle={"Download list of content requests"}
											iconClass={"fal fa-lightbulb"}
											onButtonClick={this.doContentRequestSpreadsheetDownload}
											isButtonType={true}
											width={"170px"}
										/>
									</>
								) : null}
							</LinkSectionRow>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
