import React from "react";
import styled, { css } from "styled-components";
import { Row } from "../Layout/Row";
import { colLg12, colXs12, colSm10, colLg8, colSm2, colLg4, colXl6 } from "../../common/style";
import theme from "../../common/theme";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";
import staticValues from "../../common/staticValues";

const DetailsSection = styled(Row)`
	justify-content: center;

	${(p) =>
		p.marginTop &&
		css`
			margin-top: 3em;
			@media screen and (max-width: ${theme.breakpoints.mobile}) {
				margin-top: 1em;
			}
		`};
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0.875em;
	}
`;

const DetailsWrap = styled.div`
	${colLg8}
	${colXl6}
`;

const FormHeaderWrap = styled(DetailsWrap)`
	margin-top: 0.25rem;
`;

const FullWrap = styled.div`
	${colLg12}
`;

const FormHeader = styled.h2`
	text-align: left;
	margin: 1em 0;
	color: ${theme.colours.blueMagenta};
	font-size: 1.25em;
	font-weight: normal;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-bottom: 0;
		margin-top: 0;
		font-size: 1.125em;
	}
`;

const TableWrap = styled.div`
	${colXs12}
	${colSm10}
	${colLg8}
`;

const Table = styled.table`
	width: 100%;
	th,
	td {
		font-weight: normal;
		font-size: 0.875em;
		padding: 0.5em 0;
		color: ${theme.colours.bgDarkPurple};
		height: 1.25em;
		line-height: 1.25em;
		vertical-align: top;
	}
	td {
		padding-left: 1em;
	}
`;

const ImageSection = styled.div`
	${colSm2}
	${colLg4}
`;

const ImageWrap = styled.div`
	display: flex;
	flex-wrap: nowrap;
	justify-content: flex-end;
	align-items: center;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		justify-content: flex-start;
		margin-top: 2em;
	}
`;

const Image = styled.img`
	box-shadow: 0 4px 7px;
`;

class CopyConfirmDetails extends React.PureComponent {
	render() {
		const { isbn13, workData, fields, selected, userUploadedAsset, pageOffsetString } = this.props;
		const pagePrefix = selected && selected.length === 1 ? "Page" : "Pages";

		return (
			<DetailsSection>
				<FormHeaderWrap>
					<Row>
						<FullWrap>
							<FormHeader> Confirm Details </FormHeader>
						</FullWrap>
					</Row>
					<Row>
						<TableWrap>
							<Table>
								<tbody>
									<tr>
										{workData.content_form === staticValues.assetContentForm.mi ? <th>Magazine/issue:</th> : <th>Book:</th>}
										<td>{fields.work_title}</td>
									</tr>
									{userUploadedAsset && (
										<tr>
											<th>Upload name:</th>
											<td>{fields.upload_name}</td>
										</tr>
									)}
									<tr>
										<th>{pagePrefix}:</th>
										<td>{pageOffsetString}</td>
									</tr>
									{!userUploadedAsset && (
										<tr>
											<th>Class:</th>
											<td>{fields.course_name}</td>
										</tr>
									)}
									<tr>
										<th>Institution:</th>
										<td>{fields.school}</td>
									</tr>
								</tbody>
							</Table>
						</TableWrap>
						<ImageSection>
							<ImageWrap>
								<Image src={getThumbnailUrl(isbn13)} alt={fields.work_title} width="99" height="129" onError={setDefaultCoverImage} />
							</ImageWrap>
						</ImageSection>
					</Row>
				</FormHeaderWrap>
			</DetailsSection>
		);
	}
}

export default CopyConfirmDetails;
