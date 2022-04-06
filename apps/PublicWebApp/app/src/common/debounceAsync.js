import customSetTimeout from "./customSetTimeout";

/**
 * Like ./debounce.js, except for debouncing async functions
 * (i.e. functions that return a promise).
 */
const debounceAsync = (func, wait) => {
	let timeout;
	return (...args) => {
		return new Promise((resolve, reject) => {
			clearTimeout(timeout);
			timeout = customSetTimeout(() => {
				func(...args)
					.then(resolve)
					.catch(reject);
			}, wait);
		});
	};
};

export default debounceAsync;
