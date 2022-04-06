import assert from "http-assert";
import validate from "./lib/validate";
import fetchAssetById from "./lib/fetchAssetById";
import fetchValidPages from "./lib/fetchValidPages";
import fetchExtractAzureBlobName from "./lib/fetchExtractAzureBlobName";
import db from "../../common/db";
import fetchSasUrl from "./lib/fetchSasUrl";
import {
	IEnqueueResultDone,
	IEnqueueResultEnqueued,
	IEnqueueResultFailed,
	IEnqueueResultNotFound,
} from "./lib/IEnqueueResult";
import TJsonValue from "../../common/TJsonValue";
import * as storageContainers from "../../common/storageContainers";

type TEnqueueResult = IEnqueueResultDone | IEnqueueResultEnqueued | IEnqueueResultFailed | IEnqueueResultNotFound;

export default async (paramsRaw: Record<string, TJsonValue>): Promise<TEnqueueResult> => {
	const params = validate(paramsRaw);

	const asset = await fetchAssetById(params.asset_id);
	assert(asset, 400, "asset not found");
	assert(!asset.withdrawn, 400, "asset withdrawn");
	const pages = fetchValidPages(asset, params.pages);
	const name = fetchExtractAzureBlobName(params.asset_id, pages);
	const result = await db.query(
		`
			SELECT
				status,
				error
			FROM
				born_digital_extract
			WHERE
				name = $1
		`,
		[name]
	);

	if (!result.rowCount) {
		return {
			status: "not_found",
		};
	}
	const res = result.rows[0];
	if (res.status !== "completed") {
		return {
			status: "enqueued",
		};
	}
	if (res.error) {
		return {
			status: "failed",
			message: res.error,
		};
	}
	return {
		status: "done",
		url: await fetchSasUrl(storageContainers.extracts, name),
	};
};
