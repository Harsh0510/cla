import React from "react";

const data = {
	screen: "search",
	popupTitle: "Use the search box to find the books you want",
	popupSubTitle: null,
	flyOut: [
		<>
			<span>Enter your search term here and click the magnifying glass.</span>
			<br />
			<span>The search bar appears on every page!</span>
		</>,
		"Before you can make a copy, you need to unlock the book. To unlock a book, click here.",
		"You can see all your institution's unlocked books here.",
		"Some books might already be unlocked for your institution.",
		"You can filter your search here.",
	],
	buttonText: "Show me",
	flyOutNotification: "You've received a notification! Click on the bell to see your notifications.",
};

export default data;
