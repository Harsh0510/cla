const { Ecdsa, Signature, PublicKey } = require("@starkbank/ecdsa");

const unparsed = Symbol.for("unparsedBody");

let publicKeyPem;

if (process.env.SENDGRID_EVENT_WEBHOOK_VERIFICATION_KEY) {
	publicKeyPem = PublicKey.fromPem(process.env.SENDGRID_EVENT_WEBHOOK_VERIFICATION_KEY);
}

// Ensure message is coming from SendGrid
const verify = (payload, signature, timestamp) => {
	if (!payload || !signature || !timestamp) {
		return false;
	}
	return Ecdsa.verify(timestamp + payload, Signature.fromBase64(signature), publicKeyPem);
};

module.exports = async (events, ctx) => {
	if (!Array.isArray(events) || !events.length) {
		return;
	}
	const rawPayload = ctx._koaCtx.request.body[unparsed];
	const sigb64 = ctx._koaCtx.get("X-Twilio-Email-Event-Webhook-Signature");
	const timestamp = ctx._koaCtx.get("X-Twilio-Email-Event-Webhook-Timestamp");
	if (!verify(rawPayload, sigb64, timestamp)) {
		return;
	}
	const values = [];
	const binds = [];
	for (const event of events) {
		values.push(`(
			$${binds.push(new Date(event.timestamp * 1000))},
			$${binds.push(event.category && event.category[0] ? event.category[0] : null)},
			$${binds.push(event.category ? JSON.stringify(event.category) : null)},
			$${binds.push(event.email)},
			$${binds.push(event.event)},
			$${binds.push(event.reason)},
			$${binds.push(event.response)},
			$${binds.push(event.url)},
			$${binds.push(event.url_offset)},
			$${binds.push(event.sg_event_id)},
			$${binds.push(event.sg_message_id)},
			$${binds.push(event.useragent ? event.useragent.slice(0, 255) : null)},
			$${binds.push(event.ip)},
			$${binds.push(event.status)},
			$${binds.push(event["smtp-id"])},
			$${binds.push(event.sg_content_type)}
		)`);
	}
	await ctx.appDbQuery(
		`
			INSERT INTO
				email_activity_log
				(
					date_event,
					first_category,
					categories,
					target_email,
					event_type,
					reason,
					response,
					url,
					url_offset,
					sg_event_id,
					sg_message_id,
					user_agent,
					ip,
					status,
					smtp_id,
					content_type
				)
			VALUES
				${values.join(", ")}
			ON CONFLICT
				(sg_event_id)
			DO UPDATE SET
				date_event = EXCLUDED.date_event,
				first_category = EXCLUDED.first_category,
				categories = EXCLUDED.categories,
				target_email = EXCLUDED.target_email,
				event_type = EXCLUDED.event_type,
				reason = EXCLUDED.reason,
				response = EXCLUDED.response,
				url = EXCLUDED.url,
				url_offset = EXCLUDED.url_offset,
				sg_message_id = EXCLUDED.sg_message_id,
				user_agent = EXCLUDED.user_agent,
				ip = EXCLUDED.ip,
				status = EXCLUDED.status,
				smtp_id = EXCLUDED.smtp_id,
				content_type = EXCLUDED.content_type
		`,
		binds
	);
	return {};
};
