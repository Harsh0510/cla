import db from "./db";

export interface ILogParams {
	message: string;
	api_key?: string | null | undefined;
	http_status?: number | null | undefined;
	http_request_body?: string | null | undefined;
	http_response_body?: string | null | undefined;
	url?: string | null;
	time_taken_ms?: number | null | undefined;
	request_id?: string | null | undefined;
	ip_address?: string | null | undefined;
	user_agent?: string | null | undefined;
	extract_id?: number;
	exception_message?: string | null | undefined;
	exception_stack?: string | null | undefined;
}

export default async (params: ILogParams) => {
	await db.query(
		`
			INSERT INTO
				born_digital_log
				(
					message,
					api_key,
					http_status,
					http_request_body,
					http_response_body,
					url,
					time_taken_ms,
					request_id,
					ip_address,
					user_agent,
					extract_id,
					exception_message,
					exception_stack
				)
			VALUES
				(
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					$7,
					$8,
					$9,
					$10,
					$11,
					$12,
					$13
				)
		`,
		[
			params.message,
			params.api_key ? params.api_key.slice(0, 64) : null,
			params.http_status || null,
			params.http_request_body ? params.http_request_body.slice(0, 512) : null,
			params.http_response_body ? params.http_response_body.slice(0, 512) : null,
			params.url ? params.url.slice(0, 256) : null,
			params.time_taken_ms || null,
			params.request_id || null,
			params.ip_address || null,
			params.user_agent ? params.user_agent.slice(0, 256) : null,
			params.extract_id || null,
			params.exception_message || null,
			params.exception_stack || null,
		]
	);
};
