import React from "react";
import styled from "styled-components";
import getPageOffsetString from "../../common/getPageOffsetString";
import { HeadTitle } from "../../widgets/HeadTitle";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import staticValues from "../../common/staticValues";
import theme from "../../common/theme";

const FILE_FORMAT_EPUB = staticValues.assetFileFormat.epub;

const SidebarTableWrap = styled.table`
	font-size: 14px;
	width: 100%;
`;
const CopyNameSection = styled.div`
	display: flex;
	align-content: space-between;
	width: 100%;
`;
const CopyTitleName = styled.div`
	width: 80%;
	text-align: left;
`;

const CopyTitleButton = styled.div`
	width: 20%;
	text-align: right;
`;

const CopyNameEditButton = styled.button`
	text-align: right;
	background: none;
	border: 0;
	padding: 0;
	color: ${theme.colours.white};
	text-decoration: underline;
`;

const InputCopyTitleText = styled.input`
	padding: 6px;
	background: ${theme.colours.white};
`;

const LeftSideContentTitle = styled.div`
	font-size: 1.125em;
	display: block;
	font-weight: bold;
	padding: 0.5em 0 0.25em 0;
`;

const TableThread = styled.th`
	width: 100px;
	vertical-align: top;
`;
const Ptag = styled.p`
	font-size: 0.875em;
	display: block;
	padding: 1em 0 0 0;
`;

export default class CopyDetails extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			title: props.title,
		};
	}

	handleChangeTitle = (e) => {
		e.preventDefault();
		this.setState({ title: e.target.value });
	};

	handleChange = (e) => {
		e.preventDefault();
		this.setState({ title: this.props.title });
		this.props.isDisplayCopyTitleEditable(e);
	};

	render() {
		const { data, isCopyTitleEditable } = this.props;
		const pageOffsetObject = getPageOffsetObject(data);
		const pageOffsetString = getPageOffsetString(data.pages, pageOffsetObject.roman, pageOffsetObject.arabic);
		return (
			<>
				<HeadTitle title={`Copy titled '` + data.title + `' from '` + data.work_title + `' on the Education Platform`} hideSuffix={true} />
				{data.file_format === FILE_FORMAT_EPUB && <Ptag>{staticValues.messages.assetFileFormatEpubMessage}</Ptag>}
				<LeftSideContentTitle>About this Copy</LeftSideContentTitle>
				<SidebarTableWrap>
					<tbody>
						<tr>
							<TableThread>Copy Name:</TableThread>
							<td>
								{!isCopyTitleEditable ? (
									<CopyNameSection>
										<CopyTitleName>{data.title}</CopyTitleName>
										<CopyTitleButton>
											<CopyNameEditButton onClick={(e) => this.props.isDisplayCopyTitleEditable(e)}>Edit</CopyNameEditButton>
										</CopyTitleButton>
									</CopyNameSection>
								) : (
									<form onSubmit={(e) => this.props.submitCopyTitleEditable(e, this.state.title)}>
										<InputCopyTitleText
											autoFocus
											type="text"
											value={this.state.title}
											onChange={(e) => this.handleChangeTitle(e)}
											onBlur={(e) => this.handleChange(e)}
											required
										/>
									</form>
								)}
							</td>
						</tr>
						<tr>
							<TableThread>Created by:</TableThread>
							<td>{data.teacher}</td>
						</tr>
						<tr>
							<TableThread>Class:</TableThread>
							<td>{data.course_name}</td>
						</tr>
						<tr>
							<TableThread>Pages:</TableThread>
							<td>{pageOffsetString}</td>
						</tr>
					</tbody>
				</SidebarTableWrap>
			</>
		);
	}
}
