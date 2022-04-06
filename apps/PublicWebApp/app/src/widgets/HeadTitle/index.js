import React from "react";
import Helmet from "react-helmet";

const PageTitle = {
	home: "Home",
	about: "Summary information about the Education Platform",
	search: "Search on the Education Platform",
	titleDetails: "Content Detail",
	extractBy: "Create Copy",
	extractMake: "Make copy",
	extractView: "Viewing a Copy",
	unlockWork: "Unlock a book on the Education Platform",
	profile: "Profile",
	usageForm: "Confirm copy details: ",
	signIn: "Sign In",
	notFound: "Not Found",
	terms: "Terms",
	myDetails: "My Details",
	myCopies: "My Copies",
	copyManagement: "Copy Management",
	admin: "Administration",
	courseAdmin: "Courses",
	newCourse: "New Course",
	editCourse: "Edit Course",
	eeleteCourse: "Remove Course",
	faq: "Frequently Asked Questions",
	partners: "Publishers who have provided content on the Education Platform",
	user: "Users",
	forgotPassword: "Forgot Password",
	resetPassword: "Reset Password",
	setPassword: "Set Password",
	confirmEmail: "Confirm Email",
	activatePassword: "Activate Password",
	school: "Institution",
	register: "Register",
	classes: "Classes",
	verify: "Verify",
	schools: "Institutions",
	approvedDomains: "Approved Domains",
	trustedDomains: "Trusted Domains",
	unlockContent: "Unlock Content",
	publishers: "Publishers",
	welcome: "Welcome to the Education Platform",
	whatsNew: "What's New",
	adminAssetCrud: "Asset",
	adminAssetGroupCrud: "Serials",
	adminImprintCrud: "Imprints",
	registerHelp: "How To Register",
	support: "Support",
	copy: "How To Copy",
	disableSecurityEmails: "Disable Security Emails",
	registrationQueue: "Registration Queue",
	cookiepolicy: "Cookie Policy",
	termsofuse: "Terms of Use",
	quickGuide: "Our quick guide to the main points of the Education Platform terms of use",
	createBulkUsers: "Create Bulk Users",
	showAllNotification: "Notifications",
	unlockFromImage: "Awaiting Unlocks",
	newsFeeds: "News Feed",
	approvedVerifyPage: "Get started – Education Platform",
	adminFavoritePage: "My Favourites",
	carouselAdmin: "Carousel Admin",
	processingLogAdmin: "Processing Log Admin",
	rolloverJob: "Rollover Management",
	reporting: "Reporting",
	extractUpload: "Upload your own content",
	beforeWeStart: "Before we start",
	extractSearch: "Extract search",
	myUploads: "My Uploads",
	userUploadedExtract: "User Uploaded Extracts",
};

const HeadTitle = (props) => {
	let suffix = "";
	if (props.suffix) {
		suffix = props.suffix;
	}
	if (!props.hideSuffix) {
		suffix = " - Education Platform " + suffix;
	}
	let pageTitle = props.title ? props.title + suffix : "Education Platform " + suffix;
	return (
		<Helmet>
			<title>{pageTitle}</title>
		</Helmet>
	);
};

export { HeadTitle, PageTitle };
