#!/usr/bin/env bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cla_session (
	token VARCHAR(48) PRIMARY KEY NOT NULL,
	date_created TIMESTAMP NOT NULL DEFAULT NOW(),
	expiry_date TIMESTAMP NOT NULL,
	data JSONB,
	user_id INTEGER UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS cla_session__expiry_date__index ON cla_session(expiry_date);
EOSQL