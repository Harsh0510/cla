const imgIsReady = (imgEl) => {
	if (imgEl && imgEl.tagName === "CANVAS") {
		return imgEl;
	} else {
		return imgEl && imgEl.complete && imgEl.naturalHeight;
	}
};
export default imgIsReady;
