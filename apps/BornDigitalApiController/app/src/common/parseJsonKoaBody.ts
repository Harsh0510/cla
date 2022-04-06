import { Request } from "koa";
import raw from "raw-body";
import inflate from "inflation";

export default async (req: Request): Promise<string> => {
	const len = req.headers["content-length"];
	const encoding = req.headers["content-encoding"] || "identity";
	const opts: raw.Options = {
		limit: "5kb",
		encoding: "utf8",
	};
	if (len && encoding === "identity") {
		opts.length = ~~len;
	}
	return (await raw(inflate(req.req), opts)) as unknown as string;
};
