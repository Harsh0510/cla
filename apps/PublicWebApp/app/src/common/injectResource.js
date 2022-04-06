const todo = Object.create(null);

const injectResource = (src, injectAtBeginningOfHead, fetchNode, doProcess) =>
	new Promise((resolve) => {
		if (fetchNode(src)) {
			// already appended...
			if (todo[src]) {
				// ... but still not loaded
				todo[src].push(resolve);
			} else {
				// ... and already loaded
				resolve();
			}
			return;
		}
		// not appended yet...
		if (todo[src]) {
			// ... but already loading
			todo[src].push(resolve);
			return;
		}
		// completely new resource
		todo[src] = [resolve];
		const el = doProcess(src, () => {
			if (!todo[src]) {
				return;
			}
			for (const callback of todo[src]) {
				callback();
			}
			todo[src] = null;
		});
		if (injectAtBeginningOfHead) {
			document.head.insertBefore(el, document.head.firstChild);
		} else {
			document.head.appendChild(el);
		}
	});

const removeResource = (src, fetchNode) => {
	delete todo[src];
	const el = fetchNode(src);
	if (el) {
		el.parentNode.removeChild(el);
	}
};

const fetchJs = (src) => document.querySelector("script[type='text/javascript'][src='" + src + "']");
const fetchCss = (src) => document.querySelector("link[rel='stylesheet'][type='text/css'][href='" + src + "']");

export const removeJs = (src) => removeResource(src, fetchJs);

export const removeCss = (src) => removeResource(src, fetchCss);

export const injectJs = (src, injectAtBeginningOfHead) =>
	injectResource(src, injectAtBeginningOfHead, fetchJs, (src, onLoad) => {
		const el = document.createElement("script");
		el.setAttribute("src", src);
		el.setAttribute("type", "text/javascript");
		el.setAttribute("async", "async");
		el.addEventListener("load", onLoad);
		return el;
	});

export const injectCss = (src, injectAtBeginningOfHead) =>
	injectResource(src, injectAtBeginningOfHead, fetchCss, (src, onLoad) => {
		const el = document.createElement("link");
		el.setAttribute("rel", "stylesheet");
		el.setAttribute("type", "text/css");
		el.setAttribute("href", src);
		el.addEventListener("load", onLoad);
		return el;
	});
