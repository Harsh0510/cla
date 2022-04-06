import React from "react";
import styled, { css } from "styled-components";
import CustomFormData from "../../common/CustomFormData";
import NameInputField from "../../widgets/NameInputField";
import {
	FormWrapAddEdit,
	FormMessage,
	FormBodyContainer,
	FormContainerFull,
	FormContainerButton,
	FormContainerHalf,
	FormTopCornerCancel,
	FormSectionTopRow,
	FormSectionHalf,
	FormSaveButton,
	FormDeleteButton,
} from "../../widgets/AdminStyleComponents";
import DateInputField from "../../widgets/DateInputField";
import SelectSchoolWithSearchFilter from "./SelectSchoolWithSearchFilter";
import queryString from "query-string";
import reactCreateRef from "../../common/reactCreateRef";
import XLSX from "xlsx";
import moment from "moment";
import theme from "../../common/theme";
import Confirmbox from "./Confirmbox";
import Loader from "../../widgets/Loader";
import getUniqId from "../../common/getUniqId";

const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";
const ROLLOVER_JOB_STATUS = "scheduled";
const SCHEDULE_ROLLOVER_JOB_LIMIT = require("../../../../../Controller/app/core/admin/lib/rolloverIntervalForFirstEmail") + 1;

const WrapLabel = styled.label`
	margin-bottom: 0.5rem;
	display: block;
`;

const WrapSchoolList = styled.div`
	background-color: transparent;
	border-radius: 0px;
	border: 1px solid ${theme.colours.inputBorder};
	padding: 25px;
`;

const SchoolListHeader = styled.h3`
	font-size: 18pt;
	font-weight: bold;
	margin-bottom: 4px;
	line-height: 1.2;
`;

const WrapRolloverPage = styled.div`
	position: relative;
	min-height: 1400px;
`;

const WrapperLoader = styled.div`
	position: absolute;
	margin: 0 auto;
	width: 100%;
	height: 100%;
	z-index: 1;
`;

const WrapDetailSection = styled(FormWrapAddEdit)`
	${(p) =>
		p.disabled === true &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

const WrapFormContainerButton = styled(FormContainerButton)`
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-top: 20px;
	}
`;

const Error = styled.div`
	margin-bottom: 0.2em;
	color: #cc0000;
	font-size: 0.9em;
	font-weight: bold;
