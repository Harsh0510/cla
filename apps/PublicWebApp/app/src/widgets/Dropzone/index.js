import React from "react";
import styled, { css } from "styled-components";
import Dropzone from "react-dropzone";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
	/** width: 300px;*/
	padding: 10px 15px;
	height: 130px;
	border-width: 2px;
	border-radius: 5px;
	border-color: ${(props) => (props.isValid ? theme.colours.lightGray : theme.colours.red)};
	border-style: ${(props) => (props.isDragReject || props.isDragActive ? "solid" : "dashed")};
	background-color: ${(props) => (props.isDragReject || props.isDragActive ? "#eee" : "")};
`;

const Button = styled.button`
	${(props) =>
		props.isButtonColourful
			? `
			border-radius: 0px;
			bottom: -5px;
			position: relative;
			padding: 0.3em 1em;
			margin: 0 auto;
			margin-bottom:15px;
			background-color: ${theme.colours.primary};
			color: ${theme.colours.white};
			border:none;
			display:block;
		`
			: `
			/* z-index: 999; */
			border-radius: 10px;
			bottom: -5px;
			position: relative;
			padding: 0.5em;
			width: 200px;
		`}
`;
const Error = styled.div`
	margin-bottom: 0.5em;
	color: ${theme.colours.errorTextColor};
	font-size: 1em;
	font-weight: regular;
`;

const FormMessage = styled.p`
	margin-bottom: 0.5em;
	font-size: 0.9em;
	font-weight: bold;
`;

const Uldiv = styled.div`
	margin-top: 1em;
`;

const ErrorDiv = styled.div`
	color: ${theme.colours.red};
	padding-top: 5px;
`;

const AlterTextDiv = styled.div`
	padding: 10px 5px 10px 15px;
`;

export default class CustomDropzone extends React.PureComponent {
	state = {
		files: [],
		isValid: "",
	};

	constructor(props) {
		super(props);
		this.dropzoneRef = React.createRef();
	}

	onDrop = (files, rejects, e) => {
		e.preventDefault();
		const fieldName = this.props.name || null;
		this.setState({ isValid: false, files: [] });
		if (files.length > 0) {
			this.setState({ files: files, isValid: true });
			this.props.handleUpload(files, fieldName);
		} else if (this.props.invalidateFileUpload) {
			this.props.invalidateFileUpload();
		}
	};

	onCancel = () => {
		this.setState({
			files: [],
		});
	};

	render() {
		const dragFieldText = this.props.dragFieldText ? this.props.dragFieldText : "XLS, XLSX, ODT, TXT, ODS or CSV file here...";
		let errorMessage;
		if (!this.state.isValid && this.state.isValid !== "") {
			errorMessage = "You have selected the wrong file type.";
		} else if (this.props.errorMessage) {
			errorMessage = this.props.errorMessage;
		}
		return (
			<>
				<Dropzone
					ref={(node) => (this.dropzoneRef = node)}
					onDrop={this.onDrop}
					onFileDialogCancel={this.onCancel}
					multiple={this.props.isMultiple}
					accept={this.props.accept}
				>
					{({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles }) => {
						return this.props.showDragDropArea ? (
							<>
								<Container
									isDragActive={isDragActive}
									isDragReject={isDragReject}
									isValid={this.props.isValid}
									{...getRootProps({ onClick: (evt) => evt.preventDefault() })}
									{...this.props.dropAreaGaAttribute}
								>
									<input {...getInputProps()} />
									{isDragAccept ? "Drop" : "Drag"} {dragFieldText}
								</Container>
								{this.props.alternateText ? <AlterTextDiv>{this.props.alternateText}</AlterTextDiv> : null}
								<Button
									type="button"
									onClick={() => this.dropzoneRef.open()}
									isButtonColourful={this.props.isButtonColourful}
									{...this.props.chooseFileGaAttribute}
								>
									{this.props.buttonTitle ? this.props.buttonTitle : "...or click to select file."}
								</Button>
								{errorMessage ? <Error>{errorMessage}</Error> : null}
							</>
						) : (
							<div {...getRootProps({ onClick: (evt) => evt.preventDefault() })}>
								<input {...getInputProps()} id="choose_files_btn" />
								{this.props.alternateText ? <AlterTextDiv>{this.props.alternateText}</AlterTextDiv> : null}
								<Button
									type="button"
									onClick={(evt) => {
										evt.preventDefault();
										if (evt.target.id === "choose_files_btn") {
											this.dropzoneRef.open();
										}
									}}
									isButtonColourful={this.props.isButtonColourful}
								>
									Select file
								</Button>
							</div>
						);
					}}
				</Dropzone>
				{!this.props.showCustomUploadFiles && this.state.files.length > 0 ? (
					<Uldiv>
						<FormMessage className="message">Selected file:</FormMessage>
						<ul>
							{this.state.files.map((file) => (
								<li key={file.name}> {file.name} </li>
							))}
						</ul>
					</Uldiv>
				) : (
					""
				)}
			</>
		);
	}
}
