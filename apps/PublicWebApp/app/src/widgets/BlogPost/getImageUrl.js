export default function (imagePath) {
	let path = null;
	if (imagePath) {
		if (process.env.EP_BLOG_URL) {
			path = process.env.EP_BLOG_URL + imagePath;
		}
		return path;
	} else {
		return null;
	}
}
