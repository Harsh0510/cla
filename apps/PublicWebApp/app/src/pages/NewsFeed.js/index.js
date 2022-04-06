import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import MultiRowTextField from "../../widgets/MultiRowTextField";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import Loader from "../../widgets/Loader";
import {
	FormWrapAddEdit,
	FormMessage,
	FormBodyContainer,
	FormContainerFull,
	FormContainerButton,
	FormContainerHalf,
	FormSaveButton,
} from "../../widgets/AdminStyleComponents";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const deepEqual = require("deep-equal");

const JUMP_TO_CONTENT_ID = "main-content";

const WrapperForm = styled.div`
	position: relative;
`;

const WrapperLoader = styled.div`
	position: absolute;
	margin: 0 auto;
	width: 100%;
	height: 100%;
	z-index: 1;
`;
const WrapDetailSection = styled.div`
	${(p) =>
		p.disabled === true &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class NewsFeed extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					message: "",
					blog_category_names_value: [],
					blog_category_names_valid: [],
					currentItem: [],
					isLoading: true,
				};
			}

			categoryNameIsValid() {
				for (const v of this.state.blog_category_names_valid) {
					if (!v) {
						return false;
					}
				}
				return true;
			}

			onCategoryNameChange = (name, value, valid) => {
				this.setState({
					message: null,
					blog_category_names_value: value,
					blog_category_names_valid: valid,
				});
			};

			performQuery = () => {
				let category_names;
				this.props
					.api("/admin/home-screen-blog-get-categories")
					.then((result) => {
						if (result.data) {
							category_names = result.data[0].blog_category_names;
							this.setState({
								blog_category_names_value: category_names,
								blog_category_names_valid: category_names.map((_) => true),
								currentItem: { blog_category_names: category_names },
								isLoading: false,
							});
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			componentDidMount() {
				this.performQuery();
			}

			getFieldValuesForUpdate = (currentItem, updatedItem) => {
				let params = Object.create(null);
				if (!deepEqual(currentItem.blog_category_names, updatedItem.blog_category_names)) {
					params.blog_category_names = updatedItem.blog_category_names;
				}
				return params;
			};

			// add Edit Blog Categories names
			handleSubmit = (e) => {
				e.preventDefault();
				this.setState(
					{
						isLoading: true,
					},
					this.updateCategoryBlock()
				);
			};

			updateCategoryBlock = () => {
				let category_names = this.state.blog_category_names_value;
				category_names = category_names.map((ele) => ele.trim());
				category_names = category_names.filter((ele) => ele.length > 0);
				const submitData = {
					blog_category_names: category_names,
				};
				let params = this.getFieldValuesForUpdate(this.state.currentItem, submitData);
				this.props
					.api("/admin/home-screen-blog-category-update", params)
					.then((result) => {
						if (result.result) {
							this.setState({ message: "Successfully updated", isLoading: false });
							this.performQuery();
						} else {
							this.setState({ message: "Record not updated", isLoading: false });
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString(), isLoading: false });
					});
			};

			render() {
				return (
					<>
						<HeadTitle title={PageTitle.newsFeeds} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"News Feed"} backURL="/profile/admin" id={JUMP_TO_CONTENT_ID}>
							<WrapperForm>
								{this.state.isLoading ? (
									<WrapperLoader>
										<Loader />
									</WrapperLoader>
								) : (
									""
								)}
								<WrapDetailSection disabled={this.state.isLoading}>
									<FormWrapAddEdit tableList={false} onSubmit={(e) => this.handleSubmit(e)}>
										<FormMessage className="message">{this.state.message}</FormMessage>
										<FormBodyContainer>
											<FormContainerFull>
												<FormContainerHalf>
													<label>Allowed categories: </label>
													<MultiRowTextField
														value={this.state.blog_category_names_value}
														valid={this.state.blog_category_names_valid}
														type="template"
														name="blog_category_names"
														onChange={this.onCategoryNameChange}
													/>
												</FormContainerHalf>
											</FormContainerFull>
											<FormContainerButton>
												<FormSaveButton
													type="submit"
													name="update-category"
													value="update"
													disabled={!this.categoryNameIsValid() || this.state.isLoading}
												>
													Update
												</FormSaveButton>
											</FormContainerButton>
										</FormBodyContainer>
									</FormWrapAddEdit>
								</WrapDetailSection>
							</WrapperForm>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
