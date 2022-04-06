import AzureFile, { DirectoryListFilesAndDirectoriesOptions } from "@azure/storage-file-share";

const noop = () => true;

export default async (
	shareClient: AzureFile.ShareClient,
	dir: string,
	prefix?: string | undefined | null,
	matcher: (fileName: string) => boolean = noop
) => {
	const opts: DirectoryListFilesAndDirectoriesOptions = {};
	if (prefix) {
		opts.prefix = prefix;
	}
	const ret: string[] = [];
	const fetchInner = async (subDir: string) => {
		const iter = shareClient.getDirectoryClient(subDir).listFilesAndDirectories(opts);
		for await (const entity of iter) {
			if (entity.kind === "directory") {
				await fetchInner(subDir + "/" + entity.name);
			} else if (matcher(entity.name)) {
				ret.push(subDir + "/" + entity.name);
			}
		}
	};
	await fetchInner(dir);
	return ret;
};
