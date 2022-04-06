import { BlobGenerateSasUrlOptions, BlobSASPermissions } from "@azure/storage-blob";
import { expect, test, beforeEach, jest } from "@jest/globals";

class BlockBlobClient {
	public name: string;
	constructor(name: string) {
		this.name = name;
	}
	public generateSasUrl(opts: BlobGenerateSasUrlOptions) {
		return opts;
	}
}

class ContainerClient {
	public name: string;
	constructor(name: string) {
		this.name = name;
	}

	public getBlockBlobClient(name: string) {
		return new BlockBlobClient(name);
	}
}

let mockGetContainerClient = (name: string) => new ContainerClient(name);

jest.mock("../../../../src/common/blobService", () => {
	return {
		getContainerClient(containerName: string) {
			return mockGetContainerClient(containerName);
		},
	};
});

import fetchSasUrl from "../../../../src/routes/extract/lib/fetchSasUrl";

beforeEach(() => {
	mockGetContainerClient = (name: string) => new ContainerClient(name);
});

test("works", () => {
	const res = fetchSasUrl("foo", "bar") as BlobGenerateSasUrlOptions;
	expect(res.permissions).toEqual(BlobSASPermissions.parse("r"));
	expect(res.protocol).toBe("https");

	const startFrom = new Date();
	startFrom.setMinutes(startFrom.getMinutes() - 65);

	const startTo = new Date();
	startTo.setMinutes(startTo.getMinutes() - 55);

	const endFrom = new Date();
	endFrom.setMinutes(endFrom.getMinutes() + 175);

	const endTo = new Date();
	endTo.setMinutes(endTo.getMinutes() + 185);

	const start = res.startsOn as Date;
	expect(start.getTime()).toBeGreaterThan(startFrom.getTime());
	expect(start.getTime()).toBeLessThan(startTo.getTime());

	const end = res.expiresOn as Date;
	expect(end.getTime()).toBeGreaterThan(endFrom.getTime());
	expect(end.getTime()).toBeLessThan(endTo.getTime());
});
