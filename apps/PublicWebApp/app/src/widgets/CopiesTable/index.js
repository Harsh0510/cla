import React from "react";
import styled from "styled-components";
import TableEditLink from "../TableEditLink";
import MaybeLinkToSingleCopy from "../MaybeLinkToSingleCopy";
import withAuthConsumer from "../../common/withAuthConsumer";
import staticValues from "../../common/staticValues";
import theme from "../../common/theme";
import SimpleTableViewerPresentation from "../SimpleTableViewer/Presentation";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";
const EXTRACT_STATUS_CANCELLED = staticValues.extractStatus.cancelled;

const EditIcon = styled.div`
	opacity: 0.3;
	color: ${theme.colours.headerButtonSearch};
`;

const InfoIcon = styled.i`
	color: ${theme.colours.primary} !important;
	font-weight: bold !important;
	margin-left: 8px !important;
`;

const ToolTipLink = styled.a`
	color: ${theme.colours.primary};
	:hover {
		color: ${theme.colours.primary};
		cursor: pointer;
	}
`;
const HeaderInfoLink = styled(ToolTipLink)`
	margin-left: -5px;
`;

const CopyEditInfoLink = styled(ToolTipLink)`
	margin-left: 5px;
`;

const COPIES_FIELDS = [
	{
		id: "status",
		title: [
			<>
				Status
				<HeaderInfoLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4404469871505" target="_blank">
					<InfoIcon className="fas fa-info-circle"></InfoIcon>
				</HeaderInfoLink>
			</>,
		],
		width: 100,
		sortingEnabled: false,
	},
	{ id: "teacher", title: "User", width: 200, align: COLUMN_ALIGN_LEFT_LEFT, type: "text", sortingEnabled: true },
	{ id: "title", title: "Copy name", width: 350, align: COLUMN_ALIGN_LEFT_LEFT, type: "text", sortingEnabled: true },
	{ id: "course_name", title: "Class", width: 100, align: COLUMN_ALIGN_LEFT_LEFT, type: "text", sortingEnabled: true },
	{ id: "year_group", title: "Year", width: 85, align: COLUMN_ALIGN_LEFT_LEFT, type: "text", sortingEnabled: true },
	{ id: "page_count", title: "Pages", width: 55, align: COLUMN_ALIGN_LEFT_LEFT, type: "text", sortingEnabled: true },
	{ id: "date_created", title: "Created on", width: 120, align: COLUMN_ALIGN_LEFT_LEFT, type: "date", sortingEnabled: true },
	{ id: "date_expired", title: "Expiry date", width: 120, align: COLUMN_ALIGN_LEFT_LEFT, type: "date", sortingEnabled: true },
	{ id: "share", title: "View copy", width: 80, align: COLUMN_ALIGN_CENTER, type: "text", sortingEnabled: false },
];

/**Design seperate component for display copies table used in Title Details Page, Extract By Page and Search Page */
export default withAuthConsumer(
	class CopiesTable extends React.PureComponent {
		getCopiesData = (data) => {
			const myUserDetails = this.props.withAuthConsumer_myUserDetails;
			const canCopy = myUserDetails ? myUserDetails.can_copy : false;
			const hasTrialExtractAccess = myUserDetails ? myUserDetails.has_trial_extract_access : false;

			return data.map((row) => {
				const newRow = { ...row };
				newRow.teacher = row.teacher;
				newRow.course_name = row.course_name;
				newRow.year_group = row.year_group;
				newRow.page_count = row.page_count;
				newRow.date_created = row.date_created;
				newRow.date_expired = row.date_expired;
				newRow.status = row.status;
				if (row.status.toLowerCase() !== EXTRACT_STATUS_CANCELLED) {
					newRow.title = row.title;
					if (canCopy) {
						newRow.share = (
							<TableEditLink to={`/profile/management/${row.oid}`} hovertitle={"This copy has been deleted, and can no longer be accessed."}>
								<i className="fal fa fa-edit" />
							</TableEditLink>
						);
					} else if (!canCopy && hasTrialExtractAccess) {
						newRow.share = <MaybeLinkToSingleCopy oid={row.oid} doShowModal={this.props.doShowModal} hovertitle={row.title} />;
					} else {
						newRow.share = (
							<TableEditLink to={`/profile/management/${row.oid}`} disable={true} hovertitle={row.title}>
								<i className="fal fa fa-edit" />
							</TableEditLink>
						);
					}
				} else {
					newRow.title = (
						<div title="This copy has been deleted, and can no longer be accessed.">
							{row.title}
							<CopyEditInfoLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4404469871505" target="_blank">
								<i className="fas fa-info-circle"></i>
							</CopyEditInfoLink>
						</div>
					);
					newRow.share = <EditIcon className="fal fa fa-edit" title="This copy has been deleted, and can no longer be accessed." />;
				}
				return newRow;
			});
		};

		render() {
			const { copiesData, unfilteredCount, doSorting, doPagination, limit, offset, loading, sortField, sortDir } = this.props;

			return (
				<SimpleTableViewerPresentation
					fields={COPIES_FIELDS}
					data={this.getCopiesData(copiesData)}
					unfilteredCount={unfilteredCount}
					doSorting={doSorting}
					doPagination={doPagination}
					limit={limit}
					offset={offset}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					showColumnSelector={false}
				/>
			);
		}
	}
);
