import fs from "fs/promises";

import execFile from "../execFile";

export default async (
	magickBinaryPath: string,
	pngquantBinaryPath: string,
	imageFilePath: string,
	thumbnailSize: { width: number; height: number },
	thumbnailOutputPath: string
) => {
	try {
		await execFile(magickBinaryPath, [
			imageFilePath,
			"-strip",
			"-resize",
			`${thumbnailSize.width}x${thumbnailSize.height}>`,
			thumbnailOutputPath,
		]);
		await execFile(pngquantBinaryPath, ["--force", "--ext", ".png", thumbnailOutputPath]);
	} catch (e) {
		try {
			await fs.unlink(thumbnailOutputPath);
		} catch {}
		throw e;
	}
};
