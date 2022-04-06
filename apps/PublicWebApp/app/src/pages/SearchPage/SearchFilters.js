import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import FilterGroup from "./FilterGroup";
import withPageSize from "../../common/withPageSize";
import SubjectFilterPresentation from "./SubjectFilterPresentation";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import { withFlyoutManager } from "../../common/FlyoutManager";

const Wrap = styled.div`
	padding: ${(p) => (p.isMobile && !p.open ? "0px" : "25px")};
	font-size: 16px;
	background-color: transparent;
	transition: opacity 100ms;
	${(p) =>
		!p.loaded &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
		padding: ${(p) => (p.isMobile && !p.open ? "0px" : "0 2em 0em 2em")};
		z-index: 21;
		left: 0;
		${(p) =>
			p.open === true &&
			css`
				background-color: ${theme.colours.bgDarkPurple};
			`}
	}
`;

const Header = styled.div`
	font-size: 1.125em;
	font-weight: bold;
	color: ${theme.colours.white};
	position: relative;
	display: flex;
	justify-content: space-between;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 1em;
		line-height: 1.75em;
		font-weight: bold;
	}
`;

const FilterGroupWrapper = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0 0 1.5em 0;
	font-size: 0.875em;
	line-height: 1.0625em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-top: -1em;
		font-weight: bold;
		i {
			font-weight: 300;
			font-size: 2em;
		}
	}
`;

export default withPageSize(
	withFlyoutManager(
		class SearchFilters extends React.PureComponent {
			render() {
				const { filters, selected, selectFilter, allCount, openSubject } = this.props;
				if (!filters) {
					return <></>;
				}
				const isSmall = this.props.breakpoint < withPageSize.TABLET;
				const open = !isSmall || this.props.open;
				return (
					<>
						<Wrap loaded={this.props.ajaxLoaded} open={open} isMobile={this.props.isMobile}>
							{!this.props.isMobile ? (
								<Header name="searchFilter" onClick={this.props.onMenuClick}>
									<span>Refine search</span>
								</Header>
							) : (
								""
							)}
							{open && (
								<>
									<FilterGroupWrapper>
										{filters.map((filter, index) =>
											filter.id !== "subject" ? (
												<FilterGroup
													key={filter.id}
													data={filter.data}
													group={filter.id}
													title={filter.title}
													selected={selected[filter.id]}
													selectFilter={selectFilter}
													hasAll={filter.id === "misc"}
													exclusive={filter.id === "misc"}
													allCount={allCount}
													itemIndex={index}
												/>
											) : (
												<SubjectFilterPresentation
													key={filter.id}
													group={filter.id}
													data={filter.data}
													selected={selected[filter.id]}
													selectFilter={selectFilter}
													openSubject={openSubject}
													setOpenSubjectFlag={this.props.setOpenSubjectFlag}
												/>
											)
										)}
									</FilterGroupWrapper>
								</>
							)}
						</Wrap>
					</>
				);
			}
		}
	)
);
