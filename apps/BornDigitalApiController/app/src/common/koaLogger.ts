import crypto from "crypto";

import koa from "koa";

import log from "./log";

const getBodyString = (body?: unknown) => {
	if (!body) {
		return "";
	}
	if (typeof body === "string") {
		return body;
	}
	if (typeof body === "number" || typeof body === "boolean" || typeof body === "bigint") {
		return body.toString();
	}
	return JSON.stringify(body);
};

export default async (ctx: koa.Context, next: koa.Next) => {
	const requestId = crypto.randomBytes(18).toString("base64");
	ctx["_requestId"] = requestId;
	const start = Date.now();
	const url = ctx.originalUrl;
	const ip = (() => {
		if (process.env["IS_AZURE"] === "1" && ctx.request.headers["x-client-ip"]) {
			const headers = ctx.request.headers["x-client-ip"];
			if (Array.isArray(headers)) {
				return headers[0] || null;
			}
			return headers;
		}
		return ctx.request.ip;
	})();
	const apiKey = typeof ctx.request.headers["x-auth"] === "string" ? ctx.request.headers["x-auth"] : null;
	const userAgent = (ctx.request.headers["user-agent"] || "").slice(0, 256);
	const logEnd = async (err?: { status?: number; message?: string; stack?: string }) => {
		const status = err && err.status ? err.status : ctx.status;
		const timeTaken = Date.now() - start;
		await log({
			message: "end",
			request_id: requestId,
			api_key: apiKey,
			http_status: status,
			http_request_body: ctx["_rawBody"],
			http_response_body: getBodyString(ctx.response.body),
			ip_address: ip,
			time_taken_ms: timeTaken,
			url: url,
			user_agent: userAgent,
			exception_message: err?.message,
			exception_stack: err?.stack,
		});
	};
	await log({
		message: "start",
		request_id: requestId,
		api_key: apiKey,
		http_request_body: ctx["_rawBody"],
		ip_address: ip,
		url: url,
		user_agent: userAgent,
	});
	try {
		await next();
	} catch (e) {
		await logEnd(e as { status: number });
		throw e;
	}
	const done = async () => {
		ctx.res.removeListener("finish", done);
		ctx.res.removeListener("close", done);
		await logEnd();
	};
	ctx.res.once("finish", done);
	ctx.res.once("close", done);
};
