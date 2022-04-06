import assert from "http-assert";
import validate from "./lib/validate";
import enqueueExtract from "./lib/enqueueExtract";
import fetchAssetById from "./lib/fetchAssetById";
import fetchValidPages from "./lib/fetchValidPages";
import TJsonValue from "../../common/TJsonValue";
import { IEnqueueResultDone, IEnqueueResultEnqueued } from "./lib/IEnqueueResult";

export default async (
	paramsRaw: Record<string, TJsonValue>,
	requestId: string
): Promise<IEnqueueResultDone | IEnqueueResultEnqueued> => {
	const params = validate(paramsRaw);

	const asset = await fetchAssetById(params.asset_id);
	assert(asset, 400, "asset not found");
	assert(!asset.withdrawn, 400, "asset withdrawn");
	const allPages = fetchValidPages(asset, params.pages);

	return await enqueueExtract(params.asset_id, asset.pdf_isbn13, allPages, requestId);
};
