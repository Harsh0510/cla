import React from "react";
import styled from "styled-components";
import getPageOffsetString from "../../common/getPageOffsetString";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import { HeadTitle } from "../../widgets/HeadTitle";
import staticValues from "../../common/staticValues";

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

const LeftSideContentTitle = styled.div`
	font-size: 18px;
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
	}

	render() {
		const { data } = this.props;
		const pageOffsetObject = getPageOffsetObject(data);
		const pageOffsetString = getPageOffsetString(data.pages, pageOffsetObject.roman, pageOffsetObject.arabic);

		return (
			<>
				<HeadTitle title={"Copy titled '" + data.title + "' from '" + data.work_title + "' on the Education Platform"} hideSuffix={true} />
				{data.file_format === FILE_FORMAT_EPUB && <Ptag>{staticValues.messages.assetFileFormatEpubMessage}</Ptag>}
				<LeftSideContentTitle>About this Copy</LeftSideContentTitle>
				<SidebarTableWrap>
					<tbody>
						<tr>
							<TableThread>Copy Name:</TableThread>
							<td>
								<CopyNameSection>
									<CopyTitleName>{data.title}</CopyTitleName>
								</CopyNameSection>
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
							<td name="copyPages">{pageOffsetString}</td>
						</tr>
					</tbody>
				</SidebarTableWrap>
			</>
		);
	}
}
