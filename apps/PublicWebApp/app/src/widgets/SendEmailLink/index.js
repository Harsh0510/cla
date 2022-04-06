import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import sendEmailList from "../../common/sendEmailList";
import { getOrdinalSuffix, getLongFormContributors } from "../../common/misc";
import getMailto from "../../common/getMailto";
import TextLink from "../TextLink";
import getPageOffsetString from "../../common/getPageOffsetString";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import getUrl from "../../common/getUrl";

const EMAIL = sendEmailList.supportEP;

const SendLink = styled.span`
	a {
		font-weight: ${(p) => (p.isBold ? "bold !important" : "normal")};
		color: ${theme.colours.primary};
		background: transparent;
		text-decoration: underline;
		pointer-events: cursor;
	}
`;

const ShareWorkResultEmailLink = styled.span`
	a {
		font-size: 0.875em;
		font-weight: normal;
		color: ${theme.colours.headerButtonSearch};
		background: transparent;
		pointer-events: cursor;
	}
`;

const ShareCreatedExtractLink = styled.span`
	a {
		font-size: 1.125em;
		font-weight: bold;
		background-color: ${theme.colours.primaryLight};
		color: ${theme.colours.white};
		height: 48px;
		min-width: 51px;
		border: none;
		text-align: center;
		margin-right: 1em;
		padding: 0.8rem;
		display: block;
		width: 98%;
		${(props) =>
			props.isNeedBiggerIcon &&
			css`
				i {
					font-size: 1.5em;
					line-height: 1em;
					vertical-align: middle;
				}
			`}

		@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
			font-size: 14px;
			line-height: 20px;
			padding: 10px 15px;
			height: auto;
			vertical-align: middle;
			margin-right: 0;
		}

		@media screen and (max-width: ${theme.breakpoints.mobile7}) {
			font-size: 11px;
			line-height: 14px;
			padding: 9px 4px;
		}
	}
`;

function SendEmailLink(props) {
	return (
		<a className={props.className} style={props.style} href={"mailto:" + getMailto(props)} {...(props.htmlAtts || {})}>
			{props.linkTitle}
		</a>
	);
}

function RegisterMyInterest(props) {
	const { myUserDetails } = props;

	const body = `
To: Education Platform customer support
From: ${myUserDetails && myUserDetails.title ? myUserDetails.title + " " : "{Title} "}${
		myUserDetails && myUserDetails.first_name ? myUserDetails.first_name + " " : "{First Name} "
	}${myUserDetails && myUserDetails.last_name ? myUserDetails.last_name + " " : "{Last Name} "}
Institution: ${myUserDetails && myUserDetails.school ? myUserDetails.school : "{Institution Name}"}

I have been unable to scan a work in the education Platform.

{Please enter the detail of the title and an ISBN}
`.trim();
	const emailLink = <SendEmailLink email={EMAIL} subject="Degraded barcode" body={body} linkTitle={EMAIL} />;

	return <SendLink>{emailLink}</SendLink>;
}

function TitleNotAvailableForNotification(props) {
	const { myUserDetails } = props;
	const isbn = props.isbn ? props.isbn : " isbn ";

	const subject = "Book not available " + isbn + "";
	const body = `
To: Education Platform customer support
From: ${myUserDetails && myUserDetails.title ? myUserDetails.title + " " : "{Title} "}${
		myUserDetails && myUserDetails.first_name ? myUserDetails.first_name + " " : "{First Name} "
	}${myUserDetails && myUserDetails.last_name ? myUserDetails.last_name : "{Last Name} "}
Institution: ${myUserDetails && myUserDetails.school ? myUserDetails.school : "{Institution Name}"}

The book with this ISBN (${isbn}) was not recognised as being on the Education Platform. (Note to teacher: Please add here the title and author of the book you tried to unlock)

Thank you

`.trim();

	const emailLink = <SendEmailLink email={EMAIL} subject={subject} body={body} linkTitle="Tell us about it" />;

	return (
		<SendLink>
			We found the ISBN ({props.isbn}) in the picture you sent us, and it looks like the book isn't on the Education Platform. But don't worry, we've
			logged this and will unlock it if it becomes available.
			<br />
			{emailLink}
		</SendLink>
	);
}

