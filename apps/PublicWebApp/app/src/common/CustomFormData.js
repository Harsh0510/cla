/**
 * Creat mock function for pass form data for unit test
 * @param {*} htmlFormElement
 */
export default function (htmlFormElement) {
	return new FormData(htmlFormElement);
}
