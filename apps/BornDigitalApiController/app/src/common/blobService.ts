import { BlobServiceClient } from "@azure/storage-blob";

const bsService = BlobServiceClient.fromConnectionString(process.env["BDAPI_AZURE_CONNECTION_STRING"] as string);

export default bsService;
