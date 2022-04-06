export default function scrollToItem(item) {
	var diff = (item.offsetTop - window.scrollY) / 8;
	var hasReachedBottom = false;

	if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
		hasReachedBottom = true;
	}

	if (Math.abs(diff) > 1 && !hasReachedBottom) {
		window.scrollTo(0, window.scrollY + diff);
		clearTimeout(window._TO);
		window._TO = setTimeout(scrollToItem, 30, item);
	} else {
		window.scrollTo(0, item.offsetTop);
	}
}
