/** Form called by CreateCopyForm Page */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import AssetMessageAccess from "./AssetMessageAccess";
import staticValues from "../../common/staticValues";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import { col12, h1, noGuttersMargin } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";
import { Button } from "../../widgets/Layout/Button";
import { ColExtraSmallWithNoGutters } from "../../widgets/Layout/ColExtraSmallWithNoGutters";

const LockBook = styled.div`
	max-width: 100%;
	display: flex;
	align-items: center;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		max-width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		max-width: 100%;
	}
`;

const SectionText = styled.div`
	color: ${theme.colours.darkGray};
	border-color: ${theme.colours.darkGray};
	background-size: 10px 16px;
	align-items: center;
	display: flex;
	width: 100%;
	margin-top: 15px;
	@media screen and (max-width: ${theme.breakpoints.desktop}) {
		margin-top: 1rem;
	}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) and (min-width: ${theme.breakpoints.tabletPro}) {
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		display: block;
		margin-top: 14px;
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobileSmall}) {
		-ms-flex-wrap: nowrap;
		-webkit-flex-wrap: nowrap;
		-ms-flex-wrap: nowrap;
		flex-wrap: nowrap;
	}
`;

const FormSection = styled.form``;

const SubmitButton = styled(Button)`
	color: ${theme.colours.white};
	background-color: ${theme.colours.primary};
	padding: 7px 10px;
	white-space: nowrap;

	margin-left: 15px;
	${(props) =>
		props.disabled &&
		css`
			opacity: 0.3;
			cursor: default;
			pointer-events: none;
		`};
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 100%;
		max-width: 120px;
		margin-left: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 5px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile5}) {
		max-width: 100%;
		margin-left: 0;
	}
`;

const IconWrap = styled.div`
	visibility: hidden;
	display: none;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		${(p) =>
			p.step === 1 &&
			css`
				visibility: visible;
				padding: 0 1em;
			`};
	}
`;

const MobButtonWrap = styled.div`
	padding: 0;
	width: 100%;
	display: flex;
	align-items: baseline;
	justify-content: flex-end;
`;

const MobTextIconWrap = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: 0.5em 1em;
`;
const IconText = styled.div`
	padding-left: 0;
	line-height: 1;
`;

const MobRow = styled.div`
	flex-wrap: nowrap;
`;

const MobRowWrap = styled(MobRow, Row)`
	${noGuttersMargin}
`;

const MobSelect = styled.div`
	padding: 0.5em 0em;
	width: 100%;
`;

const LeftLabelSection = styled.div`
	min-width: 60px;
`;

const WrapSubmitButton = styled.div`
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		text-align: right;
	}
`;

const DropDownContainer = styled.div`
	width: 100%;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
	}
`;

const SelectionSection = styled.div`
	display: flex;
	padding: 0 1em;
	align-items: center;
	flex-wrap: nowrap;
	width: 100%;
`;

const WrapDropDownSelection = styled.div`
	align-items: center;
	display: flex;
	width: 100%;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-bottom: 14px;
	}
`;

const IconSection = styled.div`
	text-align: right;
	display: inline-block;
	width: 50px;
	margin-right: 10px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 35px;
		margin-right: 6px;
	}
`;

const UnlockIcon = styled.div`
	text-align: center;
	margin-right: 10px;
	width: 50px;
`;

const FormItems = styled.div`
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		display: flex;
	}
`;

const CreateCopyIconButton = styled.i`
	font-size: 14px;
	margin-left: 0.5rem;
`;

const AssetContentUnLockMessageForSpan = styled.span`
	font-size: 14px;
`;

const FullWidthSection = styled.div`
	${col12}
`;
const Icon = styled.i`
	${h1}
	font-weight: normal;
