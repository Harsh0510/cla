import React from "react";
import { BrowserRouter as Router, Route, withRouter, Switch, Redirect } from "react-router-dom";
import AuthProvider from "./common/AuthProvider";
import ApiProvider from "./common/ApiProvider";
import EventEmitterProvider from "./common/EventEmitter/EventEmitterProvider";
import { FlyoutManagerProvider } from "./common/FlyoutManager";
import WhiteOutProvider from "./common/WhiteOutProvider";
import theme from "./common/theme";

import { createGlobalStyle } from "styled-components";

function PageLoader() {
	return <Loader full={true} />;
}

// Pages
const HomePage = React.lazy(() => import(/* webpackChunkName: "Page__HomePage" */ "./pages/HomePage"));
const AboutPage = React.lazy(() => import(/* webpackChunkName: "Page__AboutPage" */ "./widgets/AboutRoute"));
const SearchPage = React.lazy(() => import(/* webpackChunkName: "Page__SearchPage" */ "./pages/SearchPage"));
const TitleDetailsPage = React.lazy(() => import(/* webpackChunkName: "Page__TitleDetailsPage" */ "./pages/TitleDetailsPage"));
const ExtractByPage = React.lazy(() => import(/* webpackChunkName: "Page__ExtractByPage" */ "./pages/ExtractByPage"));
const ExtractView = React.lazy(() => import(/* webpackChunkName: "Page__ExtractView" */ "./pages/ExtractView"));
const UnlockWorkPage = React.lazy(() => import(/* webpackChunkName: "Page__UnlockWorkPage" */ "./pages/UnlockWorkPage"));
const AdminPage = React.lazy(() => import(/* webpackChunkName: "Page__AdminPage" */ "./pages/AdminPage"));
const ProfilePage = React.lazy(() => import(/* webpackChunkName: "Page__ProfilePage" */ "./pages/ProfilePage"));
const UsageFormPage = React.lazy(() => import(/* webpackChunkName: "Page__UsageFormPage" */ "./pages/UsageFormPage"));
const MyCopiesPage = React.lazy(() => import(/* webpackChunkName: "Page__MyCopiesPage" */ "./pages/MyCopiesPage"));
const SignInPage = React.lazy(() => import(/* webpackChunkName: "Page__SignInPage" */ "./pages/SignInPage"));
const CopyManagementPage = React.lazy(() => import(/* webpackChunkName: "Page__CopyManagementPage" */ "./pages/CopyManagementPage"));
const NotFoundPage = React.lazy(() => import(/* webpackChunkName: "Page__NotFoundPage" */ "./pages/NotFoundPage"));
const TermsPage = React.lazy(() => import(/* webpackChunkName: "Page__TermsPage" */ "./pages/TermsPage"));
const UserPage = React.lazy(() => import(/* webpackChunkName: "Page__UserPage" */ "./pages/UserPage"));
const ForgotPasswordPage = React.lazy(() => import(/* webpackChunkName: "Page__ForgotPasswordPage" */ "./pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import(/* webpackChunkName: "Page__ResetPasswordPage" */ "./pages/ResetPasswordPage"));
const ConfirmEmailPage = React.lazy(() => import(/* webpackChunkName: "Page__ConfirmEmailPage" */ "./pages/ConfirmEmailPage"));
const ActivatePasswordPage = React.lazy(() => import(/* webpackChunkName: "Page__ActivatePasswordPage" */ "./pages/ActivatePasswordPage"));
const SchoolPage = React.lazy(() => import(/* webpackChunkName: "Page__SchoolPage" */ "./pages/SchoolPage"));
const RegisterPage = React.lazy(() => import(/* webpackChunkName: "Page__RegisterPage" */ "./pages/RegisterPage"));
const ClassesPage = React.lazy(() => import(/* webpackChunkName: "Page__ClassesPage" */ "./pages/ClassesPage"));
const VerifyPage = React.lazy(() => import(/* webpackChunkName: "Page__VerifyPage" */ "./pages/VerifyPage"));
const ApprovedVerifyPage = React.lazy(() => import(/* webpackChunkName: "Page__VerifyPage" */ "./pages/ApprovedVerifyPage"));

const DisableSecurityEmailsPage = React.lazy(() =>
	import(/* webpackChunkName: "Page__DisableSecurityEmailsPage" */ "./pages/DisableSecurityEmailsPage")
);
const RegistrationQueuePage = React.lazy(() => import(/* webpackChunkName: "Page__RegistrationQueuePage" */ "./pages/RegistrationQueuePage"));
const SchoolsPage = React.lazy(() => import(/* webpackChunkName: "Page__SchoolsPage" */ "./pages/SchoolsPage"));
const ApprovedDomains = React.lazy(() => import(/* webpackChunkName: "Page__ApprovedDomains" */ "./pages/ApprovedDomains"));
const TrustedDomains = React.lazy(() => import(/* webpackChunkName: "Page__TrustedDomains" */ "./pages/TrustedDomains"));
const UnlockContent = React.lazy(() => import(/* webpackChunkName: "Page__UnlockContent" */ "./pages/UnlockContent"));
const PublishersPage = React.lazy(() => import(/* webpackChunkName: "Page__PublishersPage" */ "./pages/PublishersPage"));
const MyDetailsPage = React.lazy(() => import(/* webpackChunkName: "Page__MyDetailsPage" */ "./pages/MyDetailsPage"));
const FaqPage = React.lazy(() => import(/* webpackChunkName: "Page__FaqPage" */ "./pages/FaqPage"));
const PartnersPage = React.lazy(() => import(/* webpackChunkName: "Page__PartnersPage" */ "./pages/PartnersPage"));
const AdminAssetCrudPage = React.lazy(() => import(/* webpackChunkName: "Page__AdminAssetCrudPage" */ "./pages/AdminAssetCrudPage"));
const AdminAssetGroupCrudPage = React.lazy(() => import(/* webpackChunkName: "Page__AdminAssetGroupCrudPage" */ "./pages/AdminAssetGroupCrudPage"));
const AdminImprintCrudPage = React.lazy(() => import(/* webpackChunkName: "Page__AdminImprintCrudPage" */ "./pages/AdminImprintCrudPage"));
const AdminAssetFavoritePage = React.lazy(() => import(/* webpackChunkName: "Page__AdminAssetFavoritePage" */ "./pages/AdminAssetFavoritePage"));
const RegisterHelpPage = React.lazy(() => import(/* webpackChunkName: "Page__RegisterHelpPage" */ "./pages/RegisterHelpPage"));
const SupportPage = React.lazy(() => import(/* webpackChunkName: "Page__SupportPage" */ "./pages/SupportPage"));
const CopyPage = React.lazy(() => import(/* webpackChunkName: "Page__CopyPage" */ "./pages/CopyPage"));
const CookiePolicy = React.lazy(() => import(/* webpackChunkName: "Page__CookiePolicy" */ "./pages/CookiePolicy"));
const TermsUsePage = React.lazy(() => import(/* webpackChunkName: "Page__TermsUsePage" */ "./pages/TermsUsePage"));
const QuickGuidePage = React.lazy(() => import(/* webpackChunkName: "Page__QuickGuidePage" */ "./pages/QuickGuidePage"));
const UserCreateBulkPage = React.lazy(() => import(/* webpackChunkName: "Page__UserCreateBulkPage" */ "./pages/UserCreateBulkPage"));
const ClassCreateBulkPage = React.lazy(() => import(/* webpackChunkName: "Page__ClassCreateBulkPage" */ "./pages/ClassCreateBulkPage"));
const AllNotification = React.lazy(() => import(/* webpackChunkName: "Page__AllNotifications" */ "./pages/AllNotifications"));
const UnlockViaImageUpload = React.lazy(() => import(/* webpackChunkName: "Page__UnlockImageUpload" */ "./pages/UnlockImageUpload"));
const NewsFeed = React.lazy(() => import(/* webpackChunkName: "Page__NewsFeed" */ "./pages/NewsFeed.js"));
const CarouselPage = React.lazy(() => import(/* webpackChunkName: "Page__CarouselPage" */ "./pages/CarouselPage"));
const ProcessingLogPage = React.lazy(() => import(/* webpackChunkName: "Page__ProcessingLogPage" */ "./pages/ProcessingLogPage"));
const RolloverJobPage = React.lazy(() => import(/* webpackChunkName: "Page__RolloverJobPage" */ "./pages/RolloverJobPage"));
const MergeConfirmationPage = React.lazy(() => import(/* webpackChunkName: "Page__MergeConfirmationPage" */ "./pages/MergeConfirmationPage"));
const MergeVerifyPage = React.lazy(() => import(/* webpackChunkName: "Page__MergeVerifyPage" */ "./pages/MergeVerifyPage"));
const AboutFurtherEducationPage = React.lazy(() =>
	import(/* webpackChunkName: "Page__AboutFurtherEducationPage" */ "./pages/AboutFurtherEducationPage")
);
const AboutSchoolPage = React.lazy(() => import(/* webpackChunkName: "Page__AboutSchoolPage" */ "./pages/AboutSchoolPage"));
const ReportingPage = React.lazy(() => import(/* webpackChunkName: "Page__ReportingPage" */ "./pages/ReportingPage"));
const AssetUploadPage = React.lazy(() => import(/* webpackChunkName: "Page__AssetUploadPage" */ "./pages/AssetUploadPage"));
const WelcomePage = React.lazy(() => import(/* webpackChunkName: "Page__WelcomePage" */ "./pages/WelcomePage"));
const MyUploadsPage = React.lazy(() => import(/* webpackChunkName: "Page__MyUploadsPage" */ "./pages/MyUploadsPage"));
const UserUploadedExtractPage = React.lazy(() => import(/* webpackChunkName: "Page__UserUploadedExtractPage" */ "./pages/UserUploadedExtractPage"));

const CopyAccessDeniedModal = React.lazy(() => import("./widgets/CopyAccessDeniedModal"));
const Student = React.lazy(() => import("./pages/StudentPage/Student"));

// Widgets
import BackgroundWorms from "./widgets/BackgroundWorms";
import Footer from "./widgets/Footer";
import AppInner from "./AppInner";
import Loader from "./widgets/Loader";
import CookieBar from "./widgets/CookieBar";

const GlobalStyles = createGlobalStyle`

	input, textarea, select, option {
		color: ${theme.colours.primary};
		border-color: ${theme.colours.primary};
		&:disabled {
			pointer-events: none;
			opacity: 0.3;
		}
		&::placeholder {
			color: ${theme.colours.primary};
		}
		&::-ms-input-placeholder {
			color: ${theme.colours.primary};
		}
	}
`;

const GoogleAnalytics = withRouter(
	class extends React.Component {
		componentDidUpdate(prevProps) {
			if (this.props.location.pathname === prevProps.location.pathname && this.props.location.search === prevProps.location.search) {
				return;
			}
			if (this.props.history.action === "PUSH") {
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					event: "vpv",
					virtualPath: this.props.location.pathname + this.props.location.search,
				});
			}
		}

		render() {
			return null;
		}
	}
);

