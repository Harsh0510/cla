import React from "react";
import { Link, withRouter } from "react-router-dom";
import styled from "styled-components";
import theme from "../../common/theme";
import queryString from "query-string";
import Flyout from "../Flyout";
import { withFlyoutManager } from "../../common/FlyoutManager";
import { btn, formControl, srOnly } from "../../common/style";

const SearchForm = styled.form`
	margin-bottom: 1rem;
	margin-top: 1rem;
	flex-grow: 1;

	::-webkit-input-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	::-moz-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	::-ms-input-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	::-ms-input-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	:placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 0;
	}
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		margin-bottom: 0;
	}
`;

const ButtonSearch = styled.button`
	${btn}
	position: absolute;
	right: 0;
	padding: 0;
	top: 0;
	bottom: 0;
	margin: auto;
	color: ${theme.colours.headerButtonSearch};
	background-color: transparent;
	border: none;

	:hover {
		border: 1px solid ${theme.colours.primary};
	}
`;

const SearchInput = styled.div`
	display: flex;
	margin-bottom: 0;
	position: relative;
`;

const CustomInput = styled.input`
	${formControl}
	color: ${theme.colours.headerButtonSearch};
	border: 0;
	border-bottom: 1px solid ${theme.colours.primary};
	border-radius: 0;
	font-size: 14px;
	padding: 6px 20px 6px 0;
	height: auto;

	:focus {
		box-shadow: none;
		border-color: ${theme.colours.primary};
	}
	::-webkit-input-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	::-moz-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	:-ms-input-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	::-ms-input-placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
	::placeholder {
		color: ${theme.colours.headerButtonSearch};
	}
`;

const Label = styled.label`
	${srOnly}
`;

const UploadIcon = styled.i`
	font-size: 30px;
	padding: 0 10px;
	color: ${theme.colours.primary};
	pointer-events: none;
`;

const Wrap = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`;

export default withRouter(
	withFlyoutManager(
		class SearchBar extends React.PureComponent {
			state = {
				value: "",
			};

			searchBarRef = React.createRef(null);

			componentDidMount() {
				this.updateSearchState();
			}

			componentDidUpdate(prevProps) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateSearchState();
				}
			}

			updateSearchState() {
				if (this.props.location.pathname === "/works") {
					const parsed = queryString.parse(this.props.location.search);
					this.setState({
						value: parsed.q || "",
					});
				}
			}

			handleSubmit = (e) => {
				e.preventDefault();
				let url;
				const parsed = queryString.parse(this.props.location.search);
				delete parsed.q;
				delete parsed.page;
				if (this.props.myUserDetails && this.props.myUserDetails.is_fe_user && this.props.location.pathname !== "/works") {
					delete parsed.filter_level;
					url =
						"/works?" +
						(Object.keys(parsed).length ? queryString.stringify(parsed) + "&" : "") +
						encodeURI("filter_level=Further Education&q=" + this.state.value);
				} else {
					url = "/works?" + (Object.keys(parsed).length ? queryString.stringify(parsed) + "&" : "") + "q=" + encodeURIComponent(this.state.value);
				}
				if (this.isShowFlyout()) {
					this.doCloseFlyout();
				}
				this.props.history.push(url);
			};

			handleChange = (e) => {
				this.setState({ value: e.target.value });
			};

			doCloseFlyout = () => {
				this.props.flyouts_setNext("search");
			};

			isShowFlyout = () => {
				const currentLocationPathName = this.props.location.pathname;
				if (currentLocationPathName === "/works") {
					const flyoutsSearch_FirstUnseenIndex = this.props.flyouts_getFirstUnseenIndex("search");
					const SearchedQuery = this.state.value;
					if (flyoutsSearch_FirstUnseenIndex === 1 && SearchedQuery !== "") {
						this.doCloseFlyout();
					}
					return flyoutsSearch_FirstUnseenIndex === 1 && SearchedQuery === "";
				}
				return false;
			};

			render() {
				const SearchBarForm = (
					<>
						<SearchForm method="GET" onSubmit={this.handleSubmit}>
							<SearchInput ref={this.searchBarRef}>
								<Label htmlFor="search">Search books, magazines and authors</Label>
								<CustomInput
									type="text"
									name="search"
									id="search"
									placeholder="Search books, magazines and authors"
									value={this.state.value}
									onChange={this.handleChange}
								/>
								<ButtonSearch arie-label="search" type="submit">
									<i className="far fa-search"></i>
								</ButtonSearch>
							</SearchInput>
						</SearchForm>
						{this.props.myUserDetails && this.props.myUserDetails.role !== "cla-admin" && (
							<Link to="/asset-upload" data-ga-user-extract="entry-cloud">
								<UploadIcon
									className="far fa-cloud-upload"
									title="Clicking here lets you upload your own PDF extract which you can then keep on the Education Platform and share with your students."
								></UploadIcon>
							</Link>
						)}
					</>
				);
				return (
					<>
						{this.props.isMobile ? <Wrap>{SearchBarForm}</Wrap> : SearchBarForm}
						{this.isShowFlyout() && (
							<Flyout onClose={this.doCloseFlyout} target={this.searchBarRef} height={180} width={400}>
								<span>Enter your search term here and click the magnifying glass. </span>
								<br />
								<span>The search bar appears on every page!</span>
							</Flyout>
						)}
					</>
				);
			}
		}
	)
);