`;

export default function Form(props) {
	const classOptionsArr = [];
	const hasClasses = props.coursesData && props.coursesData.length;
	const canCopy = props.canCopy;
	const hasVerified = props.hasVerified;
	const asset = props.resultData;
	const contentForm = asset && asset.content_form ? asset.content_form : "";
	const isShowUnlockWithPadIcon = asset.auto_unlocked && asset.is_unlocked;
	const isShowFullAccessIcon = asset.can_copy_in_full;
	const assetContentUnLockMessage =
		asset.auto_unlocked && asset.is_unlocked ? (
			<AssetContentUnLockMessageForSpan>
				This title is unlocked for everyone{isShowFullAccessIcon && " and can be copied in full"}.
				<br /> Select a class to create a copy.
			</AssetContentUnLockMessageForSpan>
		) : asset.is_unlocked && isShowFullAccessIcon ? (
			<AssetContentUnLockMessageForSpan>
				This title can be copied in full.
				<br /> Select a class to create a copy.
			</AssetContentUnLockMessageForSpan>
		) : contentForm === staticValues.assetContentForm.mi ? (
			<AssetContentUnLockMessageForSpan>
				This issue is unlocked.
				<br /> Select a class to create a copy.
			</AssetContentUnLockMessageForSpan>
		) : (
			<AssetContentUnLockMessageForSpan>
				<AssetContentUnLockMessageForSpan>
					This book is unlocked.
					<br /> Select a class to create a copy.
				</AssetContentUnLockMessageForSpan>
			</AssetContentUnLockMessageForSpan>
		);

	if (hasClasses) {
		props.coursesData.forEach((item) => {
			const classOptions = {};
			classOptions.value = item.oid;
			classOptions.key = item.oid;
			classOptions.label = item.title;
			classOptionsArr.push(classOptions);
		});
	} else {
		const classOptions = {};
		classOptions.value = "create_class";
		classOptions.label = "Create a Class";
		classOptions.key = "create_class";
		classOptionsArr.push(classOptions);
	}

	const classesDropdown = () => {
		return (
			<AjaxSearchableDropdown
				api={props.api}
				name="class"
				value={props.selectedClass}
				placeholder="Select..."
				onChange={props.handleCourseChange}
				minQueryLength={2}
				requestApi={staticValues.api.classSearch}
				toolTipText={props.isShowTooltip ? "Please select a class" : null}
				performApiCallWhenEmpty={true}
				highlightOnError={true}
			/>
		);
	};

	return props.isMobile ? (
		<>
			{canCopy ? (
				<>
					<MobRowWrap>
						<ColExtraSmallWithNoGutters>
							<MobTextIconWrap>
								<div style={{ display: "flex", flexDirection: "row" }}>
									{isShowUnlockWithPadIcon ? (
										<IconSection>
											<img
												src={require("../../assets/icons/unlocked-with-tick.svg")}
												alt={"This title is unlocked for everyone"}
												title={"This title is unlocked for everyone"}
											/>
										</IconSection>
									) : (
										<UnlockIcon>
											<Icon className="far fa-unlock-alt"></Icon>
										</UnlockIcon>
									)}
									{isShowFullAccessIcon && (
										<IconSection>
											<img
												src={require("../../assets/icons/full-circle.svg")}
												alt={"You can copy all of this title"}
												title={"You can copy all of this title"}
											/>
										</IconSection>
									)}
								</div>
								<IconText>{assetContentUnLockMessage}</IconText>
							</MobTextIconWrap>
						</ColExtraSmallWithNoGutters>
					</MobRowWrap>
					<MobRowWrap>
						<SelectionSection>
							<LeftLabelSection>
								<span>Class: </span>
							</LeftLabelSection>
							<MobSelect>{classesDropdown()}</MobSelect>
						</SelectionSection>
					</MobRowWrap>
					<MobRow>
						<FullWidthSection>
							<MobButtonWrap>
								<SubmitButton ref={props.createCopyRef} type="submit" onClick={props.handleSubmit}>
									Create a Copy<CreateCopyIconButton className="fal fa-chevron-right"></CreateCopyIconButton>
								</SubmitButton>
								<div>
									<IconWrap step={props.step} title="Lorem ipsum dolor sit amet, consectetuer adipiscing elit">
										<i className="far fa-question-circle"></i>
									</IconWrap>
								</div>
							</MobButtonWrap>
						</FullWidthSection>
					</MobRow>
				</>
			) : !hasVerified ? (
				<AssetMessageAccess hasVerified={hasVerified} isMobile={props.isMobile} />
			) : (
				<AssetMessageAccess hasVerified={hasVerified} isMobile={props.isMobile} />
			)}
		</>
	) : (
		<FormSection>
			<FormItems>
				{canCopy ? (
					<>
						<LockBook>
							<div style={{ display: "flex", flexDirection: "row" }}>
								{isShowUnlockWithPadIcon ? (
									<IconSection>
										<img
											src={require("../../assets/icons/unlocked-with-tick.svg")}
											alt={"This title is unlocked for everyone"}
											title={"This title is unlocked for everyone"}
										/>
									</IconSection>
								) : (
									<UnlockIcon>
										<Icon className="far fa-unlock-alt"></Icon>
									</UnlockIcon>
								)}
								{isShowFullAccessIcon && (
									<IconSection>
										<img
											src={require("../../assets/icons/full-circle.svg")}
											alt={"You can copy all of this title"}
											title={"You can copy all of this title"}
										/>
									</IconSection>
								)}
							</div>

							{assetContentUnLockMessage}
						</LockBook>
						<SectionText>
							<WrapDropDownSelection>
								<LeftLabelSection>
									<span>Class: </span>
								</LeftLabelSection>
								<DropDownContainer>{classesDropdown()}</DropDownContainer>
							</WrapDropDownSelection>
							<WrapSubmitButton>
								<SubmitButton ref={props.createCopyRef} type="submit" onClick={props.handleSubmit} disabled={props.isShowTooltip}>
									Create a Copy<CreateCopyIconButton className="fal fa-chevron-right"></CreateCopyIconButton>
								</SubmitButton>
								<IconWrap step={props.step} title="Lorem ipsum dolor sit amet, consectetuer adipiscing elit">
									<i className="far fa-question-circle"></i>
								</IconWrap>
							</WrapSubmitButton>
						</SectionText>
					</>
				) : !hasVerified ? (
					<AssetMessageAccess hasVerified={hasVerified} />
				) : (
					<AssetMessageAccess hasVerified={hasVerified} />
				)}
			</FormItems>
		</FormSection>
	);
}
