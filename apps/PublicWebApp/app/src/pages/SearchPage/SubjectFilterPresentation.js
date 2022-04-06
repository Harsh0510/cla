import React from "react";
import styled, { css } from "styled-components";
import withPageSize from "../../common/withPageSize";
import ThirdLevelSubject from "./ThirdLevelSubject";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

const StyledFilterGroup = styled.div`
	margin-top: 1.25em;
	font-weight: 300;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		line-height: 1.75em;
		font-weight: bold;
		font-size: 0.875em;
		i {
			font-weight: 300;
			font-size: 2em;
		}
	}
`;

const Heading = styled.button`
	border: 0;
	border-bottom: 1px solid ${theme.colours.white};
	display: block;
	width: 100%;
	text-align: left;
	color: ${theme.colours.white};
	font-weight: 300;
	padding: 0.5em 0;
	margin-bottom: 1.25em;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: transparent;
	outline: none;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		line-height: 1.75em;
		font-weight: bold;
		font-size: 0.875em;
		i {
			font-weight: 300;
			font-size: 2em;
		}
	}
`;

const FilterList = styled.ul`
	padding: 0;
	margin: 0;
	list-style: none;
	line-height: 1.2;
	max-height: 200px;
	overflow-y: auto;
	* {
		box-sizing: border-box;
	}
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${theme.colours.lightGray};
		border-radius: 0;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.lightGray};
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		line-height: 1.75em;
		font-weight: bold;
		font-size: 0.875em;
		i {
			font-weight: 300;
			font-size: 2em;
		}
	}
`;

const CollapseArrow = styled.div`
	color: ${theme.colours.white};
`;

export default withPageSize(
	class SubjectFilterPresentation extends React.PureComponent {
		toggleSection = (e) => {
			e.preventDefault();
			this.props.setOpenSubjectFlag(!this.props.openSubject);
		};

		getCollapseIcon = (flag) => {
			return flag ? <i className="fa fa-angle-up" aria-hidden="true"></i> : <i className="fa fa-angle-down" aria-hidden="true"></i>;
		};

		render() {
			const { group, data, selected, selectFilter, openSubject } = this.props;

			return (
				<StyledFilterGroup>
					<Heading name="toggleSection" onClick={this.toggleSection}>
						Subjects
						<CollapseArrow>{this.getCollapseIcon(openSubject)}</CollapseArrow>
					</Heading>
					{openSubject ? (
						<FilterList>
							{data.map((subject) => (
								<ThirdLevelSubject key={subject.id} group={group} subject={subject} selected={selected} selectFilter={selectFilter} />
							))}
						</FilterList>
					) : (
						""
					)}
				</StyledFilterGroup>
			);
		}
	}
);
