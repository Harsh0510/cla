/**
 * This SQL file populates the database specified by the PG* parameters in the
 * .env file (see env.example).
 *
 * The script expects this SQL script to have already been executed beforehand.
 **/

CREATE TABLE IF NOT EXISTS uptime_log_item (
	id BIGSERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	endpoint TEXT NOT NULL,
	time_taken REAL NOT NULL DEFAULT 0.0,
	success BOOLEAN NOT NULL,
	num_tries INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS uptime_log_item__date_created__index ON uptime_log_item(date_created);
CREATE INDEX IF NOT EXISTS uptime_log_item__endpoint__index ON uptime_log_item(endpoint);
CREATE INDEX IF NOT EXISTS uptime_log_item__time_taken__index ON uptime_log_item(time_taken);
CREATE INDEX IF NOT EXISTS uptime_log_item__success__index ON uptime_log_item(success);
CREATE INDEX IF NOT EXISTS uptime_log_item__num_tries__index ON uptime_log_item(num_tries);
