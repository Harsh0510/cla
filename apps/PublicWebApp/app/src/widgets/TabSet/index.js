import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { FormContainerHalf, FormCustomSelect } from "../AdminStyleComponents";

const DEFAULT_TABS_IN_ROW = 5;

const Wrapper = styled.div`
	width: 100%;
	min-height: 500px;

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		min-height: 300px;
	}
`;

const TabTitleWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	text-align: center;
	width: 100%;
	margin-bottom: 5px;

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		display: none;
	}
`;

const BoxContainer = styled.div`
	border: 1px solid ${theme.colours.primary};
	margin-top: 0.5em;
	padding: 0.2em 0;
	width: ${(p) => 100 / p.maxTabsPerRow}%;

	:hover {
		cursor: pointer;
		color: ${theme.colours.primary};
	}

	${(p) =>
		p.isSelected &&
		css`
			background-color: ${theme.colours.primary};
			* {
				color: ${theme.colours.white} !important;
			}
			:hover {
				* {
					color: ${theme.colours.white};
				}
			}
		`}
`;

const Box = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledLink = styled.div`
	max-width: 100%;
`;

const ToolTipIcon = styled.div`
	margin-left: 5px;
	color: ${theme.colours.primary};
`;

const DropdownContainer = styled.div`
	display: none;
	margin-top: 30px;

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		display: block;
	}
`;

class TabSet extends React.PureComponent {
	onClick = (e) => {
		e.preventDefault();
		let idx = parseInt(e.currentTarget.getAttribute("data-index") || "", 10);
		if (e.target.name === "request type") {
			const value = e.target.value;
			if (value === "") {
				return;
			}
			idx = parseInt(value, 10);
		}
		if (idx !== this.props.selectedIndex) {
			this.props.onSelect(idx, this.props.tabs[idx].name);
		}
	};

	render() {
		const { tabs, className, style, selectedIndex, maxTabsPerRow } = this.props;
		return (
			<Wrapper className={className} style={style}>
				<TabTitleWrapper>
					{tabs.map((tab, index) => (
						<BoxContainer
							key={index}
							data-index={index}
							isSelected={index === selectedIndex}
							maxTabsPerRow={maxTabsPerRow || DEFAULT_TABS_IN_ROW}
							onClick={this.onClick}
						>
							<Box>
								<StyledLink>{tab.title}</StyledLink>
								{tab.toolTipText && <ToolTipIcon className="fas fa-question-circle" title={tab.toolTipText}></ToolTipIcon>}
							</Box>
						</BoxContainer>
					))}
				</TabTitleWrapper>
				<DropdownContainer>
					<FormContainerHalf>
						<FormCustomSelect onChange={this.onClick} name="request type" value={selectedIndex}>
							{tabs.map((tab, index) => (
								<option key={index} value={index} data-index={index}>
									{tab.title}
								</option>
							))}
						</FormCustomSelect>
					</FormContainerHalf>
				</DropdownContainer>
				<div>{tabs[selectedIndex].content}</div>
			</Wrapper>
		);
	}
}

export default TabSet;
