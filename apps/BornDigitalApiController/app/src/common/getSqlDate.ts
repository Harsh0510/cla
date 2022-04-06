export default (dt: Date) => {
	const y = dt.getFullYear().toString();
	const m = (dt.getMonth() + 1).toString().padStart(2, "0");
	const d = dt.getDate().toString().padStart(2, "0");
	const h = dt.getHours().toString().padStart(2, "0");
	const min = dt.getMinutes().toString().padStart(2, "0");
	const s = dt.getSeconds().toString().padStart(2, "0");
	const mm = dt.getMilliseconds().toString().padStart(3, "0");
	return y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s + "." + mm;
};