function UnlockAssetProblem(props) {
	const { myUserDetails } = props;

	const subject = "Problem with unlock";
	const body = `
To: Education Platform customer support
From: ${myUserDetails && myUserDetails.title ? myUserDetails.title + " " : "{Title} "}${
		myUserDetails && myUserDetails.first_name ? myUserDetails.first_name + " " : "{First Name} "
	}${myUserDetails && myUserDetails.last_name ? myUserDetails.last_name : "{Last Name} "}
Institution: ${myUserDetails && myUserDetails.school ? myUserDetails.school : "{Institution Name}"}

Unlocking issue: Please let us know if you are having trouble with:

Enabling your camera
Unable to detect a barcode
Or any other problem
`.trim();
	const emailLink = <SendEmailLink email={EMAIL} subject={subject} body={body} linkTitle={props.linkTitle || "support team"} />;
	return <SendLink>{emailLink}</SendLink>;
}

function UnlockAssetCameraNotDetected(props) {
	const { myUserDetails } = props;
	const subject = "Camera not detected";
	const body = `
To: Education Platform customer support
From: ${myUserDetails && myUserDetails.title ? myUserDetails.title + " " : "{Title} "}${
		myUserDetails && myUserDetails.first_name ? myUserDetails.first_name + " " : "{First Name} "
	}${myUserDetails && myUserDetails.last_name ? myUserDetails.last_name : "{Last Name} "}
Institution: ${myUserDetails && myUserDetails.school ? myUserDetails.school : "{Institution Name}"}

I am unable to unlock content on the Education Platform as my camera has not been recognised. (Please provide details of your PC and relevant hardware (camera, scanner etc) if you can).

`.trim();
	const emailLink = <SendEmailLink email={EMAIL} subject={subject} body={body} linkTitle={props.linkTitle || "contact support"} />;
	return <SendLink>{emailLink}</SendLink>;
}

function ShareWorkResult(props) {
	const { title, shareLink } = props;
	const subject = `Education Platform: ${title}`;
	const body = `
I found this book on the Education Platform:

${title}

${shareLink}`.trim();
	const emailLink = (
		<SendEmailLink
			subject={subject}
			body={body}
			linkTitle={
				<>
					<i className="fal fa-envelope"></i> Email
				</>
			}
		/>
	);
	return <ShareWorkResultEmailLink>{emailLink}</ShareWorkResultEmailLink>;
}

function SendRequestHelpRaw(props) {
	const { myUserDetails, title = "Request help" } = props;
	const subject = "Problem with Education Platform - {Your issue}";
	const body = `
Name: ${myUserDetails && myUserDetails.first_name ? myUserDetails.first_name + " " : ""} ${
		myUserDetails && myUserDetails.last_name ? myUserDetails.last_name : ""
	}
Institution: ${myUserDetails && myUserDetails.school ? myUserDetails.school : ""}

My Problem: Please include all relevant detail to speed up resolving your issue.`.trim();

	return <SendEmailLink className={props.className} style={props.style} email={EMAIL} subject={subject} body={body} linkTitle={title} />;
}

function SendRequestHelp(props) {
	const { className, style, isBold, ...rest } = props;
	return (
		<SendLink isBold={isBold} className={className} style={style}>
			<SendRequestHelpRaw {...rest} />
		</SendLink>
	);
}

function SendGeneralEnquiry(props) {
	const { myUserDetails, title = "Contact us", isBold = true } = props;
	const subject = "General Enquiry - {Your Enquiry description}";
	const body = `
Name: ${myUserDetails && myUserDetails.first_name ? myUserDetails.first_name + " " : ""} ${
		myUserDetails && myUserDetails.last_name ? myUserDetails.last_name : ""
	}
Institution: ${myUserDetails && myUserDetails.school ? myUserDetails.school : ""}

My Query: Please add your query.

`.trim();

	const emailLink = <SendEmailLink email={EMAIL} subject={subject} body={body} linkTitle={title} />;

	return <SendLink isBold={isBold}>{emailLink}</SendLink>;
}

