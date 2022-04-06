import React from "react";
import Quagga from "quagga";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import googleEvent from "../../common/googleEvent";
import Presentation from "./Presentation";
import eanIsValid from "../../common/eanIsValid";
import CustomQuerySelector from "../../common/CustomQuerySelector";
import CustomCreateElement from "../../common/CustomCreateElement";
import CustomNavigator from "../../common/CustomNavigator";
import CustomNavigatorMediaDevices from "../../common/CustomNavigatorMediaDevices";
import { RegisterMyInterest, UnlockAssetProblem, UnlockAssetCameraNotDetected } from "../../widgets/SendEmailLink";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import customSetTimeout from "../../common/customSetTimeout";
import detectCamAvailaibility from "../../common/detectCamAvailability";
import theme from "../../common/theme";
import flyOutGuide from "./flyOutGuide";
import FlyOutHandler from "../../common/FlyOutHandler";
import IntentToCopyForm from "../../widgets/IntentToCopyForm";
import staticValues from "../../common/staticValues";
import extractIsbn from "../../common/extractIsbn";
import queryString from "query-string";
import { Redirect } from "react-router-dom";
import ContentRequestModal from "../../widgets/ContentRequestModal";

const SCREEN = flyOutGuide.screen;
const FLYOUT_DEFAULT_INDEX = -1; // user not seen any flyout for this screen
const FLYOUT_INDEX_SCAN_BARCODE = 0; // flyout option 1
const VIDEO_IDEAL_WIDTH = 1024;
const VIDEO_IDEAL_HEIGHT = 1024;
const MESSAGE_INVALID_ISBN = "ISBN is not valid";

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_UNLOCK = homeScreenBox.unlock;
// This is for testing so we don't have to call Quagga every time,
// comment out "import Quagga from 'quagga';" in order for it to work
// - delete once it's done
/*
const Quagga = {
	init(obj, cb) {
		setTimeout(() => {
			cb(null);
		}, 200);
	},
	start() {
		setTimeout(() => {
			this.onProcessedCb(null);
			setTimeout(() => {
				this.onDetectedCb({
					codeResult: {
						code: "9780545010221",
					},
				});
			}, 2000);
		}, 500);
	},
	stop() {},
	onProcessed(cb) {
		this.onProcessedCb = cb;
	},
	onDetected(cb) {
		this.onDetectedCb = cb;
	},
	offDetected() {},
	canvas: {
		dom: {
			image: true,
		},
	},
};
*/
const iconColors = {
	lightRed: theme.colours.lightRed,
	messageSuccess: theme.colours.lightGreen,
	white: theme.colours.white,
	messageError: theme.colours.bgDarkPurple,
	black: theme.colours.black,
};

const iconClasses = {
	check: "fa fa-check",
	wrong: "fa fa-times",
	alreadyCheck: "fa fa-check-square-o",
	camera: "fa fa-camera",
	exclamation: "fa fa-exclamation-circle",
	barCode: "fa fa-barcode",
	exclamationTriangle: "fa fa-exclamation-triangle",
};

// Is this an old Edge browser (before the switch to Chromium)?
const isOldEdge = !!navigator.userAgent.match(/\bEdge\b/);

const ISBN_VALIDATION_MSG_COMMON = "Please make sure that there are 13 digits and that you have removed any gaps.";

const InvalidIsbnMessage = () => (
	<span>
		The ISBN has not been recognised.
		<br />
		{ISBN_VALIDATION_MSG_COMMON}
	</span>
);

