import execFile from "../execFile";

export default async (ghostscriptBinaryPath: string, pdfFilePath: string): Promise<number> => {
	const result = await execFile(ghostscriptBinaryPath, [
		`-q`,
		`-dNOSAFER`,
		`--permit-file-read=/`,
		`-dNODISPLAY`,
		`-c`,
		`(${pdfFilePath}) (r) file runpdfbegin pdfpagecount = quit`,
	]);
	const stdout = String(result).toString().trim();
	if (!stdout.match(/^[0-9]+$/)) {
		throw new Error("unexpected output");
	}
	return parseInt(stdout, 10);
};
