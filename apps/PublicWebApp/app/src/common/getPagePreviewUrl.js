// Uncomment the commented-out lines to enable development mode (doesn't communicate with Azure).

/*
const PAGE_COUNT = 100;

const pages = [];
for (let i = 0; i < PAGE_COUNT; ++i) {
	pages.push({
		width: 1200,
		height: Math.random() * 1000 + 1000,
	});
}
*/
export default function (isbn13, pageNumber, sasToken) {
	/*
	const sz = pages[pageNumber % PAGE_COUNT];
	return `https://dummyimage.com/${sz.width}x${sz.height}/ee0000/333.png&text=${pageNumber}`;
	*/
	pageNumber = pageNumber.toString();
	return `${process.env.ASSET_ORIGIN}/pagepreviews/${isbn13}/${pageNumber - 1}.png?${sasToken}`;
}
