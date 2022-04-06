import customSetTimeout from "./customSetTimeout";
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * Do not debounce async functions (i.e. functions that return a promise)!
 * Use ./debounceAsync.js for that.
 *
 * @param {*} func
 * @param {number} wait Milliseconds
 * @param {boolean} immediate
 */
function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = customSetTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

module.exports = debounce;