`;

export default class RolloverJobAddEdit extends React.PureComponent {
	constructor(props) {
		super(props);
		this._idBase = getUniqId();
		this.state = {
			name_field_error: true,
			date_field_error: false,
			hasSelectedAllSchools: false,
			schoolIds: [],
			isShow: false,
			setOption: {
				value: "",
				label: "",
			},
		};
		this.inputForm = reactCreateRef();
		this.doNameInputFieldChange = this.doNameInputFieldChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.fields.target_execution_date !== prevProps.fields.target_execution_date) {
			if (this.props.fields.target_execution_date) {
				this.setState({ date_field_error: false });
			} else {
				this.setState({ date_field_error: true });
			}
		}
		if (this.props.isResetSchoolFilter) {
			this.setState({ date_field_error: false });
		}
	}

	doSubmit = () => {
		const fd = CustomFormData(this.inputForm.current);
		const data = Object.create(null);

		for (const item of fd.entries()) {
			data[item[0]] = item[1];
		}
		this.props.handleSubmit(data);
	};

	doNameInputFieldChange(inputFieldValue, inputFieldName, isValid) {
		switch (inputFieldName) {
			case "name":
				this.setState({ name_field_error: isValid });
				break;
		}
		this.props.handleNameInputField(inputFieldValue, inputFieldName);
	}

	exportRollOverJobScheduledData = (resultData) => {
		this.props.setLoadingRolloverJob(false);
		const wb = XLSX.utils.book_new();
		{
			const ws = XLSX.utils.json_to_sheet([
				{
					ID: resultData.rollover.id,
					"Job name": resultData.rollover.job_name,
					"Rollover date": new Date(resultData.rollover.rollover_date),
					Status: resultData.rollover.status,
				},
			]);
			/* add to workbook */
			XLSX.utils.book_append_sheet(wb, ws, "Rollover Job");
		}
		{
			const exportData = resultData.schools.map((item) => ({
				ID: item.id,
				Name: item.name,
				Type: item.school_type,
				Level: item.school_level,
				Territory: item.territory,
			}));
			const ws = XLSX.utils.json_to_sheet(exportData);
			/* add to workbook */
			XLSX.utils.book_append_sheet(wb, ws, "Schools");
		}
		/* generate an XLSX file */
		XLSX.writeFile(
			wb,
			"Education Platform - Rollover Job Report " + resultData.rollover.id + " - " + moment().format("YYYY-MM-DD.HH-mm-ss") + ".xlsx"
		);
	};

	downloadScheduledRollOverJob = (e) => {
		this.props.setLoadingRolloverJob(true);
		e.preventDefault();
		this.props.api("/admin/rollover-job-get-for-export", { id: this.props.fields.id }).then((result) => {
			this.exportRollOverJobScheduledData(result);
		});
	};

	showConfirmModal = () => {
		this.setState({ isShow: true });
	};

	onCancle = () => {
		this.setState({ isShow: false });
	};

	onConfirm = () => {
		this.setState({ isShow: false });
		if (this.props.action === ACTION_EDIT) {
			this.props.deleteRolloverJob();
		} else {
			this.doSubmit();
		}
	};

	isFormValid = () => {
		let status = true;

		if (!this.props.fields.target_execution_date) {
			status = false;
		}
		if (status && (!this.state.name_field_error || Object.keys(this.props.selectedSchoolIdMap).length === 0)) {
			status = false;
		}
		return status;
	};

	render() {
		const { cancelAddEdit, message, fields, action, loadingRolloverJob } = this.props;
		const fieldsDisabled = fields.status && fields.status !== ROLLOVER_JOB_STATUS && action === ACTION_EDIT;
		const isFormValid = this.isFormValid();
		return (
			<WrapRolloverPage>
				{loadingRolloverJob && (
					<WrapperLoader>
						<Loader />
					</WrapperLoader>
				)}

				<WrapDetailSection ref={this.inputForm} disabled={loadingRolloverJob}>
					<FormSectionTopRow>
						<FormSectionHalf></FormSectionHalf>
						<FormSectionHalf>
							<FormTopCornerCancel type="button" to="/" title="Return to Top" onClick={cancelAddEdit} ref={this.props._refForm}>
								Return to Top
								<i className="fa fa-times" size="sm" />
							</FormTopCornerCancel>
						</FormSectionHalf>
					</FormSectionTopRow>

					{message ? <FormMessage className="message"> {message}</FormMessage> : null}
					{fieldsDisabled ? (
						<FormMessage className="message">This rollover cannot be edited or deleted because it has already begun.</FormMessage>
					) : null}
					<FormBodyContainer>
						<FormContainerFull>
							<FormContainerHalf>
								<label htmlFor={this._idBase + "_name"}>Name:</label>
								<NameInputField
									id={this._idBase + "_name"}
									name="name"
									placeholder="Enter name"
									value={fields.name}
									doNameInputFieldChange={this.doNameInputFieldChange}
									maxLength={200}
									fieldName={"name"}
									isRequired={true}
									disabled={fieldsDisabled}
								/>
							</FormContainerHalf>

							<FormContainerHalf>
								<WrapLabel htmlFor={this._idBase + "_target_execution_date"}>Rollover date:</WrapLabel>
								<DateInputField
									id={this._idBase + "_target_execution_date"}
									name="target_execution_date"
									placeholderText="Select date"
									value={fields.target_execution_date}
									onChange={this.props.handleNameInputField}
									showTimeSelect={true}
									isClearable={!fieldsDisabled}
									showPreviousDates={false}
									required={true}
									disableUpcomingDates={SCHEDULE_ROLLOVER_JOB_LIMIT}
									disabled={fieldsDisabled}
								/>
								{this.state.date_field_error && <Error>Please select a date</Error>}
							</FormContainerHalf>
						</FormContainerFull>
						{action === ACTION_EDIT ? (
							<FormContainerFull>
								<FormContainerHalf>
									<label htmlFor={this._idBase + "_status"}>Status:</label>
									<NameInputField
										id={this._idBase + "_status"}
										name="status"
										defaultValue={fields.status}
										fieldName={"status"}
										isRequired={true}
										disabled={true}
									/>
								</FormContainerHalf>
							</FormContainerFull>
						) : null}
					</FormBodyContainer>
					{action === ACTION_EDIT ? (
						<FormSectionTopRow>
							<FormSectionHalf></FormSectionHalf>
							<FormSectionHalf>
								<FormTopCornerCancel type="button" onClick={this.downloadScheduledRollOverJob}>
									Download rollover details
								</FormTopCornerCancel>
							</FormSectionHalf>
						</FormSectionTopRow>
					) : null}
					<WrapSchoolList>
						<SchoolListHeader>Institutions</SchoolListHeader>
						<SelectSchoolWithSearchFilter
							queryLocationSearch={queryString.parse(this.props.location.search)}
							withRollover={true}
							hasSelectedAllSchools={this.props.hasSelectedAllSchools}
							selectedSchoolIdMap={this.props.selectedSchoolIdMap}
							onChangeSelectedAllCheckbox={this.props.onChangeSelectedAllCheckbox}
							onChangeSchoolCheckBox={this.props.onChangeSchoolCheckBox}
							pushQueryString={this.props.pushQueryString}
							saveSchoolSearchFiter={this.props.saveSchoolSearchFiter}
							isHideSelect={this.props.isHideSelect}
							rolloverJobId={this.props.fields.id}
							with_rollover_job={this.props.withRollover}
							_selectAllRef={this.props._selectAllRef}
							isResetSchoolFilter={this.props.isResetSchoolFilter}
						></SelectSchoolWithSearchFilter>
					</WrapSchoolList>
					<FormBodyContainer>
						<WrapFormContainerButton>
							{action === ACTION_NEW || action === ACTION_ADDED ? (
								<FormSaveButton
									type="button"
									hide={this.state.isShow}
									onClick={this.showConfirmModal}
									name="Schedule-rollover-job"
									value="Schedule-rollover-job"
									disabled={!isFormValid}
								>
									Schedule rollover job
								</FormSaveButton>
							) : action === ACTION_EDIT ? (
								<>
									<FormSaveButton
										type="button"
										hide={this.state.isShow}
										onClick={this.doSubmit}
										name="update"
										value="update"
										disabled={!isFormValid || fields.status !== ROLLOVER_JOB_STATUS}
									>
										Update
									</FormSaveButton>
									<FormDeleteButton
										value="delete"
										type="button"
										hide={this.state.isShow}
										onClick={this.showConfirmModal}
										disabled={fields.status !== ROLLOVER_JOB_STATUS}
									>
										Delete
									</FormDeleteButton>
								</>
							) : null}
							<Confirmbox
								action={action}
								rolloverJobName={fields.name}
								isShow={this.state.isShow}
								onCancle={this.onCancle}
								onConfirm={this.onConfirm}
							></Confirmbox>
						</WrapFormContainerButton>
						{message ? <FormMessage className="message"> {message}</FormMessage> : null}
					</FormBodyContainer>
				</WrapDetailSection>
			</WrapRolloverPage>
		);
	}
}
