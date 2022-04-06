module.exports = function (maybeName) {
	if (typeof maybeName !== "string") {
		return false;
	}
	return maybeName.match(/^[^\s\r\t\n\]\[:_+=¬¦`(!"#£$%^&*@~{}<>?():]{1,100}$/);
};
