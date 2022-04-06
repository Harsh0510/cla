import { BlobSASPermissions, SASProtocol } from "@azure/storage-blob";
import blobService from "../../../common/blobService";

export default (containerName: string, blobName: string): Promise<string> => {
	const c = blobService.getContainerClient(containerName);
	const b = c.getBlockBlobClient(blobName);
	const startDate = new Date();
	startDate.setHours(startDate.getHours() - 1);
	const endDate = new Date();
	endDate.setHours(endDate.getHours() + 3);
	return b.generateSasUrl({
		permissions: BlobSASPermissions.parse("r"),
		protocol: SASProtocol.Https,
		startsOn: startDate,
		expiresOn: endDate,
	});
};