export default withAuthRequiredConsumer(
	withApiConsumer(
		class UnlockWorkPage extends React.PureComponent {
			state = {
				resultCode: "",
				message: "",
				loading: false,
				response: null,
				unlocked: false,
				redirect: false,
				failedCount: 0,
				showStartButton: true,
				show: true,
				waiting: false,
				notFound: false,
				unlockedTitle: null,
				isCodeDetected: false,
				doDisplayTakePictureOptions: false,
				doDisplayTakePictureButton: false,
				previewImageDataUrl: null,
				showUnlockMore: false,
				iconClass: iconClasses.camera,
				iconColor: iconColors.white,
				isScanning: true,
				didCaputre: false,
				isSending: false,
				isAllowToUseCamera: false,
				screenFlyOutIndex: null,
				isUpdateHome: false,
				notificationCount: 0,
				unlock_attempt_oid: null,
				errorIntentCopyForm: null,
				isTemp: false,
				unlockStatus: null,
				isbnValidationMsg: null,
				tempUnlockAssetTitles: [],
				isShowContentRequestModal: false,
				searchedIsbn: "",
			};

			constructor(props) {
				super(props);
				this._flyOutHandler = new FlyOutHandler(this, this.props.api, SCREEN);
				this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
				this.barCodeCameraRef = React.createRef(null);
				this.notificationRef = React.createRef(null);
				this.findBookInputRef = React.createRef(null);
				this._flyOutHandlerOnCloseBound = this._flyOutHandler.onClose.bind(this._flyOutHandler);
				this._flyOutNotificationOnCloseBound = this._flyOutHandlerNotification.onCloseNotification.bind(this._flyOutHandlerNotification);
			}

			previewImageRef = React.createRef(null);

			componentDidMount() {
				this._isMounted = true;
				this.getTempUnlockedAssetTitles();
				/* -- Check if User has selected for Flyout --- */
				const userDetail = this.props.withAuthConsumer_myUserDetails;
				this._flyOutHandler.getSeenFlyOutIndex(FLYOUT_SCREEN_UNLOCK);
				if (userDetail && userDetail.flyout_enabled) {
					this._flyOutHandler.getSeen();
					this._flyOutHandlerNotification.getSeenNotification();
					this._flyOutHandler.getSeenFlyOutIndex(FLYOUT_SCREEN_UNLOCK);
				}

				const parsed = queryString.parse(this.props.location.search);
				const isbn = parsed.isbn ? parsed.isbn : null;
				if (parsed.isbn) {
					this.findBookOnClick(isbn);
				}
			}

			// Update the HomeScreen Index
			updateHomeScreenIndex() {
				if (this.state.screenFlyOutIndex === FLYOUT_DEFAULT_INDEX) {
					this.props.api("/public/first-time-user-experience-update", {
						screen: FLYOUT_SCREEN_UNLOCK,
						index: 0,
					});
				}
			}

			componentDidUpdate(prevProps, prevState) {
				if (prevState.waiting !== this.state.waiting && !this.state.waiting && this.state.isAllowToUseCamera) {
					this.onBarCodeDetectionFail();
				}
				if (prevProps.location !== this.props.location) {
					this.resetUnlockPage();
				}
				const userDetail = this.props.withAuthConsumer_myUserDetails;
				if (userDetail && userDetail.flyout_enabled && this.state.screenFlyOutIndex != prevState.screenFlyOutIndex) {
					this.updateHomeScreenIndex();
				}
			}
			getTempUnlockedAssetTitles = () => {
				if (this.props.withAuthConsumer_myUserDetails) {
					this.props.api("/public/get-temp-unlocked-assets").then((result) => {
						if (this._isMounted && result) {
							this.setState({
								tempUnlockAssetTitles: result.result,
							});
						}
					});
				}
			};
			unlockWork = (params) => {
				const isbn13 = params.isbn13;
				params.is_temp = this.state.isTemp;
				this.setState(
					{
						loading: true,
					},
					() => {
						if (!this._isMounted) {
							return;
						}
						this.props
							.api("/public/unlock", params)
							.then((result) => {
								if (!this._isMounted) {
									return;
								}
								let show = false;
								let notFound = false;
								let iconColor = iconColors.messageError;
								let iconClass = iconClasses.exclamation;
								let showUnlockMore = false;
								let unlockedTitle = result.result;
								let unlock_attempt_oid = result.unlock_attempt_oid;
								let resultCode = isbn13;
								let unlockStatus = result.status;
								let unlocked = false;
								let response = null;
								let searchedIsbn = isbn13;
								if (
									result.status === staticValues.unlockAttemptStatus.doesNotExist ||
									result.status === staticValues.unlockAttemptStatus.publisherRestricted
								) {
									notFound = true;
									googleEvent("unlockScan", "unlock a book", "scan", "unsuccessful");
									googleEvent("unlockScan", "unlock a book", "error", "ISBN does not exist");
								} else {
									if (result.status === staticValues.unlockAttemptStatus.alreadyUnlocked && result.result.message === "Asset already unlocked") {
										googleEvent("unlockScan", "unlock a book", "scan", "unsuccessful");
										googleEvent("unlockScan", "unlock a book", "error", "Asset already unlocked");
										iconColor = iconColors.messageSuccess;
										unlocked = true;
									} else if (result.status === staticValues.unlockAttemptStatus.successfullyUnlocked) {
										googleEvent("unlockScan", "unlock a book", "scan", "successful");
										iconColor = iconColors.messageSuccess;
										unlocked = true;
									}
									show = true;
									iconClass = iconClasses.check;
									response = result.result.message;
									resultCode = result.result.isbn;
									searchedIsbn = result.result.isbn;
								}
								if (
									result.status === staticValues.unlockAttemptStatus.tempUnlocked ||
									result.status === staticValues.unlockAttemptStatus.successfullyUnlocked
								) {
									this.getTempUnlockedAssetTitles();
								}
								this.setState({
									show: show,
									notFound: notFound,
									showUnlockMore: showUnlockMore,
									unlocked: unlocked,
									unlockedTitle: unlockedTitle,
									response: response,
									message: null,
									iconClass: iconClass,
									iconColor: iconColor,
									unlock_attempt_oid: unlock_attempt_oid,
									unlockStatus: unlockStatus,
									resultCode: resultCode,
									searchedIsbn: searchedIsbn,
								});
								this.destroyAll();
							})
							.catch((result) => {
								if (!this._isMounted) {
									return;
								}
								let message = null;
								let isbnValidationMsg = null;
								let showUnlockMore = false;
								const parsed = queryString.parse(this.props.location.search);
								if (this.state.isTemp && result === MESSAGE_INVALID_ISBN) {
									message = result;
									isbnValidationMsg = <InvalidIsbnMessage />;
								} else {
									showUnlockMore = true;
									message = (
										<div>
											Perhaps we can still help you?
											<br />
											Please contact <UnlockAssetProblem linkTitle="our support team" myUserDetails={this.props.withAuthConsumer_myUserDetails} /> for
											help.
										</div>
									);
								}
								if (parsed.isbn && message === MESSAGE_INVALID_ISBN) {
									this.doNothingWhenInvalidIsbn();
								} else {
									this.setState({
										show: true,
										response: result,
										message: message,
										showUnlockMore: showUnlockMore,
										iconClass: iconClasses.wrong,
										iconColor: iconColors.lightRed,
										isbnValidationMsg: isbnValidationMsg,
									});
									this.destroyAll();
								}
							})
							.finally(() => {
								if (!this._isMounted) {
									return;
								}
								this.setState({
									loading: false,
								});
							});
					}
				);
			};

			setBarCodeDetectionInterval = () => {
				if (this._detectionInterval) {
					clearInterval(this._detectionInterval);
				}
				if (this.state.isScanning) {
					this._detectionInterval = setInterval((_) => {
						if (this.state.failedCount < 3) {
							this.setState({
								message: (
									<div>
										Your device was unable to detect a barcode. Please hold the book steady in the frame and ensure the barcode has not been obscured.
										For more assistance, please contact: <RegisterMyInterest myUserDetails={this.props.withAuthConsumer_myUserDetails} />
									</div>
								),
								failedCount: this.state.failedCount + 1,
								showUnlockMore: true,
								iconClass: iconClasses.wrong,
								iconColor: iconColors.lightRed,
							});
						} else {
							this.setState({
								show: true,
								waiting: false,
								message: (
									<div>
										<strong>WARNING!</strong>
										<br />
										Your current browser does not support this feature. Please use an alternative browser, such as Chrome or Firefox.
									</div>
								),
								showUnlockMore: true,
								iconClass: iconClasses.wrong,
								iconColor: iconColors.lightRed,
							});
							clearInterval(this._detectionInterval);
						}
					}, this.props.timeout_interval || 20000);
				}
			};

			unlockMore = (type) => {
				this.destroyAll();
				this.setState(
					{
						resultCode: "",
						message: "",
						response: null,
						unlocked: false,
						showUnlockMore: false,
						show: false,
						waiting: false,
						notFound: false,
						unlockedTitle: null,
						showUnlockMore: false,
						iconClass: iconClasses.camera,
						iconColor: iconColors.messageError,
						doDisplayTakePictureOptions: false,
						doDisplayTakePictureButton: false,
						isScanning: true,
						didCaputre: false,
						isAllowToUseCamera: true,
						isCodeDetected: false,
						searchedIsbn: "",
					},
					() => {
						this.onChangeStartButton();
						this.setBarCodeDetectionInterval();
						this.onBarCodeDetectionFail();
					}
				);

				if (type !== "unlock-more") {
					googleEvent("unlockScan", "unlock a book", "error", type);
				}
			};

			setNotificationCount = (count) => {
				this.setState({
					notificationCount: count,
				});
			};

			onChangeStartButton = () => {
				if (this.state.flyOutIndex === FLYOUT_INDEX_SCAN_BARCODE) {
					this._flyOutHandler.onClose();
				}
				this.destroyQuagga();
				Quagga.init(
					{
						inputStream: {
							type: "LiveStream",
							constraints: {
								width: 640,
								height: 480,
								facingMode: "environment",
							},
							target: CustomQuerySelector(".quagga-target"),
						},
						locator: {
							patchSize: "medium",
							halfSample: false,
						},
						numOfWorkers: 3,
						frequency: 20,
						decoder: {
							readers: [
								{
									format: "ean_reader",
									config: {},
								},
							],
						},
						locate: true,
					},
					(err) => {
						if (err) {
							googleEvent("unlockScan", "unlock a book", "scan", "unsuccessful");

							let chkNavigator = CustomNavigator();
							if (chkNavigator) {
								this.setState({
									show: true,
									waiting: false,
									message: (
										<div>
											{" "}
											The Education Platform was not able to detect a camera. Please ensure that it is correctly plugged in or enabled in your
											computer settings. For more assistance, please{" "}
											<UnlockAssetCameraNotDetected myUserDetails={this.props.withAuthConsumer_myUserDetails} />
										</div>
									),
									showUnlockMore: false,
									iconClass: iconClasses.wrong,
									iconColor: iconColors.lightRed,
									isAllowToUseCamera: false,
								});

								googleEvent("unlockScan", "unlock a book", "error", "Not able to detect a camera");
							} else {
								this.setState({
									show: true,
									waiting: false,
									message: (
										<div>
											<strong>WARNING!</strong>
											<br />
											Your current browser does not support this feature. Please use an alternative browser, such as Chrome or Firefox.
										</div>
									),
									showUnlockMore: false,
									iconClass: iconClasses.wrong,
									iconColor: iconColors.lightRed,
									isAllowToUseCamera: false,
								});
								googleEvent("unlockScan", "unlock a book", "error", "Feature not supported");
							}
							return;
						}

						Quagga.start();
						this.setBarCodeDetectionInterval();
					}
				);

				Quagga.onProcessed(this.quaggaOnProcessed);
				Quagga.onDetected(this.quaggaOnDetected);
				this.setState({
					resultCode: "",
					message: "",
					response: null,
					unlocked: false,
					redirect: false,
					showStartButton: false,
					show: false,
					waiting: true,
					notFound: false,
					unlockedTitle: null,
					searchedIsbn: "",
				});
			};

			onBarCodeDetectionFail = () => {
				if (this.state.isScanning) {
					if (this._takePictureTimeout) {
						clearTimeout(this._takePictureTimeout);
					}
					this._takePictureTimeout = customSetTimeout(() => {
						detectCamAvailaibility((res) => {
							if (!this.state.isCodeDetected) {
								this.setState(
									{
										show: true,
										message: `We're having trouble detecting a barcode. Could you take a picture for us?`,
										doDisplayTakePictureOptions: true,
										showUnlockMore: false,
										iconClass: iconClasses.exclamation,
										iconColor: iconColors.messageError,
										isScanning: false,
									},
									() => {
										/* --- Clear barcode Detection Interval  ---*/
										clearInterval(this._detectionInterval);
										this.destroyAll();
									}
								);
								googleEvent("unlockScan", "unlock a book", "scan", "unsuccessful");
								googleEvent("unlockScan", "unlock a book", "error", "Trouble detecting a barcode");
							}
						});
					}, 5000);
				}
			};

			quaggaOnProcessed = (_) => {
				// Once we have the image, hide "Waiting for permission" message
				// This is to detect if the user has accepted the "Use your camera popup from the browser"
				if (Quagga.canvas.dom.image) {
					this.setState({ waiting: false, isAllowToUseCamera: true });
				}
			};

			setStateForRedirection = () => {
				this.destroyAll();
				this.setState({ redirect: true });
			};

			destroyQuagga() {
				try {
					Quagga.offDetected(this.quaggaOnDetected);
					Quagga.offProcessed(this.quaggaOnProcessed);
					Quagga.stop();
				} catch (e) {}
			}

			_maybeDestroyCurrentStream() {
				if (this._stream) {
					if (typeof this._stream.stop === "function") {
						this._stream.stop();
					} else {
						this._stream.getTracks().forEach((trk) => trk.stop());
					}
					delete this._stream;
				}
			}

			destroyAll() {
				clearInterval(this._detectionInterval);
				clearTimeout(this._returnToWorksTimeout);
				if (this._takePictureTimeout) {
					clearTimeout(this._takePictureTimeout);
				}
				this.destroyQuagga();
				this._maybeDestroyCurrentStream();
			}

			componentWillUnmount() {
				this.destroyAll();
				this._flyOutHandler.destroy();
				delete this._flyOutHandler;
				this._flyOutHandlerNotification.destroy();
				delete this._flyOutHandlerNotification;
				delete this._isMounted;
			}

			quaggaOnDetected = (result) => {
				if (this.state.isScanning) {
					const code = result.codeResult.code;
					const params = { isbn13: code };
					if (eanIsValid(code)) {
						// this.setState({ resultCode: code });
						this.setState(
							{
								isCodeDetected: true,
								resultCode: code,
								searchedIsbn: code,
							},
							() => {
								Quagga.stop();
								clearInterval(this._detectionInterval);
								this.unlockWork(params);
							}
						);
					} else {
						clearInterval(this._detectionInterval);
						this.setState(
							{
								isScanning: false,
							},
							() => {
								this.onBarCodeDetectionFail();
							}
						);
					}
				}
			};

			onDenyTakePicture = () => {
				this.destroyAll();
				this.setState({
					doDisplayTakePictureOptions: false,
					message: (
						<div>
							Perhaps we can still help you? Please contact{" "}
							<UnlockAssetCameraNotDetected linkTitle="our support team" myUserDetails={this.props.withAuthConsumer_myUserDetails} /> for help.
						</div>
					),
				});
				googleEvent("unlockScan", "unlock a book", "error", "Take picture - no");
			};

			onAcceptTakePicture = () => {
				this.setState(
					{
						doDisplayTakePictureOptions: false,
						doDisplayTakePictureButton: true,
						message: "Hold the book in front of the camera and click OK when the barcode is steady.",
						iconClass: "",
						iconColors: iconColors.messageError,
						show: false,
					},
					this.onChangeStartButton()
				);
				googleEvent("unlockScan", "unlock a book", "error", "Take picture - yes");
			};

			sendCapturedImageToServer = () => {
				this.setState(
					{
						isSending: true,
					},
					() => {
						const uploadedFile = this.previewImageRef.current;
						const requestOptions = {
							binary: true,
							files: {
								unlock_image: uploadedFile,
							},
						};
						this.props
							.api("/public/unlock-via-image-upload", {}, requestOptions)
							.then((res) => {
								//inactive the camera
								this.destroyAll();
								this.setState({
									previewImageDataUrl: null,
									message: `Thank you! We have sent this to our automatic barcode detector and we will notify you if it can be unlocked.`,
									show: true,
									iconClass: iconClasses.barCode,
									iconColor: iconColors.black,
									doDisplayTakePictureButton: false,
									showUnlockMore: true,
									didCaputre: true,
									isSending: false,
								});
							})
							.catch((err) => {
								this.destroyAll();
								this.setState({
									previewImageDataUrl: null,
									message: "Something went wrong!",
									show: true,
									iconClass: iconClasses.exclamationTriangle,
									iconColor: iconColors.messageError,
									doDisplayTakePictureButton: false,
									showUnlockMore: true,
									didCaputre: false,
									isSending: false,
								});
							});
					}
				);
			};

			captureImage = () => {
				var VideoEle = CustomQuerySelector(".quagga-target video");
				let chkNavigator = CustomNavigatorMediaDevices();
				chkNavigator.mediaDevices
					.getUserMedia({
						video: {
							facingMode: "environment",
							width: {
								ideal: VIDEO_IDEAL_WIDTH,
							},
							height: {
								ideal: VIDEO_IDEAL_HEIGHT,
							},
						},
						audio: false,
					})
					.then((stream) => {
						this._maybeDestroyCurrentStream();
						this._stream = stream;
						VideoEle.srcObject = stream;
						return VideoEle.play();
					})
					.then(() => this.takeASnap(VideoEle));
			};

			takeASnap = (ele) => {
				return new Promise((res) => {
					const go = () => {
						if (!this._isMounted) {
							return;
						}
						const canvas = CustomCreateElement("canvas");
						const ctx = canvas.getContext("2d");
						canvas.width = ele.videoWidth > VIDEO_IDEAL_WIDTH ? VIDEO_IDEAL_WIDTH : ele.videoWidth;
						canvas.height = ele.videoHeight > VIDEO_IDEAL_HEIGHT ? VIDEO_IDEAL_HEIGHT : ele.videoHeight;
						ctx.drawImage(ele, 0, 0);
						this.setState({
							previewImageDataUrl: canvas.toDataURL(),
						});
						canvas.toBlob((blob) => {
							if (!this._isMounted) {
								return;
							}
							this.previewImageRef.current = blob;
							res(this.previewImageRef.current);
						}, "image/jpeg");
					};
					if (isOldEdge) {
						/**
						 * For some reason, old Edge (before the switch to Chromium) only captures a
						 * black image unless there's a timeout. It's not even a case of the video
						 * element not loading - even when ele.readyState == 4 (i.e. the video has
						 * fully loaded), a black image is captured! The only thing that seems to
						 * work is a short timeout.
						 */
						setTimeout(go, 300);
					} else {
						go();
					}
				});
			};

			onDenyPreviewImage = () => {
				this.previewImageRef.current = null;
				this.setState({
					previewImageDataUrl: null,
				});
			};

			onCloseIntentToCopy = () => {
				this.resetUnlockPage();
			};

			findBookOnClick = (isbn = null) => {
				const isbn13 = this.findBookInputRef && this.findBookInputRef.current ? this.findBookInputRef.current.value : isbn;
				const validIsbn = extractIsbn(isbn13);
				if (validIsbn) {
					const params = { isbn13: isbn13 };
					this.setState(
						{
							isTemp: true,
							isbnValidationMsg: null,
						},
						() => {
							this.unlockWork(params);
						}
					);
				} else {
					if (isbn13) {
						this.setState({
							isbnValidationMsg: <InvalidIsbnMessage />,
						});
					} else {
						this.setState({
							isbnValidationMsg: (
								<span>
									No ISBN entered.
									<br />
									{ISBN_VALIDATION_MSG_COMMON}
								</span>
							),
						});
					}
				}
			};

			doNothingWhenInvalidIsbn = () => {
				this.resetUnlockPage();
				this.props.history.push("/unlock");
				return <Redirect to="/unlock" />;
			};

			unlockWithoutPhysicalCopy = () => {
				this.resetUnlockPage();
				if (this.findBookInputRef && this.findBookInputRef.current) {
					this.findBookInputRef.current.value = null;
				}
				this.setState({ isTemp: true });
			};

			backFromTempUnlock = () => {
				this.resetUnlockPage();
			};

			//when user deny the temporary unlock asset confirmed
			onDenyOwnsAssetForTempUnlock = () => {
				const params = {
					isbn13: this.state.resultCode,
					is_temp_confirmed: false,
				};
				this.unlockWork(params);
			};

			//when user confirmed the temporary unlock asset
			onConfirmOwnsAssetForTempUnlock = () => {
				const params = {
					isbn13: this.state.resultCode,
					is_temp_confirmed: true,
				};
				this.unlockWork(params);
			};
			resetUnlockPage = () => {
				this.destroyAll();
				this.setState({
					resultCode: "",
					message: "",
					response: null,
					unlocked: false,
					redirect: false,
					failedCount: 0,
					showStartButton: true,
					show: true,
					waiting: false,
					notFound: false,
					unlockedTitle: null,
					isCodeDetected: false,
					doDisplayTakePictureOptions: false,
					doDisplayTakePictureButton: false,
					previewImageDataUrl: null,
					showUnlockMore: false,
					iconClass: iconClasses.camera,
					iconColor: iconColors.white,
					isScanning: true,
					didCaputre: false,
					isSending: false,
					isAllowToUseCamera: false,
					isUpdateHome: false,
					notificationCount: 0,
					unlock_attempt_oid: null,
					errorIntentCopyForm: null,
					isTemp: false,
					unlockStatus: null,
					isbnValidationMsg: null,
				});
			};

			openContentRequestModal = () => {
				this.setState({ isShowContentRequestModal: true, previewImageDataUrl: false });
			};

			hideContentRequestModal = () => {
				this.setState({ isShowContentRequestModal: false });
			};

			render() {
				return (
					<>
						<HeadTitle title={PageTitle.unlockWork} hideSuffix={true} />
						<Presentation
							loading={this.state.loading ? true : false}
							unlocked={this.state.unlocked}
							message={this.state.message}
							response={this.state.response}
							redirect={this.state.redirect}
							resultCode={this.state.resultCode}
							showStartButton={this.onChangeStartButton}
							show={this.state.show}
							onClick={this.onClick}
							waiting={this.state.waiting}
							school={this.props.withAuthConsumer_myUserDetails.school}
							notFound={this.state.notFound}
							myUserDetails={this.props.withAuthConsumer_myUserDetails}
							doDisplayTakePictureOptions={this.state.doDisplayTakePictureOptions}
							doDisplayTakePictureButton={this.state.doDisplayTakePictureButton}
							onClickCapture={this.captureImage}
							unlockedTitle={this.state.unlockedTitle}
							onAcceptTakePicture={this.onAcceptTakePicture}
							onDenyTakePicture={this.onDenyTakePicture}
							onDenyPreview={this.onDenyPreviewImage}
							onAcceptPreview={this.sendCapturedImageToServer}
							previewImageDataUrl={this.state.previewImageDataUrl}
							showUnlockMore={this.state.showUnlockMore}
							iconClass={this.state.iconClass}
							iconColor={this.state.iconColor}
							unlockMore={this.unlockMore}
							didCaputre={this.state.didCaputre}
							isSending={this.state.isSending}
							setStateForRedirection={this.setStateForRedirection}
							flyOutIndex={this.state.flyOutIndex}
							onCloseModal={this._flyOutHandlerOnCloseBound}
							barCodeCameraRef={this.barCodeCameraRef}
							onClose={this._flyOutNotificationOnCloseBound}
							notificationRef={this.notificationRef}
							notificationCount={this.state.notificationCount}
							setNotificationCount={this.setNotificationCount}
							flyOutIndexNotification={this.state.flyOutIndexNotification}
							findBookOnClick={this.findBookOnClick}
							findBookInputRef={this.findBookInputRef}
							isTemp={this.state.isTemp}
							unlockWithoutPhysicalCopy={this.unlockWithoutPhysicalCopy}
							backFromTempUnlock={this.backFromTempUnlock}
							onDenyOwnsAssetForTempUnlock={this.onDenyOwnsAssetForTempUnlock}
							onConfirmOwnsAssetForTempUnlock={this.onConfirmOwnsAssetForTempUnlock}
							unlockStatus={this.state.unlockStatus}
							isbnValidationMsg={this.state.isbnValidationMsg}
							tempUnlockAssetTitles={this.state.tempUnlockAssetTitles}
							location={this.props.location}
							openContentRequestModal={this.openContentRequestModal}
						/>
						{this.state.notFound && (
							<IntentToCopyForm
								isUnlock={true}
								onCloseIntentToCopy={this.onCloseIntentToCopy}
								unlock_attempt_oid={this.state.unlock_attempt_oid}
								isbn={this.state.resultCode}
								isTemp={this.state.isTemp}
								openContentRequestModal={this.openContentRequestModal}
								history={this.props.history}
							/>
						)}
						{this.state.isShowContentRequestModal && (
							<ContentRequestModal
								defaultValues={{ isbn: this.state.searchedIsbn }}
								api={this.props.api}
								handleClose={this.hideContentRequestModal}
							></ContentRequestModal>
						)}
					</>
				);
			}
		}
	)
);
