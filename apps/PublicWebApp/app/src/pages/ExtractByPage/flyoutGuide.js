const data = {
	screen: "extract",
	popupTitle: "This is where you can make your copy",
	popupSubTitle: "Now you can select the pages you want to copy.",
	ePubPopupTitle: "This title is derived from an ebook.",
	ePubPopupSubTitle: "This means that there are important differences to be aware of when making your copy.",
	flyout: [
		"Click on the arrows to navigate to the page that you want.",
		"Click on the circle to select the page you want to copy.",
		"This is where you can see how many pages you have left to copy.",
		"Click Next when you have chosen your pages. Remember that once you've clicked next, your page selection can't be changed.",
		"", //For leave blank due to not change next flyouts index beacuse it's displaying the flyout modal for epub which values come from ePubPopupTitle and ePubPopupSubTitle.
		"Every title with this icon is an ebook.",
		"When copying an ebook title, please select your pages carefully as the page numbers may be different from the ones in your book.",
	],
	buttonText: "Start",
	flyOutNotification: "You've received a notification! Click on the bell to see your notifications.",
};

export default data;
