import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import NameInputField from "../../widgets/NameInputField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import Loader from "../../widgets/Loader";

const STATUS_Pending = "pending";
const STATUS_Awaiting = "awaiting";
const STATUS_Rejected = "rejected";
const STATUS_Approved = "approved";
const STATUS_ApprovedPending = "approved-pending";

/** Form Style component */
const WrapForm = styled.form`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	padding: 1em 1em 1em 1em;
	background-color: ${theme.colours.formBackground};
	margin: 0 0 2em 0;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 1em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 0 0 20px 0;
		padding: 20px;
		overflow-y: auto;
	}
`;

const FormFieldsDisabledMessage = styled.div`
	text-align: center;
	margin: auto;
`;

const FormMessage = styled.div`
	text-align: center;
	justify-content: center;
	padding: 1em 2em;
	width: 90%;
	margin: auto;
	color: ${theme.colours.bgDarkPurple};

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 1em 0em 1em 0em;
		width: 90%;
	}
`;

const FormBodyContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	max-width: 100%;
	position: relative;
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

const FormContainerFull = styled.div`
	width: calc(100%);
	display: flex;
	// flex-direction: column;
	// padding: 0 2em;
	box-sizing: border-box;
	margin-top: 2em;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: calc(100%);
		padding: 0;
		flex-direction: column;
	}
`;

const FormContainerButton = styled.div`
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

const FormContainerHalf = styled.div`
	width: calc(50%);
	display: flex;
	flex-direction: column;
	padding: 0 1em;
	box-sizing: border-box;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: calc(100% - 1em);
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		padding: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		.hide {
			display: none;
		}
	}

	select::-ms-expand {
		display: none;
	}
`;

/** Button Style Component */
const Button = styled.button`
	background-color: ${theme.colours.secondary};
	color: ${theme.colours.white};
	padding: 1em;
	margin-top: 0em;
	border: none;
	border-radius: 3px;

	${(p) =>
		p.hide == true &&
		css`
			display: none;
		`};
`;

const ActionButton = styled(Button)`
	margin: 1em;
	width: 200px;
	display: flex;
	justify-content: space-between;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 1em 0em 0 0em;
		width: auto;
	}
	${(props) =>
		props.disabled &&
		css`
			opacity: 0.2;
			cursor: default;
		`};
	i {
		font-size: 22px;
		line-height: 24px;
		color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.white)} !important;
	}
`;

const SaveButton = styled(ActionButton)`
	background-color: ${theme.colours.primaryDark};
	color: ${theme.colours.white};
`;

const DeleteButton = styled(ActionButton)`
	background-color: ${theme.colours.red};
	color: ${theme.colours.white};
`;

const ImageWrapper = styled.div`
	padding: 0 1em;
	justify-content: center;
	width: 100%;
	display: flex;
	img {
		max-width: 400px;
		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			width: 100%;
			max-width: 100%;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0;
	}
`;

const ValidationMessage = styled.div`
	margin: 0.5em;
	color: ${theme.colours.red};
`;

const WrapLoader = styled.span`
	text-align: center;
	line-height: 1.3;
	margin: auto;
	position: absolute;
	left: 47%;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-top: 20px;
	}