function CopyExtentIncreaseEmail(props) {
	const { myUserDetails } = props;

	const body = `
${myUserDetails && myUserDetails.first_name ? myUserDetails.first_name : "{First Name}"}
${myUserDetails && myUserDetails.last_name ? myUserDetails.last_name : "{Last Name}"}
${myUserDetails && myUserDetails.title ? myUserDetails.title : "{Title}"}

${myUserDetails && myUserDetails.school ? myUserDetails.school : "{Institution Name}"}

I would like to increase my Institution's extent limit for the title '${props.asset_title}' (${props.asset_isbn}).
	`.trim();
	return <SendEmailLink email={EMAIL} subject="Increase extent limit" body={body} linkTitle={props.children} />;
}

function getPlainTextBookDetails(props) {
	const authorsData = getLongFormContributors(props.work_authors);
	const editionString = props.edition > 1 ? `${getOrdinalSuffix(props.edition)} ed. ` : "";
	let prefix;
	if (authorsData) {
		if (authorsData.authors && !authorsData.editors) {
			prefix = `${authorsData.authors}. ${props.work_title}`;
		} else if (!authorsData.authors && authorsData.editors) {
			const suffix = authorsData.raw.editors.length > 1 ? "eds" : "ed";
			prefix = `${authorsData.authors}, ${suffix}. ${props.work_title}`;
		} else if (authorsData.authors && authorsData.editors) {
			const eds = authorsData.raw.editors.length > 1 ? "Eds" : "Ed";
			prefix = `${authorsData.authors}. ${props.work_title}. ${eds}. ${authorsData.editors}.`;
		} else {
			prefix = `${props.work_title}`;
		}
		if (authorsData.translators) {
			if (prefix[prefix.length - 1] !== ".") {
				prefix += ". ";
			}
			prefix += "Translated by " + authorsData.translators + ".";
		}
	} else {
		prefix = `${props.work_title}.`;
	}
	let suffix = ``;
	if (editionString) {
		suffix += `${editionString}`;
	}
	suffix += `${props.work_publisher + (props.work_publication_date ? ", " : ". ")}`;
	if (props.work_publication_date) {
		suffix += props.work_publication_date.slice(0, 4) + ". ";
	}
	suffix += `The Education Platform.`;
	return `
${prefix}
${suffix}
`.trim();
}

const extraShareExtractHtmlAtts = {
	"data-ga-create-copy": "share",
	"data-ga-use-copy": "email",
};

function ShareExtractLink(props) {
	const shareLinkURL = getUrl("/extract/" + props.copyOId + "/" + props.shareLink.oid);
	const enable_extract_share_access_code = props.shareLink.enable_extract_share_access_code;
	const access_code = props.shareLink.access_code;
	const data = props.workDetails;
	const pageOffsetObject = getPageOffsetObject(data);
	const pageOffsetString = getPageOffsetString(data.pages, pageOffsetObject.roman, pageOffsetObject.arabic);
	const subject = `View the extract from ${props.workDetails.work_title}`;
	let body = "";

	if (!enable_extract_share_access_code) {
		body = `
You can view the extract of pages ${pageOffsetString} from:

${getPlainTextBookDetails(props.workDetails)}

${shareLinkURL}

Please note that all extracts shared using the Education Platform are for use only by members of ${props.workDetails.school_name}.
`.trim();
	} else {
		body = `
I have created an extract of pages ${pageOffsetString} for you from:

${getPlainTextBookDetails(props.workDetails)}

which is available here:

${shareLinkURL}

For this copy you will also need the access code: ${access_code}

Please note that this copy and all extracts shared using the Education Platform are for use only by members of ${props.workDetails.school_name}.
		`.trim();
	}
	const emailLink = (
		<SendEmailLink
			subject={subject}
			body={body}
			htmlAtts={extraShareExtractHtmlAtts}
			linkTitle={
				<>
					Email &nbsp; <i className="fal fa-envelope"></i>{" "}
				</>
			}
		/>
	);
	return <ShareCreatedExtractLink>{emailLink}</ShareCreatedExtractLink>;
}

