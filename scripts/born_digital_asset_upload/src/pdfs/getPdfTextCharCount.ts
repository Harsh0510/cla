import execFile from "../execFile";

export default async (pdftotextBinaryPath: string, pdfFilePath: string): Promise<number> => {
	const result = await execFile(pdftotextBinaryPath, [pdfFilePath, "-"]);
	return result.length;
};
