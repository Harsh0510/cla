import { execFile } from "child_process";

export default (ghostscriptBinaryPath: string, pdfFilePath: string, thumbnailOutputPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		execFile(
			ghostscriptBinaryPath,
			[
				"-o",
				thumbnailOutputPath,
				"-sDEVICE=png16m",
				"-r300",
				"-dFirstPage=1",
				"-dLastPage=1",
				"-dNOSAFER",
				"-sstdout=%stderr",
				pdfFilePath,
			],
			(err, stdout, stderr) => {
				stdout;
				if (err) {
					reject(err || new Error(stderr.toString()));
					return;
				}
				resolve();
			}
		);
	});
