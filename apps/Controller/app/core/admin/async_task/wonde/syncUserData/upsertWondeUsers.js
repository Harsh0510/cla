const upsertOne = async (querier, localSchoolDbId, wondeUser) => {
	const returnFields = "id, school_id, email, activation_token, title, last_name";
	let existingUser;
	existingUser = (
		await querier(
			`
				SELECT
					id,
					status
				FROM
					cla_user
				WHERE
					wonde_identifier = $1
			`,
			[wondeUser.id]
		)
	).rows[0];
	if (!existingUser) {
		existingUser = (
			await querier(
				`
					SELECT
						id,
						status
					FROM
						cla_user
					WHERE
						email = $1
						AND school_id = $2
				`,
				[wondeUser.email, localSchoolDbId]
			)
		).rows[0];
	}
	if (existingUser) {
		// update
		const binds = [];
		const data = [];
		data.push(
			["email", "$" + binds.push(wondeUser.email.toLowerCase())],
			["first_name", "$" + binds.push(wondeUser.first_name)],
			["last_name", "$" + binds.push(wondeUser.last_name)],
			["school_id", "$" + binds.push(localSchoolDbId)],
			["title", "$" + binds.push(wondeUser.title)],
			["wonde_identifier", "$" + binds.push(wondeUser.id)],
			["wonde_mis_id", "$" + binds.push(wondeUser.mis_id)],
			["wonde_upi", "$" + binds.push(wondeUser.upi)]
		);
		const isReg = existingUser.status === "registered" || existingUser.status === "approved";
		if (!isReg) {
			data.push(
				["activation_token", "encode(gen_random_bytes(18), 'hex')"],
				["activation_token_expiry", "NOW() + interval '3 days'"],
				["date_status_changed", "NOW()"],
				["date_last_registration_activity", "NOW()"],
				["is_pending_approval", false],
				["registered_with_approved_domain", true],
				["status", "'approved'"],
				["date_transitioned_to_approved", "NOW()"],
				["date_edited", "NOW()"]
			);
		}
		const ret = (
			await querier(
				`
					UPDATE
						cla_user
					SET
						${data.map((f) => f[0] + " = " + f[1]).join(", ")}
					WHERE
						id = ${existingUser.id}
					RETURNING
						${returnFields}
				`,
				binds
			)
		).rows[0];
		ret.did_register = !isReg;
		return ret;
	}
	// insert
	const binds = [];
	const data = [
		["email", "$" + binds.push(wondeUser.email.toLowerCase())],
		["first_name", "$" + binds.push(wondeUser.first_name)],
		["last_name", "$" + binds.push(wondeUser.last_name)],
		["role", "'teacher'"],
		["source", "'local'"],
		["school_id", "$" + binds.push(localSchoolDbId)],
		["activation_token", "encode(gen_random_bytes(18), 'hex')"],
		["activation_token_expiry", "NOW() + interval '3 days'"],
		["title", "$" + binds.push(wondeUser.title)],
		["date_status_changed", "NOW()"],
		["date_last_registration_activity", "NOW()"],
		["is_pending_approval", false],
		["registered_with_approved_domain", true],
		["wonde_identifier", "$" + binds.push(wondeUser.id)],
		["wonde_mis_id", "$" + binds.push(wondeUser.mis_id)],
		["wonde_upi", "$" + binds.push(wondeUser.upi)],
		["status", "'approved'"],
		["date_transitioned_to_approved", "NOW()"],
	];
	const ret = (
		await querier(
			`
				INSERT INTO
					cla_user
					(${data.map((f) => f[0]).join(",")})
				VALUES
					(${data.map((f) => f[1]).join(", ")})
				RETURNING
					${returnFields}
			`,
			binds
		)
	).rows[0];
	ret.did_register = true;
	return ret;
};

module.exports = async (querier, localSchoolDbId, wondeUsers) => {
	const ret = [];
	for (const wondeUser of wondeUsers) {
		try {
			ret.push(await upsertOne(querier, localSchoolDbId, wondeUser));
		} catch (e) {
			console.error("DB query error when upserting Wonde user [" + wondeUser.id + "] for school [" + localSchoolDbId + "] - check DB server logs");
		}
	}
	return ret;
};
