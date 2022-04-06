import React from "react";
import styled from "styled-components";
import { Container } from "../Layout/Container";
import Modal from "../Modal";
import BookRequest from "./BookRequest";
import AuthorRequest from "./AuthorRequest";
import PublisherRequest from "./PublisherRequest";
import ContentTypeRequest from "./ContentTypeRequest";
import OtherRequest from "./OtherRequest";
import TabSet from "../../widgets/TabSet";
import { Button } from "../Layout/Button";
import ConfirmModal from "../ConfirmModal";
import staticValues from "../../common/staticValues";
import theme from "../../common/theme";
import getMaybeValidIsbn from "../../common/getMaybeValidIsbn";
import getNoneEmptyValueArray from "../../common/getNoneEmptyValueArray";

const WrapTabcontent = styled.div`
	margin: 30px 20px 20px 20px;

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 0px;
	}
`;

const ModalBody = styled.div`
	margin-bottom: 1.5em;
`;

const ModalText = styled.div`
	margin-bottom: 0.6em;
`;

class ContentRequestModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selectedTabIndex: 0,
			currentTab: staticValues.contentRequestType.bookRequest,
			bookRequest: {
				isbn: "",
				publisher: "",
				title: "",
				publicationYear: "",
				author: "",
				url: "",
			},
			authorRequest: [],
			publisherRequest: [],
			contentTypeRequest: {
				contentTypes: [],
				additionalComments: "",
			},
			otherRequest: "",
			isEnableSubmit: false,
			contentTypeDropDownData: [],
			isShowSuccessConfirmModal: false,
			isShowContentRequestForm: true,
			requestTypes: new Set(),
			isShowMultiRequestConfirmModal: false,
		};
	}

	resetAll = () => {
		this.setState({
			selectedTabIndex: 0,
			currentTab: staticValues.contentRequestType.bookRequest,
			bookRequest: {
				isbn: "",
				publisher: "",
				title: "",
				publicationYear: "",
				author: "",
				url: "",
			},
			authorRequest: [],
			publisherRequest: [],
			contentTypeRequest: {
				contentTypes: [],
				additionalComments: "",
			},
			otherRequest: "",
			isEnableSubmit: false,
			requestTypes: new Set(),
		});
	};

	componentDidMount() {
		this._isMounted = true;
		if (this.props.defaultValues) {
			this.setState(
				{
					bookRequest: { ...this.state.bookRequest, isbn: this.props.defaultValues.isbn, title: this.props.defaultValues.title },
				},
				() => {
					this.isValid();
				}
			);
		}
		this.props.api("/admin/content-type-get-all", {}).then((result) => {
			this.setState({ contentTypeDropDownData: result.data });
		});
	}

	onChangeTab = (index, name) => {
		this.setState({ selectedTabIndex: index, currentTab: name }, () => {
			this.isValid();
		});
	};

	onChange = (name, value) => {
		switch (this.state.currentTab) {
			case staticValues.contentRequestType.bookRequest:
				this.setState(
					{
						bookRequest: { ...this.state.bookRequest, [name]: value },
					},
					() => {
						this.isValid();
					}
				);
				break;
			case staticValues.contentRequestType.contentTypeRequest:
				this.setState({ contentTypeRequest: { ...this.state.contentTypeRequest, [name]: value } }, () => {
					this.isValid();
				});
				break;
			default:
				this.setState({ [name]: value }, () => {
					this.isValid();
				});
				break;
		}
	};

	hasObjectKeysContainValue = (obj) => {
		let hasValue = false;
		for (const item in obj) {
			if (obj[item]) {
				if (typeof obj[item] === "string" || typeof obj[item] === "number") {
					hasValue = true;
					break;
				} else if (Array.isArray(obj[item])) {
					hasValue = getNoneEmptyValueArray(obj[item]).length > 0;
					break;
				}
			}
		}
		return hasValue;
	};

	isValid = () => {
		let requestTypes = new Set(this.state.requestTypes);
		let isTabContainValueforBook = false;
		let isTabContainValueForAuthor = false;
		let isTabContainValueForPublisher = false;
		let isTabContainValueForContent = false;
		let isTabContainValueForOther = false;

		Object.values(staticValues.contentRequestType).forEach((tab) => {
			switch (tab) {
				case staticValues.contentRequestType.bookRequest:
					isTabContainValueforBook = this.state.bookRequest.isbn
						? getMaybeValidIsbn(this.state.bookRequest.isbn)
						: this.hasObjectKeysContainValue(this.state.bookRequest);
					if (isTabContainValueforBook) {
						requestTypes.add(staticValues.contentRequestType.bookRequest);
					} else {
						requestTypes.delete(staticValues.contentRequestType.bookRequest);
					}
					this.setState({ requestTypes: requestTypes });
					break;
				case staticValues.contentRequestType.authorRequest:
					isTabContainValueForAuthor = getNoneEmptyValueArray(this.state.authorRequest).length > 0;
					if (isTabContainValueForAuthor) {
						requestTypes.add(staticValues.contentRequestType.authorRequest);
					} else {
						requestTypes.delete(staticValues.contentRequestType.authorRequest);
					}
					this.setState({ requestTypes: requestTypes });
					break;
				case staticValues.contentRequestType.publisherRequest:
					isTabContainValueForPublisher = getNoneEmptyValueArray(this.state.publisherRequest).length > 0;
					if (isTabContainValueForPublisher) {
						requestTypes.add(staticValues.contentRequestType.publisherRequest);
					} else {
						requestTypes.delete(staticValues.contentRequestType.publisherRequest);
					}
					this.setState({ requestTypes: requestTypes });
					break;
				case staticValues.contentRequestType.contentTypeRequest:
					isTabContainValueForContent = this.state.contentTypeRequest.additionalComments || this.state.contentTypeRequest.contentTypes.length;
					if (isTabContainValueForContent) {
						requestTypes.add(staticValues.contentRequestType.contentTypeRequest);
					} else {
						requestTypes.delete(staticValues.contentRequestType.contentTypeRequest);
					}
					this.setState({ requestTypes: requestTypes });
					break;
				case staticValues.contentRequestType.otherRequest:
					isTabContainValueForOther = this.state.otherRequest ? true : false;
					if (isTabContainValueForOther) {
						requestTypes.add(staticValues.contentRequestType.otherRequest);
					} else {
						requestTypes.delete(staticValues.contentRequestType.otherRequest);
					}
					this.setState({ requestTypes: requestTypes });
					break;
			}
		});
		this.setState({
			isEnableSubmit:
				isTabContainValueforBook ||
				isTabContainValueForAuthor ||
				isTabContainValueForPublisher ||
				isTabContainValueForContent ||
				isTabContainValueForOther,
		});
	};

	onSubmitData = () => {
		const requestTypes = [];
		let data = Object.create(null);
		data.isbn = this.state.bookRequest.isbn;
		data.book_title = this.state.bookRequest.title;
		data.book_request_author = this.state.bookRequest.author;
		data.book_request_publisher = this.state.bookRequest.publisher;
		data.publication_year = this.state.bookRequest.publicationYear;
		data.url = this.state.bookRequest.url;
		data.authors = getNoneEmptyValueArray(this.state.authorRequest);
		data.publishers = getNoneEmptyValueArray(this.state.publisherRequest);
		data.content_type = this.state.contentTypeRequest.contentTypes;
		data.content_type_note = this.state.contentTypeRequest.additionalComments;
		data.other_note = this.state.otherRequest;
		this.state.requestTypes.forEach(function (value) {
			requestTypes.push(value);
		});
		data.request_types = requestTypes;
		this.props
			.api("/admin/content-request-create", data)
			.then((result) => {
				if (result.created) {
					if (this.state.isShowMultiRequestConfirmModal) {
						this.setState({ isShowSuccessConfirmModal: true, isShowContentRequestForm: false, isShowMultiRequestConfirmModal: false });
					} else {
						this.setState({ isShowContentRequestForm: false, isShowSuccessConfirmModal: true });
					}
				}
			})
			.catch((err) => {
				if (err.indexOf("ISBN is not valid") === -1) {
					console.log(err);
				}
			});
	};

	onConfirmSuccessConfirmModal = () => {
		this.resetAll();
		this.setState({ isShowSuccessConfirmModal: false, isShowContentRequestForm: true });
	};

	onConfirmMultiRequestConfirmModal = () => {
		this.onSubmitData();
	};

	onCancleMultiRequestConfirmModal = () => {
		this.setState({ isShowMultiRequestConfirmModal: false, isShowContentRequestForm: true });
	};

	onSubmit = () => {
		if (this.state.isEnableSubmit) {
			if (this.state.requestTypes.size > 1) {
				this.setState({ isShowMultiRequestConfirmModal: true, isShowContentRequestForm: false });
			} else if (this.state.requestTypes.size === 1) {
				this.onSubmitData();
			}
		}
	};

	render() {
		const { handleClose } = this.props;
		const { selectedTabIndex } = this.state;
		const tabContent = [
			{
				title: "Book request",
				name: staticValues.contentRequestType.bookRequest,
				content: (
					<WrapTabcontent>
						<BookRequest data={this.state.bookRequest} onChange={this.onChange} />
					</WrapTabcontent>
				),
				toolTipText: "Please enter as much information about the book you wish to see on the Platform as you have available.",
			},
			{
				title: "Author request",
				name: staticValues.contentRequestType.authorRequest,
				content: (
					<WrapTabcontent>
						<AuthorRequest data={this.state.authorRequest} onChange={this.onChange} />
					</WrapTabcontent>
				),
				toolTipText: "Please add up to 5 authors here.",
			},
			{
				title: "Publisher request",
				name: staticValues.contentRequestType.publisherRequest,
				content: (
					<WrapTabcontent>
						<PublisherRequest data={this.state.publisherRequest} onChange={this.onChange} />
					</WrapTabcontent>
				),
				toolTipText: "Please add up to 5 publishers here.",
			},
			{
				title: "Content type request",
				name: staticValues.contentRequestType.contentTypeRequest,
				content: (
					<WrapTabcontent>
						<ContentTypeRequest data={this.state.contentTypeRequest} dropDownData={this.state.contentTypeDropDownData} onChange={this.onChange} />
					</WrapTabcontent>
				),
				toolTipText:
					"Please tell us about different types of content/material types you wish to see on the Platform, for example Fiction, Podcasts or Videos.",
			},
			{
				title: "Other request",
				name: staticValues.contentRequestType.otherRequest,
				content: (
					<WrapTabcontent>
						<OtherRequest data={this.state.otherRequest} onChange={this.onChange} />
					</WrapTabcontent>
				),
				toolTipText:
					"If you'd like to tell us about something you want to see on the Platform which isn't covered by the other request types, please do so here.",
			},
		];

		let tabNamebyTabTitleMap = Object.create(null);
		tabContent.forEach((tab) => {
			tabNamebyTabTitleMap[tab.name] = tab.title;
		});

		const getSelectedTabs = () => {
			const selectedTabs = [];
			this.state.requestTypes.forEach((tab) => {
				selectedTabs.push(tabNamebyTabTitleMap[tab]);
			});
			return [selectedTabs.slice(0, -1).join(", "), selectedTabs.slice(-1)[0]].join(selectedTabs.length < 2 ? "" : " and ");
		};
		return (
			<Container>
				{this.state.isShowSuccessConfirmModal && (
					<ConfirmModal
						title={getSelectedTabs() + " successfully submitted"}
						subTitle="Thank you for your suggestion! Would you like to submit another request?"
						onClose={handleClose}
						onConfirm={this.onConfirmSuccessConfirmModal}
						onCancel={handleClose}
					/>
				)}
				{this.state.isShowMultiRequestConfirmModal && (
					<ConfirmModal
						title={"You've entered some text on the " + getSelectedTabs() + " as well."}
						subTitle=" Do you want that to be part of what you tell us? Please delete anything you do not wish to submit."
						onClose={this.onCancleMultiRequestConfirmModal}
						onConfirm={this.onConfirmMultiRequestConfirmModal}
						onCancel={this.onCancleMultiRequestConfirmModal}
						confirmButtonText={"Yes - submit info from all tabs"}
						cancelButtonText={"No - take me back to editing"}
					/>
				)}
				{this.state.isShowContentRequestForm && (
					<Modal
						title={`Can't find what you're looking for?`}
						show={this.state.isShowContentRequestForm}
						handleClose={handleClose}
						modalWidth={"700px"}
					>
						<ModalBody>
							<ModalText>
								We're working hard to make more great content available for you to unlock and copy. Please use this form to tell us about what you'd
								like to see on the Education Platform in the future.
							</ModalText>
							<ModalText>Start by clicking one of the below buttons to tell us what type of request you have.</ModalText>
							<TabSet tabs={tabContent} selectedIndex={selectedTabIndex} onSelect={this.onChangeTab} maxTabsPerRow={3} data={this.state} />
							<Button type="submit" onClick={this.onSubmit} disabled={!this.state.isEnableSubmit}>
								Submit request
							</Button>
						</ModalBody>
					</Modal>
				)}
			</Container>
		);
	}
}

export default ContentRequestModal;