export default class App extends React.PureComponent {
	render() {
		return (
			<>
				<GlobalStyles />
				<React.Suspense fallback={<PageLoader />}>
					<AuthProvider>
						<ApiProvider>
							<EventEmitterProvider>
								<WhiteOutProvider>
									<FlyoutManagerProvider>
										<Router>
											<AppInner>
												<GoogleAnalytics />
												<BackgroundWorms />
												<Switch>
													<Route path="/" exact={true} component={HomePage} />
													<Route path="/welcome" exact={true} component={WelcomePage} />
													<Route path="/about" exact={true} component={AboutPage} />
													<Route path="/sign-in" exact={true} component={SignInPage} />
													<Route path="/works" exact={true} component={SearchPage} />
													<Route path="/works/:isbn/extract/form" component={UsageFormPage} />
													<Route path="/works/:isbn/extract" component={ExtractByPage} />
													<Route path="/works/:isbn" component={TitleDetailsPage} />
													<Route path="/extract/:extractOid/:shareOid" component={ExtractView} />
													<Route path="/unlock" exact={true} component={UnlockWorkPage} />
													<Route path="/profile" exact={true} component={ProfilePage} />
													<Route path="/profile/my-details" exact={true} component={MyDetailsPage} />
													<Route path="/profile/admin" exact={true} component={AdminPage} />
													<Route path="/profile/my-copies" exact={true} component={MyCopiesPage} />
													<Route path="/profile/management/:copyOid/" component={CopyManagementPage} />
													<Route path="/terms" exact={true} component={TermsPage} />
													<Route path="/profile/admin/users" component={UserPage} />
													<Route path="/auth/forgot-password" exact={true} component={ForgotPasswordPage} />
													<Route path="/auth/reset-password/:token" exact={true} component={ResetPasswordPage} />
													<Route path="/auth/set-password/:token" exact={true} component={ResetPasswordPage} />
													<Route path="/auth/confirm-email/:token" exact={true} component={ConfirmEmailPage} />
													<Route path="/auth/activate/:token" exact={true} component={ActivatePasswordPage} />
													<Route path="/auth/verify/:token" exact={true} component={VerifyPage} />
													<Route path="/auth/approved-verify/:token" exact={true} component={ApprovedVerifyPage} />
													<Route path="/auth/disable-security-emails/:hashed" exact={true} component={DisableSecurityEmailsPage} />
													<Route path="/auth/merge-confirmation" exact={true} component={MergeConfirmationPage} />
													<Route path="/auth/merge-verify/:token" exact={true} component={MergeVerifyPage} />
													<Route path="/profile/admin/institution" exact={true} component={SchoolPage} />
													<Route path="/register" exact={true} component={RegisterPage} />
													<Route path="/profile/admin/classes" exact={true} component={ClassesPage} />
													<Route path="/profile/admin/registration-queue" exact={true} component={RegistrationQueuePage} />
													<Route path="/profile/admin/institutions" exact={true} component={SchoolsPage} />
													<Route path="/profile/admin/imprints" exact={true} component={AdminImprintCrudPage} />
													<Route path="/profile/admin/favourites" exact={true} component={AdminAssetFavoritePage} />
													<Route path="/profile/admin/assets" exact={true} component={AdminAssetCrudPage} />
													<Route path="/profile/admin/asset-groups" exact={true} component={AdminAssetGroupCrudPage} />
													<Route path="/profile/admin/approved-domains" exact={true} component={ApprovedDomains} />
													<Route path="/profile/admin/trusted-domains" exact={true} component={TrustedDomains} />
													<Route path="/profile/admin/unlock-content" exact={true} component={UnlockContent} />
													<Route path="/profile/admin/publishers" exact={true} component={PublishersPage} />
													<Route path="/faq" exact={true} component={FaqPage} />
													<Route path="/partners" exact={true} component={PartnersPage} />
													<Route path="/how-to-register" exact={true} component={RegisterHelpPage} />
													<Route path="/support" exact={true} component={SupportPage} />
													<Route path="/how-to-copy" exact={true} component={CopyPage} />
													<Route path="/cookie-policy" exact={true} component={CookiePolicy} />
													<Route path="/terms-of-use" exact={true} component={TermsUsePage} />
													<Route path="/our-quick-guide-to-terms-of-use" exact={true} component={QuickGuidePage} />
													<Route path="/profile/admin/user-create-bulk" exact={true} component={UserCreateBulkPage} />
													<Route path="/profile/admin/class-create-bulk" exact={true} component={ClassCreateBulkPage} />
													<Route path="/see-all-notifications" exact={true} component={AllNotification} />
													<Route path="/profile/admin/unlock-via-image-upload" exact={true} component={UnlockViaImageUpload} />
													<Route path="/profile/admin/news-feed" exact={true} component={NewsFeed} />
													<Route path="/profile/admin/carousel-admin" exact={true} component={CarouselPage} />
													<Route path="/profile/admin/processing-log-admin" exact={true} component={ProcessingLogPage} />
													<Route path="/profile/admin/rollover-management" exact={true} component={RolloverJobPage} />
													<Route path="/profile/admin/reporting" exact={true} component={ReportingPage} />
													<Route path="/about-for-fe" exact={true} component={AboutFurtherEducationPage} />
													<Route path="/about-for-school" exact={true} component={AboutSchoolPage} />
													<Route path="/asset-upload" component={AssetUploadPage} />
													<Route path="/profile/admin/my-uploads" exact={true} component={MyUploadsPage} />
													<Route path="/profile/admin/user-uploaded-extracts" component={UserUploadedExtractPage} />
													<Route path="/profile/admin/student" component={Student} />
													<Route component={NotFoundPage} />
												</Switch>
												<CookieBar />
											</AppInner>
											<CopyAccessDeniedModal />
										</Router>
										<Footer />
									</FlyoutManagerProvider>
								</WhiteOutProvider>
							</EventEmitterProvider>
						</ApiProvider>
					</AuthProvider>
				</React.Suspense>
			</>
		);
	}
}
