const genPasswordHash = require('../../apps/Controller/app/core/auth/common/genPasswordHash');

module.exports = getCreateUserSql = async users => {
	let counter = 0;
	const queryParts = [];
	const values = [];
	for (const user of users) {
		const [email, first, last, schoolId, role, title, pw] = user;
		const deets = await genPasswordHash(pw);
		queryParts.push(`(
			$${++counter},
			$${++counter},
			$${++counter},
			$${++counter},
			$${++counter},
			$${++counter},
			$${++counter},
			$${++counter},
			$${++counter},
			'registered',
			NOW(),
			NOW(),
			NOW(),
			NOW(),
			NOW()
		)`);
		values.push(email.toLowerCase(), first, last, schoolId, deets.algo, deets.hash, deets.salt, role, title);
	}

	const query = `
		INSERT INTO
			cla_user
			(
				email,
				first_name,
				last_name,
				school_id,
				password_algo,
				password_hash,
				password_salt,
				role,
				title,
				status,
				date_status_changed,
				date_last_registration_activity,
				date_transitioned_to_pending,
				date_transitioned_to_approved,
				date_transitioned_to_registered
			)
		VALUES
			${queryParts.join(', ')}
		ON CONFLICT
			(email)
		DO UPDATE SET
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			school_id = EXCLUDED.school_id,
			password_algo = EXCLUDED.password_algo,
			password_hash = EXCLUDED.password_hash,
			password_salt = EXCLUDED.password_salt,
			role = EXCLUDED.role,
			status = EXCLUDED.status,
			title = EXCLUDED.title,
			date_status_changed = EXCLUDED.date_status_changed,
			date_last_registration_activity = EXCLUDED.date_last_registration_activity,
			date_transitioned_to_pending = EXCLUDED.date_transitioned_to_pending,
			date_transitioned_to_approved = EXCLUDED.date_transitioned_to_approved,
			date_transitioned_to_registered = EXCLUDED.date_transitioned_to_registered
	`;

	return { query, values };
};