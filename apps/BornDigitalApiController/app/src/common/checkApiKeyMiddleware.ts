import assert from "http-assert";
import { Context, Next } from "koa";

import getApiKeys from "./getApiKeys";

const apiKeys = getApiKeys();

export default (ctx: Context, next: Next) => {
	assert(typeof ctx.request.headers["x-auth"] === "string", 401);
	assert(apiKeys.has(ctx.request.headers["x-auth"]), 401);
	return next();
};
