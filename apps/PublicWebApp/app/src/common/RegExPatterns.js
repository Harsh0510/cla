const RegExPatterns = {
	name: /^[^\r\t\n\]\[¬|\<>?:@~{}_+!£$%^&/*,./;#\[\]|]{1,255}$/,
	common: /^[^\r\t\n\]\[¬|<>?:@~{}_+!£$%^&*;#\[\]|]{1,255}$/,
	copyTitle: /^[^\r\t\n\]\[¬|<>?:@~{}_+!£$%^*;#\[\]|]{1,255}$/, // allow ampersands
	alphaNumeric: /^[a-zA-Z0-9 ]*$/,
	floatNumeric: /(^-?\d\d*\.\d\d*$)|(^-?\.\d\d*$)|(^-?\d*$)/,
};

export default RegExPatterns;
