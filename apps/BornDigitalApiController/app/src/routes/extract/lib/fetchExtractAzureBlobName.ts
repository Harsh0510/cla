import crypto from "crypto";

const numSort = (a: number, b: number) => a - b;

export default (assetId: number, pages: number[]) => {
	const cloned = [...pages];
	cloned.sort(numSort);
	const raw = assetId + "/" + cloned.join("-");
	return assetId + "/" + crypto.createHash("sha1").update(raw).digest("hex") + ".pdf";
};
