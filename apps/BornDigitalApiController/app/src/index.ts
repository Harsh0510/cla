import Koa, { Context } from "koa";
import Router from "@koa/router";
import { loadEnvVars } from "./common/envLoader";

loadEnvVars(__dirname);

import routeAssetGetAll from "./routes/asset/getAll";
import routeExtractEnqueue from "./routes/extract/enqueue";
import routeExtractGetOne from "./routes/extract/getOne";
import koaLogger from "./common/koaLogger";
import parseJsonKoaBody from "./common/parseJsonKoaBody";
import TJsonValue from "./common/TJsonValue";
import getBindPort from "./common/getBindPort";
import JsonBigNative from "./common/JsonBigNative";
import parseJsonRequestBody from "./common/parseJsonRequestBody";
import checkApiKeyMiddleware from "./common/checkApiKeyMiddleware";

type TRouteFunc = (params: Record<string, TJsonValue>, requestId: string) => Promise<object>;

const wrapRoute = (func: TRouteFunc) => async (ctx: Context) => {
	ctx.response.type = "application/json";
	const params = parseJsonRequestBody(ctx["_rawBody"]);
	ctx.body = JsonBigNative.stringify(await func(params, ctx["_requestId"]));
};

const app = new Koa();
const router = new Router();
router.post("/asset/get-all", wrapRoute(routeAssetGetAll));
router.post("/extract/enqueue", wrapRoute(routeExtractEnqueue));
router.post("/extract/get-one", wrapRoute(routeExtractGetOne));

app.use(async (ctx: Context, next: Koa.Next) => {
	ctx["_rawBody"] = await parseJsonKoaBody(ctx.request);
	return await next();
});

app.use(koaLogger);
app.use(checkApiKeyMiddleware);
app.use(router.routes());

app.listen(getBindPort());

export default app;