function getVerificationFailMailto(props) {
	let name = "";
	let school = "";
	let email = "";
	if (props && props.user) {
		name =
			props.user.title && props.user.first_name && props.user.last_name
				? `${props.user.title}. ${props.user.first_name} ${props.user.last_name}`
				: "";
		school = props.user.school || "";
		email = props.user.email || "";
	}
	let extraMessage;
	if (props && props.as_administrator) {
		extraMessage = `I'm unable to resend a verification email.`;
	} else {
		extraMessage = `I have an email verification problem.`;
	}
	return getMailto({
		email: EMAIL,
		subject: `Email verification`,
		body: `
Name: ${name}
Institution: ${school}
Email: ${email}

${extraMessage}
`.trim(),
	});
}

function getHwbVerificationFailMailto(props) {
	let name = "";
	let school = "";
	let email = "";
	if (props && props.user) {
		name =
			props.user.title && props.user.first_name && props.user.last_name
				? `${props.user.title}. ${props.user.first_name} ${props.user.last_name}`
				: "";
		school = props.user.school || "";
		email = props.user.email || "";
	}
	return getMailto({
		email: EMAIL,
		subject: `Education Platform: verification email`,
		body: `
From: ${name}
Institution: ${school}
Email: ${email}

I have not received my verification email for the Education Platform. Please can you resend it to me.

Thank you
`.trim(),
	});
}

function getLegacyActivationFailMailto(props) {
	let name = "";
	let school = "";
	let email = "";
	if (props && props.user) {
		name =
			props.user.title && props.user.first_name && props.user.last_name
				? `${props.user.title}. ${props.user.first_name} ${props.user.last_name}`
				: "";
		school = props.user.school || "";
		email = props.user.email || "";
	}
	let extraMessage;
	if (props && props.as_administrator) {
		extraMessage = `I'm unable to resend an activation email.`;
	} else {
		extraMessage = `I have an email activation problem.`;
	}
	return getMailto({
		email: EMAIL,
		subject: `Email activation`,
		body: `
Name: ${name}
Institution: ${school}
Email: ${email}

${extraMessage}
`.trim(),
	});
}

function ResendVerificationEmailFailMessage(props) {
	const mailto = getVerificationFailMailto(props);
	return (
		<span>
			Could not resend email. Please {props.as_administrator ? "" : `contact the Education Platform administrator for your institution or`}{" "}
			<TextLink href={`mailto:${mailto}`} title="Contact us">
				contact us
			</TextLink>
			.
		</span>
	);
}

function ResendSetPasswordEmailFailMessage(props) {
	let name = "";
	let school = "";
	let email = "";
	if (props && props.user) {
		name =
			props.user.title && props.user.first_name && props.user.last_name
				? `${props.user.title}. ${props.user.first_name} ${props.user.last_name}`
				: "";
		school = props.user.school || "";
		email = props.user.email || "";
	}
	let extraMessage;
	if (props && props.as_administrator) {
		extraMessage = `I'm unable to resend a set password email.`;
	} else {
		extraMessage = `I have a problem setting my password.`;
	}
	const mailto = getMailto({
		email: EMAIL,
		subject: `Set password`,
		body: `
Name: ${name}
Institution: ${school}
Email: ${email}

${extraMessage}
`.trim(),
	});
	return (
		<span>
			Could not resend email. Please {props.as_administrator ? "" : `contact the Education Platform administrator for your institution or`}{" "}
			<TextLink href={`mailto:${mailto}`} title="Contact us">
				contact us
			</TextLink>
			.
		</span>
	);
}

export {
	SendEmailLink,
	RegisterMyInterest,
	UnlockAssetProblem,
	UnlockAssetCameraNotDetected,
	ShareWorkResult,
	SendRequestHelpRaw,
	SendRequestHelp,
	SendGeneralEnquiry,
	CopyExtentIncreaseEmail,
	ShareExtractLink,
	ResendVerificationEmailFailMessage,
	ResendSetPasswordEmailFailMessage,
	getVerificationFailMailto,
	getHwbVerificationFailMailto,
	getLegacyActivationFailMailto,
	TitleNotAvailableForNotification,
};
