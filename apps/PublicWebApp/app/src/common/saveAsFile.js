export default function (url) {
	let fileName = url.substring(url.lastIndexOf("/") + 1);
	const element = document.createElement("a");
	element.setAttribute("href", url);
	element.setAttribute("download", true);
	element.setAttribute("class", "cla-hidden");
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