`;

export default class ShowEditScreen extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			rejection_reason: true,
			pdf_isbn13: true,
			isInputFieldsValid: true,
		};
		this.doNameInputFieldChange = this.doNameInputFieldChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.message !== prevProps.message) {
			this.setState({
				rejection_reason: true,
				pdf_isbn13: true,
			});
		}
	}

	doHandleApproveSubmit = () => {
		if (this.props.fields.pdf_isbn13) {
			var data = {
				oid: this.props.fields.oid,
				pdf_isbn13: this.props.fields.pdf_isbn13,
				reject_reason: this.props.fields.rejection_reason,
				isApproved: true,
			};
			this.props.handleSubmit(data);
		} else {
			this.setState({ pdf_isbn13: false, rejection_reason: true });
		}
	};

	doHandleRejectSubmit = () => {
		if (this.props.fields.rejection_reason) {
			var data = {
				oid: this.props.fields.oid,
				reject_reason: this.props.fields.rejection_reason,
				isApproved: false,
			};
			this.props.handleSubmit(data);
		} else {
			this.setState({ rejection_reason: false, pdf_isbn13: true });
		}
	};

	doNameInputFieldChange(inputFieldValue, inputFieldName, isValid) {
		this.setState({ isInputFieldsValid: isValid }, () => {
			switch (inputFieldName) {
				case "rejection_reason":
					this.setState({ rejection_reason: true });
					break;
				case "pdf_isbn13":
					this.setState({ pdf_isbn13: true });
					break;
			}
			this.props.handleNameInputField(inputFieldValue, inputFieldName);
		});
	}

	render() {
		const { message, fields, action, isInProcess } = this.props;
		let confirmBox = false;
		let LoaderSection = null;

		if (isInProcess) {
			LoaderSection = (
				<WrapLoader>
					<Loader />
				</WrapLoader>
			);
		}

		let fieldsDisabledMessage = null;
		if (fields.status !== STATUS_Awaiting) {
			fieldsDisabledMessage = `This image has now been processed and cannot be changed. You may only approve or reject records that are in the 'Awaiting' state.`;
		}

		const fieldsDisabled = fieldsDisabledMessage !== null || isInProcess;

		return (
			<WrapForm key={"form_" + fields.oid}>
				{message ? <FormMessage className="message">{message}</FormMessage> : null}

				<FormBodyContainer>
					{LoaderSection}
					{fieldsDisabledMessage && (
						<FormFieldsDisabledMessage>
							<FontAwesomeIcon icon={faInfoCircle} size="lg" /> {fieldsDisabledMessage}
						</FormFieldsDisabledMessage>
					)}
					<FormContainerFull>
						<ImageWrapper>
							<a href={fields.url} target="_blank">
								{" "}
								<img src={fields.url} alt="Unlock Asset Barcode Image" />
							</a>
						</ImageWrapper>
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="pdf_isbn13">Enter ISBN to unlock: </label>
							<NameInputField
								name="pdf_isbn13"
								defaultValue={fields.pdf_isbn13}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={13}
								fieldName={"pdf_isbn13"}
								isRequired={false}
								disabled={fieldsDisabled}
							/>
							<ValidationMessage>{!this.state.pdf_isbn13 ? "Please enter ISBN" : ""}</ValidationMessage>
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="rejection_reason">Enter the reason for rejection: </label>
							<NameInputField
								name="rejection_reason"
								defaultValue={fields.rejection_reason}
								doNameInputFieldChange={this.doNameInputFieldChange}
								maxLength={100}
								fieldName={"rejection_reason"}
								isRequired={false}
								disabled={fieldsDisabled}
							/>
							<ValidationMessage>
								{!this.state.rejection_reason ? "Please enter the reason for rejection. Please keep the text short; it will be seen by users" : ""}
							</ValidationMessage>
						</FormContainerHalf>
					</FormContainerFull>

					<FormContainerButton>
						{
							<>
								<SaveButton
									type="button"
									hide={!!confirmBox}
									name="Approve"
									value="approve-unlock"
									onClick={this.doHandleApproveSubmit}
									disabled={!this.state.isInputFieldsValid || fieldsDisabled ? true : false}
									iconColor={theme.colours.lightGreen}
								>
									Approve{" "}
									{isInProcess ? <i className="fa fa-spinner fa-spin" aria-hidden="true"></i> : <i className="fa fa-check" aria-hidden="true"></i>}
								</SaveButton>

								<DeleteButton
									type="button"
									name="Reject"
									hide={!!confirmBox}
									onClick={this.doHandleRejectSubmit}
									iconColor={theme.colours.white}
									disabled={!this.state.isInputFieldsValid || fieldsDisabled ? true : false}
								>
									Reject{" "}
									{isInProcess ? <i className="fa fa-spinner fa-spin" aria-hidden="true"></i> : <i className="fa fa-times" aria-hidden="true"></i>}
								</DeleteButton>
							</>
						}
						{confirmBox}
					</FormContainerButton>
				</FormBodyContainer>
			</WrapForm>
		);
	}
}
