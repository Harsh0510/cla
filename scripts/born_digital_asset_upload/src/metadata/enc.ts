// Convert string to hex.
export default (str: string) => {
	return Buffer.from(str, "utf8").toString("hex");
};
