import db from "../../../common/db";
import IExtract from "../../../common/IExtract";
import * as storageContainers from "../../../common/storageContainers";
import fetchExtractAzureBlobName from "./fetchExtractAzureBlobName";
import fetchSasUrl from "./fetchSasUrl";
import { IEnqueueResultDone, IEnqueueResultEnqueued } from "./IEnqueueResult";
import enqueue from "./queue";

type IEnqueueResult = IEnqueueResultDone | IEnqueueResultEnqueued;

export default async (
	assetId: number,
	pdfIsbn13: string,
	pages: number[],
	requestId?: string
): Promise<IEnqueueResult> => {
	const name = fetchExtractAzureBlobName(assetId, pages);
	const result = await db.query(
		`
			INSERT INTO
				born_digital_extract
				(asset_id, isbn13, pages, name)
			VALUES
				($1, $2, $3, $4)
			ON CONFLICT
				(name)
			DO UPDATE SET
				asset_id = EXCLUDED.asset_id
			RETURNING
				id,
				status,
				error
		`,
		[assetId, pdfIsbn13, JSON.stringify(pages), name]
	);
	const res = result.rows[0];
	const extract: IExtract = {
		id: res.id,
		asset_id: assetId,
		pages: pages,
		name: name,
		isbn: pdfIsbn13,
	};
	if (res.status === "unstarted") {
		// was newly created
		enqueue(extract, requestId);
		return {
			status: "enqueued",
		};
	}
	if (res.status === "running") {
		// was previously created and is already in progress
		return {
			status: "enqueued",
		};
	}
	// is complete (but may have failed)
	if (res.error) {
		// did complete, but with error - retry
		await db.query(
			`
				UPDATE
					born_digital_extract
				SET
					status = 'unstarted',
					date_began_running = NULL,
					date_completed = NULL,
					error = NULL
				WHERE
					id = $1
					AND status = 'completed'
					AND error IS NOT NULL
			`,
			[res.id]
		);
		enqueue(extract, requestId);
		return {
			status: "enqueued",
		};
	}
	// complete - and successful!
	return {
		status: "done",
		url: await fetchSasUrl(storageContainers.extracts, name),
	};
};
