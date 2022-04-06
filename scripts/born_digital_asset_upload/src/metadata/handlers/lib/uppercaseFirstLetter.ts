export default (str?: string | null) => {
	if (!str) {
		return str;
	}
	if (typeof str !== "string") {
		return str;
	}
	return (str[0] as string).toUpperCase() + str.slice(1);
};
