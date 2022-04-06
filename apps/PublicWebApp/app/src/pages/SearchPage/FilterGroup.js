import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";
import CheckBox from "./CheckBox";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import { withFlyoutManager } from "../../common/FlyoutManager";

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
	${(props) =>
		!props.open &&
		css`
			display: none;
		`}
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

const FilterItem = styled.div`
	display: block;
	margin-bottom: 0.7em;
	margin-top: 1em;
`;

const TableToggle = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin: 10px 0;
`;
const Tab = styled.div`
	border: 1px solid ${theme.colours.white};
	padding: 5px;
	flex: auto;
	text-align: center;
	transition: opacity 300ms;
	${(props) =>
		props.isSelected
			? css`
					background-color: ${theme.colours.white};
					color: ${theme.colours.bgDarkPurple};
					cursor: default;
			  `
			: css`
					&:hover {
						opacity: 0.7;
						cursor: pointer;
					}
			  `}
	${(props) =>
		props.disabled
			? css`
					pointer-events: none;
					opacity: 0.3;
			  `
			: null}
`;

export default withPageSize(
	withFlyoutManager(
		class FilterGroup extends React.PureComponent {
			state = {
				open: true,
				breakpoint: null,
			};

			unlockedBookFilterRef = React.createRef(null);

			static getDerivedStateFromProps(nextProps, prevState) {
				if (nextProps.breakpoint !== prevState.breakpoint) {
					return { breakpoint: nextProps.breakpoint };
				}
				return null; // Triggers no change in the state
			}

			toggleSection = () => {
				this.setState({ open: !this.state.open });
			};

			doChange = (filterId, isChecked, exclusive) => {
				const selected = [];
				// if an 'all' filter is selected, deselect all other filters
				if (filterId === "__all__") {
					for (const item of this.props.data) {
						selected.push({
							isChecked: false,
							filterId: item.id,
							filterGroup: this.props.group,
						});
					}
					// make the filter group behave like radio buttons
				} else if (exclusive) {
					for (const item of this.props.data) {
						if (item.id !== filterId) {
							selected.push({
								isChecked: false,
								filterId: item.id,
								filterGroup: this.props.group,
							});
						}
					}
					selected.push({
						isChecked: isChecked,
						filterId: filterId,
						filterGroup: this.props.group,
					});
					// toggle checkbox normally
				} else {
					selected.push({
						isChecked: isChecked,
						filterId: filterId,
						filterGroup: this.props.group,
					});
				}

				if (this.props.flyouts_getFirstUnseenIndex("search") === 5) {
					this.props.flyouts_setNext("search");
				}
				this.props.selectFilter(selected);
			};

			//event for 'misc filter' only
			doChangeMiscFilter = (filterId, isChecked) => {
				const selected = [];
				// if 'Books' filter is selected, deselect all other filters
				if (filterId === "__all__" || filterId === "all_extracts" || filterId === "all_copies") {
					for (const item of this.props.data) {
						selected.push({
							isChecked: false,
							filterId: item.id,
							filterGroup: this.props.group,
						});
					}

					//'all_copies' filter is selected
					if (filterId === "all_copies" && isChecked) {
						for (const item of this.props.data) {
							if (item.id == "all_copies") {
								selected.push({
									isChecked: true,
									filterId: item.id,
									filterGroup: this.props.group,
								});
							}
						}
					}
					//'all_extracts' filter is selected
					if (filterId === "all_extracts" && isChecked) {
						for (const item of this.props.data) {
							if (item.id == "all_extracts") {
								selected.push({
									isChecked: true,
									filterId: "all_extracts",
									filterGroup: this.props.group,
								});
							}
						}
					}
					// make the filter group behave like radio buttons
				} else if (filterId === "__allbooks__") {
					// make the filter group behave like radio buttons
					for (const item of this.props.data) {
						selected.push({
							isChecked: false,
							filterId: item.id,
							filterGroup: this.props.group,
						});
					}
				} else {
					selected.push({
						isChecked: isChecked,
						filterId: filterId,
						filterGroup: this.props.group,
					});
				}

				const firstUnseen = this.props.flyouts_getFirstUnseenIndex("search");

				if (filterId === "unlock_books" && firstUnseen === 3) {
					this.props.flyouts_setNext("search");
				}

				if (firstUnseen === 5) {
					this.props.flyouts_setNext("search");
				}
				this.props.selectFilter(selected);
			};

			getCollapseIcon = (flag) => {
				return flag ? <i className="fa fa-angle-up" aria-hidden="true"></i> : <i className="fa fa-angle-down" aria-hidden="true"></i>;
			};

			doCloseUnlockedBooksFlyout = () => {
				this.props.flyouts_setNext("search");
			};

			onChangeTab = (name) => {
				this.doChangeMiscFilter(name, true);
			};

			render() {
				const allFilterSelected = this.props.hasAll && Object.keys(this.props.selected).length === 0;
				const BooksFilterSelected =
					this.props.hasAll && (Object.keys(this.props.selected).length === 0 || this.props.selected["unlock_books"] === true);
				const myCopiesOnlyFilter = this.props.hasAll ? this.props.data.find((item) => item.id === "my_copies") : null;
				const showUnlockedBooksFlyout = this.props.flyouts_getFirstUnseenIndex("search") === 3;
				const extractsFilterSelected = this.props.hasAll && this.props.selected["all_extracts"] === true;
				const allCopiesFilterSelected = this.props.hasAll && this.props.selected["all_copies"] === true;
				const miscFiltersById = (() => {
					if (!this.props.hasAll) {
						return null;
					}
					const ret = Object.create(null);
					for (const item of this.props.data) {
						if (item.count && item.id) {
							ret[item.id] = true;
						}
					}
					return ret;
				})();
				return (
					<StyledFilterGroup>
						{this.props.hasAll && (
							<>
								<TableToggle>
									<Tab isSelected={BooksFilterSelected} onClick={() => this.onChangeTab("__all__")} data-ga-user-extract="search-filter-content">
										<div>Content</div>
									</Tab>
									<Tab
										isSelected={extractsFilterSelected}
										disabled={!miscFiltersById.all_extracts}
										onClick={() => this.onChangeTab("all_extracts")}
										data-ga-user-extract="search-filter-user-uploads"
									>
										<div>User uploads</div>
									</Tab>
									<Tab
										isSelected={allCopiesFilterSelected}
										disabled={!miscFiltersById.all_copies}
										onClick={() => this.onChangeTab("all_copies")}
										data-ga-user-extract="search-filter-copies"
									>
										<div>Copies</div>
									</Tab>
								</TableToggle>

								{myCopiesOnlyFilter && myCopiesOnlyFilter.id ? (
									<FilterItem>
										<CheckBox
											onChange={this.doChange}
											checked={this.props.selected[myCopiesOnlyFilter.id]}
											value={myCopiesOnlyFilter.id}
											isDisable={BooksFilterSelected || extractsFilterSelected}
											isLabel={true}
										>
											{myCopiesOnlyFilter.title} ({myCopiesOnlyFilter.count})
										</CheckBox>
									</FilterItem>
								) : (
									""
								)}
								{BooksFilterSelected ? (
									<>
										<Heading name="toggleSection" onClick={this.toggleSection} open={this.state.open}>
											Search within
											{this.getCollapseIcon(this.state.open)}
										</Heading>
										<FilterList open={this.state.open}>
											<FilterItem>
												<CheckBox
													key="__allbooks__"
													onChange={this.doChangeMiscFilter}
													checked={allFilterSelected}
													value="__allbooks__"
													isRadioButton={true}
												>
													All ({this.props.allCount})
												</CheckBox>
											</FilterItem>
											{this.props.data.map((item, index) =>
												item.id === "unlock_books" ? (
													<FilterItem key={item.id}>
														{showUnlockedBooksFlyout ? (
															<>
																<CheckBox
																	key={item.id}
																	onChange={this.doChangeMiscFilter}
																	checked={this.props.selected[item.id]}
																	value={item.id}
																	isRadioButton={true}
																	ref={this.unlockedBookFilterRef}
																>
																	{item.title} ({item.count})
																</CheckBox>
																<Flyout
																	onClose={this.doCloseUnlockedBooksFlyout}
																	target={this.unlockedBookFilterRef}
																	width={theme.flyOutWidth}
																	height={130}
																	highlight_gutter={10}
																>
																	{flyOutGuide.flyOut[2]}
																</Flyout>
															</>
														) : (
															<CheckBox
																key={item.id}
																onChange={this.doChangeMiscFilter}
																checked={this.props.selected[item.id]}
																value={item.id}
																isRadioButton={true}
															>
																{item.title} ({item.count})
															</CheckBox>
														)}
													</FilterItem>
												) : (
													""
												)
											)}
										</FilterList>
									</>
								) : (
									""
								)}
							</>
						)}

						{!this.props.hasAll ? (
							<>
								<Heading name="toggleSection" onClick={this.toggleSection} open={this.state.open}>
									{this.props.title}
									{this.getCollapseIcon(this.state.open)}
								</Heading>
								{this.props.data.length > 0 && (
									<FilterList open={this.state.open}>
										{this.props.data.map((item) => (
											<CheckBox
												key={item.id}
												onChange={this.doChange}
												checked={this.props.selected[item.id]}
												value={item.id}
												exclusive={this.props.exclusive}
											>
												{item.title} ({item.count})
											</CheckBox>
										))}
									</FilterList>
								)}
							</>
						) : (
							""
						)}
					</StyledFilterGroup>
				);
			}
		}
	)
);
