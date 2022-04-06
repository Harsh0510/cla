import async, { AsyncResultCallback } from "async";

import IExtract from "../../../common/IExtract";
import processExtract from "../../../common/processExtract";

import db from "../../../common/db";
import { TQuerier } from "../../../common/TQuerier";

const querier: TQuerier = db.query.bind(db);

const queue = async.queue(
	(item: { extract: IExtract; requestId?: string | null | undefined }, callback: AsyncResultCallback<void>) => {
		processExtract(querier, item.extract, item.requestId).finally(callback);
	},
	1
);

export default (extract: IExtract, requestId?: string | null | undefined) => {
	queue.push({ extract, requestId });
};
