import React from "react";
import { renderToString } from "react-dom/server";
import styled from "styled-components";
import { CopyToClipboard } from "react-copy-to-clipboard";
import memoizeOne from "memoize-one";
import Modal from "../Modal/index.js";
import AssetDescriptionString from "../CoverPage/AssetDescriptionString.js";
import customSetTimeout from "../../common/customSetTimeout";

const ModalHeader = styled.h2`
	font-size: 1.125em;
	margin-bottom: 0.4em;
	font-weight: 400;
	line-height: 20px;
	border-bottom: 1px solid black;
	margin-bottom: 1em;
`;

const ModalBody = styled.div`
	font-size: 0.875em;
	font-weight: 400;
	line-height: 20px;
	margin-bottom: 1.2em;
`;

const ModalFooter = styled.div`
	margin-bottom: 1.5em;
	font-size: 0.875em;
`;

const CreateCitationLink = styled.button`
	border: 0;
	outline: 0;
	display: block;
	background-color: transparent;
	font-size: 0.875em;
	padding: 0;
	color: #4d475f;
	text-decoration: underline;
`;

const CopyIconWrap = styled.span`
	cursor: pointer;
	& > * {
		pointer-events: none;
	}
`;
const parser = new DOMParser();
const htmlDecode = (input) => parser.parseFromString(input, "text/html").documentElement.textContent;
const fetchCitationText = (resultData) => htmlDecode(renderToString(AssetDescriptionString(resultData)).replace(/(<([^>]+)>)/gi, ""));

export default class CitationTool extends React.PureComponent {
	state = {
		isShowCitationPopup: false,
		showDidCopyIndicator: false,
	};

	getCitationText = memoizeOne(fetchCitationText);

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		if (this._onCopyHider) {
			clearTimeout(this._onCopyHider);
		}
		delete this._onCopyHider;
		delete this._isMounted;
	}

	doShowCitationPopup = () => {
		this.setState({ isShowCitationPopup: true });
	};

	doHideCitationPopup = () => {
		this.setState({ isShowCitationPopup: false });
	};

	onCopy = (text, success) => {
		if (!success) {
			return;
		}
		this.setState({
			showDidCopyIndicator: true,
		});
		if (this._onCopyHider) {
			clearTimeout(this._onCopyHider);
		}
		this._onCopyHider = customSetTimeout(() => {
			if (!this._isMounted) {
				return;
			}
			this.setState({
				showDidCopyIndicator: false,
			});
		}, 1000);
	};

	render() {
		const { resultData } = this.props;
		const { isShowCitationPopup } = this.state;
		const citationText = this.getCitationText(resultData);
		return (
			<>
				<CopyToClipboard text={citationText}>
					<CreateCitationLink type="button" onClick={this.doShowCitationPopup} data-ga-create-copy="share" data-ga-use-copy="create-citation">
						Create Citation
					</CreateCitationLink>
				</CopyToClipboard>
				{isShowCitationPopup && (
					<Modal show={true} handleClose={this.doHideCitationPopup} modalWidth={"698px"} isApplyMobileLarge={true}>
						<div>
							<ModalHeader>Citation Created!</ModalHeader>
							<ModalBody>
								<AssetDescriptionString {...resultData} />
							</ModalBody>
							<ModalFooter>
								Citation copied to clipboard.&nbsp;
								<CopyToClipboard text={citationText} onCopy={this.onCopy}>
									<CopyIconWrap data-ga-create-copy="share" data-ga-use-copy="copy-citation" title="Copy to clipboard">
										<i className="far fa-copy" />
										{this.state.showDidCopyIndicator ? "✔" : null}
									</CopyIconWrap>
								</CopyToClipboard>
							</ModalFooter>
						</div>
					</Modal>
				)}
			</>
		);
	}
}
