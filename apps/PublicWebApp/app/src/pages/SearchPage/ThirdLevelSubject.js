import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";
import FourthLevelSubject from "./FourthLevelSubject";
import CheckBox from "./CheckBox";
import { withFlyoutManager } from "../../common/FlyoutManager";

const StyledFilterGroup = styled.li`
	display: block;
	margin-bottom: 0.7em;
`;

const Heading = styled.div`
	color: ${theme.colours.white};
	border: 0;
	border-bottom: 0px solid ${theme.colours.white};
	display: block;
	width: 100%;
	text-align: left;
	font-weight: 300;
	margin-bottom: 0.7em;
	padding: 0;
	display: flex;
	justify-content: flex-start;
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
	padding: 0 0 0 1.5em;
	margin: 0;
	list-style: none;
	line-height: 1.2;
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
	padding-left: 0.5em;
	color: ${theme.colours.white};
`;

export default withPageSize(
	withFlyoutManager(
		class ThirdLevelSubject extends React.PureComponent {
			state = {
				open: false,
				breakpoint: null,
			};

			static getDerivedStateFromProps(nextProps, prevState) {
				if (nextProps.breakpoint !== prevState.breakpoint) {
					const nextState = {
						breakpoint: nextProps.breakpoint,
					};
					if (prevState.open && nextProps.breakpoint < withPageSize.TABLET) {
						nextState.open = false;
					}
					return nextState;
				}
				return null; // Triggers no change in the state
			}

			toggleSection = () => {
				this.setState({ open: !this.state.open });
			};

			doChange = (filterId, isChecked) => {
				const selected = [];
				// toggle checkbox normally
				selected.push({
					isChecked: isChecked,
					filterId: filterId,
					filterGroup: this.props.group,
				});
				this.props.selectFilter(selected);
				if (this.props.flyouts_getFirstUnseenIndex("search") === 5) {
					this.props.flyouts_setNext("search");
				}
			};

			getSubjectCount = (subject) => {
				return parseInt(subject.count, 10);
			};

			getCollapseIcon = (flag) => {
				return flag ? <i className="fa fa-angle-up" aria-hidden="true"></i> : <i className="fa fa-angle-down" aria-hidden="true"></i>;
			};

			render() {
				const { subject, selected, selectFilter, group } = this.props;
				return (
					<StyledFilterGroup>
						<Heading>
							<CheckBox
								key={"ThirdLevelSubject" + subject.id}
								onChange={this.doChange}
								checked={selected[subject.id]}
								value={subject.id}
								isLabel={true}
							>
								{subject.title} ({this.getSubjectCount(subject)})
							</CheckBox>
							{/* {subject.child_subjects.length>0?<CollapseArrow><FontAwesomeIcon icon={this.state.open ? faCaretUp : faCaretDown} onClick={this.toggleSection}/></CollapseArrow>:''} */}
							{subject.child_subjects.length > 0 ? (
								<CollapseArrow onClick={this.toggleSection}>{this.getCollapseIcon(this.state.open)}</CollapseArrow>
							) : (
								""
							)}
						</Heading>
						{subject.child_subjects.length > 0 && this.state.open ? (
							<FilterList>
								{subject.child_subjects.map((childSubject) => (
									<FourthLevelSubject
										key={childSubject.id}
										childSubject={childSubject}
										selected={selected[childSubject.id]}
										selectFilter={selectFilter}
										group={group}
									/>
								))}
							</FilterList>
						) : (
							""
						)}
					</StyledFilterGroup>
				);
			}
		}
	)
);
