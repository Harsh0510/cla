import React from "react";
import styled, { css } from "styled-components";
import PreventRightClick from "../../widgets/PreventRightClick";
import getPageOffset from "../../common/getPageOffset";
import flyoutGuide from "./flyoutGuide";
import Flyout from "../../widgets/Flyout";
import AssetPageNotAvailable from "../../widgets/AssetPageNotAvailable";
import theme from "../../common/theme";
import { col12, colLg8, colMd6 } from "../../common/style";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { Button } from "../../widgets/Layout/Button";

const CustomControl = styled.div`
	font-weight: bold;
	font-size: 18px;
	padding-left: 33px;
	position: relative;
	display: block;
	min-height: 30px;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 10px;
		margin-bottom: 10px;
	}
`;

const CustomControlInput = styled.input`
	position: absolute;
	z-index: -1;
	opacity: 0;
`;

const CustomControlLabel = styled.label`
	position: relative;
	margin-bottom: 0;
	vertical-align: middle;
	padding-left: 5px;

	${(p) =>
		!p.isExcludedPage &&
		css`
			::before {
				position: absolute;
				top: 0;
				left: -33px;
				display: block;
				width: 30px;
				height: 30px;
				pointer-events: none;
				content: "";
				border: #ffffff solid 1px;
				transition: all 0.15s;
				border-radius: 50%;
			}

			::after {
				position: absolute;
				top: 0;
				left: -30px;
				display: block;
				width: 30px;
				height: 30px;
				content: "";
				font-family: "Font Awesome 5 Pro";
				text-align: center;
				font-size: 30px;
				line-height: 27px;
				font-weight: 300;
				color: ${theme.colours.lime};
				${(p) =>
					p.checked &&
					css`
						content: "\f00c";
					`};
				cursor: pointer;
			}

			@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
				::before {
					top: 3px;
					width: 20px;
					height: 20px;
				}

				::after {
					width: 20px;
					height: 20px;
					font-size: 20px;
					line-height: 23px;
				}
			}
		`};
`;

const BookHeader = styled.div`
	background-color: ${theme.colours.darkGray};
	height: 46px;
	overflow: hidden;
	padding-left: 10px;
	display: flex;
	align-items: center;

	height: 46px;
	overflow: hidden;
	padding-left: 10px;
	width: 100%;
	cursor: default;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		height: 35px;
	}
`;

const BookGrid = styled.div`
	margin-left: auto;
	button .square {
		width: 20px;
		height: 27px;
		border: 1px solid #ffffff;
		display: inline-block;
		vertical-align: middle;
	}
	button {
		padding: 10px 10px 9px;
		border: 0;
		background: transparent;
	}
	button:hover {
		background: transparent;
	}
	button.selected,
	.book-grid button.selected:hover {
		background: #dae99c;
	}
	button.selected .square {
		border-color: ${theme.colours.darkGray};
	}
`;

const Image = styled.img`
	width: 100%;
	cursor: pointer;
	margin-right: auto;
	margin-left: auto;
`;

const Wrapper = styled.div`
	${col12}
	${(p) => (p.numColumns === 1 ? PageContentLarge : ``)}
	${(p) => (p.numColumns === 1 ? colLg8 : colMd6)}
	${(p) =>
		p.numColumns === 1 &&
		css`
			margin-right: auto;
			margin-left: auto;
		`};
	${(p) =>
		p.numColumns !== 1 &&
		css`
			padding-bottom: 1rem;
			@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
				padding-bottom: 0;
			}
		`}
`;

export default class SliderPage extends React.PureComponent {
	checkBox = React.createRef();
	bookPageSelection = React.createRef();

	handleClick(pageNumber) {
		this.props.onOpen(pageNumber);
	}

	handleChange = (e) => {
		let pageValue = parseInt(e.target.value, 10);
		setTimeout(() => {
			this.props.addSelectedPage(pageValue);
		}, 20);
		if (this.props.doShowFlyout && this.props.currentIndex === 0) {
			this.props.onFlyoutClose();
		}
	};

	handleFilterClick(column) {
		this.props.setNumColumns(column);
	}

	render() {
		const { isbn, pageNumber, checked, numColumns, currentIndex, contentForm, copyExcludedPagesMap } = this.props;
		let pageColumnsLayout = null;

		if (numColumns === 1 && currentIndex === 0) {
			pageColumnsLayout = (
				<BookGrid>
					<Button className="selected" title="Single page layout" onClick={this.handleFilterClick.bind(this, 1)}>
						<span className="square"></span>
					</Button>
					<Button title="Double page layout" onClick={this.handleFilterClick.bind(this, 2)}>
						<span className="square"></span>
						<span className="square"></span>
					</Button>
				</BookGrid>
			);
		} else if (numColumns === 2 && currentIndex === 1) {
			pageColumnsLayout = (
				<BookGrid>
					<Button title="Single page layout" onClick={this.handleFilterClick.bind(this, 1)}>
						<span className="square"></span>
					</Button>
					<Button className="selected" title="Double page layout" onClick={this.handleFilterClick.bind(this, 2)}>
						<span className="square"></span>
						<span className="square"></span>
					</Button>
				</BookGrid>
			);
		}

		return (
			<>
				<Wrapper numColumns={numColumns}>
					<PreventRightClick isCursorAuto={!this.props.imageSrc}>
						<BookHeader ref={this.props.currentIndex === 0 && this.props.doShowFlyout ? this.bookPageSelection : undefined}>
							<CustomControl>
								{!copyExcludedPagesMap[pageNumber] && (
									<CustomControlInput
										type="checkbox"
										ref={this.checkBox}
										value={pageNumber}
										name={"SliderPage-Select-" + pageNumber}
										id={"SliderPage-Select-" + pageNumber}
										onChange={this.handleChange}
										checked={checked}
									/>
								)}
								<CustomControlLabel htmlFor={"SliderPage-Select-" + pageNumber} isExcludedPage={copyExcludedPagesMap[pageNumber]} checked={checked}>
									{getPageOffset(pageNumber, this.props.page_offset_roman, this.props.page_offset_arabic)}
								</CustomControlLabel>
							</CustomControl>
							{pageColumnsLayout}
						</BookHeader>

						{!this.props.imageSrc ? (
							<AssetPageNotAvailable />
						) : (
							<Image
								id={`PDFPage${pageNumber}`}
								src={this.props.imageSrc}
								alt={`PDF Page ${pageNumber}`}
								onClick={this.handleClick.bind(this, pageNumber)}
								width="467"
								height="490"
								title="Fullscreen"
							/>
						)}
					</PreventRightClick>
				</Wrapper>
				{this.props.currentIndex === 0 && this.props.doShowFlyout && (
					<Flyout key={0} target={this.bookPageSelection} width={320} height={140} onClose={this.props.onFlyoutClose}>
						{flyoutGuide.flyout[1]}
					</Flyout>
				)}
			</>
		);
	}
}
