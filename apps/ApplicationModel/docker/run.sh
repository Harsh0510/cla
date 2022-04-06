#!/usr/bin/env bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-"EOSQL"

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('unverified', 'pending', 'approved', 'registered');
CREATE TYPE extract_status AS ENUM ('editable', 'active', 'cancelled');
CREATE TYPE content_request_type AS ENUM ('book-request', 'author-request', 'publisher-request', 'content-type-request', 'other-request');

CREATE TABLE IF NOT EXISTS cla_user (
	id BIGSERIAL PRIMARY KEY,
	oid TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	role VARCHAR(32) NOT NULL,
	school_id BIGINT NOT NULL DEFAULT 0,
	email VARCHAR(255) UNIQUE NOT NULL,
	pending_email VARCHAR(255),
	pending_email_token VARCHAR(36),
	pending_email_expiry TIMESTAMP,
	password_reset_token VARCHAR(36),
	password_reset_expiry TIMESTAMP,
	password_salt VARCHAR(32),
	password_hash VARCHAR(64),
	password_algo VARCHAR(32),
	title VARCHAR(8),
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	middle_names VARCHAR(255),
	job_title VARCHAR(64),
	activation_token VARCHAR(36),
	activation_token_expiry TIMESTAMP,
	registered_with_approved_domain BOOLEAN NOT NULL DEFAULT FALSE,
	trusted_domain_registered_with VARCHAR(255),
	is_pending_approval BOOLEAN NOT NULL DEFAULT FALSE,
	source VARCHAR(32) NOT NULL DEFAULT 'local',
	keywords TSVECTOR,
	admin_keywords TSVECTOR,
	is_security_email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	status user_status NOT NULL DEFAULT 'unverified',
	date_status_changed TIMESTAMPTZ,
	date_last_registration_activity TIMESTAMPTZ,
	date_transitioned_to_pending TIMESTAMPTZ,
	date_transitioned_to_approved TIMESTAMPTZ,
	date_transitioned_to_registered TIMESTAMPTZ,
	name_display_preference VARCHAR(255),
	receive_marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
	receive_marketing_emails_update_counter INT NOT NULL DEFAULT 0,
	pardot_prospect_identifier BIGINT NOT NULL DEFAULT 0,
	default_class_year_group VARCHAR(255),
	default_class_exam_board VARCHAR(255),
	is_first_time_flyout_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	date_created_initial_password TIMESTAMPTZ,
	wonde_identifier TEXT,
	wonde_mis_id TEXT,
	wonde_upi TEXT,
	hwb_user_identifier TEXT,
	hwb_default_merge_user_id INTEGER,
	hwb_chosen_merge_user_id INTEGER,
	hwb_match_type TEXT,
	hwb_match_email TEXT,
	hwb_merge_token TEXT,
	hwb_merge_token_expiry TIMESTAMPTZ,
	hwb_email TEXT,
	email_opt_out TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0,
	date_last_activation_token_set TIMESTAMPTZ,
	date_last_activation_reminder_sent TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS cla_user__school_id__index ON cla_user(school_id);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__oid__index ON cla_user(oid);
CREATE INDEX IF NOT EXISTS cla_user__role__index ON cla_user(role);
CREATE INDEX IF NOT EXISTS cla_user__activation_token__index ON cla_user(activation_token);
CREATE INDEX IF NOT EXISTS cla_user__activation_token_expiry__index ON cla_user(activation_token_expiry);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__password_reset_token__index ON cla_user(password_reset_token);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__pending_email__index ON cla_user(pending_email);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__pending_email_token__index ON cla_user(pending_email_token);
CREATE INDEX IF NOT EXISTS cla_user__pending_email_expiry__index ON cla_user(pending_email_expiry);
CREATE INDEX IF NOT EXISTS cla_user__is_pending_approval__index ON cla_user(is_pending_approval);
CREATE INDEX IF NOT EXISTS cla_user__registered_with_approved_domain__index ON cla_user(registered_with_approved_domain);
CREATE INDEX IF NOT EXISTS cla_user__trusted_domain_registered_with__index ON cla_user(trusted_domain_registered_with);
CREATE INDEX IF NOT EXISTS cla_user__keywords__index ON cla_user USING GIN(keywords);
CREATE INDEX IF NOT EXISTS cla_user__admin_keywords__index ON cla_user USING GIN(admin_keywords);
CREATE INDEX IF NOT EXISTS cla_user__status__index ON cla_user(status);
CREATE INDEX IF NOT EXISTS cla_user__date_last_registration_activity__index ON cla_user(date_last_registration_activity);
CREATE INDEX IF NOT EXISTS cla_user__pardot_prospect_identifier__index ON cla_user(pardot_prospect_identifier);
CREATE INDEX IF NOT EXISTS cla_user__receive_marketing_emails_update_counter__index ON cla_user(receive_marketing_emails_update_counter);
CREATE INDEX IF NOT EXISTS cla_user__date_created__index ON cla_user(date_created);
CREATE INDEX IF NOT EXISTS cla_user__date_created_initial_password__index ON cla_user(date_created_initial_password);
CREATE INDEX IF NOT EXISTS cla_user__wonde_mis_id__index ON cla_user(wonde_mis_id);
CREATE INDEX IF NOT EXISTS cla_user__wonde_upi__index ON cla_user(wonde_upi);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__wonde_identifier__index ON cla_user(wonde_identifier);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__hwb_user_identifier__index ON cla_user(hwb_user_identifier);
CREATE INDEX IF NOT EXISTS cla_user__hwb_default_merge_user_id__index ON cla_user(hwb_default_merge_user_id);
CREATE INDEX IF NOT EXISTS cla_user__hwb_chosen_merge_user_id__index ON cla_user(hwb_chosen_merge_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__hwb_merge_token__index ON cla_user(hwb_merge_token);
CREATE INDEX IF NOT EXISTS cla_user__hwb_merge_token_expiry__index ON cla_user(hwb_merge_token_expiry);
CREATE UNIQUE INDEX IF NOT EXISTS cla_user__hwb_email__index ON cla_user(hwb_email);
CREATE INDEX IF NOT EXISTS cla_user__email_opt_out__index ON cla_user(email_opt_out);
CREATE INDEX IF NOT EXISTS cla_user__date_last_activation_token_set__index ON cla_user(date_last_activation_token_set);
CREATE INDEX IF NOT EXISTS cla_user__date_last_activation_reminder_sent__index ON cla_user(date_last_activation_reminder_sent);

CREATE OR REPLACE FUNCTION cla_user__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.email, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.first_name, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.last_name, '')), 'B')
		;
		new.admin_keywords :=
			setweight(to_tsvector('english', COALESCE(new.email, '')), 'A')
			|| setweight(to_tsvector('simple', new.id::TEXT), 'A')
			|| setweight(to_tsvector('simple', new.school_id::TEXT), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.first_name, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.last_name, '')), 'B')
		;
		return new;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cla_user__keywords__trigger ON cla_user;
CREATE TRIGGER cla_user__keywords__trigger BEFORE INSERT OR UPDATE ON cla_user FOR EACH ROW EXECUTE PROCEDURE cla_user__keywords__func_trigger();

CREATE OR REPLACE FUNCTION cla_user__receive_marketing_emails_has_changed__func_trigger() RETURNS trigger AS $$
	begin
		NEW.receive_marketing_emails_update_counter = OLD.receive_marketing_emails_update_counter + 1;
		return NEW;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cla_user__receive_marketing_emails_has_changed__trigger ON cla_user;
CREATE TRIGGER
	cla_user__receive_marketing_emails_has_changed__trigger
BEFORE UPDATE
ON cla_user
FOR EACH ROW
WHEN
	(OLD.receive_marketing_emails <> NEW.receive_marketing_emails)
EXECUTE PROCEDURE
	cla_user__receive_marketing_emails_has_changed__func_trigger();

CREATE OR REPLACE FUNCTION cla_user__activation_token_set_date__func_trigger() RETURNS trigger AS $$
	begin
		IF NEW.activation_token IS NOT NULL THEN
			NEW.date_last_activation_token_set = NOW();
		END IF;
		return NEW;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cla_user__activation_token_set_date__trigger ON cla_user;
CREATE TRIGGER cla_user__activation_token_set_date__trigger
	BEFORE INSERT OR UPDATE OF activation_token ON cla_user
	FOR EACH ROW
	EXECUTE PROCEDURE cla_user__activation_token_set_date__func_trigger();

CREATE TABLE IF NOT EXISTS login_security_token (
	oid TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex') PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	user_id BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS login_security_token__date_created__index ON login_security_token(date_created);
CREATE INDEX IF NOT EXISTS login_security_token__user_id__index ON login_security_token(user_id);

CREATE TABLE IF NOT EXISTS cla_role (
	code VARCHAR(16) PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	level SMALLINT NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
INSERT INTO cla_role (code, name, level) VALUES
	('teacher', 'Teacher', 200),
	('school-admin', 'School Admin', 300),
	('cla-admin', 'CLA Admin', 400)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS school (
	id SERIAL PRIMARY KEY,
	identifier VARCHAR(255) UNIQUE,
	academic_year_end_month SMALLINT NOT NULL DEFAULT 7,
	academic_year_end_day SMALLINT NOT NULL DEFAULT 31,
	name VARCHAR(255) NOT NULL,
	address1 VARCHAR(255),
	address2 VARCHAR(255),
	address3 VARCHAR(255),
	city VARCHAR(255),
	county VARCHAR(255),
	post_code VARCHAR(255),
	country_iso2 VARCHAR(2) NOT NULL DEFAULT 'GB',
	territory VARCHAR(255) NOT NULL DEFAULT 'england',
	local_authority VARCHAR(255),
	school_level VARCHAR(255) NOT NULL,
	school_type VARCHAR(255),
	school_home_page VARCHAR(255),
	number_of_students INT,
	keywords tsvector,
	postcode_first_part_lower VARCHAR(255),
	postcode_lower VARCHAR(255),
	public_keywords tsvector,
	public_combined_keywords TEXT,
	wonde_identifier TEXT,
	la_code TEXT,
	mis TEXT,
	wonde_approved BOOLEAN NOT NULL DEFAULT FALSE,
	gsg TEXT,
	dfe TEXT,
	seed TEXT,
	nide TEXT,
	enable_wonde_class_sync BOOLEAN NOT NULL DEFAULT FALSE,
	enable_wonde_user_sync BOOLEAN NOT NULL DEFAULT FALSE,
	date_last_wonde_class_synced TIMESTAMPTZ,
	date_last_wonde_user_synced TIMESTAMPTZ,
	hwb_identifier TEXT,
	establishment_number INTEGER,
	rollover_job_id INTEGER NOT NULL DEFAULT 0,
	last_rollover_date TIMESTAMPTZ,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS school__school_level__index ON school(school_level);
CREATE INDEX IF NOT EXISTS school__school_type__index ON school(school_type);
CREATE INDEX IF NOT EXISTS school__number_of_students__index ON school(number_of_students);
CREATE INDEX IF NOT EXISTS school__city__index ON school(city);
CREATE INDEX IF NOT EXISTS school__keywords__index ON school USING GIN(keywords);
CREATE INDEX IF NOT EXISTS school__postcode_first_part_lower__index ON school(postcode_first_part_lower);
CREATE INDEX IF NOT EXISTS school__postcode_lower__index ON school(postcode_lower);
CREATE INDEX IF NOT EXISTS school__public_keywords__index ON school USING GIN(public_keywords);
CREATE INDEX IF NOT EXISTS school__public_combined_keywords__index ON school(public_combined_keywords);
CREATE INDEX IF NOT EXISTS school__la_code__index ON school(la_code);
CREATE UNIQUE INDEX IF NOT EXISTS school__wonde_identifier__index ON school(wonde_identifier);
CREATE INDEX IF NOT EXISTS school__wonde_approved__index ON school(wonde_approved);
CREATE INDEX IF NOT EXISTS school__name__index ON school(name);
CREATE INDEX IF NOT EXISTS school__gsg__index ON school(gsg);
CREATE INDEX IF NOT EXISTS school__dfe__index ON school(dfe);
CREATE INDEX IF NOT EXISTS school__seed__index ON school(seed);
CREATE UNIQUE INDEX IF NOT EXISTS school__nide__index ON school(nide);
CREATE INDEX IF NOT EXISTS school__enable_wonde_class_sync__index ON school(enable_wonde_class_sync);
CREATE INDEX IF NOT EXISTS school__enable_wonde_user_sync__index ON school(enable_wonde_user_sync);
CREATE INDEX IF NOT EXISTS school__date_last_wonde_class_synced__index ON school(date_last_wonde_class_synced);
CREATE INDEX IF NOT EXISTS school__date_last_wonde_user_synced__index ON school(date_last_wonde_user_synced);
CREATE UNIQUE INDEX IF NOT EXISTS school__hwb_identifier__index ON school(hwb_identifier);
CREATE INDEX IF NOT EXISTS school__establishment_number__index ON school(establishment_number);
CREATE INDEX IF NOT EXISTS school__rollover_job_id__index ON school(rollover_job_id);
CREATE INDEX IF NOT EXISTS school__last_rollover_date__index ON school(last_rollover_date);

CREATE OR REPLACE FUNCTION school__keywords__func_trigger() RETURNS trigger AS $$
begin
	new.keywords :=
		setweight(to_tsvector('simple', COALESCE(new.identifier, '')), 'A')
		|| setweight(to_tsvector('english', COALESCE(new.name, '')), 'A')
		|| setweight(to_tsvector('simple', new.id::TEXT), 'A')
		|| setweight(to_tsvector('simple', COALESCE(new.gsg, '')), 'B')
		|| setweight(to_tsvector('simple', COALESCE(new.dfe, '')), 'B')
		|| setweight(to_tsvector('simple', COALESCE(new.seed, '')), 'B')
		|| setweight(to_tsvector('simple', COALESCE(new.nide, '')), 'B')
		|| setweight(to_tsvector('simple', COALESCE(new.hwb_identifier, '')), 'B')
	;
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school__keywords__trigger ON school;
CREATE TRIGGER school__keywords__trigger BEFORE INSERT OR UPDATE ON school FOR EACH ROW EXECUTE PROCEDURE school__keywords__func_trigger();

CREATE OR REPLACE FUNCTION school__post_code__func_trigger()
	RETURNS trigger AS $$
	DECLARE postcode VARCHAR(255) := '';
	DECLARE first VARCHAR(255) := '';
	begin
		postcode := LOWER(new.post_code);
		first := SPLIT_PART(postcode,' ', 1);
		new.postcode_first_part_lower := first;
		new.postcode_lower := postcode;
		return new;
	end;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school__post_code__trigger ON school;
CREATE TRIGGER school__post_code__trigger
	BEFORE INSERT OR UPDATE OF post_code ON school
	FOR EACH ROW
	EXECUTE PROCEDURE school__post_code__func_trigger();

CREATE OR REPLACE FUNCTION school__public_keywords__func_trigger() RETURNS trigger AS $$
begin
	new.public_keywords :=
		setweight(to_tsvector('english', COALESCE(new.postcode_first_part_lower, '')), 'A')
		|| setweight(to_tsvector('english', COALESCE(new.name, '')), 'B')
		|| setweight(to_tsvector('english', COALESCE(new.city, '')), 'C')
		|| setweight(to_tsvector('english', COALESCE(new.county, '')), 'C')
	;
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school__public_keywords__trigger ON school;
CREATE TRIGGER school__public_keywords__trigger BEFORE INSERT OR UPDATE ON school FOR EACH ROW EXECUTE PROCEDURE school__public_keywords__func_trigger();

CREATE OR REPLACE FUNCTION school__public_combined_keywords__func_trigger() RETURNS trigger AS $$
begin
	new.public_combined_keywords := LOWER(TRIM(CONCAT(COALESCE(new.name, ''), ' ', COALESCE(new.city, '') , ' ', COALESCE(new.county, ''), ' ', COALESCE(new.post_code, ''))));
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school__public_combined_keywords__trigger ON school;
CREATE TRIGGER school__public_combined_keywords__trigger BEFORE INSERT OR UPDATE ON school FOR EACH ROW EXECUTE PROCEDURE school__public_combined_keywords__func_trigger();

CREATE OR REPLACE FUNCTION school__identifier__func_trigger()
	RETURNS trigger AS $$
	BEGIN
		new.gsg := cla_trim_text(SPLIT_PART(new.identifier, '/', 1));
		new.dfe := cla_trim_text(SPLIT_PART(new.identifier, '/', 2));
		new.seed := cla_trim_text(SPLIT_PART(new.identifier, '/', 3));
		return new;
	END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school__identifier__trigger ON school;
CREATE TRIGGER school__identifier__trigger
	BEFORE INSERT OR UPDATE OF identifier ON school
	FOR EACH ROW
	EXECUTE PROCEDURE school__identifier__func_trigger();

CREATE OR REPLACE FUNCTION cla_trim_text(v_input TEXT)
	RETURNS TEXT AS $$
	DECLARE v_input_value TEXT = TRIM(v_input);
	BEGIN
		IF(v_input_value = '')
		THEN
			RETURN NULL;
		END IF;
		RETURN v_input_value;
	END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE born_digital_asset_change_counter START 1;

CREATE TABLE IF NOT EXISTS asset (
	id SERIAL PRIMARY KEY,
	active BOOLEAN NOT NULL DEFAULT FALSE,
	active_born_digital BOOLEAN NOT NULL DEFAULT FALSE,
	content_form VARCHAR(255) NOT NULL DEFAULT 'BO',
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	title TEXT NOT NULL,
	sub_title VARCHAR(255),
	description TEXT,
	extent_page_count SMALLINT,
	page_count SMALLINT,
	copyable_page_count SMALLINT,
	record_reference VARCHAR(255),
	table_of_contents TEXT,
	table_of_contents_stripped TEXT,
	table_of_contents_description_stripped TEXT,
	website_link TEXT,
	edition INT NOT NULL DEFAULT 1,
	publication_date TIMESTAMP,
	file_location VARCHAR(255),
	isbn13 VARCHAR(50) NOT NULL,
	alternate_isbn13 VARCHAR(50),
	pdf_isbn13 VARCHAR(50) NOT NULL,
	publisher_id INT NOT NULL DEFAULT 0,
	publisher_name_log TEXT NOT NULL,
	subject_codes_log JSONB,
	authors_log JSONB,
	authors_string TEXT,
	weighted_tsv tsvector,
	buy_book_link VARCHAR(1000),
	buy_book_link_began_updating TIMESTAMP,
	buy_book_link_last_updated TIMESTAMP,
	buy_book_rules JSONB,
	imprint_id INTEGER NOT NULL DEFAULT 0,
	imprint TEXT,
	page_offset_roman INT NOT NULL DEFAULT 0,
	page_offset_arabic INT NOT NULL DEFAULT 0,
	volume_number VARCHAR(255),
	issue_number VARCHAR(255),
	copy_excluded_pages INTEGER[],
	parent_asset_id INTEGER NOT NULL DEFAULT 0,
	auto_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
	parent_asset_group_id INTEGER NOT NULL DEFAULT 0,
	parent_asset_group_identifier_log VARCHAR,
	can_copy_in_full BOOLEAN NOT NULL DEFAULT FALSE,
	file_format TEXT,
	doi TEXT,
	modified_by_user_id BIGINT NOT NULL DEFAULT 0,
	dewey_class TEXT,
	date_system_created TIMESTAMPTZ DEFAULT NOW(),
	date_user_created TIMESTAMPTZ,
	is_ep BOOLEAN NOT NULL DEFAULT TRUE,
	is_born_digital BOOLEAN NOT NULL DEFAULT FALSE,
	ocr BOOLEAN NOT NULL DEFAULT FALSE,
	color_scale TEXT NOT NULL DEFAULT 'color',
	born_digital_withdrawn BOOLEAN NOT NULL DEFAULT FALSE,
	born_digital_change_counter BIGINT NOT NULL DEFAULT nextval('born_digital_asset_change_counter')
);
CREATE UNIQUE INDEX IF NOT EXISTS asset__isbn13__index ON asset(isbn13);
CREATE UNIQUE INDEX IF NOT EXISTS asset__alternate_isbn13__index ON asset(alternate_isbn13);
CREATE UNIQUE INDEX IF NOT EXISTS asset__pdf_isbn13__index ON asset(pdf_isbn13);
CREATE INDEX IF NOT EXISTS asset__content_form__index ON asset(content_form);
CREATE INDEX IF NOT EXISTS asset__date_created__index ON asset(date_created);
CREATE INDEX IF NOT EXISTS asset__date_edited__index ON asset(date_edited);
CREATE INDEX IF NOT EXISTS asset__title__index ON asset(title);
CREATE INDEX IF NOT EXISTS asset__publisher_id__index ON asset(publisher_id);
CREATE INDEX IF NOT EXISTS asset__active__index ON asset(active);
CREATE INDEX IF NOT EXISTS asset__active_born_digital__index ON asset(active_born_digital);
CREATE INDEX IF NOT EXISTS asset__weighted_tsv__index ON asset USING GIN(weighted_tsv);
CREATE INDEX IF NOT EXISTS asset__imprint_id__index ON asset(imprint_id);
CREATE INDEX IF NOT EXISTS asset__page_offset_roman__index ON asset(page_offset_roman);
CREATE INDEX IF NOT EXISTS asset__page_offset_arabic__index ON asset(page_offset_arabic);
CREATE INDEX IF NOT EXISTS asset__publisher_name_log__index ON asset(publisher_name_log);
CREATE INDEX IF NOT EXISTS asset__volume_number__index ON asset(volume_number);
CREATE INDEX IF NOT EXISTS asset__issue_number__index ON asset(issue_number);
CREATE INDEX IF NOT EXISTS asset__parent_asset_id__index ON asset(parent_asset_id);
CREATE INDEX IF NOT EXISTS asset__auto_unlocked__index ON asset(auto_unlocked);
CREATE INDEX IF NOT EXISTS asset__parent_asset_group_id__index ON asset(parent_asset_group_id);
CREATE INDEX IF NOT EXISTS asset__parent_asset_group_identifier_log__index ON asset(parent_asset_group_identifier_log);
CREATE INDEX IF NOT EXISTS asset__can_copy_in_full__index ON asset(can_copy_in_full);
CREATE INDEX IF NOT EXISTS asset__file_format__index ON asset(file_format);
CREATE INDEX IF NOT EXISTS asset__doi__index ON asset(doi);
CREATE INDEX IF NOT EXISTS asset__dewey_class__index ON asset(dewey_class);
CREATE INDEX IF NOT EXISTS asset__date_system_created__index ON asset(date_system_created);
CREATE INDEX IF NOT EXISTS asset__date_user_created__index ON asset(date_user_created);
CREATE INDEX IF NOT EXISTS asset__is_ep__index ON asset(is_ep);
CREATE INDEX IF NOT EXISTS asset__is_born_digital__index ON asset(is_born_digital);
CREATE INDEX IF NOT EXISTS asset__born_digital_withdrawn__index ON asset(born_digital_withdrawn);
CREATE INDEX IF NOT EXISTS asset__born_digital_change_counter__index ON asset(born_digital_change_counter);

CREATE OR REPLACE FUNCTION asset__born_digital_asset_change_counter__func() RETURNS trigger AS $$
begin
	new.born_digital_change_counter = nextval('born_digital_asset_change_counter');
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset__born_digital_asset_change_counter__trigger ON asset;
CREATE TRIGGER
	asset__born_digital_asset_change_counter__trigger
BEFORE UPDATE ON
	asset
FOR EACH ROW
WHEN (
	OLD.pdf_isbn13 IS DISTINCT FROM NEW.pdf_isbn13
	OR OLD.title IS DISTINCT FROM NEW.title
	OR OLD.authors_log IS DISTINCT FROM NEW.authors_log
	OR OLD.publisher_name_log IS DISTINCT FROM NEW.publisher_name_log
	OR OLD.publication_date IS DISTINCT FROM NEW.publication_date
	OR OLD.page_count IS DISTINCT FROM NEW.page_count
	OR OLD.ocr IS DISTINCT FROM NEW.ocr
	OR OLD.color_scale IS DISTINCT FROM NEW.color_scale
	OR OLD.born_digital_withdrawn IS DISTINCT FROM NEW.born_digital_withdrawn
	OR OLD.born_digital_change_counter IS DISTINCT FROM NEW.born_digital_change_counter
	OR OLD.page_offset_roman IS DISTINCT FROM NEW.page_offset_roman
	OR OLD.page_offset_arabic IS DISTINCT FROM NEW.page_offset_arabic
)
EXECUTE PROCEDURE asset__born_digital_asset_change_counter__func();

CREATE OR REPLACE FUNCTION asset_on_upsert_trigger() RETURNS trigger AS $$
begin
	new.weighted_tsv :=
		setweight(to_tsvector('english', new.isbn13), 'A')
		|| setweight(to_tsvector('english', COALESCE(new.alternate_isbn13, '')), 'A')
		|| setweight(to_tsvector('english', new.pdf_isbn13), 'A')
		|| setweight(to_tsvector('english', new.title), 'B')
		|| setweight(to_tsvector('english', COALESCE(new.sub_title, '')), 'C')
		|| setweight(to_tsvector('english', COALESCE(new.table_of_contents_stripped, '')), 'C')
		|| setweight(to_tsvector('english', COALESCE(new.table_of_contents_description_stripped, '')), 'D')
		|| setweight(to_tsvector('english', COALESCE(new.authors_string, '')), 'D')
		|| setweight(to_tsvector('english', COALESCE(new.publisher_name_log, '')), 'D')
		|| setweight(to_tsvector('english', COALESCE(new.imprint, '')), 'D')
	;
	new.copyable_page_count = new.page_count - COALESCE(ARRAY_LENGTH(new.copy_excluded_pages, 1), 0);
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_search_tsv_updater ON asset;
CREATE TRIGGER asset_search_tsv_updater BEFORE INSERT OR UPDATE ON asset FOR EACH ROW EXECUTE PROCEDURE asset_on_upsert_trigger();

CREATE TABLE asset_group (
	id SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL,
	identifier VARCHAR NOT NULL,
	buy_book_rules JSONB,
	publisher_id INT NOT NULL DEFAULT 0,
	publisher_name_log VARCHAR(255) NOT NULL,
	keywords TSVECTOR
);
CREATE INDEX IF NOT EXISTS asset_group__title__index ON asset_group(title);
CREATE UNIQUE INDEX IF NOT EXISTS asset_group__identifier__index ON asset_group(identifier);
CREATE INDEX IF NOT EXISTS asset_group__publisher_id__index ON asset_group(publisher_id);
CREATE INDEX IF NOT EXISTS asset_group__publisher_name_log__index ON asset_group(publisher_name_log);
CREATE INDEX IF NOT EXISTS asset_group__keywords__index ON asset_group USING GIN(keywords);

CREATE OR REPLACE FUNCTION asset_group__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.title, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.identifier, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.publisher_name_log, '')), 'C')
		;
		return new;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_group__keywords__trigger ON asset_group;
CREATE TRIGGER asset_group__keywords__trigger BEFORE INSERT OR UPDATE ON asset_group FOR EACH ROW EXECUTE PROCEDURE asset_group__keywords__func_trigger();

CREATE TABLE asset_fragment (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	asset_id INTEGER NOT NULL,
	start_page INTEGER NOT NULL,
	title VARCHAR NOT NULL,
	description VARCHAR,
	keywords TSVECTOR
);
CREATE INDEX IF NOT EXISTS asset_fragment__date_created__index ON asset_fragment(date_created);
CREATE INDEX IF NOT EXISTS asset_fragment__asset_id__index ON asset_fragment(asset_id);
CREATE INDEX IF NOT EXISTS asset_fragment__keywords__index ON asset_fragment USING GIN(keywords);

CREATE OR REPLACE FUNCTION asset_fragment__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.title, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.description, '')), 'B')
		;
		return new;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_fragment__keywords__trigger ON asset_fragment;
CREATE TRIGGER asset_fragment__keywords__trigger BEFORE INSERT OR UPDATE ON asset_fragment FOR EACH ROW EXECUTE PROCEDURE asset_fragment__keywords__func_trigger();

CREATE TABLE asset_user_upload (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	asset_id INTEGER NOT NULL,
	user_id BIGINT NOT NULL,
	user_first_name TEXT,
	user_last_name TEXT,
	asset_authors TEXT,
	pages JSONB NOT NULL,
	pdf_page_count INTEGER NOT NULL,
	page_count_difference_log INTEGER NOT NULL,
	title TEXT NOT NULL,
	cover_status TEXT,
	description TEXT,
	filename TEXT,
	upload_name TEXT NOT NULL,
	keywords tsvector,
	is_copying_full_chapter BOOLEAN NOT NULL DEFAULT FALSE,
	file_size INT NOT NULL,
	copy_ratio REAL NOT NULL,
	oid VARCHAR(36) NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex')
);
CREATE INDEX IF NOT EXISTS asset_user_upload__date_created__index ON asset_user_upload(date_created);
CREATE INDEX IF NOT EXISTS asset_user_upload__asset_id__index ON asset_user_upload(asset_id);
CREATE INDEX IF NOT EXISTS asset_user_upload__user_id__index ON asset_user_upload(user_id);
CREATE INDEX IF NOT EXISTS asset_user_upload__title__index ON asset_user_upload(title);
CREATE INDEX IF NOT EXISTS asset_user_upload__pdf_page_count__index ON asset_user_upload(pdf_page_count);
CREATE INDEX IF NOT EXISTS asset_user_upload__page_count_difference_log__index ON asset_user_upload(page_count_difference_log);
CREATE INDEX IF NOT EXISTS asset_user_upload__cover_status__index ON asset_user_upload(cover_status);
CREATE INDEX IF NOT EXISTS asset_user_upload__filename__index ON asset_user_upload(filename);
CREATE INDEX IF NOT EXISTS asset_user_upload__file_size__index ON asset_user_upload(file_size);
CREATE INDEX IF NOT EXISTS asset_user_upload__upload_name__index ON asset_user_upload(upload_name);
CREATE INDEX IF NOT EXISTS asset_user_upload__copy_ratio__index ON asset_user_upload(copy_ratio);
CREATE UNIQUE INDEX IF NOT EXISTS asset_user_upload__oid__index ON asset_user_upload(oid);
CREATE INDEX IF NOT EXISTS asset_user_upload__keywords__index ON asset_user_upload USING GIN(keywords);

CREATE OR REPLACE FUNCTION asset_user_upload_upsert_trigger() RETURNS trigger AS $$
begin
	new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.upload_name, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.title, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.asset_authors, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.user_first_name, '')), 'C')
			|| setweight(to_tsvector('english', COALESCE(new.user_last_name, '')), 'C');
	new.page_count_difference_log = new.pdf_page_count - JSONB_ARRAY_LENGTH(new.pages);
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_user_upload_tsv_updater ON asset_user_upload;
CREATE TRIGGER asset_user_upload_tsv_updater BEFORE INSERT OR UPDATE ON asset_user_upload FOR EACH ROW EXECUTE PROCEDURE asset_user_upload_upsert_trigger();

CREATE TABLE asset_subject (
	asset_id INTEGER NOT NULL,
	subject_code VARCHAR(12) NOT NULL,
	top_level_subject_code VARCHAR(12) NOT NULL,
	third_level_subject_code VARCHAR(12) NOT NULL,
	fourth_level_subject_code VARCHAR(12) NOT NULL,
	PRIMARY KEY (asset_id, subject_code),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_subject__asset_id__index ON asset_subject(asset_id);
CREATE INDEX IF NOT EXISTS asset_subject__subject_code__index ON asset_subject(subject_code);
CREATE INDEX IF NOT EXISTS asset_subject__top_level_subject_code__index ON asset_subject(top_level_subject_code);
CREATE INDEX IF NOT EXISTS asset_subject__third_level_subject_code__index ON asset_subject(third_level_subject_code);
CREATE INDEX IF NOT EXISTS asset_subject__fourth_level_subject_code__index ON asset_subject(fourth_level_subject_code);

CREATE OR REPLACE FUNCTION asset_subject__subject_code__trigger() RETURNS trigger AS $$
begin
	new.top_level_subject_code := substring(new.subject_code FROM 1 FOR 1);
	new.third_level_subject_code := substring(new.subject_code FROM 1 FOR 3);
	new.fourth_level_subject_code := substring(new.subject_code FROM 1 FOR 4);
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_subject__subject_code__updater ON asset_subject;
CREATE TRIGGER asset_subject__subject_code__updater BEFORE INSERT OR UPDATE ON asset_subject FOR EACH ROW EXECUTE PROCEDURE asset_subject__subject_code__trigger();

CREATE TABLE IF NOT EXISTS asset_language (
	asset_id INTEGER NOT NULL,
	language VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, language)
);
CREATE INDEX IF NOT EXISTS asset_language__asset_id__index ON asset_language(asset_id);
CREATE INDEX IF NOT EXISTS asset_language__language__index ON asset_language(language);

CREATE TABLE IF NOT EXISTS asset_key_stage (
	asset_id INTEGER NOT NULL,
	key_stage VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, key_stage),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_key_stage__asset_id__index ON asset_key_stage(asset_id);
CREATE INDEX IF NOT EXISTS asset_key_stage__key_stage__index ON asset_key_stage(key_stage);

CREATE TABLE IF NOT EXISTS asset_exam_board (
	asset_id INTEGER NOT NULL,
	exam_board VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, exam_board),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_exam_board__asset_id__index ON asset_exam_board(asset_id);
CREATE INDEX IF NOT EXISTS asset_exam_board__exam_board__index ON asset_exam_board(exam_board);

CREATE TABLE IF NOT EXISTS asset_exam (
	asset_id INTEGER NOT NULL,
	exam VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, exam),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_exam__asset_id__index ON asset_exam(asset_id);
CREATE INDEX IF NOT EXISTS asset_exam__exam__index ON asset_exam(exam);

CREATE TABLE IF NOT EXISTS asset_level (
	asset_id INTEGER NOT NULL,
	level VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, level),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_level__asset_id__index ON asset_level(asset_id);
CREATE INDEX IF NOT EXISTS asset_level__level__index ON asset_level(level);

CREATE TABLE IF NOT EXISTS asset_scottish_level (
	asset_id INTEGER NOT NULL,
	scottish_level VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, scottish_level),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_scottish_level__asset_id__index ON asset_scottish_level(asset_id);
CREATE INDEX IF NOT EXISTS asset_scottish_level__scottish_level__index ON asset_scottish_level(scottish_level);

CREATE TABLE IF NOT EXISTS asset_collection (
	asset_id INTEGER NOT NULL,
	collection VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, collection),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_collection__asset_id__index ON asset_collection(asset_id);
CREATE INDEX IF NOT EXISTS asset_collection__collection__index ON asset_collection(collection);

CREATE TABLE IF NOT EXISTS asset_educational_year_group (
	asset_id INTEGER NOT NULL,
	educational_year_group VARCHAR(255) NOT NULL,
	PRIMARY KEY (asset_id, educational_year_group),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_educational_year_group__asset_id__index ON asset_educational_year_group(asset_id);
CREATE INDEX IF NOT EXISTS asset_educational_year_group__educational_year_group__index ON asset_educational_year_group(educational_year_group);

CREATE TABLE IF NOT EXISTS publisher (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	overall_name VARCHAR(255),
	external_identifier VARCHAR(255),
	contact_name VARCHAR(255),
	printing_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
	buy_book_rules JSONB,
	blurry_preview_images BOOLEAN NOT NULL DEFAULT FALSE,
	school_extract_limit_percentage INTEGER,
	class_extract_limit_percentage INTEGER,
	enable_extract_share_access_code BOOLEAN NOT NULL DEFAULT FALSE,
	temp_unlock_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
	keywords TSVECTOR,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0,
	date_system_created TIMESTAMPTZ DEFAULT NOW(),
	date_user_created TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS publisher__name__index ON publisher(name);
CREATE UNIQUE INDEX IF NOT EXISTS publisher__external_identifier__index ON publisher(external_identifier);
CREATE INDEX IF NOT EXISTS publisher__contact_name__index ON publisher(contact_name);
CREATE INDEX IF NOT EXISTS publisher__school_extract_limit_percentage__index ON publisher (school_extract_limit_percentage);
CREATE INDEX IF NOT EXISTS publisher__class_extract_limit_percentage__index ON publisher (class_extract_limit_percentage);
CREATE INDEX IF NOT EXISTS publisher__temp_unlock_opt_in__index ON publisher (temp_unlock_opt_in);
CREATE INDEX IF NOT EXISTS publisher__keywords__index ON publisher USING GIN(keywords);
CREATE INDEX IF NOT EXISTS publisher__date_system_created__index ON publisher(date_system_created);
CREATE INDEX IF NOT EXISTS publisher__date_user_created__index ON publisher(date_user_created);

CREATE OR REPLACE FUNCTION publisher__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.name, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.external_identifier, '')), 'C')
			|| setweight(to_tsvector('english', COALESCE(new.contact_name, '')), 'B')
		;
		return new;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS publisher__keywords__trigger ON publisher;
CREATE TRIGGER publisher__keywords__trigger BEFORE INSERT OR UPDATE ON publisher FOR EACH ROW EXECUTE PROCEDURE publisher__keywords__func_trigger();

CREATE TABLE IF NOT EXISTS imprint (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	external_identifier VARCHAR(255),
	buy_book_rules JSONB,
	publisher_name_log VARCHAR(255) NOT NULL,
	publisher_id INT NOT NULL,
	keywords TSVECTOR,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS imprint__name__index ON imprint(name);
CREATE UNIQUE INDEX IF NOT EXISTS imprint__external_identifier__index ON imprint(external_identifier);
CREATE INDEX IF NOT EXISTS imprint__publisher_id__index ON imprint(publisher_id);
CREATE INDEX IF NOT EXISTS imprint__keywords__index ON imprint USING GIN(keywords);

CREATE OR REPLACE FUNCTION imprint__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.name, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.external_identifier, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.publisher_name_log, '')), 'C')
		;
		return new;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS imprint__keywords__trigger ON imprint;
CREATE TRIGGER imprint__keywords__trigger BEFORE INSERT OR UPDATE ON imprint FOR EACH ROW EXECUTE PROCEDURE imprint__keywords__func_trigger();

CREATE TABLE IF NOT EXISTS author (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0,
	date_system_created TIMESTAMPTZ DEFAULT NOW(),
	date_user_created TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS author__name__index ON author(first_name, last_name);
CREATE INDEX IF NOT EXISTS author__date_system_created__index ON author(date_system_created);
CREATE INDEX IF NOT EXISTS author__date_user_created__index ON author(date_user_created);

CREATE TABLE IF NOT EXISTS asset_authors (
	asset_id INTEGER NOT NULL,
	author_id INTEGER NOT NULL,
	role_code VARCHAR(6) NOT NULL DEFAULT 'A01',
	role_code_short VARCHAR(6) NOT NULL DEFAULT 'A',
	sort_order INT NOT NULL DEFAULT 0,
	PRIMARY KEY (asset_id, author_id, role_code),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS asset_authors__sort_order__index ON asset_authors(sort_order);
CREATE INDEX IF NOT EXISTS asset_authors__role_code_short__index ON asset_authors(role_code_short);

CREATE OR REPLACE FUNCTION asset_authors__role_code_short__trigger() RETURNS trigger AS $$
begin
	new.role_code_short := substring(new.role_code FROM 1 FOR 1);
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_authors__role_code_short__updater ON asset_authors;
CREATE TRIGGER asset_authors__role_code_short__updater BEFORE INSERT OR UPDATE ON asset_authors FOR EACH ROW EXECUTE PROCEDURE asset_authors__role_code_short__trigger();

CREATE TABLE IF NOT EXISTS subject (
	code VARCHAR(12) PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS subject__name__index ON subject(name);

-- The BIC 2.1 subject list
INSERT INTO subject (code, name) VALUES
	('A', 'The arts'),
	('AB', 'The arts: general issues'),
	('ABA', 'Theory of art'),
	('ABC', 'Conservation, restoration & care of artworks'),
	('ABK', 'Forgery, falsification & theft of artworks'),
	('ABQ', 'Art: financial aspects'),
	('AC', 'History of art / art & design styles'),
	('ACB', 'Art styles not defined by date'),
	('ACBK', 'Art of indigenous peoples'),
	('ACBN', 'Naive art'),
	('ACBP', 'Oriental art'),
	('ACBS', 'Colonial art'),
	('ACC', 'History of art: pre-history'),
	('ACG', 'History of art: ancient & classical art,BCE to c 500 CE'),
	('ACK', 'History of art: Byzantine & Medieval art c 500 CE to c 1400'),
	('ACN', 'History of art & design styles: c 1400 to c 1600'),
	('ACND', 'Renaissance art'),
	('ACNH', 'Art & design styles: Mannerism'),
	('ACQ', 'History of art & design styles: c 1600 to c 1800'),
	('ACQB', 'Art & design styles: Baroque'),
	('ACQH', 'Art & design styles: Classicism'),
	('ACV', 'History of art & design styles: c 1800 to c 1900'),
	('ACVC', 'Art & design styles: Romanticism'),
	('ACVM', 'Art & design styles: Pre-Raphaelite art'),
	('ACVN', 'Art & design styles: Arts & Crafts style'),
	('ACVT', 'Art & design styles: Impressionism & Post-Impressionism'),
	('ACVY', 'Art & design styles: Art Nouveau'),
	('ACX', 'History of art & design styles: from c 1900 -'),
	('ACXD', 'Art & design styles: c 1900 to c 1960'),
	('ACXD1', 'Art & design styles: Expressionism'),
	('ACXD2', 'Art & design styles: Modernist design & Bauhaus'),
	('ACXD3', 'Art & design styles: Art Deco'),
	('ACXD5', 'Art & design styles: Cubism'),
	('ACXD7', 'Art & design styles: Surrealism & Dada'),
	('ACXD9', 'Art & design styles: Abstract Expressionism'),
	('ACXJ', 'Art & design styles: from c 1960'),
	('ACXJ1', 'Art & design styles: Pop art'),
	('ACXJ4', 'Art & design styles: Minimalism'),
	('ACXJ5', 'Art & design styles: Conceptual art'),
	('ACXJ8', 'Art & design styles: Postmodernism'),
	('AF', 'Art forms'),
	('AFC', 'Painting & paintings'),
	('AFCC', 'Watercolours'),
	('AFCL', 'Oils'),
	('AFF', 'Drawing & drawings'),
	('AFH', 'Prints & printmaking'),
	('AFJ', 'Other graphic art forms'),
	('AFJD', 'Collage & photomontage'),
	('AFJG', 'Graffiti & street art'),
	('AFK', 'Non-graphic art forms'),
	('AFKB', 'Sculpture'),
	('AFKC', 'Carvings: artworks'),
	('AFKG', 'Precious metal, precious stones & jewellery: artworks & design'),
	('AFKN', 'Installation art'),
	('AFKP', 'Performance art'),
	('AFKV', 'Electronic, holographic & video art'),
	('AFP', 'Ceramic arts, pottery, glass'),
	('AFPC', 'Ceramics: artworks'),
	('AFPM', 'Mosaics: artworks'),
	('AFPS', 'Stained glass: artworks'),
	('AFT', 'Decorative arts'),
	('AFTB', 'Folk art'),
	('AFTC', 'Celtic arts & crafts'),
	('AFW', 'Textile artworks'),
	('AFWD', 'Textile artworks: carpets & rugs'),
	('AFWH', 'Textile artworks: tapestries, hangings & quilts'),
	('AFY', 'Body art & tattooing'),
	('AG', 'Art treatments & subjects'),
	('AGB', 'Individual artists, art monographs'),
	('AGC', 'Exhibition catalogues & specific collections'),
	('AGH', 'Human figures depicted in art'),
	('AGHF', 'Portraits in art'),
	('AGHN', 'Nudes depicted in art'),
	('AGHX', 'Erotic art'),
	('AGK', 'Small-scale, secular & domestic scenes in art'),
	('AGN', 'Animals & nature in art (still life, landscapes & seascapes, etc)'),
	('AGNB', 'Botanical art'),
	('AGP', 'Man-made objects depicted in art (cityscapes, machines, etc)'),
	('AGR', 'Religious subjects depicted in art'),
	('AGZ', 'Art techniques & principles'),
	('AJ', 'Photography & photographs'),
	('AJB', 'Individual photographers'),
	('AJC', 'Photographs: collections'),
	('AJCP', 'Photographs: portraits'),
	('AJCR', 'Photographic reportage'),
	('AJCX', 'Erotic & nude photography'),
	('AJG', 'Photographic equipment & techniques'),
	('AJR', 'Special kinds of photography'),
	('AJRD', 'Cinematography, television camerawork'),
	('AJRH', 'Video photography'),
	('AJRK', 'Aerial photography'),
	('AK', 'Industrial / commercial art & design'),
	('AKB', 'Individual designers'),
	('AKC', 'Graphic design'),
	('AKD', 'Typography & lettering'),
	('AKH', 'Book design'),
	('AKL', 'Illustration & commercial art'),
	('AKLB', 'Illustration'),
	('AKLC', 'Comic book & cartoon art'),
	('AKLC1', 'Graphic novel & Manga artwork'),
	('AKLP', 'Poster art'),
	('AKP', 'Product design'),
	('AKR', 'Furniture design'),
	('AKT', 'Fashion & textiles: design'),
	('AKTA', 'Fashion design & theory'),
	('AKTH', 'History of fashion'),
	('AKTX', 'Textile design & theory'),
	('AM', 'Architecture'),
	('AMA', 'Theory of architecture'),
	('AMB', 'Individual architects & architectural firms'),
	('AMC', 'Architectural structure & design'),
	('AMCR', 'Environmentally-friendly architecture & design'),
	('AMD', 'Architecture: professional practice'),
	('AMG', 'Public buildings: civic, commercial, industrial, etc'),
	('AMGC', 'Concert halls, arenas, stadia'),
	('AMGD', 'Memorials, monuments'),
	('AMK', 'Residential buildings, domestic buildings'),
	('AMKD', 'Houses, apartments, flats, etc'),
	('AMKH', 'Palaces, chateaux, country houses'),
	('AMKL', 'Castles & fortifications'),
	('AMN', 'Religious buildings'),
	('AMR', 'Professional interior design'),
	('AMV', 'Landscape art & architecture'),
	('AMVD', 'City & town planning - architectural aspects'),
	('AMX', 'History of architecture'),
	('AN', 'Theatre studies'),
	('ANB', 'Theatre: individual actors & directors'),
	('ANC', 'Acting techniques'),
	('ANF', 'Theatre direction & production'),
	('ANH', 'Theatre: technical & background skills'),
	('ANS', 'Theatre management'),
	('AP', 'Film, TV & radio'),
	('APB', 'Individual actors & performers'),
	('APF', 'Films, cinema'),
	('APFA', 'Film theory & criticism'),
	('APFB', 'Individual film directors, film-makers'),
	('APFD', 'Film scripts & screenplays'),
	('APFG', 'Film guides & reviews'),
	('APFN', 'Film: styles & genres'),
	('APFR', 'Documentary films'),
	('APFV', 'Animated films'),
	('APFX', 'Film production: technical & background skills'),
	('APT', 'Television'),
	('APTD', 'Television scripts & screenplays'),
	('APTS', 'Television soap operas'),
	('APTX', 'Television production: technical & background skills'),
	('APW', 'Radio'),
	('APWD', 'Radio scripts'),
	('AS', 'Dance & other performing arts'),
	('ASD', 'Dance'),
	('ASDC', 'Choreography'),
	('ASDL', 'Ballet'),
	('ASDR', 'Ballroom dancing'),
	('ASDT', 'Contemporary dance'),
	('ASDX', 'Folk dancing'),
	('ASZ', 'Other performing arts'),
	('ASZB', 'Performing arts: comedy'),
	('ASZC', 'Mime'),
	('ASZD', 'Street theatre'),
	('ASZG', 'Conjuring & magic'),
	('ASZH', 'Variety shows, music hall, cabaret'),
	('ASZJ', 'Juggling'),
	('ASZM', 'Puppetry, miniature & toy theatre'),
	('ASZP', 'Pageants, parades, festivals'),
	('ASZW', 'Circus'),
	('ASZX', 'Animal spectacles'),
	('AV', 'Music'),
	('AVA', 'Theory of music & musicology'),
	('AVC', 'Music reviews & criticism'),
	('AVD', 'Discographies & buyer''s guides'),
	('AVG', 'Music: styles & genres'),
	('AVGC', 'Western "classical" music'),
	('AVGC1', 'Early music (up to c 1000 CE)'),
	('AVGC2', 'Medieval & Renaissance music (c 1000 to c 1600)'),
	('AVGC3', 'Baroque music (c 1600 to c 1750)'),
	('AVGC4', 'Classical music (c 1750 to c 1830)'),
	('AVGC5', 'Romantic music (c 1830 to c 1900)'),
	('AVGC6', '20th century & contemporary classical music'),
	('AVGC8', 'Choral music'),
	('AVGC9', 'Opera'),
	('AVGD', 'Sacred & religious music'),
	('AVGE', 'Non-Western music: traditional & "classical"'),
	('AVGF', 'Light orchestral & big band music'),
	('AVGG', 'Brass band, military music & marches'),
	('AVGH', 'Folk & traditional music'),
	('AVGJ', 'Jazz'),
	('AVGK', 'Blues'),
	('AVGL', 'Country & Western music'),
	('AVGM', 'Musicals'),
	('AVGN', 'Popular music, easy listening'),
	('AVGP', 'Rock & Pop music'),
	('AVGQ', 'Soul & R ''n'' B'),
	('AVGR', 'Rap & Hip-Hop'),
	('AVGS', 'Reggae'),
	('AVGT', 'Heavy Metal music'),
	('AVGU', 'Punk, New Wave & Indie'),
	('AVGV', 'Electronic music'),
	('AVGW', 'World music'),
	('AVGZ', 'Ambient & New Age music'),
	('AVH', 'Individual composers & musicians, specific bands & groups'),
	('AVQ', 'Musical scores, lyrics & libretti'),
	('AVQS', 'Songbooks'),
	('AVR', 'Musical instruments & instrumental ensembles'),
	('AVRB', 'Orchestras'),
	('AVRD', 'Chamber ensembles'),
	('AVRG', 'Keyboard instruments'),
	('AVRJ', 'Percussion instruments'),
	('AVRL', 'String instruments'),
	('AVRL1', 'Guitar'),
	('AVRN', 'Wind instruments'),
	('AVRQ', 'Mechanical musical instruments'),
	('AVRS', 'Electronic musical instruments'),
	('AVS', 'Techniques of music / music tutorials'),
	('AVX', 'Music recording & reproduction'),
	('B', 'Biography & True Stories'),
	('BG', 'Biography: general'),
	('BGA', 'Autobiography: general'),
	('BGB', 'Biography: business & industry'),
	('BGBA', 'Autobiography: business & industry'),
	('BGF', 'Biography: arts & entertainment'),
	('BGFA', 'Autobiography: arts & entertainment'),
	('BGH', 'Biography: historical, political & military'),
	('BGHA', 'Autobiography: historical, political & military'),
	('BGL', 'Biography: literary'),
	('BGLA', 'Autobiography: literary'),
	('BGR', 'Biography: royalty'),
	('BGRA', 'Autobiography: royalty'),
	('BGS', 'Biography: sport'),
	('BGSA', 'Autobiography: sport'),
	('BGT', 'Biography: science, technology & medicine'),
	('BGTA', 'Autobiography: science, technology & medicine'),
	('BGX', 'Biography: religious & spiritual'),
	('BGXA', 'Autobiography: religious & spiritual'),
	('BJ', 'Diaries, letters & journals'),
	('BK', 'Collected biographies'),
	('BM', 'Memoirs'),
	('BT', 'True stories'),
	('BTC', 'True crime'),
	('BTH', 'True stories: discovery / historical / scientific'),
	('BTM', 'True war  & combat stories'),
	('BTP', 'True stories of heroism, endurance & survival'),
	('BTX', 'Erotic confessions & true stories'),
	('C', 'Language'),
	('CB', 'Language: reference & general'),
	('CBD', 'Dictionaries'),
	('CBDX', 'Bilingual & multilingual dictionaries'),
	('CBF', 'Thesauri'),
	('CBG', 'Usage & grammar guides'),
	('CBP', 'Public speaking guides'),
	('CBV', 'Creative writing & creative writing guides'),
	('CBVS', 'Screenwriting techniques'),
	('CBW', 'Writing & editing guides'),
	('CBWJ', 'Journalistic style guides'),
	('CBWT', 'Technical writing'),
	('CBX', 'Language: history & general works'),
	('CF', 'linguistics'),
	('CFA', 'Philosophy of language'),
	('CFB', 'Sociolinguistics'),
	('CFC', 'Literacy'),
	('CFD', 'Psycholinguistics'),
	('CFDC', 'Language acquisition'),
	('CFDM', 'Bilingualism & multilingualism'),
	('CFF', 'Historical & comparative linguistics'),
	('CFFD', 'Dialect, slang & jargon'),
	('CFG', 'Semantics, discourse analysis, etc'),
	('CFGA', 'Semantics & pragmatics'),
	('CFGR', 'Discourse analysis'),
	('CFH', 'Phonetics, phonology'),
	('CFK', 'Grammar, syntax & morphology'),
	('CFL', 'Palaeography (history of writing)'),
	('CFLA', 'Writing systems, alphabets'),
	('CFM', 'Lexicography'),
	('CFP', 'Translation & interpretation'),
	('CFX', 'Computational linguistics'),
	('CFZ', 'Sign languages, Braille & other linguistic communication'),
	('CJ', 'Language teaching & learning (other than ELT)'),
	('CJA', 'Language teaching theory & methods'),
	('CJB', 'Language teaching & learning material & coursework'),
	('CJBG', 'Grammar & vocabulary'),
	('CJBR', 'Language readers'),
	('CJBT', 'Language self-study texts'),
	('CJBV', 'Language learning: audio-visual & multimedia'),
	('CJC', 'Language learning: specific skills'),
	('CJCK', 'Speaking / pronunciation skills'),
	('CJCL', 'Listening skills'),
	('CJCR', 'Reading skills'),
	('CJCW', 'Writing skills'),
	('D', 'Literature & literary studies'),
	('DB', 'Classical texts'),
	('DC', 'Poetry'),
	('DCF', 'Poetry by individual poets'),
	('DCQ', 'Poetry anthologies (various poets)'),
	('DD', 'Plays, playscripts'),
	('DDS', 'Shakespeare plays'),
	('DN', 'Prose: non-fiction'),
	('DNF', 'Literary essays'),
	('DNJ', 'Reportage & collected journalism'),
	('DNS', 'Speeches'),
	('DQ', 'Anthologies (non-poetry)'),
	('DS', 'Literature: history & criticism'),
	('DSA', 'Literary theory'),
	('DSB', 'Literary studies: general'),
	('DSBB', 'Literary studies: classical, early & medieval'),
	('DSBD', 'Literary studies: c 1500 to c 1800'),
	('DSBF', 'Literary studies: c 1800 to c 1900 '),
	('DSBH', 'Literary studies: from c 1900 -'),
	('DSBH5', 'Literary studies: post-colonial literature'),
	('DSC', 'Literary studies: poetry & poets'),
	('DSG', 'Literary studies: plays & playwrights'),
	('DSGS', 'Shakespeare studies & criticism'),
	('DSK', 'Literary studies: fiction, novelists & prose writers'),
	('DSR', 'Literary reference works'),
	('DSRC', 'Literary companions, book reviews & guides'),
	('DSY', 'Children’s & teenage literature studies'),
	('DSYC', 'Children’s & teenage book reviews & guides'),
	('E', 'English language teaching (ELT)'),
	('EB', 'ELT background & reference material'),
	('EBA', 'ELT: teaching theory & methods'),
	('EBAL', 'Applied linguistics for ELT'),
	('EBAR', 'ELT resource books for teachers'),
	('EBD', 'ELT dictionaries & reference'),
	('EL', 'ELT: learning material & coursework'),
	('ELG', 'ELT grammar, vocabulary & pronunciation'),
	('ELGG', 'ELT grammar'),
	('ELGP', 'ELT pronunciation'),
	('ELGV  ', 'ELT vocabulary'),
	('ELH', 'ELT graded readers'),
	('ELHB', 'ELT non-fiction & background readers'),
	('ELHF', 'ELT literature & fiction readers'),
	('ELM', 'ELT non-book material & resources'),
	('ELP', 'ELT workbooks, practice books & exercises'),
	('ELS', 'ELT self-study texts'),
	('ELV', 'ELT examination practice tests'),
	('ELX', 'ELT: specific skills'),
	('ELXD', 'ELT: speaking skills'),
	('ELXG', 'ELT: listening skills'),
	('ELXJ', 'ELT: reading skills'),
	('ELXN', 'ELT: writing skills'),
	('ES', 'ELT: English for specific purposes'),
	('ESB', 'ELT: English for business'),
	('ESF', 'ELT: English for academic purposes'),
	('EST', 'ELT: English for technical & scientific purposes'),
	('ESV', 'ELT: English for travel & communications'),
	('F', 'Fiction & related items'),
	('FA', 'Modern & contemporary fiction (post c 1945)'),
	('FC', 'Classic fiction (pre c 1945)'),
	('FF', 'Crime & mystery'),
	('FFC', 'Classic crime'),
	('FFH', 'Historical mysteries'),
	('FH', 'Thriller / suspense'),
	('FHD', 'Espionage & spy thriller'),
	('FHP', 'Political / legal thriller'),
	('FJ', 'Adventure'),
	('FJH', 'Historical adventure'),
	('FJM', 'War & combat fiction'),
	('FJMC', 'Napoleonic War fiction'),
	('FJMF', 'First World War fiction'),
	('FJMS', 'Second World War fiction'),
	('FJMV', 'Vietnam War fiction'),
	('FJW', 'Westerns'),
	('FK', 'Horror & ghost stories'),
	('FKC', 'Classic horror & ghost stories'),
	('FL', 'Science fiction'),
	('FLC', 'Classic science fiction'),
	('FLS', 'Space opera'),
	('FM', 'Fantasy'),
	('FMR', 'Fantasy romance'),
	('FP', 'Erotic fiction'),
	('FQ', 'Myth & legend told as fiction'),
	('FR', 'Romance'),
	('FRD', 'Adult & contemporary romance'),
	('FRH', 'Historical romance'),
	('FT', 'Sagas'),
	('FV', 'Historical fiction'),
	('FW', 'Religious & spiritual fiction'),
	('FX', 'Graphic novels'),
	('FXA', 'Graphic novels: Manga'),
	('FXL', 'Graphic novels: literary & memoirs'),
	('FXS', 'Graphic novels: superheroes & super-villains'),
	('FXZ', 'Graphic novels: true stories & non-fiction'),
	('FY', 'Fiction: special features'),
	('FYB', 'Short stories'),
	('FYT', 'Fiction in translation'),
	('FZ', 'Fiction-related items'),
	('FZC', 'Fiction companions'),
	('FZG', 'Graphic novels: history & criticism'),
	('G', 'Reference, information & interdisciplinary subjects'),
	('GB', 'Encyclopaedias & reference works'),
	('GBA', 'General encyclopaedias'),
	('GBC', 'Reference works'),
	('GBCB', 'Dictionaries of biography (Who''s Who)'),
	('GBCQ', 'Dictionaries of quotations'),
	('GBCR', 'Bibliographies, catalogues'),
	('GBCS', 'Serials, periodicals, abstracts, indexes'),
	('GBCT', 'Directories'),
	('GBCY', 'Yearbooks, annuals, almanacs'),
	('GBG', 'Geographical reference'),
	('GBGM', 'World atlases / world maps'),
	('GBGP', 'Place names & gazetteers'),
	('GL', 'Library & information sciences'),
	('GLC', 'Library, archive & information management'),
	('GLF', 'IT, Internet & electronic resources in libraries'),
	('GLH', 'Acquisitions & collection development'),
	('GLK', 'Bibliographic & subject control'),
	('GLM', 'Library & information services'),
	('GLMA', 'Academic & specialist libraries '),
	('GLMB', 'Public libraries'),
	('GLMC', 'School libraries & young reader services  '),
	('GLMG', 'Reference services'),
	('GLML', 'Circulation services (eg interlibrary loans)'),
	('GLMX', 'Community & outreach services'),
	('GLP', 'Archiving, preservation & digitisation '),
	('GM', 'Museology & heritage studies'),
	('GP', 'Research & information: general'),
	('GPF', 'Information theory'),
	('GPFC', 'Cybernetics & systems theory'),
	('GPH', 'Data analysis: general'),
	('GPJ', 'Coding theory & cryptology'),
	('GPQ', 'Decision theory: general'),
	('GPQD', 'Risk assessment'),
	('GPS', 'Research methods: general'),
	('GT', 'Interdisciplinary studies'),
	('GTB', 'Regional studies'),
	('GTC', 'Communication studies'),
	('GTE', 'Semiotics / semiology'),
	('GTF', 'Development studies'),
	('GTG', 'General studies'),
	('GTH', 'Flags, emblems, symbols, logos'),
	('GTJ', 'Peace studies & conflict resolution'),
	('GTN', 'Institutions & learned societies: general'),
	('GTR', 'Cognitive science'),
	('H', 'Humanities'),
	('HB', 'History'),
	('HBA', 'History: theory & methods'),
	('HBAH', 'Historiography'),
	('HBG', 'General & world history'),
	('HBJ', 'Regional & national history'),
	('HBJD', 'European history'),
	('HBJD1', 'British & Irish history'),
	('HBJF', 'Asian history'),
	('HBJF1', 'Middle Eastern history'),
	('HBJH', 'African history'),
	('HBJK', 'History of the Americas'),
	('HBJM', 'Australasian & Pacific history'),
	('HBJQ', 'History of other lands'),
	('HBL', 'History: earliest times to present day'),
	('HBLA', 'Ancient history: to c 500 CE'),
	('HBLA1', 'Classical history / classical civilisation'),
	('HBLC', 'Early history: c 500 to c 1450/1500'),
	('HBLC1', 'Medieval history'),
	('HBLH', 'Early modern history: c 1450/1500 to c 1700'),
	('HBLL', 'Modern history to 20th century: c 1700 to c 1900'),
	('HBLW', '20th century history: c 1900  to c 2000'),
	('HBLW3', 'Postwar 20th century history, from c 1945 to c 2000'),
	('HBLX', '21st century history: from c 2000 -'),
	('HBT', 'History: specific events & topics'),
	('HBTB', 'Social & cultural history'),
	('HBTD', 'Oral history'),
	('HBTG', 'Genealogy, heraldry, names & honours'),
	('HBTK', 'Industrialisation & industrial history'),
	('HBTM', 'Maritime history'),
	('HBTP', 'Historical geography'),
	('HBTP1', 'Historical maps & atlases'),
	('HBTQ', 'Colonialism & imperialism'),
	('HBTR', 'National liberation & independence, post-colonialism'),
	('HBTS', 'Slavery & abolition of slavery'),
	('HBTV', 'Revolutions, uprisings, rebellions'),
	('HBTV2', 'French Revolution'),
	('HBTV4', 'Russian Revolution'),
	('HBTW', 'The Cold War'),
	('HBTZ', 'Genocide & ethnic cleansing'),
	('HBTZ1', 'The Holocaust'),
	('HBW', 'Military history'),
	('HBWC', 'Crusades'),
	('HBWE', 'English Civil War'),
	('HBWF', 'American War of Independence'),
	('HBWH', 'Napoleonic Wars'),
	('HBWJ', 'American Civil War'),
	('HBWL', 'Crimean War'),
	('HBWM', 'Boer Wars'),
	('HBWN', 'First World War'),
	('HBWP', 'Spanish Civil War'),
	('HBWQ', 'Second World War'),
	('HBWS', 'Military history: post WW2 conflicts'),
	('HBWS1', 'Korean War'),
	('HBWS2', 'Vietnam War'),
	('HBWS3', 'Gulf War'),
	('HBWS4', 'Afghan War'),
	('HBWS5', 'Iraq War'),
	('HD', 'Archaeology'),
	('HDA', 'Archaeological theory'),
	('HDD', 'Archaeology by period / region'),
	('HDDA', 'Prehistoric archaeology'),
	('HDDC', 'Middle & Near Eastern archaeology'),
	('HDDG', 'Egyptian archaeology / Egyptology'),
	('HDDH', 'Biblical archaeology'),
	('HDDK', 'Classical Greek & Roman archaeology'),
	('HDDM', 'Medieval European archaeology'),
	('HDL', 'Landscape archaeology'),
	('HDP', 'Environmental archaeology'),
	('HDR', 'Underwater archaeology'),
	('HDT', 'Industrial archaeology'),
	('HDW', 'Archaeological science, methodology & techniques'),
	('HP', 'Philosophy'),
	('HPC', 'History of Western philosophy'),
	('HPCA', 'Western philosophy: Ancient, to c 500'),
	('HPCB', 'Western philosophy: Medieval & Renaissance, c 500 to c 1600'),
	('HPCD', 'Western philosophy: c 1600 to c 1900'),
	('HPCD1', 'Western philosophy: Enlightenment'),
	('HPCF', 'Western philosophy, from c 1900 -'),
	('HPCF3', 'Phenomenology & Existentialism'),
	('HPCF5', 'Analytical philosophy & Logical Positivism'),
	('HPCF7', 'Deconstructionism, Structuralism, Post-structuralism'),
	('HPD', 'Non-Western philosophy'),
	('HPDC', 'Islamic & Arabic philosophy'),
	('HPDF', 'Oriental & Indian philosophy'),
	('HPJ', 'Philosophy: metaphysics & ontology'),
	('HPK', 'Philosophy: epistemology & theory of knowledge'),
	('HPL', 'Philosophy: logic'),
	('HPM', 'Philosophy of mind'),
	('HPN', 'Philosophy: aesthetics'),
	('HPQ', 'Ethics & moral philosophy'),
	('HPS', 'Social & political philosophy'),
	('HPX', 'Popular philosophy'),
	('HR', 'Religion & beliefs'),
	('HRA', 'Religion: general'),
	('HRAB', 'Philosophy of religion'),
	('HRAB1', 'Nature & existence of God'),
	('HRAC', 'Comparative religion'),
	('HRAF', 'Interfaith relations'),
	('HRAM', 'Religious issues & debates'),
	('HRAM1', 'Religious ethics'),
	('HRAM2', 'Religion & politics'),
	('HRAM3', 'Religion & science'),
	('HRAM6', 'Religious fundamentalism'),
	('HRAM7 ', 'Blasphemy, heresy, apostasy'),
	('HRAM9', 'Religious intolerance, persecution & conflict'),
	('HRAX', 'History of religion'),
	('HRC', 'Christianity'),
	('HRCA', 'The historical Jesus'),
	('HRCC', 'Christian Churches & denominations'),
	('HRCC1', 'The Early Church'),
	('HRCC2', 'Church history'),
	('HRCC7', 'Roman Catholicism, Roman Catholic Church'),
	('HRCC8', 'Orthodox & Oriental Churches'),
	('HRCC9', 'Protestantism & Protestant Churches'),
	('HRCC91', 'Anglican & Episcopalian Churches, Church of England'),
	('HRCC92', 'Baptist Churches'),
	('HRCC93', 'Calvinist, Reformed & Presbyterian Churches'),
	('HRCC95', 'Methodist Churches'),
	('HRCC96', 'Pentecostal Churches'),
	('HRCC97', 'Quakers (Religious Society of Friends)'),
	('HRCC99', 'Other Nonconformist & Evangelical Churches'),
	('HRCF', 'Bibles'),
	('HRCF1', 'Old Testaments'),
	('HRCF2', 'New Testaments'),
	('HRCG ', 'Biblical studies & exegesis'),
	('HRCG1 ', 'Biblical commentaries'),
	('HRCG2', 'Biblical concordances'),
	('HRCG3 ', 'Biblical exegesis & hermeneutics'),
	('HRCG7 ', 'Bible studies: for individual or small group study'),
	('HRCG9', 'Bible readings, selections & meditations'),
	('HRCJ', 'Ecumenism'),
	('HRCL', 'Christian liturgy, prayerbooks & hymnals'),
	('HRCL1', 'Christian prayerbooks'),
	('HRCL2', 'Christian hymnals'),
	('HRCM', 'Christian theology'),
	('HRCP', 'Christian sermons'),
	('HRCR', 'Christian worship, rites & ceremonies'),
	('HRCR1', 'Christian prayer'),
	('HRCS', 'Christian spirituality & religious experience'),
	('HRCS1', 'Christian mysticism'),
	('HRCV', 'Christian life & practice'),
	('HRCV1', 'Christian sacraments'),
	('HRCV2', 'Christian instruction'),
	('HRCV3', 'Christian counselling'),
	('HRCV4', 'Christian aspects of sexuality, gender & relationships'),
	('HRCV9', 'Personal Christian testimony & popular inspirational works'),
	('HRCX', 'Christian institutions & organizations'),
	('HRCX1', 'Christian leaders & leadership'),
	('HRCX4', 'Christian ministry & pastoral activity'),
	('HRCX6', 'Christian social thought & activity'),
	('HRCX7', 'Christian mission & evangelism'),
	('HRCX8', 'Christian communities & monasticism'),
	('HRCZ', 'Christian & quasi-Christian cults & sects'),
	('HRE', 'Buddhism'),
	('HREC', 'Buddhist worship, rites & ceremonies'),
	('HREP', 'Buddhist life & practice'),
	('HRES', 'Buddhist sacred texts'),
	('HREX', 'Tibetan Buddhism'),
	('HREZ', 'Zen Buddhism'),
	('HRG', 'Hinduism'),
	('HRGC', 'Hindu worship, rites & ceremonies'),
	('HRGP', 'Hindu life & practice'),
	('HRGS', 'Hindu sacred texts'),
	('HRH', 'Islam'),
	('HRHC', 'Islamic worship, rites & ceremonies'),
	('HRHP', 'Islamic life & practice'),
	('HRHS', 'The Koran'),
	('HRHT', 'Islamic theology'),
	('HRHX', 'Sufism & Islamic mysticism'),
	('HRJ', 'Judaism'),
	('HRJC', 'Judaism: worship, rites & ceremonies'),
	('HRJP', 'Judaism: life & practice'),
	('HRJS', 'Judaism: sacred texts'),
	('HRJT', 'Judaism: theology'),
	('HRJX', 'Judaism: mysticism'),
	('HRK', 'Other non-Christian religions'),
	('HRKB', 'Baha''i'),
	('HRKJ', 'Jainism'),
	('HRKN', 'Oriental religions'),
	('HRKN1', 'Confucianism'),
	('HRKN3', 'Shintoism'),
	('HRKN5', 'Taoism'),
	('HRKP', 'Ancient religions & mythologies'),
	('HRKP1', 'Ancient Egyptian religion & mythology'),
	('HRKP2', 'Celtic religion & mythology'),
	('HRKP3', 'Ancient Greek religion & mythology'),
	('HRKP4', 'Roman religion & mythology'),
	('HRKP5', 'Norse religion & mythology'),
	('HRKS', 'Sikhism'),
	('HRKT', 'Tribal religions'),
	('HRKZ', 'Zoroastrianism'),
	('HRL', 'Aspects of religion (non-Christian)'),
	('HRLB', 'Theology'),
	('HRLC', 'Sacred texts'),
	('HRLC1', 'Criticism & exegesis of sacred texts'),
	('HRLD', 'Prayers & liturgical material'),
	('HRLF', 'Worship, rites & ceremonies'),
	('HRLF9', 'Prayer'),
	('HRLK', 'Spirituality & religious experience'),
	('HRLK2', 'Mysticism'),
	('HRLM', 'Religious life & practice'),
	('HRLM3', 'Religious instruction'),
	('HRLM5', 'Religious counselling'),
	('HRLM7', 'Religious aspects of sexuality, gender & relationships'),
	('HRLP', 'Religious institutions & organizations'),
	('HRLP1', 'Religious & spiritual leaders'),
	('HRLP5', 'Religious social & pastoral thought & activity'),
	('HRLP7', 'Religious communities & monasticism'),
	('HRQ', 'Alternative belief systems'),
	('HRQA', 'Humanist & secular alternatives to religion'),
	('HRQA5', 'Agnosticism & atheism'),
	('HRQC', 'Eclectic & esoteric religions & belief systems'),
	('HRQC1', 'Gnosticism'),
	('HRQC5', 'Theosophy & Anthroposophy'),
	('HRQM', 'Contemporary non-Christian & para-Christian cults & sects'),
	('HRQM2', 'Spiritualism'),
	('HRQX', 'Occult studies'),
	('HRQX2', 'Magic, alchemy & hermetic thought'),
	('HRQX5', 'Witchcraft'),
	('HRQX9', 'Satanism & demonology'),
	('J', 'Society & social sciences'),
	('JF', 'Society & culture: general'),
	('JFC', 'Cultural studies'),
	('JFCA', 'Popular culture'),
	('JFCD', 'Material culture'),
	('JFCK', 'Fashion & society'),
	('JFCV', 'Food & society'),
	('JFCX', 'History of ideas'),
	('JFD', 'Media studies'),
	('JFDT', 'TV & society'),
	('JFDV', 'Advertising & society'),
	('JFF', 'Social issues & processes'),
	('JFFA', 'Poverty  & unemployment'),
	('JFFB', 'Housing & homelessness'),
	('JFFC', 'Social impact of disasters'),
	('JFFC1', 'Famine'),
	('JFFD', 'Refugees & political asylum'),
	('JFFE', 'Violence in society'),
	('JFFE1', 'Child abuse'),
	('JFFE2', 'Sexual abuse & harassment'),
	('JFFE3', 'Domestic violence'),
	('JFFG', 'Disability: social aspects'),
	('JFFH', 'Illness & addiction: social aspects'),
	('JFFH1', 'Drug & substance abuse: social aspects'),
	('JFFH2', 'HIV / AIDS: social aspects'),
	('JFFJ', 'Social discrimination & inequality'),
	('JFFK', 'Feminism & feminist theory'),
	('JFFL', 'Political correctness'),
	('JFFM', 'Social mobility'),
	('JFFN', 'Migration, immigration & emigration'),
	('JFFP', 'Social interaction'),
	('JFFR', 'Social forecasting, future studies'),
	('JFFS', 'Globalization'),
	('JFFT', 'Consumerism'),
	('JFFU', 'Public safety issues'),
	('JFFX', 'Corruption in society'),
	('JFFZ', 'Animals & society'),
	('JFH', 'Popular beliefs & controversial knowledge'),
	('JFHC', 'Conspiracy theories'),
	('JFHF', 'Folklore, myths & legends'),
	('JFHX', 'Hoaxes & deceptions'),
	('JFM', 'Ethical issues & debates'),
	('JFMA', 'Ethical issues: abortion & birth control'),
	('JFMC', 'Ethical issues: capital punishment'),
	('JFMD', 'Ethical issues: censorship'),
	('JFME', 'Ethical issues: euthanasia & right to die'),
	('JFMG', 'Ethical issues: scientific & technological developments'),
	('JFMP', 'Ethical issues: pornography & obscenity'),
	('JFMX', 'Ethical issues: prostitution & sex industry'),
	('JFS', 'Social groups'),
	('JFSC', 'Social classes'),
	('JFSF', 'Rural communities'),
	('JFSG', 'Urban communities'),
	('JFSJ', 'Gender studies, gender groups'),
	('JFSJ1', 'Gender studies: women'),
	('JFSJ2', 'Gender studies: men'),
	('JFSJ5', 'Gender studies: transsexuals & hermaphroditism'),
	('JFSK', 'Gay & Lesbian studies'),
	('JFSK1', 'Lesbian studies'),
	('JFSK2', 'Gay studies (Gay men)'),
	('JFSL', 'Ethnic studies'),
	('JFSL1', 'Ethnic minorities & multicultural studies'),
	('JFSL3', 'Black & Asian studies'),
	('JFSL4', 'Hispanic & Latino studies'),
	('JFSL9', 'Indigenous peoples'),
	('JFSP', 'Age groups'),
	('JFSP1', 'Age groups: children'),
	('JFSP2', 'Age groups: adolescents'),
	('JFSP3', 'Age groups: adults'),
	('JFSP31', 'Age groups: the elderly'),
	('JFSR', 'Religious groups: social & cultural aspects'),
	('JFSR1', 'Jewish studies'),
	('JFSR2', 'Islamic studies'),
	('JFSS', 'Alternative lifestyles'),
	('JFSV', 'Social groups: clubs & societies'),
	('JFSV1', 'Freemasonry & secret societies'),
	('JH', 'Sociology & anthropology'),
	('JHB', 'Sociology'),
	('JHBA', 'Social theory'),
	('JHBC', 'Social research & statistics'),
	('JHBD', 'Population & demography'),
	('JHBF', 'Sociology: birth'),
	('JHBK', 'Sociology: family & relationships'),
	('JHBK5', 'Sociology: sexual relations'),
	('JHBL', 'Sociology: work & labour'),
	('JHBS', 'Sociology: sport & leisure'),
	('JHBT', 'Sociology: customs & traditions'),
	('JHBZ', 'Sociology: death & dying'),
	('JHM', 'Anthropology'),
	('JHMC', 'Social & cultural anthropology, ethnography'),
	('JHMP', 'Physical anthropology'),
	('JK', 'Social services & welfare, criminology'),
	('JKS', 'Social welfare & social services'),
	('JKSB', 'Welfare & benefit systems'),
	('JKSB1', 'Child welfare'),
	('JKSF', 'Adoption & fostering'),
	('JKSG', 'Care of the elderly'),
	('JKSM', 'Care of the mentally ill'),
	('JKSN', 'Social work'),
	('JKSN1', 'Charities, voluntary services & philanthropy'),
	('JKSN2', 'Counselling & advice services'),
	('JKSR', 'Aid & relief programmes'),
	('JKSW', 'Emergency services'),
	('JKSW1', 'Police & security services'),
	('JKSW2', 'Fire services'),
	('JKSW3', 'Ambulance & rescue services'),
	('JKV', 'Crime & criminology'),
	('JKVC', 'Causes & prevention of crime'),
	('JKVF', 'Criminal investigation & detection'),
	('JKVF1', 'Forensic science'),
	('JKVG', 'Drugs trade / drug trafficking'),
	('JKVJ', 'Street crime / gun crime'),
	('JKVK', 'Corporate crime'),
	('JKVM', 'Organized crime'),
	('JKVP', 'Penology & punishment'),
	('JKVP1', 'Prisons'),
	('JKVQ', 'Offenders'),
	('JKVQ1', 'Rehabilitation of offenders'),
	('JKVQ2', 'Juvenile offenders'),
	('JKVS', 'Probation services'),
	('JM', 'Psychology'),
	('JMA', 'Psychological theory & schools of thought'),
	('JMAF', 'Psychoanalytical theory (Freudian psychology)'),
	('JMAJ', 'Analytical & Jungian psychology'),
	('JMAL', 'Behavioural theory (Behaviourism)'),
	('JMAN', 'Humanistic psychology'),
	('JMAQ', 'Cognitivism, cognitive theory'),
	('JMB', 'Psychological methodology'),
	('JMBT', 'Psychological testing & measurement'),
	('JMC', 'Child & developmental psychology'),
	('JMD', 'Psychology of ageing'),
	('JMF', 'Family psychology'),
	('JMG', 'Psychology of gender'),
	('JMH', 'Social, group or collective psychology'),
	('JMJ', 'Occupational & industrial psychology'),
	('JMK', 'Criminal or forensic psychology'),
	('JML', 'Experimental psychology'),
	('JMM', 'Physiological & neuro-psychology, biopsychology'),
	('JMP', 'Abnormal psychology'),
	('JMQ', 'Psychology: emotions'),
	('JMR', 'Cognition & cognitive psychology'),
	('JMRL', 'Learning'),
	('JMRM', 'Memory'),
	('JMRN', 'Intelligence & reasoning'),
	('JMRP', 'Perception'),
	('JMS', 'The self, ego, identity, personality'),
	('JMT', 'States of consciousness'),
	('JMTC', 'Conscious & unconscious'),
	('JMTD', 'Sleep & dreams'),
	('JMTH', 'Hypnosis'),
	('JMTK', 'Drug-induced states'),
	('JMU', 'Sexual behaviour'),
	('JMX', 'Parapsychological studies'),
	('JN', 'Education'),
	('JNA', 'Philosophy & theory of education'),
	('JNAM', 'Moral & social purpose of education'),
	('JNB', 'History of education'),
	('JNC', 'Educational psychology'),
	('JNF', 'Educational strategies & policy'),
	('JNFD', 'Literacy strategies'),
	('JNFG', 'Numeracy strategies'),
	('JNFN', 'Inclusive education / mainstreaming'),
	('JNFR', 'Multicultural education'),
	('JNH', 'Education: care & counselling of students'),
	('JNHB', 'Bullying & anti-bullying strategies'),
	('JNHT', 'Truancy & anti-truancy strategies'),
	('JNHX', 'Exclusions / dropping out of school'),
	('JNK', 'Organization & management of education'),
	('JNKA', 'Admissions procedures'),
	('JNKC', 'Curriculum planning & development'),
	('JNKD', 'Examinations & assessment'),
	('JNKF', 'Schools inspection (& preparing for inspection)'),
	('JNKG', 'Funding of education & student finance'),
	('JNKH', 'Teaching staff'),
	('JNKH1', 'Teacher assessment'),
	('JNKN', 'Non-teaching & support staff'),
	('JNKP', 'School/community relations & school/home relations'),
	('JNKR', 'School governors & school boards'),
	('JNKS', 'Students & student organisations'),
	('JNL', 'Schools'),
	('JNLA', 'Pre-school & kindergarten'),
	('JNLB', 'Primary & middle schools'),
	('JNLC', 'Secondary schools'),
	('JNLP', 'Independent schools, private education'),
	('JNLR', 'Faith (religious) schools'),
	('JNM', 'Higher & further education, tertiary education'),
	('JNMF', 'Colleges of further education'),
	('JNMH', 'Colleges of higher education'),
	('JNMN', 'Universities'),
	('JNMT', 'Teacher training'),
	('JNP', 'Adult education, continuous learning'),
	('JNQ', 'Open learning, home learning, distance education'),
	('JNR', 'Careers guidance'),
	('JNRV', 'Industrial or vocational training'),
	('JNS', 'Teaching of specific groups & persons with special educational needs'),
	('JNSC', 'Teaching of physically disabled students'),
	('JNSC1', 'Teaching of hearing-impaired students'),
	('JNSC2', 'Teaching of visually impaired students'),
	('JNSG', 'Teaching of students with specific learning difficulties / needs'),
	('JNSG1', 'Teaching of dyslexic students'),
	('JNSG2', 'Teaching of autistic students'),
	('JNSL', 'Teaching of students with emotional & behavioural difficulties'),
	('JNSP', 'Teaching of gifted students'),
	('JNSV', 'Teaching of students with English as a second language (TESOL)'),
	('JNT', 'Teaching skills & techniques'),
	('JNU', 'Teaching of a specific subject'),
	('JNUM', 'Teachers'' classroom resources & material'),
	('JNV', 'Educational equipment & technology, computer-aided learning (CAL)'),
	('JNW', 'Extra-curricular activities'),
	('JNWT', 'Educational visits & field trips'),
	('JNZ', 'Study & learning skills: general'),
	('JP', 'Politics & government'),
	('JPA', 'Political science & theory'),
	('JPB', 'Comparative politics'),
	('JPF', 'Political ideologies'),
	('JPFB', 'Anarchism'),
	('JPFC', 'Marxism & Communism'),
	('JPFF', 'Socialism & left-of-centre democratic ideologies'),
	('JPFK', 'Liberalism & centre democratic ideologies'),
	('JPFM', 'Conservatism & right-of-centre democratic ideologies'),
	('JPFN', 'Nationalism'),
	('JPFQ', 'Fascism & Nazism'),
	('JPFR', 'Religious & theocratic ideologies'),
	('JPH', 'Political structure & processes'),
	('JPHC', 'Constitution: government & the state'),
	('JPHF', 'Elections & referenda'),
	('JPHL', 'Political leaders & leadership'),
	('JPHV', 'Political structures: democracy'),
	('JPHX', 'Political structures: totalitarianism & dictatorship'),
	('JPL', 'Political parties'),
	('JPLM', 'Political manifestos'),
	('JPP', 'Public administration'),
	('JPQ', 'Central government'),
	('JPQB', 'Central government policies'),
	('JPR', 'Regional government'),
	('JPRB', 'Regional government policies'),
	('JPS', 'International relations'),
	('JPSD', 'Diplomacy'),
	('JPSF', 'Arms negotiation & control'),
	('JPSH', 'Espionage & secret services'),
	('JPSL', 'Geopolitics'),
	('JPSN', 'International institutions'),
	('JPSN1', 'United Nations & UN agencies'),
	('JPSN2', 'EU & European institutions'),
	('JPV', 'Political control & freedoms'),
	('JPVH', 'Human rights'),
	('JPVH1', 'Civil rights & citizenship'),
	('JPVH2', 'Freedom of information & freedom of speech'),
	('JPVH3', 'Land rights'),
	('JPVH4', 'Religious freedom / freedom of worship'),
	('JPVK', 'Public opinion & polls'),
	('JPVL', 'Political campaigning & advertising'),
	('JPVN', 'Propaganda'),
	('JPVR', 'Political oppression & persecution'),
	('JPW', 'Political activism'),
	('JPWD', 'Pressure groups & lobbying'),
	('JPWF', 'Demonstrations & protest movements'),
	('JPWH', 'Non-governmental organizations (NGOs)'),
	('JPWJ', 'Political subversion'),
	('JPWL', 'Terrorism, armed struggle'),
	('JPWL1', 'Political assassinations'),
	('JPWL2', 'Terrorist attack'),
	('JPWQ', 'Revolutionary groups & movements'),
	('JPWS', 'Armed conflict'),
	('JPZ', 'Political corruption'),
	('JW', 'Warfare & defence'),
	('JWA', 'Theory of warfare & military science'),
	('JWD', 'Land forces & warfare'),
	('JWDG', 'Irregular or guerrilla forces & warfare'),
	('JWF', 'Naval forces & warfare'),
	('JWG', 'Air forces & warfare'),
	('JWH', 'Special & elite forces'),
	('JWJ', 'Military administration'),
	('JWK', 'Defence strategy, planning & research'),
	('JWKF', 'Military intelligence'),
	('JWKT', 'Military tactics'),
	('JWKW', 'Civil defence'),
	('JWL', 'War & defence operations'),
	('JWLF', 'Battles & campaigns'),
	('JWLP', 'Peacekeeping operations'),
	('JWM', 'Weapons & equipment'),
	('JWMC', 'Chemical & biological weapons'),
	('JWMN', 'Nuclear weapons'),
	('JWMV', 'Military vehicles'),
	('JWMV1', 'Tanks & military land vehicles'),
	('JWMV2', 'Military & naval ships'),
	('JWMV3', 'Military aircraft'),
	('JWT', 'Military life & institutions'),
	('JWTR', 'Regiments'),
	('JWTU', 'Uniforms & insignia'),
	('JWTY', 'Memorials & rolls of honour'),
	('JWX', 'Other warfare & defence issues'),
	('JWXF', 'Arms trade'),
	('JWXK', 'War crimes'),
	('JWXN', 'Mercenaries'),
	('JWXR', 'Prisoners of war'),
	('JWXT', 'Mutiny'),
	('JWXV', 'Military veterans'),
	('JWXZ', 'Combat / defence skills & manuals'),
	('K', 'Economics, finance, business & management'),
	('KC', 'Economics'),
	('KCA', 'Economic theory & philosophy'),
	('KCB', 'Macroeconomics'),
	('KCBM', 'Monetary economics'),
	('KCC', 'Microeconomics'),
	('KCCD', 'Domestic trade'),
	('KCD', 'Economics of industrial organisation'),
	('KCF', 'Labour economics'),
	('KCFM', 'Employment & unemployment'),
	('KCG', 'Economic growth'),
	('KCH', 'Econometrics'),
	('KCHS', 'Economic statistics'),
	('KCJ', 'Economic forecasting'),
	('KCK', 'Behavioural economics'),
	('KCL', 'International economics'),
	('KCLF', 'International finance'),
	('KCLT', 'International trade'),
	('KCLT1', 'Trade agreements'),
	('KCM', 'Development economics & emerging economies'),
	('KCN', 'Environmental economics'),
	('KCP', 'Political economy'),
	('KCQ', 'Health economics'),
	('KCR', 'Welfare economics'),
	('KCS', 'Economic systems & structures'),
	('KCT', 'Agricultural economics'),
	('KCU', 'Urban economics'),
	('KCX', 'Economic & financial crises & disasters'),
	('KCY', 'Popular economics'),
	('KCZ', 'Economic history'),
	('KF', 'Finance & accounting'),
	('KFC', 'Accounting'),
	('KFCC', 'Cost accounting'),
	('KFCF', 'Financial accounting'),
	('KFCM', 'Management accounting & bookkeeping'),
	('KFCP', 'Public finance accounting'),
	('KFCR', 'Financial reporting, financial statements'),
	('KFCX', 'Accounting: study & revision guides'),
	('KFF', 'Finance'),
	('KFFD', 'Public finance'),
	('KFFD1', 'Taxation'),
	('KFFH', 'Corporate finance'),
	('KFFK', 'Banking'),
	('KFFL', 'Credit & credit institutions'),
	('KFFM', 'Investment & securities'),
	('KFFM1', 'Commodities'),
	('KFFM2', 'Stocks & shares'),
	('KFFN', 'Insurance & actuarial studies'),
	('KFFP', 'Pensions'),
	('KFFR', 'Property & real estate'),
	('KFFX', 'Banking & finance: study & revision guides'),
	('KJ', 'Business & management'),
	('KJB', 'Business studies: general'),
	('KJBX', 'Business & management: study & revision guides'),
	('KJC', 'Business strategy'),
	('KJD', 'Business innovation'),
	('KJE', 'E-commerce: business aspects'),
	('KJF', 'Business competition'),
	('KJG', 'Business ethics & social responsibility'),
	('KJH', 'Entrepreneurship'),
	('KJJ', 'Business & the environment, ‘Green’ approaches to business'),
	('KJK', 'International business'),
	('KJL', 'Consultancy & grants for businesses'),
	('KJM', 'Management & management techniques'),
	('KJMB', 'Management: leadership & motivation'),
	('KJMD', 'Management decision making'),
	('KJMP', 'Project management'),
	('KJMQ', 'Quality Assurance (QA) & Total Quality Management (TQM)'),
	('KJMT', 'Time management'),
	('KJMV', 'Management of specific areas'),
	('KJMV1', 'Budgeting & financial management'),
	('KJMV2', 'Personnel & human resources management'),
	('KJMV3', 'Knowledge management'),
	('KJMV4', 'Management of real estate, property & plant'),
	('KJMV5', 'Production & quality control management'),
	('KJMV6', 'Research & development management'),
	('KJMV7', 'Sales & marketing management'),
	('KJMV8', 'Purchasing & supply management'),
	('KJMV9', 'Distribution & warehousing management'),
	('KJN', 'Business negotiation'),
	('KJP', 'Business communication & presentation'),
	('KJQ', 'Business mathematics & systems'),
	('KJR', 'Corporate governance'),
	('KJRD', 'Boards & directors: role & responsibilities'),
	('KJRS', 'Company secretary: role & responsibilities'),
	('KJS', 'Sales & marketing'),
	('KJSA', 'Advertising'),
	('KJSM', 'Market research'),
	('KJSP', 'Public relations'),
	('KJSU', 'Customer services'),
	('KJT', 'Operational research'),
	('KJU', 'Organizational theory & behaviour'),
	('KJV', 'Ownership & organization of enterprises'),
	('KJVB', 'Takeovers, mergers & buy-outs'),
	('KJVD', 'Privatization'),
	('KJVF', 'Franchises'),
	('KJVG', 'Multinationals'),
	('KJVN', 'Public ownership / nationalization'),
	('KJVP', 'Monopolies'),
	('KJVS', 'Small businesses & self-employed'),
	('KJVT', 'Outsourcing'),
	('KJVV', 'Joint ventures'),
	('KJVW', 'Employee-ownership & co-operatives'),
	('KJVX', 'Non-profitmaking organizations'),
	('KJW', 'Office & workplace'),
	('KJWB', 'Office management'),
	('KJWF', 'Office systems & equipment'),
	('KJWS', 'Secretarial, clerical & office skills'),
	('KJWX', 'Working patterns & practices'),
	('KJZ', 'History of specific companies / corporate history'),
	('KN', 'Industry & industrial studies'),
	('KNA', 'Primary industries'),
	('KNAC', 'Agriculture & related industries'),
	('KNAF', 'Fisheries & related industries'),
	('KNAL', 'Forestry & related industries'),
	('KNAT', 'Mining industry'),
	('KNB', 'Energy industries & utilities'),
	('KNBC', 'Coal & solid fuel industries'),
	('KNBG', 'Gas industries'),
	('KNBL', 'Electrical power industries'),
	('KNBN', 'Nuclear power industries'),
	('KNBP', 'Petroleum & oil industries'),
	('KNBT', 'Alternative & renewable energy industries'),
	('KNBW', 'Water industries'),
	('KND', 'Manufacturing industries'),
	('KNDC', 'Chemical industries'),
	('KNDD', 'Textile industries'),
	('KNDF', 'Food manufacturing & related industries'),
	('KNDF1', 'Tobacco industry'),
	('KNDH', 'Hi-tech manufacturing industries'),
	('KNDH1', 'Biotechnology industries'),
	('KNDM', 'Armaments industries'),
	('KNDP', 'Pharmaceutical industries'),
	('KNDR', 'Road vehicle manufacturing industry'),
	('KNDS', 'Shipbuilding industry'),
	('KNDV', 'Aviation manufacturing industry'),
	('KNG', 'Transport industries'),
	('KNGR', 'Road transport industries'),
	('KNGS', 'Shipping industries'),
	('KNGT', 'Railway transport industries'),
	('KNGV', 'Aerospace & air transport industries'),
	('KNGV1', 'Airports'),
	('KNJ', 'Construction & heavy industry'),
	('KNJC', 'Construction industry'),
	('KNJH', 'Iron, steel & metals industries'),
	('KNP', 'Distributive industries'),
	('KNPR', 'Retail sector'),
	('KNPW', 'Wholesale sector'),
	('KNS', 'Service industries'),
	('KNSG', 'Tourism industry'),
	('KNSH', 'Hospitality industry'),
	('KNSJ', 'Events management industries'),
	('KNSP', 'Sport & leisure industries'),
	('KNSS', 'Security services'),
	('KNSS1', 'Surveillance services'),
	('KNST', 'Financial services industry'),
	('KNSX', 'Fashion & beauty industries'),
	('KNSZ', 'Funeral services'),
	('KNT', 'Media, information & communication industries'),
	('KNTC', 'Cinema industry'),
	('KNTD', 'Radio & television industry'),
	('KNTF', 'Music industry'),
	('KNTJ', 'Press & journalism'),
	('KNTP', 'Publishing industry & book trade'),
	('KNTR', 'Printing, packaging & reprographic industry'),
	('KNTT', 'Postal & telecommunications industries'),
	('KNTX', 'Information technology industries'),
	('KNTX1', 'Internet & WWW industries'),
	('KNTY', 'Advertising industry'),
	('KNV', 'Civil service & public sector'),
	('KNX', 'Industrial relations, health & safety'),
	('KNXB', 'Industrial relations'),
	('KNXB1', 'Strikes'),
	('KNXB2', 'Trade unions'),
	('KNXB3', 'Industrial arbitration & negotiation'),
	('KNXC', 'Health & safety issues'),
	('L', 'Law'),
	('LA', 'Jurisprudence & general issues'),
	('LAB', 'Jurisprudence & philosophy of law'),
	('LAF', 'Systems of law'),
	('LAFC', 'Common law'),
	('LAFD', 'Civil codes / Civil law'),
	('LAFR', 'Roman law'),
	('LAFS', 'Islamic law'),
	('LAFX', 'Ecclesiastical (canon) law'),
	('LAM', 'Comparative law'),
	('LAQ', 'Law & society'),
	('LAQG', 'Gender & the law'),
	('LAR', 'Criminology: legal aspects'),
	('LAS', 'Legal skills & practice'),
	('LASD', 'Advocacy'),
	('LASP', 'Paralegals & paralegalism'),
	('LAT', 'Legal profession: general'),
	('LATC', 'Legal ethics & professional conduct'),
	('LAY', 'Law as it applies to other professions'),
	('LAZ', 'Legal history'),
	('LB', 'International law'),
	('LBB', 'Public international law'),
	('LBBC', 'Treaties & other sources of international law'),
	('LBBC1', 'Customary law'),
	('LBBD', 'Diplomatic law'),
	('LBBF', 'Jurisdiction & immunities'),
	('LBBJ', 'International law of territory & statehood'),
	('LBBK', 'Law of the sea'),
	('LBBM', 'International economic & trade law'),
	('LBBM1', 'Tariffs'),
	('LBBM3', 'Investment treaties & disputes'),
	('LBBP', 'International environmental law'),
	('LBBR', 'International human rights law'),
	('LBBS', 'International humanitarian law'),
	('LBBU', 'International organisations & institutions'),
	('LBBV', 'Responsibility of states & other entities'),
	('LBBZ', 'International criminal law'),
	('LBD', 'International law of transport, communications & commerce'),
	('LBDA', 'International space & aerospace law'),
	('LBDK', 'Transnational commercial law'),
	('LBDM', 'International maritime law'),
	('LBDT', 'International communications & telecommunications law'),
	('LBG', 'Private international law & conflict of laws'),
	('LBH', 'Settlement of international disputes'),
	('LBHG', 'International courts & procedures'),
	('LBHT', 'International arbitration'),
	('LBL', 'International law reports'),
	('LN', 'Laws of Specific jurisdictions'),
	('LNA', 'Legal system: general'),
	('LNAA', 'Courts & procedure'),
	('LNAA1', 'Judicial powers'),
	('LNAA2', 'Legal system: law of contempt'),
	('LNAC', 'Civil procedure, litigation & dispute resolution'),
	('LNAC1', 'Civil remedies'),
	('LNAC12', 'Restitution'),
	('LNAC14', 'Damages & compensation'),
	('LNAC16', 'Injunctions & other orders'),
	('LNAC3', 'Civil procedure: law of evidence'),
	('LNAC5', 'Arbitration, mediation & alternative dispute resolution'),
	('LNAF', 'Legal system: costs & funding'),
	('LNAL', 'Regulation of legal profession'),
	('LNB', 'Private / Civil law: general works'),
	('LNC', 'Company, commercial & competition law'),
	('LNCB', 'Commercial law'),
	('LNCB1', 'Franchising law'),
	('LNCB2', 'E-commerce law'),
	('LNCB3', 'Sale of goods law'),
	('LNCB4', 'Outsourcing law'),
	('LNCB5', 'Shipping law'),
	('LNCB6', 'Aviation law'),
	('LNCD', 'Company law'),
	('LNCD1', 'Mergers & acquisitions law'),
	('LNCF', 'Partnership law'),
	('LNCH', 'Competition law / Antitrust law'),
	('LNCJ', 'Contract law'),
	('LNCL', 'Agency law'),
	('LNCN', 'Procurement law'),
	('LNCQ', 'Construction & engineering law'),
	('LNCR', 'Energy & natural resources law'),
	('LND', 'Constitutional & administrative law'),
	('LNDA', 'Citizenship & nationality law'),
	('LNDA1', 'Immigration law'),
	('LNDA3', 'Asylum law'),
	('LNDC', 'Human rights & civil liberties law'),
	('LNDC2', 'Privacy law'),
	('LNDC4', 'Freedom of expression law'),
	('LNDF', 'Freedom of information law'),
	('LNDH', 'Government powers'),
	('LNDK', 'Military & defence law'),
	('LNDM', 'Judicial review'),
	('LNDP', 'Parliamentary & legislative practice'),
	('LNDS', 'Election law'),
	('LNDU', 'Local government law'),
	('LNF', 'Criminal law & procedure'),
	('LNFB', 'Criminal justice law'),
	('LNFG', 'Offences against the government'),
	('LNFJ', 'Offences against the person'),
	('LNFJ1', 'Harassment law'),
	('LNFL', 'Offences against property'),
	('LNFN', 'Fraud'),
	('LNFQ', 'Juvenile criminal law'),
	('LNFR', 'Offences against public health, safety, order'),
	('LNFT', 'Road traffic law, motoring offences'),
	('LNFV', 'Terrorism law'),
	('LNFX', 'Criminal procedure'),
	('LNFX1', 'Sentencing & punishment'),
	('LNFX3', 'Criminal procedure: law of evidence'),
	('LNFX5', 'Police law & police procedures'),
	('LNH', 'Employment & labour law'),
	('LNHD', 'Discrimination in employment law'),
	('LNHH', 'Occupational health & safety law'),
	('LNHR', 'Industrial relations & trade unions law'),
	('LNHU', 'Employment contracts'),
	('LNJ', 'Entertainment & media law'),
	('LNJD', 'Defamation law (slander & libel)'),
	('LNJS', 'Sport & the law'),
	('LNJX', 'Advertising, marketing & sponsorship law'),
	('LNK', 'Environment, transport & planning law'),
	('LNKF', 'Agricultural law'),
	('LNKG', 'Animal law'),
	('LNKJ', 'Environment law'),
	('LNKN', 'Nature Conservation law'),
	('LNKT', 'Transport law'),
	('LNKV', 'Highways'),
	('LNKW', 'Planning law'),
	('LNL', 'Equity & trusts'),
	('LNM', 'Family law'),
	('LNMB', 'Family law: marriage & divorce'),
	('LNMC', 'Family law: cohabitation'),
	('LNMF', 'Family law: same-sex partnership'),
	('LNMK', 'Family law: children'),
	('LNP', 'Financial law'),
	('LNPA', 'Accounting law'),
	('LNPB', 'Banking law'),
	('LNPC', 'Bankruptcy & insolvency'),
	('LNPD', 'Capital markets & securities law & regulation'),
	('LNPF', 'Financial services law & regulation'),
	('LNPN', 'Insurance law'),
	('LNPP', 'Pensions law'),
	('LNQ', 'IT & Communications law'),
	('LNQD', 'Data protection law'),
	('LNR', 'Intellectual property law'),
	('LNRC', 'Copyright law'),
	('LNRD', 'Patents law'),
	('LNRF', 'Trademarks law'),
	('LNRL', 'Designs law'),
	('LNRV', 'Confidential information law'),
	('LNS', 'Property law'),
	('LNSH', 'Land & real estate law'),
	('LNSH1', 'Ownership & mortgage law'),
	('LNSH3', 'Landlord & tenant law'),
	('LNSH5', 'Conveyancing law'),
	('LNSH7', 'Rating & valuation law'),
	('LNSH9', 'Housing law'),
	('LNSP', 'Personal property law'),
	('LNT', 'Social law'),
	('LNTC', 'Charity law'),
	('LNTD', 'Education & the law'),
	('LNTH', 'Social security & welfare law'),
	('LNTH1', 'Social insurance law'),
	('LNTJ', 'Public health & safety law'),
	('LNTM', 'Medical & healthcare law'),
	('LNTM1', 'Mental health law'),
	('LNTM2', 'Regulation of medicines & medical devices'),
	('LNTQ', 'Disability & the law'),
	('LNTS', 'Law & the elderly'),
	('LNTU', 'Consumer protection law'),
	('LNTX', 'Licensing, gaming & club law'),
	('LNU', 'Taxation & duties law'),
	('LNUC', 'Corporate tax'),
	('LNUP', 'Personal tax'),
	('LNUS', 'Sales tax  & Customs duties'),
	('LNUT', 'Trusts & estates taxation'),
	('LNV', 'Torts / Delicts'),
	('LNVC', 'Negligence'),
	('LNVF', 'Nuisance'),
	('LNVJ', 'Personal injury'),
	('LNW', 'Wills & probate / Succession'),
	('LNZ', 'Primary sources of law'),
	('LNZC', 'Case law'),
	('LNZL', 'Legislation'),
	('LR', 'Law: study & revision guides'),
	('M', 'Medicine'),
	('MB', 'Medicine: general issues'),
	('MBD', 'Medical profession'),
	('MBDC', 'Medical ethics & professional conduct'),
	('MBDP', 'Doctor/patient relationship'),
	('MBF', 'Medical bioinformatics'),
	('MBG', 'Medical equipment & techniques'),
	('MBGL', 'Medical laboratory testing & techniques'),
	('MBGR', 'Medical research'),
	('MBGR1', 'Clinical trials'),
	('MBGT', 'Telemedicine'),
	('MBN', 'Public health & preventive medicine'),
	('MBNC', 'Medical screening'),
	('MBNH', 'Personal & public health'),
	('MBNH1', 'Hygiene'),
	('MBNH2', 'Environmental factors'),
	('MBNH3', 'Dietetics & nutrition'),
	('MBNH4', 'Birth control, contraception, family planning'),
	('MBNH9', 'Health psychology'),
	('MBNS', 'Epidemiology & medical statistics'),
	('MBP', 'Health systems & services'),
	('MBPC', 'General practice'),
	('MBPK', 'Mental health services'),
	('MBPM', 'Medical administration & management'),
	('MBPR', 'Medical insurance'),
	('MBQ', 'Medicolegal issues'),
	('MBS', 'Medical sociology'),
	('MBX', 'History of medicine'),
	('MF', 'Pre-clinical medicine: basic sciences'),
	('MFC', 'Anatomy'),
	('MFCC', 'Cytology'),
	('MFCH', 'Histology'),
	('MFCR', 'Regional anatomy'),
	('MFCX', 'Dissection'),
	('MFG', 'Physiology'),
	('MFGC', 'Cellular physiology'),
	('MFGG', 'Regional physiology'),
	('MFGM', 'Metabolism'),
	('MFGV', 'Biomechanics, human kinetics'),
	('MFK', 'Human reproduction, growth & development'),
	('MFKC', 'Reproductive medicine'),
	('MFKC1', 'Infertility & fertilization'),
	('MFKC3', 'Embryology'),
	('MFKH', 'Human growth & development'),
	('MFKH3', 'Maturation & ageing'),
	('MFN', 'Medical genetics'),
	('MJ', 'Clinical & internal medicine'),
	('MJA', 'Medical diagnosis'),
	('MJAD', 'Examination of patients'),
	('MJC', 'Diseases & disorders'),
	('MJCG', 'Congenital diseases & disorders'),
	('MJCG1', 'Hereditary diseases & disorders'),
	('MJCJ', 'Infectious & contagious diseases'),
	('MJCJ1', 'Venereal diseases'),
	('MJCJ2', 'HIV / AIDS'),
	('MJCJ3', 'Hospital infections'),
	('MJCL', 'Oncology'),
	('MJCL1', 'Radiotherapy'),
	('MJCL2', 'Chemotherapy'),
	('MJCM', 'Immunology'),
	('MJCM1', 'Allergies'),
	('MJD', 'Cardiovascular medicine'),
	('MJE', 'Musculoskeletal medicine'),
	('MJF', 'Haematology'),
	('MJG', 'Endocrinology'),
	('MJGD', 'Diabetes'),
	('MJH', 'Gastroenterology'),
	('MJJ', 'Hepatology'),
	('MJK', 'Dermatology'),
	('MJL', 'Respiratory medicine'),
	('MJM', 'Rheumatology'),
	('MJN', 'Neurology & clinical neurophysiology'),
	('MJNA', 'Autism & Asperger’s Syndrome'),
	('MJND', 'Alzheimer’s & dementia'),
	('MJP', 'Otorhinolaryngology (ENT)'),
	('MJPD', 'Audiology & otology'),
	('MJQ', 'Ophthalmology'),
	('MJR', 'Renal medicine & nephrology'),
	('MJRD', 'Haemodialysis'),
	('MJS', 'Urology & urogenital medicine'),
	('MJT', 'Gynaecology & obstetrics'),
	('MJTF', 'Materno-fetal medicine'),
	('MJW', 'Paediatric medicine'),
	('MJWN', 'Neonatal medicine'),
	('MJX', 'Geriatric medicine'),
	('MJZ', 'Gene therapy'),
	('MM', 'Other branches of medicine'),
	('MMB', 'Anaesthetics'),
	('MMBP', 'Pain & pain management'),
	('MMC', 'Palliative medicine'),
	('MMD', 'Dentistry'),
	('MMDS', 'Oral & maxillofacial surgery'),
	('MMF', 'Pathology'),
	('MMFC', 'Cytopathology'),
	('MMFH', 'Histopathology'),
	('MMFM', 'Medical microbiology & virology'),
	('MMFP', 'Medical parasitology'),
	('MMG', 'Pharmacology'),
	('MMGT', 'Medical toxicology'),
	('MMGW', 'Psychopharmacology'),
	('MMH', 'Psychiatry'),
	('MMJ', 'Clinical psychology'),
	('MMJT', 'Psychotherapy'),
	('MMJT1', 'Cognitive behavioural therapy'),
	('MMK', 'Accident & emergency medicine'),
	('MMKB', 'Trauma & shock'),
	('MMKD', 'Burns'),
	('MMKL', 'Intensive care medicine'),
	('MMN', 'Nuclear medicine'),
	('MMP', 'Medical imaging'),
	('MMPF', 'Ultrasonics'),
	('MMPG', 'Nuclear magnetic resonance (NMR / MRI)'),
	('MMPH', 'Radiology'),
	('MMPJ', 'Tomography'),
	('MMQ', 'Forensic medicine'),
	('MMR', 'Environmental medicine'),
	('MMRB', 'Aviation & space medicine'),
	('MMRD', 'Diving & hyperbaric medicine'),
	('MMRP', 'Occupational medicine'),
	('MMRT', 'Tropical medicine'),
	('MMS', 'Sports injuries & medicine'),
	('MMZ', 'Therapy & therapeutics'),
	('MMZD', 'Eating disorders & therapy'),
	('MMZF', 'Obesity: treatment & therapy'),
	('MMZL', 'Speech & language disorders & therapy'),
	('MMZR', 'Addiction & therapy'),
	('MMZS', 'Sleep disorders & therapy'),
	('MN', 'Surgery'),
	('MNB', 'Surgical techniques'),
	('MNC', 'General surgery'),
	('MNG', 'Gastrointestinal & colorectal surgery'),
	('MNH', 'Cardiothoracic surgery'),
	('MNJ', 'Vascular surgery'),
	('MNK', 'Surgical oncology'),
	('MNL', 'Critical care surgery'),
	('MNN', 'Neurosurgery'),
	('MNP', 'Plastic & reconstructive surgery'),
	('MNPC', 'Cosmetic surgery'),
	('MNQ', 'Transplant surgery'),
	('MNS', 'Orthopaedics & fractures'),
	('MNZ', 'Peri-operative care'),
	('MQ', 'Nursing & ancillary services'),
	('MQC', 'Nursing'),
	('MQCA', 'Nursing fundamentals & skills'),
	('MQCB', 'Nursing research & theory'),
	('MQCH', 'Nurse/patient relationship'),
	('MQCL', 'Nursing specialties'),
	('MQCL1', 'Accident & emergency nursing'),
	('MQCL2', 'Intensive care nursing'),
	('MQCL3', 'Paediatric nursing'),
	('MQCL4', 'Geriatric nursing'),
	('MQCL5', 'Psychiatric nursing'),
	('MQCL6', 'Surgical nursing'),
	('MQCL9', 'Terminal care nursing'),
	('MQCM', 'Nursing pharmacology'),
	('MQCW', 'Nursing sociology'),
	('MQCX', 'Community nursing'),
	('MQCZ', 'Nursing management & leadership'),
	('MQD', 'Midwifery'),
	('MQDB', 'Birthing methods'),
	('MQF', 'First aid & paramedical services'),
	('MQH', 'Radiography'),
	('MQK', 'Chiropody & podiatry'),
	('MQP', 'Pharmacy / dispensing'),
	('MQR', 'Optometry / opticians'),
	('MQS', 'Physiotherapy'),
	('MQT', 'Occupational therapy'),
	('MQTC', 'Creative therapy (eg art, music, drama)'),
	('MQU', 'Medical counselling'),
	('MQV', 'Rehabilitation'),
	('MQVB', 'Rehabilitation: brain & spinal injuries'),
	('MQW', 'Biomedical engineering'),
	('MQWB', 'Orthotics'),
	('MQWP', 'Prosthetics'),
	('MQZ', 'Mortuary practice'),
	('MR', 'Medical study & revision guides & reference material'),
	('MRG', 'Medical study & revision guides'),
	('MRGD', 'Medical revision aids: MRCP'),
	('MRGK', 'Medical revision aids: MRCS'),
	('MRGL', 'Medical revision aids: PLAB'),
	('MRT', 'Medical charts, colour atlases'),
	('MX', 'Complementary medicine'),
	('MXH', 'Chiropractic & osteopathy'),
	('MZ', 'Veterinary medicine'),
	('MZC', 'Veterinary medicine: small animals (pets)'),
	('MZD', 'Veterinary medicine: large animals (domestic / farm)'),
	('MZDH', 'Equine veterinary medicine'),
	('MZF', 'Veterinary medicine: laboratory animals'),
	('MZG', 'Veterinary medicine: exotic & zoo animals'),
	('MZH', 'Veterinary anatomy & physiology'),
	('MZK', 'Veterinary pathology & histology'),
	('MZL', 'Veterinary nutrition'),
	('MZM', 'Veterinary medicine: infectious diseases & therapeutics'),
	('MZMP', 'Veterinary bacteriology, virology, parasitology'),
	('MZP', 'Veterinary pharmacology'),
	('MZR', 'Veterinary radiology'),
	('MZS', 'Veterinary surgery'),
	('MZSN', 'Veterinary anaesthetics'),
	('MZT', 'Veterinary dentistry'),
	('MZV', 'Veterinary nursing'),
	('MZX', 'Complementary medicine for animals'),
	('P', 'Mathematics & science'),
	('PB', 'Mathematics'),
	('PBB', 'Philosophy of mathematics'),
	('PBC', 'Mathematical foundations'),
	('PBCD', 'Mathematical logic'),
	('PBCH', 'Set theory'),
	('PBCN', 'Number systems'),
	('PBD', 'Discrete mathematics'),
	('PBF', 'Algebra'),
	('PBG', 'Groups & group theory'),
	('PBH', 'Number theory'),
	('PBJ', 'Pre-calculus'),
	('PBK', 'Calculus & mathematical analysis'),
	('PBKA', 'Calculus'),
	('PBKB', 'Real analysis, real variables'),
	('PBKD', 'Complex analysis, complex variables'),
	('PBKF', 'Functional analysis & transforms'),
	('PBKJ', 'Differential calculus & equations'),
	('PBKL', 'Integral calculus & equations'),
	('PBKQ', 'Calculus of variations'),
	('PBKS', 'Numerical analysis'),
	('PBM', 'Geometry'),
	('PBMB', 'Trigonometry'),
	('PBMH', 'Euclidean geometry'),
	('PBML', 'Non-Euclidean geometry'),
	('PBMP', 'Differential & Riemannian geometry'),
	('PBMS', 'Analytic geometry'),
	('PBMW', 'Algebraic geometry'),
	('PBMX', 'Fractal geometry'),
	('PBP', 'Topology'),
	('PBPD', 'Algebraic topology'),
	('PBPH', 'Analytic topology'),
	('PBT', 'Probability & statistics'),
	('PBTB', 'Bayesian inference'),
	('PBU', 'Optimization'),
	('PBUD', 'Game theory'),
	('PBUH', 'Linear programming'),
	('PBV', 'Combinatorics & graph theory'),
	('PBW', 'Applied mathematics'),
	('PBWH', 'Mathematical modelling'),
	('PBWL', 'Stochastics'),
	('PBWR', 'Nonlinear science'),
	('PBWS', 'Chaos theory'),
	('PBWX', 'Fuzzy set theory'),
	('PBX', 'History of mathematics'),
	('PD', 'Science: general issues'),
	('PDA', 'Philosophy of science'),
	('PDC', 'Scientific nomenclature & classification'),
	('PDD', 'Scientific standards'),
	('PDDM', 'Mensuration & systems of measurement'),
	('PDE', 'Maths for scientists'),
	('PDG', 'Industrial applications of scientific research & technological innovation'),
	('PDK', 'Science funding & policy'),
	('PDN', 'Scientific equipment, experiments & techniques'),
	('PDND', 'Microscopy'),
	('PDR', 'Impact of science & technology on society'),
	('PDX', 'History of science'),
	('PDZ', 'Popular science'),
	('PDZM', 'Popular mathematics'),
	('PG', 'Astronomy, space & time'),
	('PGC', 'Theoretical & mathematical astronomy'),
	('PGG', 'Astronomical observation: observatories, equipment & methods'),
	('PGK', 'Cosmology & the universe'),
	('PGM', 'Galaxies & stars'),
	('PGS', 'Solar system: the Sun & planets'),
	('PGT', 'Astronomical charts & atlases'),
	('PGZ', 'Time (chronology), time systems & standards'),
	('PH', 'Physics'),
	('PHD', 'Classical mechanics'),
	('PHDB', 'Elementary mechanics'),
	('PHDD', 'Analytical mechanics'),
	('PHDF', 'Fluid mechanics'),
	('PHDS', 'Wave mechanics (vibration & acoustics)'),
	('PHDT', 'Dynamics & statics'),
	('PHDV', 'Gravity'),
	('PHDY', 'Energy'),
	('PHF', 'Materials / States of matter'),
	('PHFB', 'Low temperature physics'),
	('PHFC', 'Condensed matter physics (liquid state & solid state physics)'),
	('PHFC1', 'Soft matter physics'),
	('PHFC2', 'Mesoscopic physics'),
	('PHFG', 'Physics of gases'),
	('PHFP', 'Plasma physics'),
	('PHH', 'Thermodynamics & heat'),
	('PHJ', 'Optical physics'),
	('PHJL', 'Laser physics'),
	('PHK', 'Electricity, electromagnetism & magnetism'),
	('PHM', 'Atomic & molecular physics'),
	('PHN', 'Nuclear physics'),
	('PHP', 'Particle & high-energy physics'),
	('PHQ', 'Quantum physics (quantum mechanics & quantum field theory)'),
	('PHR', 'Relativity physics'),
	('PHS', 'Statistical physics'),
	('PHU', 'Mathematical physics'),
	('PHV', 'Applied physics'),
	('PHVB', 'Astrophysics'),
	('PHVD', 'Medical physics'),
	('PHVG', 'Geophysics'),
	('PHVJ', 'Atmospheric physics'),
	('PHVN', 'Biophysics'),
	('PHVQ', 'Chemical physics'),
	('PHVS', 'Cryogenics'),
	('PN', 'Chemistry'),
	('PNF', 'Analytical chemistry'),
	('PNFC', 'Chromatography'),
	('PNFR', 'Magnetic resonance'),
	('PNFS', 'Spectrum analysis, spectrochemistry, mass spectrometry'),
	('PNK', 'Inorganic chemistry'),
	('PNN', 'Organic chemistry'),
	('PNND', 'Organometallic chemistry'),
	('PNNP', 'Polymer chemistry'),
	('PNR', 'Physical chemistry'),
	('PNRC', 'Colloid chemistry'),
	('PNRD', 'Catalysis'),
	('PNRH', 'Electrochemistry & magnetochemistry'),
	('PNRL', 'Nuclear chemistry, photochemistry & radiation'),
	('PNRP', 'Quantum & theoretical chemistry'),
	('PNRS', 'Solid state chemistry'),
	('PNRW', 'Thermochemistry & chemical thermodynamics'),
	('PNRX', 'Surface chemistry & adsorption'),
	('PNT', 'Crystallography'),
	('PNV', 'Mineralogy & gems'),
	('PS', 'Biology, life sciences'),
	('PSA', 'Life sciences: general issues'),
	('PSAB', 'Taxonomy & systematics'),
	('PSAD', 'Bio-ethics'),
	('PSAF', 'Ecological science, the Biosphere'),
	('PSAG', 'Xenobiotics'),
	('PSAJ', 'Evolution'),
	('PSAK', 'Genetics (non-medical)'),
	('PSAK1', 'DNA & Genome'),
	('PSAN', 'Neurosciences'),
	('PSB', 'Biochemistry'),
	('PSBC', 'Proteins'),
	('PSBF', 'Carbohydrates'),
	('PSBH', 'Lipids'),
	('PSBM', 'Biochemical immunology'),
	('PSBT', 'Toxicology (non-medical)'),
	('PSBZ', 'Enzymology'),
	('PSC', 'Developmental biology'),
	('PSD', 'Molecular biology'),
	('PSF', 'Cellular biology (cytology)'),
	('PSG', 'Microbiology (non-medical)'),
	('PSGD', 'Bacteriology (non-medical)'),
	('PSGH', 'Parasitology (non-medical)'),
	('PSGL', 'Virology (non-medical)'),
	('PSGN', 'Protozoa'),
	('PSP', 'Hydrobiology'),
	('PSPF', 'Freshwater biology'),
	('PSPM', 'Marine biology'),
	('PSQ', 'Mycology, fungi (non-medical)'),
	('PST', 'Botany & plant sciences'),
	('PSTD', 'Plant physiology'),
	('PSTL', 'Plant reproduction & propagation'),
	('PSTP', 'Plant pathology & diseases'),
	('PSTS', 'Plant ecology'),
	('PSTV', 'Phycology, algae & lichens'),
	('PSV', 'Zoology & animal sciences'),
	('PSVD', 'Animal physiology'),
	('PSVH', 'Animal reproduction'),
	('PSVL', 'Animal pathology & diseases'),
	('PSVP', 'Animal behaviour'),
	('PSVS', 'Animal ecology'),
	('PSVT', 'Zoology: Invertebrates'),
	('PSVT3', 'Molluscs'),
	('PSVT5', 'Crustaceans'),
	('PSVT6', 'Arachnids'),
	('PSVT7', 'Insects (entomology)'),
	('PSVW', 'Zoology: Vertebrates'),
	('PSVW1', 'Fishes (ichthyology)'),
	('PSVW3', 'Amphibians'),
	('PSVW5', 'Reptiles'),
	('PSVW6', 'Birds (ornithology)'),
	('PSVW7', 'Zoology: Mammals'),
	('PSVW71', 'Marsupials & monotremes'),
	('PSVW73', 'Marine & freshwater mammals'),
	('PSVW79', 'Primates'),
	('PSX', 'Human biology'),
	('PSXE', 'Early man'),
	('PSXM', 'Medical anthropology'),
	('R', 'Earth sciences, geography, environment, planning'),
	('RB', 'Earth sciences'),
	('RBC', 'Volcanology & seismology'),
	('RBG', 'Geology & the lithosphere'),
	('RBGB', 'Soil science, sedimentology'),
	('RBGD', 'Geological surface processes (geomorphology)'),
	('RBGF', 'Historical geology'),
	('RBGG', 'Petrology'),
	('RBGH', 'Stratigraphy'),
	('RBGK', 'Geochemistry'),
	('RBGL', 'Economic geology'),
	('RBK', 'Hydrology & the hydrosphere'),
	('RBKC', 'Oceanography (seas)'),
	('RBKF', 'Limnology (freshwater)'),
	('RBP', 'Meteorology & climatology'),
	('RBX', 'Palaeontology'),
	('RG', 'Geography'),
	('RGB', 'Physical geography & topography'),
	('RGBA', 'Arid zones, deserts'),
	('RGBC', 'Grasslands, heaths, prairies, tundra'),
	('RGBF', 'Wetlands, swamps, fens'),
	('RGBL', 'Forests, rainforests'),
	('RGBP', 'Deltas, estuaries, coastal regions'),
	('RGBR', 'Coral reefs'),
	('RGBS', 'Mountains'),
	('RGC', 'Human geography'),
	('RGCM', 'Economic geography'),
	('RGCP', 'Political geography'),
	('RGL', 'Regional geography'),
	('RGM', 'Biogeography'),
	('RGR', 'Geographical discovery & exploration'),
	('RGS', 'Geographical maps (specialist)'),
	('RGV', 'Cartography, map-making & projections'),
	('RGW', 'Geographical information systems (GIS) & remote sensing'),
	('RGY', 'Geodesy & surveying for maps & charts'),
	('RN', 'The environment'),
	('RNA', 'Environmentalist thought & ideology'),
	('RNB', 'Environmentalist, conservationist & Green organizations'),
	('RNC', 'Applied ecology'),
	('RNCB', 'Biodiversity'),
	('RND', 'Environmental policy & protocols'),
	('RNF', 'Environmental management'),
	('RNFD', 'Drought & water supply'),
	('RNFF', 'Food security & supply'),
	('RNFY', 'Energy resources'),
	('RNH', 'Waste management'),
	('RNK', 'Conservation of the environment'),
	('RNKH', 'Conservation of wildlife & habitats'),
	('RNKH1', 'Endangered species & extinction of species'),
	('RNP', 'Pollution & threats to the environment'),
	('RNPD', 'Deforestation'),
	('RNPG', 'Climate change'),
	('RNQ', 'Nuclear issues'),
	('RNR', 'Natural disasters'),
	('RNT', 'Social impact of environmental issues'),
	('RNU', 'Sustainability'),
	('RP', 'Regional & area planning'),
	('RPC', 'Urban & municipal planning'),
	('RPG', 'Rural planning'),
	('RPT', 'Transport planning & policy'),
	('T', 'Technology, engineering, agriculture'),
	('TB', 'Technology: general issues'),
	('TBC', 'Engineering: general'),
	('TBD', 'Technical design'),
	('TBDG', 'Ergonomics'),
	('TBG', 'Engineering graphics & technical drawing'),
	('TBJ', 'Maths for engineers'),
	('TBM', 'Instruments & instrumentation engineering'),
	('TBMM', 'Engineering measurement & calibration'),
	('TBN', 'Nanotechnology'),
	('TBR', 'Intermediate technology'),
	('TBX', 'History of engineering & technology'),
	('TBY', 'Inventions & inventors'),
	('TC', 'Biochemical engineering'),
	('TCB', 'Biotechnology'),
	('TCBG', 'Genetic engineering'),
	('TCBS', 'Biosensors'),
	('TD', 'Industrial chemistry & manufacturing technologies'),
	('TDC', 'Industrial chemistry'),
	('TDCB', 'Chemical engineering'),
	('TDCC', 'Heavy chemicals'),
	('TDCD', 'Detergents technology'),
	('TDCG', 'Powder technology'),
	('TDCH', 'Insecticide & herbicide technology'),
	('TDCJ', 'Pigments, dyestuffs & paint technology'),
	('TDCJ1', 'Cosmetics technology'),
	('TDCK', 'Surface-coating technology'),
	('TDCP', 'Plastics & polymers technology'),
	('TDCQ', 'Ceramics & glass technology'),
	('TDCR', 'Rubber technology'),
	('TDCT', 'Food & beverage technology'),
	('TDCT1', 'Brewing technology'),
	('TDCT2', 'Winemaking technology'),
	('TDCW', 'Pharmaceutical technology'),
	('TDG', 'Leather & fur technology'),
	('TDH', 'Textile & fibre technology'),
	('TDJ', 'Timber & wood processing'),
	('TDJP', 'Pulp & paper technology'),
	('TDM', 'Metals technology / metallurgy'),
	('TDP', 'Other manufacturing technologies'),
	('TDPB', 'Precision instruments manufacture'),
	('TDPB1', 'Clocks, chronometers & watches (horology)'),
	('TDPD', 'Household appliances manufacture'),
	('TDPF', 'Furniture & furnishings manufacture'),
	('TDPH', 'Clothing & footware manufacture'),
	('TDPP', 'Printing & reprographic technology'),
	('TG', 'Mechanical engineering & materials'),
	('TGB', 'Mechanical engineering'),
	('TGBF', 'Tribology (friction & lubrication)'),
	('TGBN', 'Engines & power transmission'),
	('TGBN1', 'Steam engines'),
	('TGM', 'Materials science'),
	('TGMB', 'Engineering thermodynamics'),
	('TGMD', 'Mechanics of solids'),
	('TGMD4', 'Dynamics & vibration'),
	('TGMD5', 'Stress & fracture'),
	('TGMF', 'Mechanics of fluids'),
	('TGMF1', 'Aerodynamics'),
	('TGMF2', 'Hydraulics & pneumatics'),
	('TGMF3', 'Flow, turbulence, rheology'),
	('TGMT', 'Testing of materials'),
	('TGMT1', 'Non-destructive testing'),
	('TGP', 'Production engineering'),
	('TGPC', 'Computer aided manufacture (CAM)'),
	('TGPQ', 'Industrial quality control'),
	('TGPR', 'Reliability engineering'),
	('TGX', 'Engineering skills & trades'),
	('TGXT', 'Tool making'),
	('TGXW', 'Welding'),
	('TH', 'Energy technology & engineering'),
	('THF', 'Fossil fuel technologies'),
	('THFG', 'Gas technology'),
	('THFP', 'Petroleum technology'),
	('THFS', 'Solid fuel technology'),
	('THK', 'Nuclear power & engineering'),
	('THN', 'Heat transfer processes'),
	('THR', 'Electrical engineering'),
	('THRB', 'Power generation & distribution'),
	('THRD', 'Power networks, systems, stations & plants'),
	('THRF', 'Power utilization & applications'),
	('THRH', 'Energy conversion & storage'),
	('THRM', 'Electric motors'),
	('THRS', 'Electrician skills'),
	('THT', 'Energy efficiency'),
	('THX', 'Alternative & renewable energy sources & technology'),
	('TJ', 'Electronics & communications engineering'),
	('TJF', 'Electronics engineering'),
	('TJFC', 'Circuits & components'),
	('TJFD', 'Electronic devices & materials'),
	('TJFD1', 'Microprocessors'),
	('TJFD3', 'Transistors'),
	('TJFD5', 'Semi-conductors & super-conductors'),
	('TJFM', 'Automatic control engineering'),
	('TJFM1', 'Robotics'),
	('TJFN', 'Microwave technology'),
	('TJK', 'Communications engineering / telecommunications'),
	('TJKD', 'Radar'),
	('TJKR', 'Radio technology'),
	('TJKS', 'Satellite communication'),
	('TJKT', 'Telephone technology'),
	('TJKT1', 'Mobile phone technology'),
	('TJKV', 'Television technology'),
	('TJKW', 'WAP (wireless) technology'),
	('TN', 'Civil engineering, surveying & building'),
	('TNC', 'Structural engineering'),
	('TNCB', 'Surveying'),
	('TNCB1', 'Quantity surveying'),
	('TNCC', 'Soil & rock mechanics'),
	('TNCE', 'Earthquake engineering'),
	('TNCJ', 'Bridges'),
	('TNF', 'Hydraulic engineering'),
	('TNFD', 'Dams & reservoirs'),
	('TNFH', 'Harbours & ports'),
	('TNFL', 'Flood control'),
	('TNFR', 'Land reclamation & drainage'),
	('TNH', 'Highway & traffic engineering'),
	('TNK', 'Building construction & materials'),
	('TNKF', 'Fire protection & safety'),
	('TNKH', 'Heating, lighting, ventilation'),
	('TNKS', 'Security & fire alarm systems'),
	('TNKX', 'Conservation of buildings & building materials'),
	('TNT', 'Building skills & trades'),
	('TNTB', 'Bricklaying & plastering'),
	('TNTC', 'Carpentry'),
	('TNTP', 'Plumbing'),
	('TNTR', 'Roofing'),
	('TQ', 'Environmental science, engineering & technology'),
	('TQD', 'Environmental monitoring'),
	('TQK', 'Pollution control'),
	('TQS', 'Sanitary & municipal engineering'),
	('TQSR', 'Waste treatment & disposal'),
	('TQSR1', 'Sewage treatment & disposal'),
	('TQSR3', 'Hazardous waste treatment & disposal'),
	('TQSW', 'Water supply & treatment'),
	('TQSW1', 'Water purification & desalinization'),
	('TR', 'Transport technology & trades'),
	('TRC', 'Automotive technology & trades'),
	('TRCS', 'Automotive (motor mechanic) skills'),
	('TRCT', 'Road transport & haulage trades'),
	('TRF', 'Railway technology, engineering & trades'),
	('TRFT', 'Railway trades'),
	('TRL', 'Shipbuilding technology, engineering & trades'),
	('TRLD', 'Ship design & naval architecture'),
	('TRLN', 'Navigation & seamanship'),
	('TRLT', 'Maritime / nautical trades'),
	('TRP', 'Aerospace & aviation technology'),
	('TRPS', 'Aviation skills / piloting'),
	('TRT', 'Intelligent & automated transport system technology'),
	('TT', 'Other technologies & applied sciences'),
	('TTA', 'Acoustic & sound engineering'),
	('TTB', 'Applied optics'),
	('TTBF', 'Fibre optics'),
	('TTBL', 'Laser technology & holography'),
	('TTBM', 'Imaging systems & technology'),
	('TTBS', 'Scanning systems & technology'),
	('TTD', 'Space science'),
	('TTDS', 'Astronautics'),
	('TTM', 'Military engineering'),
	('TTMW', 'Ordnance, weapons technology'),
	('TTP', 'Explosives technology & pyrotechnics'),
	('TTS', 'Marine engineering'),
	('TTSH', 'Offshore engineering'),
	('TTSX', 'Sonar'),
	('TTU', 'Mining technology & engineering'),
	('TTV', 'Other vocational technologies & trades'),
	('TTVC', 'Hotel & catering trades'),
	('TTVH', 'Hairdressing & salon skills'),
	('TTVR', 'Traditional trades & skills'),
	('TTX', 'Taxidermy'),
	('TV', 'Agriculture & farming'),
	('TVB', 'Agricultural science'),
	('TVD', 'Agricultural engineering & machinery'),
	('TVDR', 'Irrigation'),
	('TVF', 'Sustainable agriculture'),
	('TVG', 'Organic farming'),
	('TVH', 'Animal husbandry'),
	('TVHB', 'Animal breeding'),
	('TVHF', 'Dairy farming'),
	('TVHH', 'Apiculture (beekeeping)'),
	('TVHP', 'Poultry farming'),
	('TVK', 'Agronomy & crop production'),
	('TVKC', 'Cereal crops'),
	('TVKF', 'Fertilizers & manures'),
	('TVM', 'Smallholdings'),
	('TVP', 'Pest control'),
	('TVQ', 'Tropical agriculture: practice & techniques'),
	('TVR', 'Forestry & silviculture: practice & techniques'),
	('TVS', 'Horticulture'),
	('TVSW', 'Viticulture'),
	('TVT', 'Aquaculture & fish-farming: practice & techniques'),
	('U', 'Computing & information technology'),
	('UB', 'Information technology: general issues'),
	('UBH', 'Health & safety aspects of IT'),
	('UBJ', 'Ethical & social aspects of IT'),
	('UBL', 'Legal aspects of IT'),
	('UBW', 'Internet: general works '),
	('UD', 'Digital lifestyle'),
	('UDA', 'Personal organisation software & apps'),
	('UDB', 'Internet guides & online services'),
	('UDBA', 'Online shopping & auctions'),
	('UDBD', 'Internet searching'),
	('UDBG', 'Internet gambling'),
	('UDBM', 'Online finance & investing'),
	('UDBR', 'Internet browsers'),
	('UDBS', 'Social networking'),
	('UDBV', 'Virtual worlds '),
	('UDF', 'Email: consumer/user guides'),
	('UDH', 'Portable & handheld devices: consumer/user guides'),
	('UDM', 'Digital music: consumer/user guides'),
	('UDP', 'Digital photography: consumer/user guides'),
	('UDQ', 'Digital video: consumer/user guides'),
	('UDT', 'Mobile phones: consumer/user guides'),
	('UDV', 'Digital TV & media centres: consumer/user guides'),
	('UDX', 'Computer games / online games: strategy guides'),
	('UF', 'Business applications'),
	('UFB', 'Integrated software packages'),
	('UFBC', 'Microsoft Office'),
	('UFBF', 'Microsoft Works'),
	('UFBL', 'Lotus Smartsuite'),
	('UFBP', 'OpenOffice'),
	('UFBS', 'StarOffice'),
	('UFBW', 'iWork'),
	('UFC', 'Spreadsheet software'),
	('UFCE', 'Excel'),
	('UFCL', 'Lotus 1-2-3'),
	('UFD', 'Word processing software'),
	('UFDM', 'Microsoft Word'),
	('UFG', 'Presentation graphics software'),
	('UFGP', 'PowerPoint'),
	('UFK', 'Accounting software'),
	('UFL', 'Enterprise software'),
	('UFLS', 'SAP (Systems, applications & products in databases)'),
	('UFM', 'Mathematical & statistical software'),
	('UFP', 'Project management software'),
	('UFS', 'Collaboration & group software'),
	('UG', 'Graphical & digital media applications'),
	('UGB', 'Web graphics & design'),
	('UGC', 'Computer-aided design (CAD)'),
	('UGD', 'Desktop publishing'),
	('UGG ', 'Computer games design'),
	('UGK', '3D graphics & modelling'),
	('UGL', 'Illustration & drawing software'),
	('UGM', 'Digital music: professional'),
	('UGN', 'Digital animation'),
	('UGP', 'Photo & image editing'),
	('UGV', 'Digital video: professional'),
	('UK', 'Computer hardware'),
	('UKC', 'Supercomputers'),
	('UKD', 'Mainframes & minicomputers'),
	('UKF', 'Servers'),
	('UKG', 'Grid & parallel computing'),
	('UKM', 'Embedded systems'),
	('UKN', 'Network hardware'),
	('UKP', 'Personal computers'),
	('UKPC', 'PCs (IBM-compatible personal computers)'),
	('UKPM', 'Macintosh'),
	('UKR', 'Maintenance & repairs'),
	('UKS', 'Storage media & peripherals'),
	('UKX', 'Utilities & tools'),
	('UL', 'Operating systems'),
	('ULD', 'Windows & variants'),
	('ULDF', 'Windows 7'),
	('ULDG', 'Windows Vista'),
	('ULDL', 'Windows 2003'),
	('ULDP', 'Windows XP'),
	('ULDT', 'Windows 2000'),
	('ULDX', 'Windows NT'),
	('ULH', 'Macintosh OS'),
	('ULL', 'Linux'),
	('ULLD', 'Debian'),
	('ULLR', 'Red Hat'),
	('ULLS', 'SUSE'),
	('ULLU', 'UBUNTU'),
	('ULN', 'UNIX'),
	('ULNB', 'BSD / FreeBSD'),
	('ULNH', 'HP-UX'),
	('ULNM', 'IBM AIX'),
	('ULNS', 'Sun Solaris'),
	('ULP', 'Handheld operating systems'),
	('ULQ', 'IBM mainframe operating systems'),
	('ULR', 'Real time operating systems'),
	('UM', 'Computer programming / software development'),
	('UMA', 'Program concepts / learning to program'),
	('UMB', 'Algorithms & data structures'),
	('UMC', 'Compilers'),
	('UMF', 'Agile programming'),
	('UMG', 'Aspect programming / AOP'),
	('UMH', 'Extreme programming'),
	('UMJ', 'Functional programming'),
	('UMK', 'Games development & programming'),
	('UMKB', '2D graphics: games programming'),
	('UMKC', '3D graphics: games programming'),
	('UMKL', 'Level design: games programming'),
	('UML', 'Graphics programming'),
	('UMN', 'Object-oriented programming (OOP)'),
	('UMP', 'Microsoft programming'),
	('UMPN', '.Net programming'),
	('UMPW', 'Windows programming'),
	('UMQ', 'Macintosh programming'),
	('UMR', 'Network programming'),
	('UMS', 'Mobile & handheld device programming / Apps programming'),
	('UMT', 'Database programming'),
	('UMW', 'Web programming'),
	('UMWS', 'Web services'),
	('UMX', 'Programming & scripting languages: general'),
	('UMZ', 'Software Engineering'),
	('UMZL', 'Unified Modeling Language (UML)'),
	('UMZT', 'Software testing & verification'),
	('UMZW', 'Object oriented software engineering'),
	('UN', 'Databases'),
	('UNA', 'Database design & theory'),
	('UNAR', 'Relational databases'),
	('UNC', 'Data capture & analysis'),
	('UND', 'Data warehousing'),
	('UNF', 'Data mining'),
	('UNH', 'Information retrieval'),
	('UNJ', 'Object-oriented databases'),
	('UNK', 'Distributed databases'),
	('UNN', 'Databases & the Web'),
	('UNS', 'Database software'),
	('UNSB', 'Oracle'),
	('UNSC', 'Access'),
	('UNSF', 'FileMaker'),
	('UNSJ', 'SQL Server / MS SQL'),
	('UNSK', 'SQLite'),
	('UNSM', 'MySQL'),
	('UNSP', 'PostgreSQL'),
	('UNSX', 'IBM DB2'),
	('UNSY', 'Sybase'),
	('UQ', 'Computer certification'),
	('UQF', 'Computer certification: Microsoft'),
	('UQJ', 'Computer certification: Cisco'),
	('UQL', 'Computer certification: ECDL'),
	('UQR', 'Computer certification: CompTia'),
	('UQT', 'Computer certification: CLAiT'),
	('UR', 'Computer security'),
	('URD', 'Privacy & data protection'),
	('URH', 'Computer fraud & hacking'),
	('URJ', 'Computer viruses, Trojans & worms'),
	('URQ', 'Firewalls'),
	('URS', 'Spam'),
	('URW', 'Spyware'),
	('URY', 'Data encryption'),
	('UT', 'Computer networking & communications'),
	('UTC', 'Cloud computing'),
	('UTD', 'Client-Server networking'),
	('UTF', 'Network management'),
	('UTFB', 'Computer systems back-up & data recovery'),
	('UTG', 'Grid computing'),
	('UTM', 'Electronic mail (email): professional'),
	('UTN', 'Network security'),
	('UTP', 'Networking standards & protocols'),
	('UTR', 'Distributed systems'),
	('UTS', 'Networking packages'),
	('UTV', 'Virtualisation'),
	('UTW', 'WAP networking & applications'),
	('UTX', 'EDI (electronic data interchange)'),
	('UY', 'Computer science'),
	('UYA', 'Mathematical theory of computation'),
	('UYAM', 'Maths for computer scientists'),
	('UYD', 'Systems analysis & design'),
	('UYF', 'Computer architecture & logic design'),
	('UYFL', 'Assembly languages'),
	('UYFP', 'Parallel processing'),
	('UYM', 'Computer modelling & simulation'),
	('UYQ', 'Artificial intelligence'),
	('UYQE', 'Expert systems / knowledge-based systems'),
	('UYQL', 'Natural language & machine translation'),
	('UYQM', 'Machine learning'),
	('UYQN', 'Neural networks & fuzzy systems'),
	('UYQP', 'Pattern recognition'),
	('UYQS', 'Speech recognition'),
	('UYQV', 'Computer vision'),
	('UYS', 'Signal processing'),
	('UYT', 'Image processing'),
	('UYU', 'Audio processing'),
	('UYV', 'Virtual reality'),
	('UYZ', 'Human-computer interaction'),
	('UYZF', 'Information visualization'),
	('UYZG', 'User interface design & usability'),
	('UYZM', 'Information architecture'),
	('V', 'Health & personal development'),
	('VF', 'Family & health'),
	('VFB', 'Personal safety'),
	('VFD', 'Popular medicine & health'),
	('VFDF', 'First aid for the home'),
	('VFDM', 'Men''s health'),
	('VFDW', 'Women''s health'),
	('VFG', 'Home nursing & caring'),
	('VFJ', 'Coping with personal problems'),
	('VFJB', 'Coping with illness & specific conditions'),
	('VFJD', 'Coping with disability'),
	('VFJG', 'Coping with old age'),
	('VFJJ', 'Coping with eating disorders'),
	('VFJK', 'Coping with drug & alcohol abuse'),
	('VFJP', 'Coping with anxiety & phobias'),
	('VFJS', 'Coping with stress'),
	('VFJX', 'Coping with death & bereavement'),
	('VFL', 'Giving up smoking'),
	('VFM', 'Fitness & diet'),
	('VFMD', 'Diets & dieting'),
	('VFMG', 'Exercise & workout books'),
	('VFMS', 'Massage'),
	('VFV', 'Family & relationships'),
	('VFVC', 'Sex & sexuality, sex manuals'),
	('VFVG', 'Dating, relationships, living together & marriage'),
	('VFVK', 'Adoption'),
	('VFVS', 'Separation & divorce'),
	('VFVX', 'Intergenerational relationships'),
	('VFX', 'Advice on parenting'),
	('VFXB', 'Pregnancy, birth & baby care'),
	('VFXB1', 'Baby names'),
	('VFXC', 'Child care & upbringing'),
	('VFXC1', 'Teenagers: advice for parents'),
	('VS', 'Self-help & personal development'),
	('VSB', 'Personal finance'),
	('VSC', 'Advice on careers & achieving success'),
	('VSD', 'Law, citizenship & rights for the lay person'),
	('VSF', 'Roadcraft, driving & the Highway Code'),
	('VSG', 'Consumer advice'),
	('VSH', 'Housing & property for the individual - buying/selling & legal aspects'),
	('VSK', 'Advice on education'),
	('VSL', 'Adult literacy guides & handbooks'),
	('VSN', 'Adult numeracy guides & handbooks'),
	('VSP', 'Popular psychology'),
	('VSPM', 'Assertiveness, motivation & self-esteem'),
	('VSPT', 'Memory improvement & thinking techniques'),
	('VSPX', 'Neuro Linguistic Programming (NLP)'),
	('VSR', 'Retirement'),
	('VSW', 'Living & working abroad'),
	('VSZ', 'Green lifestyle & self-sufficiency'),
	('VX', 'Mind, Body, Spirit'),
	('VXA', 'Mind, Body, Spirit: thought & practice'),
	('VXF', 'Fortune-telling & divination'),
	('VXFA', 'Astrology'),
	('VXFA1', 'Star signs & horoscopes'),
	('VXFC', 'Fortune-telling by cards (cartomancy)'),
	('VXFC1', 'Tarot'),
	('VXFD', 'The I Ching'),
	('VXFG', 'Graphology'),
	('VXFJ', 'Palmistry, phrenology & physiognomy'),
	('VXFN', 'Numerology'),
	('VXFT', 'Clairvoyance & precognition'),
	('VXH', 'Complementary therapies, healing & health'),
	('VXHA', 'Alexander technique'),
	('VXHC', 'Aromatherapy & essential oils'),
	('VXHH', 'Homoeopathy'),
	('VXHJ', 'Reflexology'),
	('VXHK', 'Reiki'),
	('VXHT', 'Traditional medicine & herbal remedies'),
	('VXHT1', 'Chinese medicine & acupuncture'),
	('VXHT2', 'Ayurvedic therapies'),
	('VXM', 'Mind, body, spirit: meditation & visualisation'),
	('VXN', 'Dreams & their interpretation'),
	('VXP', 'Psychic powers & psychic phenomena'),
	('VXPC', 'Crystals & colour-healing'),
	('VXPH', 'Chakras, auras & spiritual energy'),
	('VXPJ', 'Astral projection & out-of-body experiences'),
	('VXPR', 'The afterlife, reincarnation & past lives'),
	('VXPS', 'Spirit guides, angels & channelling'),
	('VXQ', 'Unexplained phenomena / the paranormal'),
	('VXQB', 'UFOs & extraterrestrial beings'),
	('VXQG', 'Ghosts & poltergeists'),
	('VXQM', 'Monsters & legendary beings'),
	('VXV', 'Feng Shui'),
	('VXW', 'Mysticism, magic & ritual'),
	('VXWK', 'Kabbalah: popular works'),
	('VXWM', 'Magic, spells & alchemy'),
	('VXWS', 'Shamanism, paganism & druidry'),
	('VXWT', 'Witchcraft & Wicca'),
	('W', 'Lifestyle, sport & leisure'),
	('WB', 'Cookery / food & drink etc'),
	('WBA', 'General cookery & recipes'),
	('WBB', 'TV / celebrity chef cookbooks'),
	('WBC', 'Cooking for one'),
	('WBD', 'Budget cookery'),
	('WBF', 'Quick & easy cooking'),
	('WBH', 'Health & wholefood cookery'),
	('WBHS', 'Cookery for specific diets & conditions'),
	('WBJ', 'Vegetarian cookery'),
	('WBN', 'National & regional cuisine'),
	('WBQ', 'Cooking for/with children'),
	('WBR', 'Cooking for parties'),
	('WBS', 'Cooking with specific gadgets'),
	('WBT', 'Cookery by ingredient'),
	('WBTB', 'Cooking with meat & game'),
	('WBTC', 'Cooking with chicken & other poultry'),
	('WBTF', 'Cooking with fish & seafood'),
	('WBTH', 'Cooking with herbs & spices'),
	('WBTP', 'Pasta dishes'),
	('WBTR', 'Cooking with dairy products'),
	('WBTX', 'Cooking with chocolate'),
	('WBV', 'Cookery dishes & courses'),
	('WBVD', 'Soups & starters'),
	('WBVG', 'Salads'),
	('WBVM', 'Main courses'),
	('WBVQ', 'Desserts'),
	('WBVS', 'Cakes, baking, icing & sugarcraft'),
	('WBW', 'Preserving & freezing'),
	('WBX', 'Beverages'),
	('WBXD', 'Alcoholic beverages'),
	('WBXD1', 'Wines'),
	('WBXD2', 'Beers'),
	('WBXD3', 'Spirits & cocktails'),
	('WBXN', 'Non-alcoholic beverages'),
	('WBZ', 'Cigars & smoking'),
	('WC', 'Antiques & collectables'),
	('WCB', 'Antiques & collectables: buyer''s guides'),
	('WCC', 'Care & restoration of antiques'),
	('WCF', 'Coins, banknotes, medals, seals (numismatics)'),
	('WCG', 'Stamps, philately'),
	('WCJ', 'Antique clocks, watches, musical boxes & automata'),
	('WCK', 'Militaria, arms & armour'),
	('WCL', 'Antique furniture / furniture collecting'),
	('WCN', 'Antiques & collectables: ceramics & glass'),
	('WCP', 'Antiques & collectables: jewellery'),
	('WCR', 'Antiques & collectables: gold & silver (other than jewellery)'),
	('WCS', 'Antiques & collectables: books, manuscripts, ephemera & printed matter'),
	('WCU', 'Antiques & collectables: pictures, prints & maps'),
	('WCV', 'Antiques & collectables: carpets, rugs & textiles'),
	('WCW', 'Antiques & collectables: toys, games & models'),
	('WCX', 'Antiques & collectables: scientific & musical instruments'),
	('WD', 'Hobbies, quizzes & games'),
	('WDH', 'Hobbies'),
	('WDHM', 'Model railways'),
	('WDHR', 'Radio-controlled models'),
	('WDHW', 'Role-playing, war games & fantasy sports'),
	('WDJ', '3-D images & optical illusions'),
	('WDK', 'Puzzles & quizzes'),
	('WDKC', 'Crosswords'),
	('WDKN', 'Sudoku & number puzzles'),
	('WDKX', 'Trivia & quiz question books'),
	('WDM', 'Indoor games'),
	('WDMC', 'Card games'),
	('WDMC1', 'Bridge'),
	('WDMC2', 'Poker'),
	('WDMG', 'Board games'),
	('WDMG1', 'Chess'),
	('WDP', 'Gambling: theories & methods'),
	('WF', 'Handicrafts, decorative arts & crafts'),
	('WFA', 'Painting & art manuals'),
	('WFB', 'Needlework & fabric crafts'),
	('WFBC', 'Embroidery crafts'),
	('WFBL', 'Lace & lacemaking'),
	('WFBQ', 'Quiltmaking, patchwork & applique'),
	('WFBS', 'Knitting & crochet'),
	('WFBV', 'Batik & tie-dye'),
	('WFC', 'Ropework, knots & macrame'),
	('WFF', 'Rug & carpetmaking'),
	('WFG', 'Spinning & weaving'),
	('WFH', 'Toys: making & decorating'),
	('WFJ', 'Jewellery & beadcraft'),
	('WFK', 'Decorative finishes & surfaces'),
	('WFL', 'Decorative wood & metalwork'),
	('WFLF', 'Picture framing'),
	('WFN', 'Pottery, ceramics & glass crafts'),
	('WFS', 'Carving & modelling, moulding & casting'),
	('WFT', 'Book & paper crafts'),
	('WFTG', 'Greeting cards'),
	('WFTM', 'Origami & paper engineering'),
	('WFTS', 'Scrapbook keeping'),
	('WFU', 'Lettering & calligraphy'),
	('WFV', 'Rural crafts'),
	('WFW', 'Flower arranging & floral crafts'),
	('WG', 'Transport: general interest'),
	('WGC', 'Road & motor vehicles: general interest'),
	('WGCB', 'Motor cars: general interest'),
	('WGCF', 'Buses, trams & commercial vehicles: general interest'),
	('WGCK', 'Motorcycles: general interest'),
	('WGCT', 'Tractors & farm vehicles: general interest'),
	('WGCV', 'Vehicle maintenance & manuals'),
	('WGF', 'Trains & railways: general interest'),
	('WGG', 'Ships & boats: general interest'),
	('WGGN', 'Narrowboats & canals'),
	('WGGV', 'Boatbuilding & maintenance'),
	('WGM', 'Aircraft: general interest'),
	('WH', 'Humour'),
	('WHC', 'Cartoons & comic strips'),
	('WHG', 'TV tie-in humour'),
	('WHJ', 'Jokes & riddles'),
	('WHL', 'Slang & dialect humour'),
	('WHP', 'Parodies & spoofs'),
	('WHX', 'Humour collections & anthologies'),
	('WJ', 'Lifestyle & personal style guides'),
	('WJF', 'Fashion & style guides'),
	('WJH', 'Cosmetics, hair & beauty'),
	('WJK', 'Interior design, decor & style guides'),
	('WJS', 'Shopping guides'),
	('WJW', 'Weddings, wedding planners'),
	('WJX', 'Parties, etiquette & entertaining'),
	('WK', 'Home & house maintenance'),
	('WKD', 'DIY: general'),
	('WKDM', 'DIY: house maintenance manuals'),
	('WKDW', 'DIY: carpentry & woodworking'),
	('WKH', 'Household hints'),
	('WKR', 'Home renovation & extension'),
	('WM', 'Gardening'),
	('WMB', 'Gardens (descriptions, history etc)'),
	('WMD', 'Garden design & planning'),
	('WMF', 'Greenhouses, conservatories, patios'),
	('WMP', 'Gardening: plants'),
	('WMPC', 'Gardening: flowers'),
	('WMPF', 'Gardening: growing fruit & vegetables'),
	('WMPH', 'Gardening: herbs'),
	('WMPM', 'Succulents & cacti'),
	('WMPS', 'Gardening: shrubs & trees'),
	('WMPX', 'House plants'),
	('WMQ', 'Specialized gardening methods'),
	('WMQB', 'Bonsai'),
	('WMQF', 'Organic gardening'),
	('WMQL', 'Landscape gardening'),
	('WMQN', 'Natural & wild gardening'),
	('WMQP', 'Gardening with native plants'),
	('WMQR', 'Container gardening'),
	('WMQW', 'Water gardens, pools'),
	('WMT', 'Allotments'),
	('WN', 'Natural history'),
	('WNA', 'Dinosaurs & the prehistoric world'),
	('WNC', 'Wildlife: general interest'),
	('WNCB', 'Wildlife: birds & birdwatching'),
	('WNCF', 'Wildlife: mammals'),
	('WNCK', 'Wildlife: reptiles & amphibians'),
	('WNCN', 'Wildlife: butterflies, other insects & spiders'),
	('WNCS', 'Wildlife: aquatic creatures'),
	('WNCS1', 'Sea life & the seashore'),
	('WNCS2', 'Freshwater life'),
	('WND', 'The countryside, country life'),
	('WNF', 'Farm & working animals'),
	('WNG', 'Domestic animals & pets'),
	('WNGC', 'Cats as pets'),
	('WNGD', 'Dogs as pets'),
	('WNGD1', 'Dog obedience & training'),
	('WNGF', 'Fishes & aquaria'),
	('WNGH', 'Horses & ponies'),
	('WNGK', 'Birds, including cage birds, as pets'),
	('WNGR', 'Rabbits & rodents as pets'),
	('WNGS', 'Reptiles & amphibians as pets'),
	('WNGX', 'Insects & spiders as pets'),
	('WNH', 'Zoos & wildlife parks'),
	('WNP', 'Trees, wildflowers & plants'),
	('WNR', 'Rocks, minerals & fossils'),
	('WNW', 'The Earth: natural history general'),
	('WNWM', 'Weather'),
	('WNX', 'Popular astronomy & space'),
	('WQ', 'Local interest, family history & nostalgia'),
	('WQH', 'Local history'),
	('WQN', 'Nostalgia: general'),
	('WQP', 'Places in old photographs'),
	('WQY', 'Family history, tracing ancestors'),
	('WS', 'Sports & outdoor recreation'),
	('WSB', 'Sporting events & management'),
	('WSBB', 'Olympic & Paralympic games'),
	('WSBG', 'Sports governing bodies'),
	('WSBM', 'Sports management & facilities'),
	('WSBT', 'Sports teams & clubs'),
	('WSBV', 'Sporting venues'),
	('WSBX', 'History of sport'),
	('WSC', 'Disability sports'),
	('WSD', 'Sports training & coaching'),
	('WSDF', 'Sport science, physical education'),
	('WSDP', 'Sports psychology'),
	('WSDX', 'Drug abuse in sport'),
	('WSE', 'Extreme sports'),
	('WSF', 'Air sports & recreations'),
	('WSJ', 'Ball games'),
	('WSJA', 'Football (Soccer, Association football)'),
	('WSJA1', 'World Cup'),
	('WSJC', 'Cricket'),
	('WSJF', 'Rugby football'),
	('WSJF1', 'Rugby Union'),
	('WSJF2', 'Rugby League'),
	('WSJG', 'Golf'),
	('WSJH', 'Hockey'),
	('WSJJ', 'Lacrosse'),
	('WSJK', 'Hurling'),
	('WSJL', 'Gaelic football'),
	('WSJM', 'Basketball'),
	('WSJN', 'Netball'),
	('WSJQ', 'Australian Rules football'),
	('WSJR', 'Racket games'),
	('WSJR2', 'Tennis'),
	('WSJR3', 'Badminton'),
	('WSJR4', 'Squash & rackets'),
	('WSJR5', 'Table tennis'),
	('WSJS', 'American football'),
	('WSJT', 'Baseball'),
	('WSJV', 'Volleyball'),
	('WSJY', 'Bowls, bowling, petanque'),
	('WSJZ', 'Snooker, billiards, pool'),
	('WSK', 'Track & field sports, athletics'),
	('WSKC', 'Marathon & cross-country running'),
	('WSKQ', 'Multidiscipline sports'),
	('WSL', 'Gymnastics'),
	('WSM', 'Weightlifting'),
	('WSN', 'Equestrian & animal sports'),
	('WSNB', 'Horse racing'),
	('WSNF', 'Riding, showjumping & horsemanship'),
	('WSNP', 'Greyhound racing'),
	('WSP', 'Motor sports'),
	('WSPC', 'Car racing'),
	('WSPC1', 'Formula 1 & Grand Prix'),
	('WSPG', 'Motor rallying / rally driving'),
	('WSPM', 'Motorcycle racing'),
	('WSQ', 'Cycling'),
	('WSR', 'Rollerblading, skateboarding, etc'),
	('WSS', 'Water sports & recreations'),
	('WSSC', 'Swimming & diving'),
	('WSSC1', 'Sub-aqua swimming'),
	('WSSG', 'Surfing, windsurfing, water skiing'),
	('WSSN', 'Boating'),
	('WSSN1', 'Motor / power boating & cruising'),
	('WSSN3', 'Sailing'),
	('WSSN5', 'Canoeing & kayaking'),
	('WSSN7', 'Rowing'),
	('WST', 'Combat sports & self-defence'),
	('WSTB', 'Boxing'),
	('WSTC', 'Wrestling'),
	('WSTF', 'Fencing'),
	('WSTM', 'Oriental martial arts'),
	('WSU', 'Bodybuilding'),
	('WSW', 'Winter sports'),
	('WSWK', 'Skiing'),
	('WSWM', 'Snowboarding'),
	('WSWS', 'Ice-skating'),
	('WSWY', 'Ice hockey'),
	('WSX', 'Field sports: fishing, hunting, shooting'),
	('WSXF', 'Fishing, angling'),
	('WSXH', 'Hunting or shooting animals & game'),
	('WSXR', 'Archery'),
	('WSXS', 'Small firearms, guns & other equipment'),
	('WSXT', 'Target shooting'),
	('WSZ', 'Active outdoor pursuits'),
	('WSZC', 'Walking, hiking, trekking'),
	('WSZG', 'Climbing & mountaineering'),
	('WSZK', 'Orienteering'),
	('WSZN', 'Caving & potholing'),
	('WSZR', 'Camping & woodcraft'),
	('WSZV', 'Outdoor survival skills'),
	('WT', 'Travel & holiday'),
	('WTD', 'Travel tips & advice: general'),
	('WTH', 'Travel & holiday guides'),
	('WTHA', 'Adventure holidays'),
	('WTHB', 'Business travel'),
	('WTHC', 'Eco-tourist guides'),
	('WTHF', 'Travel with children / family holidays'),
	('WTHH', 'Hotel & holiday accommodation guides'),
	('WTHH1', 'Caravan & camp-site guides'),
	('WTHM', 'Museum, historic sites, gallery & art guides'),
	('WTHR', 'Restaurant, cafe & pub guides'),
	('WTHT', 'Theme parks & funfairs'),
	('WTHX', 'Cruises'),
	('WTK', 'Language phrasebooks'),
	('WTL', 'Travel writing'),
	('WTLC', 'Classic travel writing'),
	('WTLP', 'Expeditions'),
	('WTM', 'Places & peoples: general & pictorial works'),
	('WTR', 'Travel maps & atlases'),
	('WTRD', 'Road atlases & maps'),
	('WTRM', 'Travel maps'),
	('WTRS', 'Street maps & city plans'),
	('WZ', 'Miscellaneous items'),
	('WZG', 'Gift books'),
	('WZS', 'Stationery items'),
	('Y', 'Children''s, Teenage & educational'),
	('YB', 'Picture books, activity books & early learning material'),
	('YBC', 'Picture books'),
	('YBCB', 'Baby books'),
	('YBCH', 'Picture books: character books'),
	('YBCS', 'Picture storybooks'),
	('YBG', 'Interactive & activity books & packs'),
	('YBGC', 'Colouring & painting activity books'),
	('YBGK', 'Press out & kit books'),
	('YBGP', 'Pop-up & lift-the-flap books'),
	('YBGS', 'Sticker & stamp books'),
	('YBGT', 'Novelty, toy & die-cut books'),
	('YBGT1', 'Sound story, noisy books, musical books'),
	('YBGT3', 'Touch & feel books'),
	('YBGT5', 'Magnet books'),
	('YBGT7', 'Jigsaw books'),
	('YBL', 'Early learning / early learning concepts'),
	('YBLA', 'Early learning: ABC books / alphabet books'),
	('YBLA1', 'Early learning: first word books'),
	('YBLB', 'Early learning: rhyming & wordplay books'),
	('YBLB1', 'Early learning: verse & rhymes'),
	('YBLC', 'Early learning: numbers & counting'),
	('YBLD', 'Early learning: colours'),
	('YBLF', 'Early learning: opposites'),
	('YBLH', 'Early learning: size, shapes & patterns'),
	('YBLJ', 'Early learning: time & seasons'),
	('YBLJ1', 'Early learning: telling the time'),
	('YBLN', 'Early learning: first experiences'),
	('YBLN1', 'Early learning: the senses'),
	('YBLP', 'Early learning: people who help us'),
	('YBLT', 'Early learning: things that go'),
	('YD', 'Children''s / Teenage poetry, anthologies, annuals'),
	('YDA', 'Annuals (Children''s / Teenage)'),
	('YDC', 'Anthologies (Children''s / Teenage)'),
	('YDP', 'Poetry (Children''s / Teenage)'),
	('YF', 'Children''s / Teenage fiction & true stories'),
	('YFA', 'Classic fiction (Children''s / Teenage)'),
	('YFB', 'General fiction (Children''s / Teenage)'),
	('YFC', 'Adventure stories (Children''s / Teenage)'),
	('YFCB', 'Thrillers (Children''s / Teenage)'),
	('YFCF', 'Crime & mystery fiction (Children''s / Teenage)'),
	('YFD', 'Horror & ghost stories, chillers (Children''s / Teenage)'),
	('YFG', 'Science fiction (Children''s / Teenage)'),
	('YFH', 'Fantasy & magical realism (Children''s / Teenage)'),
	('YFHR', 'Fantasy romance (Teenage)'),
	('YFJ', 'Traditional stories (Children''s / Teenage)'),
	('YFM', 'Romance & relationships stories (Children''s / Teenage)'),
	('YFN', 'Family & home stories (Children''s / Teenage)'),
	('YFP', 'Animal stories (Children''s / Teenage)'),
	('YFQ', 'Humorous stories (Children''s / Teenage)'),
	('YFR', 'Sporting stories (Children''s / Teenage)'),
	('YFS', 'School stories (Children''s / Teenage)'),
	('YFT', 'Historical fiction (Children''s / Teenage)'),
	('YFU', 'Short stories (Children''s / Teenage)'),
	('YFW', 'Comic strip fiction / graphic novels (Children''s / Teenage)'),
	('YFY', 'True stories (Children''s / Teenage)'),
	('YN', 'Children''s / Teenage: general non-fiction'),
	('YNA', 'Art: general interest (Children''s / Teenage)'),
	('YNC', 'Music: general interest (Children''s / Teenage)'),
	('YNCP', 'Pop music (Children''s / Teenage)'),
	('YND', 'Drama & performing (Children''s / Teenage)'),
	('YNDB', 'Dance, ballet (Children''s / Teenage)'),
	('YNDS', 'Playscripts (Children''s / Teenage)'),
	('YNF', 'Television & film (Children''s / Teenage)'),
	('YNG', 'General knowledge & trivia (Children''s / Teenage)'),
	('YNGL', 'Libraries, museums, schools (Children''s / Teenage)'),
	('YNH', 'History & the past: general interest (Children''s / Teenage)'),
	('YNJ', 'Warfare, battles, armed forces (Children''s / Teenage)'),
	('YNK', 'Work & industry / world of work (Children''s / Teenage)'),
	('YNL', 'Literature, books & writers (Children’s/Teenage)'),
	('YNM', 'People & places (Children''s / Teenage)'),
	('YNN', 'Natural history (Children’s/Teenage)'),
	('YNNA', 'Dinosaurs & prehistoric world (Children''s / Teenage)'),
	('YNND', 'Pets (Children''s / Teenage)'),
	('YNNF', 'Farm animals (Children''s / Teenage)'),
	('YNNR', 'Wildlife (Children''s / Teenage)'),
	('YNP', 'Practical interests (Children''s / Teenage)'),
	('YNPC', 'Cooking & food (Children''s / Teenage)'),
	('YNPG', 'Gardening (Children''s / Teenage)'),
	('YNPH', 'Handicrafts (Children''s / Teenage)'),
	('YNPK', 'Money (Children''s / Teenage)'),
	('YNR', 'Religion & beliefs: general interest (Children''s / Teenage)'),
	('YNRB', 'Bibles & bible stories (Children''s / Teenage)'),
	('YNT', 'Science & technology: general interest (Children''s / Teenage)'),
	('YNTB', 'Buildings & construction (Children''s / Teenage)'),
	('YNTR', 'Transport (Children''s / Teenage)'),
	('YNTS', 'Space (Children''s / Teenage)'),
	('YNU', 'Humour & jokes (Children''s / Teenage)'),
	('YNUC', 'Cartoons & comic strips (Children''s / Teenage)'),
	('YNV', 'Hobbies, quizzes & games (Children''s / Teenage)'),
	('YNVP', 'Puzzle books (Children''s / Teenage)'),
	('YNVU', 'Computer game guides (Children''s / Teenage)'),
	('YNW', 'Sports & outdoor recreation (Children''s / Teenage)'),
	('YNWA', 'Football / soccer (Children''s / Teenage)'),
	('YNWB', 'Rugby (Children''s / Teenage)'),
	('YNWC', 'Cricket (Children''s / Teenage)'),
	('YNWG', 'Athletics & gymnastics (Children''s / Teenage)'),
	('YNWW', 'Swimming & water sports (Children''s / Teenage)'),
	('YNWY', 'Cycling, boarding & skating (Children''s / Teenage)'),
	('YNX', 'Mysteries, the supernatural, monsters & mythological beings (Children’s/Teenage)'),
	('YNXF', 'UFOs & extraterrestrial beings (Children''s / Teenage)'),
	('YNXW', 'Witches & ghosts (Children''s / Teenage)'),
	('YQ', 'Educational material'),
	('YQA', 'Educational: Art & design'),
	('YQB', 'Educational: Music'),
	('YQC', 'Educational: English language & literacy'),
	('YQCR', 'Educational: English language: readers & reading schemes'),
	('YQCR5', 'Educational: English language: readers & reading schemes: Synthetic Phonics'),
	('YQCS', 'Educational: English language: reading & writing skills'),
	('YQCS1', 'Educational: writing skills: handwriting'),
	('YQCS5', 'Educational: English language: reading skills: Synthetic Phonics'),
	('YQD', 'Educational: drama studies'),
	('YQE', 'Educational: English literature'),
	('YQEF', 'School editions of English literature fiction texts'),
	('YQES', 'School editions of Shakespeare'),
	('YQF', 'Educational: Languages other than English'),
	('YQFL', 'Educational: literature in languages other than English'),
	('YQG', 'Educational: Geography'),
	('YQH', 'Educational: History'),
	('YQJ', 'Educational: Social sciences'),
	('YQJP', 'Educational: Psychology'),
	('YQM', 'Educational: Mathematics & numeracy'),
	('YQMT', 'Educational: Mathematics & numeracy: times tables'),
	('YQN', 'Educational: Citizenship & social education'),
	('YQNP', 'Educational: Personal, social & health education (PSHE)'),
	('YQR', 'Educational: Religious studies'),
	('YQRA', 'Educational: school assembly resource material'),
	('YQRC', 'Educational: Religious studies: Christianity'),
	('YQRN', 'Educational: Religious studies: Non-Christian religions'),
	('YQRN1', 'Educational: Religious studies: Judaism'),
	('YQRN2', 'Educational: Religious studies: Islam'),
	('YQRN3', 'Educational: Religious studies: Hinduism'),
	('YQRN4', 'Educational: Religious studies: Buddhism'),
	('YQS', 'Educational: Sciences, general science'),
	('YQSB', 'Educational: Biology'),
	('YQSC', 'Educational: Chemistry'),
	('YQSP', 'Educational: Physics'),
	('YQT', 'Educational: Technology'),
	('YQTD', 'Educational: Design & technology'),
	('YQTF', 'Educational: Food technology'),
	('YQTU', 'Educational: IT & computing, ICT'),
	('YQV', 'Educational: Business studies & economics'),
	('YQW', 'Educational: Physical education (including dance)'),
	('YQX', 'Educational: General studies / study skills general'),
	('YQY', 'Educational: Vocational subjects'),
	('YQZ', 'Educational: study & revision guides'),
	('YR', 'Reference material (Children''s / Teenage)'),
	('YRD', 'Dictionaries, school dictionaries (Children''s / Teenage)'),
	('YRDC', 'Picture dictionaries (Children''s / Teenage)'),
	('YRDL', 'Bilingual/multilingual dictionaries (Children''s / Teenage)'),
	('YRE', 'Encyclopaedias (Children''s / Teenage)'),
	('YRG', 'Reference works (Children''s / Teenage)'),
	('YRW', 'Atlases & maps (Children’s/Teenage)'),
	('YX', 'Personal & social issues (Children''s / Teenage)'),
	('YXA', 'Personal & social issues: body & health (Children''s / Teenage)'),
	('YXAX', 'Personal & social issues: sex education & the facts of life (Children''s / Teenage)'),
	('YXC', 'Personal & social issues: bullying, violence & abuse (Children''s / Teenage)'),
	('YXF', 'Personal & social issues: family issues (Children''s / Teenage)'),
	('YXFD', 'Personal & social issues: divorce, separation, family break-up (Children''s / Teenage)'),
	('YXFM', 'Personal & social issues: siblings (Children''s / Teenage)'),
	('YXFT', 'Personal & social issues: teenage pregnancy (Children''s / Teenage)'),
	('YXG', 'Personal & social issues: death & bereavement (Children''s / Teenage)'),
	('YXJ', 'Personal & social issues: drugs & addiction (Children''s / Teenage)'),
	('YXK', 'Personal & social issues: disability & special needs (Children''s / Teenage)'),
	('YXL', 'Personal & social issues: self-awareness & self-esteem (Children''s / Teenage)'),
	('YXN', 'Personal & social issues: racism & multiculturalism (Children''s / Teenage)'),
	('YXS', 'Personal & social issues: sexuality & relationships (Children''s / Teenage)'),
	('YXT', 'Personal & social issues: truancy & school problems (Children''s / Teenage)'),
	('YXV', 'Personal & social issues: careers guidance (Teenage)'),
	('YXZ', 'Social issues (Children''s / Teenage)'),
	('YXZG', 'Social issues: environment & green issues (Children''s / Teenage)'),
	('YXZR', 'Social issues: religious issues (Children''s / Teenage)'),
	('YXZW', 'Social issues: war & conflict issues (Children''s / Teenage)'),
	('YZ', 'Stationery & miscellaneous items (Children''s / Teenage)')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS top_level_subject (
	code VARCHAR(4) PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS top_level_subject__name__index ON top_level_subject(name);
INSERT INTO top_level_subject (code, name) SELECT code, name FROM subject WHERE length(code) = 1 ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS mid_level_subject (
	code VARCHAR(6) PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS mid_level_subject__name__index ON mid_level_subject(name);
INSERT INTO mid_level_subject (code, name) SELECT code, name FROM subject WHERE length(code) = 3 OR length(code) = 4 ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS third_level_subject (
	code VARCHAR(6) PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX ON third_level_subject(name);
INSERT INTO third_level_subject (code, name) SELECT code, name FROM subject WHERE length(code) = 3 ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS fourth_level_subject (
	code VARCHAR(6) PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX ON fourth_level_subject(name);
INSERT INTO fourth_level_subject (code, name) SELECT code, name FROM subject WHERE length(code) = 4 ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS country (
	iso2 VARCHAR(2) PRIMARY KEY NOT NULL,
	iso3 VARCHAR(3) UNIQUE NOT NULL,
	name VARCHAR(255) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS country__name__index ON country(name);
INSERT INTO country (name, iso2, iso3) VALUES
	('Afghanistan','AF','AFG'),
	('Åland Islands','AX','ALA'),
	('Albania','AL','ALB'),
	('Algeria','DZ','DZA'),
	('American Samoa','AS','ASM'),
	('Andorra','AD','AND'),
	('Angola','AO','AGO'),
	('Anguilla','AI','AIA'),
	('Antarctica','AQ','ATA'),
	('Antigua and Barbuda','AG','ATG'),
	('Argentina','AR','ARG'),
	('Armenia','AM','ARM'),
	('Aruba','AW','ABW'),
	('Australia','AU','AUS'),
	('Austria','AT','AUT'),
	('Azerbaijan','AZ','AZE'),
	('Bahamas','BS','BHS'),
	('Bahrain','BH','BHR'),
	('Bangladesh','BD','BGD'),
	('Barbados','BB','BRB'),
	('Belarus','BY','BLR'),
	('Belgium','BE','BEL'),
	('Belize','BZ','BLZ'),
	('Benin','BJ','BEN'),
	('Bermuda','BM','BMU'),
	('Bhutan','BT','BTN'),
	('Bolivia (Plurinational State of)','BO','BOL'),
	('Bonaire, Sint Eustatius and Saba','BQ','BES'),
	('Bosnia and Herzegovina','BA','BIH'),
	('Botswana','BW','BWA'),
	('Bouvet Island','BV','BVT'),
	('Brazil','BR','BRA'),
	('British Indian Ocean Territory','IO','IOT'),
	('Brunei Darussalam','BN','BRN'),
	('Bulgaria','BG','BGR'),
	('Burkina Faso','BF','BFA'),
	('Burundi','BI','BDI'),
	('Cabo Verde','CV','CPV'),
	('Cambodia','KH','KHM'),
	('Cameroon','CM','CMR'),
	('Canada','CA','CAN'),
	('Cayman Islands','KY','CYM'),
	('Central African Republic','CF','CAF'),
	('Chad','TD','TCD'),
	('Chile','CL','CHL'),
	('China','CN','CHN'),
	('Christmas Island','CX','CXR'),
	('Cocos (Keeling) Islands','CC','CCK'),
	('Colombia','CO','COL'),
	('Comoros','KM','COM'),
	('Congo','CG','COG'),
	('Congo (Democratic Republic of the)','CD','COD'),
	('Cook Islands','CK','COK'),
	('Costa Rica','CR','CRI'),
	('Côte d''Ivoire','CI','CIV'),
	('Croatia','HR','HRV'),
	('Cuba','CU','CUB'),
	('Curaçao','CW','CUW'),
	('Cyprus','CY','CYP'),
	('Czechia','CZ','CZE'),
	('Denmark','DK','DNK'),
	('Djibouti','DJ','DJI'),
	('Dominica','DM','DMA'),
	('Dominican Republic','DO','DOM'),
	('Ecuador','EC','ECU'),
	('Egypt','EG','EGY'),
	('El Salvador','SV','SLV'),
	('Equatorial Guinea','GQ','GNQ'),
	('Eritrea','ER','ERI'),
	('Estonia','EE','EST'),
	('Eswatini','SZ','SWZ'),
	('Ethiopia','ET','ETH'),
	('Falkland Islands (Malvinas)','FK','FLK'),
	('Faroe Islands','FO','FRO'),
	('Fiji','FJ','FJI'),
	('Finland','FI','FIN'),
	('France','FR','FRA'),
	('French Guiana','GF','GUF'),
	('French Polynesia','PF','PYF'),
	('French Southern Territories','TF','ATF'),
	('Gabon','GA','GAB'),
	('Gambia','GM','GMB'),
	('Georgia','GE','GEO'),
	('Germany','DE','DEU'),
	('Ghana','GH','GHA'),
	('Gibraltar','GI','GIB'),
	('Greece','GR','GRC'),
	('Greenland','GL','GRL'),
	('Grenada','GD','GRD'),
	('Guadeloupe','GP','GLP'),
	('Guam','GU','GUM'),
	('Guatemala','GT','GTM'),
	('Guernsey','GG','GGY'),
	('Guinea','GN','GIN'),
	('Guinea-Bissau','GW','GNB'),
	('Guyana','GY','GUY'),
	('Haiti','HT','HTI'),
	('Heard Island and McDonald Islands','HM','HMD'),
	('Holy See','VA','VAT'),
	('Honduras','HN','HND'),
	('Hong Kong','HK','HKG'),
	('Hungary','HU','HUN'),
	('Iceland','IS','ISL'),
	('India','IN','IND'),
	('Indonesia','ID','IDN'),
	('Iran (Islamic Republic of)','IR','IRN'),
	('Iraq','IQ','IRQ'),
	('Ireland','IE','IRL'),
	('Isle of Man','IM','IMN'),
	('Israel','IL','ISR'),
	('Italy','IT','ITA'),
	('Jamaica','JM','JAM'),
	('Japan','JP','JPN'),
	('Jersey','JE','JEY'),
	('Jordan','JO','JOR'),
	('Kazakhstan','KZ','KAZ'),
	('Kenya','KE','KEN'),
	('Kiribati','KI','KIR'),
	('Korea (Democratic People''s Republic of)','KP','PRK'),
	('Korea (Republic of)','KR','KOR'),
	('Kuwait','KW','KWT'),
	('Kyrgyzstan','KG','KGZ'),
	('Lao People''s Democratic Republic','LA','LAO'),
	('Latvia','LV','LVA'),
	('Lebanon','LB','LBN'),
	('Lesotho','LS','LSO'),
	('Liberia','LR','LBR'),
	('Libya','LY','LBY'),
	('Liechtenstein','LI','LIE'),
	('Lithuania','LT','LTU'),
	('Luxembourg','LU','LUX'),
	('Macao','MO','MAC'),
	('Macedonia (the former Yugoslav Republic of)','MK','MKD'),
	('Madagascar','MG','MDG'),
	('Malawi','MW','MWI'),
	('Malaysia','MY','MYS'),
	('Maldives','MV','MDV'),
	('Mali','ML','MLI'),
	('Malta','MT','MLT'),
	('Marshall Islands','MH','MHL'),
	('Martinique','MQ','MTQ'),
	('Mauritania','MR','MRT'),
	('Mauritius','MU','MUS'),
	('Mayotte','YT','MYT'),
	('Mexico','MX','MEX'),
	('Micronesia (Federated States of)','FM','FSM'),
	('Moldova (Republic of)','MD','MDA'),
	('Monaco','MC','MCO'),
	('Mongolia','MN','MNG'),
	('Montenegro','ME','MNE'),
	('Montserrat','MS','MSR'),
	('Morocco','MA','MAR'),
	('Mozambique','MZ','MOZ'),
	('Myanmar','MM','MMR'),
	('Namibia','NA','NAM'),
	('Nauru','NR','NRU'),
	('Nepal','NP','NPL'),
	('Netherlands','NL','NLD'),
	('New Caledonia','NC','NCL'),
	('New Zealand','NZ','NZL'),
	('Nicaragua','NI','NIC'),
	('Niger','NE','NER'),
	('Nigeria','NG','NGA'),
	('Niue','NU','NIU'),
	('Norfolk Island','NF','NFK'),
	('Northern Mariana Islands','MP','MNP'),
	('Norway','NO','NOR'),
	('Oman','OM','OMN'),
	('Pakistan','PK','PAK'),
	('Palau','PW','PLW'),
	('Palestine, State of','PS','PSE'),
	('Panama','PA','PAN'),
	('Papua New Guinea','PG','PNG'),
	('Paraguay','PY','PRY'),
	('Peru','PE','PER'),
	('Philippines','PH','PHL'),
	('Pitcairn','PN','PCN'),
	('Poland','PL','POL'),
	('Portugal','PT','PRT'),
	('Puerto Rico','PR','PRI'),
	('Qatar','QA','QAT'),
	('Réunion','RE','REU'),
	('Romania','RO','ROU'),
	('Russian Federation','RU','RUS'),
	('Rwanda','RW','RWA'),
	('Saint Barthélemy','BL','BLM'),
	('Saint Helena, Ascension and Tristan da Cunha','SH','SHN'),
	('Saint Kitts and Nevis','KN','KNA'),
	('Saint Lucia','LC','LCA'),
	('Saint Martin (French part)','MF','MAF'),
	('Saint Pierre and Miquelon','PM','SPM'),
	('Saint Vincent and the Grenadines','VC','VCT'),
	('Samoa','WS','WSM'),
	('San Marino','SM','SMR'),
	('Sao Tome and Principe','ST','STP'),
	('Saudi Arabia','SA','SAU'),
	('Senegal','SN','SEN'),
	('Serbia','RS','SRB'),
	('Seychelles','SC','SYC'),
	('Sierra Leone','SL','SLE'),
	('Singapore','SG','SGP'),
	('Sint Maarten (Dutch part)','SX','SXM'),
	('Slovakia','SK','SVK'),
	('Slovenia','SI','SVN'),
	('Solomon Islands','SB','SLB'),
	('Somalia','SO','SOM'),
	('South Africa','ZA','ZAF'),
	('South Georgia and the South Sandwich Islands','GS','SGS'),
	('South Sudan','SS','SSD'),
	('Spain','ES','ESP'),
	('Sri Lanka','LK','LKA'),
	('Sudan','SD','SDN'),
	('Suriname','SR','SUR'),
	('Svalbard and Jan Mayen','SJ','SJM'),
	('Sweden','SE','SWE'),
	('Switzerland','CH','CHE'),
	('Syrian Arab Republic','SY','SYR'),
	('Taiwan, Province of China','TW','TWN'),
	('Tajikistan','TJ','TJK'),
	('Tanzania, United Republic of','TZ','TZA'),
	('Thailand','TH','THA'),
	('Timor-Leste','TL','TLS'),
	('Togo','TG','TGO'),
	('Tokelau','TK','TKL'),
	('Tonga','TO','TON'),
	('Trinidad and Tobago','TT','TTO'),
	('Tunisia','TN','TUN'),
	('Turkey','TR','TUR'),
	('Turkmenistan','TM','TKM'),
	('Turks and Caicos Islands','TC','TCA'),
	('Tuvalu','TV','TUV'),
	('Uganda','UG','UGA'),
	('Ukraine','UA','UKR'),
	('United Arab Emirates','AE','ARE'),
	('United Kingdom of Great Britain and Northern Ireland','GB','GBR'),
	('United States of America','US','USA'),
	('United States Minor Outlying Islands','UM','UMI'),
	('Uruguay','UY','URY'),
	('Uzbekistan','UZ','UZB'),
	('Vanuatu','VU','VUT'),
	('Venezuela (Bolivarian Republic of)','VE','VEN'),
	('Viet Nam','VN','VNM'),
	('Virgin Islands (British)','VG','VGB'),
	('Virgin Islands (U.S.)','VI','VIR'),
	('Wallis and Futuna','WF','WLF'),
	('Western Sahara','EH','ESH'),
	('Yemen','YE','YEM'),
	('Zambia','ZM','ZMB'),
	('Zimbabwe','ZW','ZWE')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS asset_school_info (
	school_id BIGINT NOT NULL,
	asset_id INTEGER NOT NULL,
	is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
	user_id BIGINT NOT NULL DEFAULT 0,
	expiration_date TIMESTAMPTZ,
	is_auto_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
	email_processed BOOLEAN NOT NULL DEFAULT FALSE,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS asset_school_info__user_asset__index ON asset_school_info(school_id, asset_id);
CREATE INDEX IF NOT EXISTS asset_school_info__school_id__index ON asset_school_info(school_id);
CREATE INDEX IF NOT EXISTS asset_school_info__asset_id__index ON asset_school_info(asset_id);
CREATE INDEX IF NOT EXISTS asset_school_info__user_id__index ON asset_school_info(user_id);
CREATE INDEX IF NOT EXISTS asset_school_info__expiration_date__index ON asset_school_info(expiration_date);
CREATE INDEX IF NOT EXISTS asset_school_info__is_auto_unlocked__index ON asset_school_info(is_auto_unlocked);
CREATE INDEX IF NOT EXISTS asset_school_info__email_processed__index ON asset_school_info(email_processed);

CREATE TABLE IF NOT EXISTS student (
	id BIGSERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	enroll_number VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	school_id BIGINT NOT NULL,
	department VARCHAR(255) NOT NULL,
	city_id BIGINT NOT NULL,
	mobile_number VARCHAR(255) NOT NULL,
	address VARCHAR(255) NOT NULL,
);

CREATE TABLE IF NOT EXISTS course (
	id BIGSERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	creator_id BIGINT NOT NULL,
	title VARCHAR(255) NOT NULL,
	year_group VARCHAR(255),
	school_id BIGINT NOT NULL,
	oid VARCHAR(36) NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
	number_of_students INT,
	exam_board VARCHAR(20),
	key_stage VARCHAR(20),
	wonde_identifier TEXT,
	wonde_mis_id TEXT,
	keywords tsvector,
	title_lower VARCHAR(255),
	archive_date TIMESTAMPTZ,
	parent_id INT NOT NULL DEFAULT 0,
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS course__school_title_wonde__index ON course(school_id, title, COALESCE(wonde_identifier, '')) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS course__date_created__index ON course(date_created);
CREATE INDEX IF NOT EXISTS course__date_edited__index ON course(date_edited);
CREATE INDEX IF NOT EXISTS course__title__index ON course(title);
CREATE INDEX IF NOT EXISTS course__school_id__index ON course(school_id);
CREATE UNIQUE INDEX IF NOT EXISTS course__oid__index ON course(oid) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS course__oid_btree__index ON course(oid);
CREATE INDEX IF NOT EXISTS course__creator_id__index ON course(creator_id);
CREATE UNIQUE INDEX IF NOT EXISTS course__wonde_identifier__index ON course(wonde_identifier) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS course__wonde_identifier_btree__index ON course(wonde_identifier);
CREATE INDEX IF NOT EXISTS course__wonde_mis_id__index ON course(wonde_mis_id);
CREATE INDEX IF NOT EXISTS course__keywords__index ON course USING GIN(keywords);
CREATE INDEX IF NOT EXISTS course__title_lower__index ON course(title_lower);
CREATE INDEX IF NOT EXISTS course__parent_id__index ON course(parent_id);

CREATE OR REPLACE FUNCTION course__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.title, '')), 'A')
			|| setweight(to_tsvector('english', REGEXP_REPLACE(COALESCE(new.title, ''), '^[0-9]*(.+?)[0-9]*$', '\1')), 'C')
			|| setweight(to_tsvector('english', COALESCE(new.key_stage, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.year_group, '')), 'B')
		;
		return new;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS course__keywords__trigger ON course;
CREATE TRIGGER course__keywords__trigger BEFORE INSERT OR UPDATE ON course FOR EACH ROW EXECUTE PROCEDURE course__keywords__func_trigger();

CREATE OR REPLACE FUNCTION course__title__func_trigger() RETURNS trigger AS $$
	begin
		new.title_lower := LOWER(new.title);
		return new;
	end;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS course__title__trigger ON course;
CREATE TRIGGER course__title__trigger
	BEFORE INSERT OR UPDATE OF title ON course
	FOR EACH ROW
	EXECUTE PROCEDURE course__title__func_trigger();


CREATE TABLE IF NOT EXISTS course_teachers (
	course_id BIGINT NOT NULL,
	teacher_id INTEGER NOT NULL,
	PRIMARY KEY (course_id, teacher_id),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS course_teachers__course_id__index ON course_teachers(course_id);
CREATE INDEX IF NOT EXISTS course_teachers__teacher_id__index ON course_teachers(teacher_id);

CREATE TABLE IF NOT EXISTS extract (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_created_year INT NOT NULL,
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_expired TIMESTAMP NOT NULL DEFAULT NOW() + interval '3 months',
	title VARCHAR(255) NOT NULL,
	exam_board VARCHAR(32),
	students_in_course INTEGER NOT NULL,
	page_count INTEGER NOT NULL,
	oid VARCHAR(36) NOT NULL,
	asset_id INTEGER NOT NULL,
	course_id BIGINT NOT NULL,
	course_name_log VARCHAR(255) NOT NULL,
	school_id BIGINT NOT NULL,
	user_id BIGINT NOT NULL,
	pages JSONB NOT NULL,
	title_tsv tsvector,
	course_name_log_tsv tsvector,
	is_watermarked BOOLEAN NOT NULL DEFAULT FALSE,
	keywords tsvector,
	archive_date TIMESTAMPTZ,
	parent_id INT NOT NULL DEFAULT 0,
	status extract_status NOT NULL DEFAULT 'editable',
	grace_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + interval '14 days',
	modified_by_user_id BIGINT NOT NULL DEFAULT 0,
	cloned_from_extract_id INT,
	asset_user_upload_id INT
);
CREATE UNIQUE INDEX IF NOT EXISTS extract__oid__index ON extract(oid) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS extract__oid_btree__index ON extract(oid);
CREATE INDEX IF NOT EXISTS extract__asset_id__index ON extract(asset_id);
CREATE INDEX IF NOT EXISTS extract__course_id__index ON extract(course_id);
CREATE INDEX IF NOT EXISTS extract__school_id__index ON extract(school_id);
CREATE INDEX IF NOT EXISTS extract__user_id__index ON extract(user_id);
CREATE INDEX IF NOT EXISTS extract__pages__index ON extract(pages);
CREATE INDEX IF NOT EXISTS extract__title_tsv__index ON extract USING GIN(title_tsv);
CREATE INDEX IF NOT EXISTS extract__course_name_log_tsv__index ON extract USING GIN(course_name_log_tsv);
CREATE INDEX IF NOT EXISTS extract__keywords__index ON extract USING GIN(keywords);
CREATE INDEX IF NOT EXISTS extract__date_created__index ON extract(date_created);
CREATE INDEX IF NOT EXISTS extract__date_expired__index ON extract(date_expired);
CREATE INDEX IF NOT EXISTS extract__parent_id__index ON extract(parent_id);
CREATE INDEX IF NOT EXISTS extract__status__index ON extract(status);
CREATE INDEX IF NOT EXISTS extract__grace_period_end__index ON extract(grace_period_end);
CREATE INDEX IF NOT EXISTS extract__cloned_from_extract_id__index ON extract(cloned_from_extract_id);
CREATE INDEX IF NOT EXISTS extract__asset_user_upload_id__index ON extract(asset_user_upload_id);

CREATE OR REPLACE FUNCTION extract_upsert_trigger() RETURNS trigger AS $$
begin
	new.title_tsv := setweight(to_tsvector('english', new.title), 'B');
	new.course_name_log_tsv := setweight(to_tsvector('english', new.course_name_log), 'B');
	new.date_created_year := EXTRACT(YEAR FROM new.date_created);
	new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.title, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE((SELECT title FROM asset WHERE id = new.asset_id), '')), 'A')
			|| setweight(to_tsvector('english', COALESCE((SELECT authors_string FROM asset WHERE id = new.asset_id), '')), 'A');
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS extract_tsv_updater ON extract;
CREATE TRIGGER extract_tsv_updater BEFORE INSERT OR UPDATE ON extract FOR EACH ROW EXECUTE PROCEDURE extract_upsert_trigger();

CREATE TABLE IF NOT EXISTS extract_user_info (
	extract_id INTEGER NOT NULL,
	user_id BIGINT NOT NULL,
	is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (extract_id, user_id)
);
CREATE INDEX IF NOT EXISTS extract_user_info__extract_id__index ON extract_user_info(extract_id);
CREATE INDEX IF NOT EXISTS extract_user_info__user_id__index ON extract_user_info(user_id);
CREATE INDEX IF NOT EXISTS extract_user_info__is_favorite__index ON extract_user_info(is_favorite);

CREATE TABLE IF NOT EXISTS extract_page (
	course_id BIGINT NOT NULL,
	asset_id INTEGER NOT NULL,
	page_number SMALLINT NOT NULL,
	archive_date TIMESTAMPTZ,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS extract_page__id__index ON extract_page(course_id, asset_id, page_number) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS extract_page__course_id__index ON extract_page(course_id);
CREATE INDEX IF NOT EXISTS extract_page__asset_id__index ON extract_page(asset_id);
CREATE INDEX IF NOT EXISTS extract_page__course_page__index ON extract_page((course_id::text || '.' || page_number::text));

CREATE TABLE IF NOT EXISTS extract_page_by_school (
	school_id BIGINT NOT NULL,
	asset_id INTEGER NOT NULL,
	page_number SMALLINT NOT NULL,
	archive_date TIMESTAMPTZ,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS extract_page_by_school__id__index ON extract_page_by_school(school_id, asset_id, page_number) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS extract_page_by_school__school_id__index ON extract_page_by_school(school_id);
CREATE INDEX IF NOT EXISTS extract_page_by_school__asset_id__index ON extract_page_by_school(asset_id);
CREATE INDEX IF NOT EXISTS extract_page_by_school__school_page__index ON extract_page_by_school((school_id::text || '.' || page_number::text));

CREATE TABLE IF NOT EXISTS extract_share (
	id SERIAL PRIMARY KEY,
	oid VARCHAR(36) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_expired TIMESTAMP NOT NULL DEFAULT NOW() + interval '3 months',
	user_id BIGINT NOT NULL,
	extract_id INTEGER NOT NULL,
	title VARCHAR(255),
	access_code VARCHAR(10),
	enable_extract_share_access_code BOOLEAN NOT NULL DEFAULT FALSE,
	archive_date TIMESTAMPTZ,
	parent_id INT NOT NULL DEFAULT 0,
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS extract_share__oid__index ON extract_share(oid) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS extract_share__oid_btree__index ON extract_share(oid);
CREATE INDEX IF NOT EXISTS extract_share__user_id__index ON extract_share(user_id);
CREATE INDEX IF NOT EXISTS extract_share__extract_id__index ON extract_share(extract_id);
CREATE INDEX IF NOT EXISTS extract_share__title__index ON extract_share(title);
CREATE INDEX IF NOT EXISTS extract_share__date_expired__index ON extract_share(date_expired);
CREATE INDEX IF NOT EXISTS extract_share__access_code__index ON extract_share(access_code);
CREATE INDEX IF NOT EXISTS extract_share__parent_id__index ON extract_share(parent_id);

CREATE TABLE IF NOT EXISTS unlock_attempt (
	id SERIAL PRIMARY KEY,
	oid VARCHAR(36) NOT NULL,
	user_id BIGINT NOT NULL,
	user_email VARCHAR(255) NOT NULL,
	school_id BIGINT NOT NULL,
	school_name VARCHAR(255) NOT NULL,
	isbn VARCHAR(32) NOT NULL,
	status VARCHAR(64) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	asset_id INTEGER NOT NULL DEFAULT 0,
	event VARCHAR(50),
	intent_to_copy BOOLEAN,
	expiration_date TIMESTAMPTZ,
	asset_title TEXT,
	publisher_name TEXT,
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS unlock_attempt__user_id__index ON unlock_attempt(user_id);
CREATE INDEX IF NOT EXISTS unlock_attempt__school_id__index ON unlock_attempt(school_id);
CREATE INDEX IF NOT EXISTS unlock_attempt__isbn__index ON unlock_attempt(isbn);
CREATE INDEX IF NOT EXISTS unlock_attempt__date_created__index ON unlock_attempt(date_created);
CREATE INDEX IF NOT EXISTS unlock_attempt__status__index ON unlock_attempt(status);
CREATE UNIQUE INDEX IF NOT EXISTS unlock_attempt__oid__index ON unlock_attempt(oid);
CREATE INDEX IF NOT EXISTS unlock_attempt__asset_id__index ON unlock_attempt(asset_id);
CREATE INDEX IF NOT EXISTS unlock_attempt__event__index ON unlock_attempt(event);
CREATE INDEX IF NOT EXISTS unlock_attempt__intent_to_copy__index ON unlock_attempt(intent_to_copy);

CREATE TABLE IF NOT EXISTS approved_domain (
	id SERIAL PRIMARY KEY,
	domain VARCHAR(255) NOT NULL,
	school_id BIGINT NOT NULL,
	keywords TSVECTOR,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS approved_domain__school_id__index ON approved_domain(school_id);
CREATE INDEX IF NOT EXISTS approved_domain__domain__index ON approved_domain(domain);
CREATE UNIQUE INDEX IF NOT EXISTS approved_domain__school_id_domain__index ON approved_domain(school_id, domain);
CREATE INDEX IF NOT EXISTS approved_domain__keywords__index ON approved_domain USING GIN(keywords);

CREATE OR REPLACE FUNCTION approved_domain__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.domain, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE((SELECT name FROM school WHERE id = new.school_id), '')), 'A')
		;
		return new;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS approved_domain__keywords__trigger ON approved_domain;
CREATE TRIGGER approved_domain__keywords__trigger BEFORE INSERT OR UPDATE ON approved_domain FOR EACH ROW EXECUTE PROCEDURE approved_domain__keywords__func_trigger();

CREATE TABLE IF NOT EXISTS extract_access (
	id SERIAL PRIMARY KEY,
	asset_id INT NOT NULL,
	extract_id INT NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	title_of_work CHARACTER VARYING(255) NOT NULL,
	title_of_copy CHARACTER VARYING(255) NOT NULL,
	ip_address VARCHAR(128) NOT NULL,
	user_agent CHARACTER VARYING(255),
	referrer CHARACTER VARYING(255),
	extract_oid VARCHAR(36) NOT NULL,
	extract_share_oid VARCHAR(36) NOT NULL,
	accessor_school_id BIGINT NOT NULL DEFAULT 0,
	accessor_school_name VARCHAR(255),
	user_id BIGINT NOT NULL DEFAULT 0,
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS extract_access__asset_id__index ON extract_access(asset_id);
CREATE INDEX IF NOT EXISTS extract_access__extract_id__index ON extract_access(extract_id);
CREATE INDEX IF NOT EXISTS extract_access__date_created__index ON extract_access(date_created);
CREATE INDEX IF NOT EXISTS extract_access__title_of_work__index ON extract_access(title_of_work);
CREATE INDEX IF NOT EXISTS extract_access__title_of_copy__index ON extract_access(title_of_copy);
CREATE INDEX IF NOT EXISTS extract_access__ip_address__index ON extract_access(ip_address);
CREATE INDEX IF NOT EXISTS extract_access__extract_oid__index ON extract_access(extract_oid);
CREATE INDEX IF NOT EXISTS extract_access__extract_share_oid__index ON extract_access(extract_share_oid);
CREATE INDEX IF NOT EXISTS extract_access__accessor_school_id__index ON extract_access(accessor_school_id);
CREATE INDEX IF NOT EXISTS extract_access__accessor_school_name__index ON extract_access(accessor_school_name);
CREATE INDEX IF NOT EXISTS extract_access__user_id__index ON extract_access(user_id);

CREATE TABLE IF NOT EXISTS login_attempt (
	id SERIAL PRIMARY KEY,
	email VARCHAR(128) NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	ip_address VARCHAR(128) NOT NULL,
	user_agent VARCHAR(255),
	location VARCHAR(255),
	additional_info VARCHAR(255),
	is_successful BOOLEAN NOT NULL DEFAULT FALSE,
	used_for_rate_limiting BOOLEAN NOT NULL DEFAULT TRUE,
	modified_by_user_id BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS login_attempt__date_created__index ON login_attempt(date_created);
CREATE INDEX IF NOT EXISTS login_attempt__ip_address__index ON login_attempt(ip_address);
CREATE INDEX IF NOT EXISTS login_attempt__email__index ON login_attempt(email);
CREATE INDEX IF NOT EXISTS login_attempt__is_successful__index ON login_attempt(is_successful);
CREATE INDEX IF NOT EXISTS login_attempt__used_for_rate_limiting__index ON login_attempt(used_for_rate_limiting);

CREATE TABLE IF NOT EXISTS async_task (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	key VARCHAR(255),
	callback_name VARCHAR(255) NOT NULL,
	priority INTEGER NOT NULL DEFAULT 5,
	date_to_execute TIMESTAMPTZ NOT NULL,
	data JSONB
);
CREATE INDEX IF NOT EXISTS async_task__priority__index ON async_task(priority);
CREATE INDEX IF NOT EXISTS async_task__date_to_execute__index ON async_task(date_to_execute);
CREATE UNIQUE INDEX IF NOT EXISTS async_task__key__index ON async_task(key);

CREATE TABLE extract_access_email_send_log (
	id INTEGER NOT NULL PRIMARY KEY,
	last_completed_id INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS extract_access_email_send_log__last_completed_id__index ON extract_access_email_send_log(last_completed_id);

CREATE TABLE IF NOT EXISTS school_extract_email_send_log (
	asset_id  INTEGER NOT NULL,
	school_id BIGINT NOT NULL,
	highest_percentage_ratio INTEGER NOT NULL,
	archive_date TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS school_extract_email_send_log__school_asset__index ON school_extract_email_send_log(school_id, asset_id) WHERE archive_date IS NULL;
CREATE INDEX IF NOT EXISTS school_extract_email_send_log__school_id__index ON school_extract_email_send_log(school_id);
CREATE INDEX IF NOT EXISTS school_extract_email_send_log__asset_id__index ON school_extract_email_send_log(asset_id);
CREATE INDEX IF NOT EXISTS school_extract_email_send_log__archive_date__index ON school_extract_email_send_log(archive_date);

CREATE TABLE IF NOT EXISTS notification_category (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	description_to_enable VARCHAR(255),
	code VARCHAR(255) UNIQUE NOT NULL,
	hideable BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS notification_category__sort_order__index ON notification_category(sort_order);
CREATE INDEX IF NOT EXISTS notification_category__code__index ON notification_category(code);
CREATE INDEX IF NOT EXISTS notification_category__hideable__index ON notification_category(hideable);

INSERT INTO notification_category (id, sort_order, name, description_to_enable, code, hideable) VALUES
(1, 10, 'Awaiting Approval', 'Receive notifications about users awaiting approval', 'awaiting-approval', TRUE),
(2, 20, 'Unlocked', 'Receive notifications about books I tried to unlock and are now available','unlocked', TRUE),
(4, 40, 'Book Unlock', 'Receive notifications about book unlocks', 'book-unlock', FALSE)
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS notification (
	id SERIAL PRIMARY KEY,
	oid VARCHAR(36) UNIQUE NOT NULL,
	user_id BIGINT NOT NULL DEFAULT 0,
	has_read BOOLEAN NOT NULL DEFAULT FALSE,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_expiry TIMESTAMPTZ,
	category_id INTEGER NOT NULL DEFAULT 0,
	title VARCHAR(255) NOT NULL,
	subtitle VARCHAR(255),
	description TEXT,
	link JSONB,
	hideable_log BOOLEAN NOT NULL DEFAULT TRUE,
	high_priority BOOLEAN NOT NULL DEFAULT FALSE,
	keywords TSVECTOR
);
CREATE INDEX IF NOT EXISTS notification__user_id__index ON notification(user_id);
CREATE INDEX IF NOT EXISTS notification__category_id__index ON notification(category_id);
CREATE INDEX IF NOT EXISTS notification__date_created__index ON notification(date_created);
CREATE INDEX IF NOT EXISTS notification__date_expiry__index ON notification(date_expiry);
CREATE UNIQUE INDEX IF NOT EXISTS notification__oid__index ON notification(oid);
CREATE INDEX IF NOT EXISTS notification__has_read__index ON notification(has_read);
CREATE INDEX IF NOT EXISTS notification__title__index ON notification(title);
CREATE INDEX IF NOT EXISTS notification__hideable_log__index ON notification(hideable_log);
CREATE INDEX IF NOT EXISTS notification__high_priority__index ON notification(high_priority);
CREATE INDEX IF NOT EXISTS notification__keywords__index ON notification USING GIN(keywords);

CREATE OR REPLACE FUNCTION notification__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.title, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.description, '')), 'B');
		return new;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification__keywords__trigger ON notification;
CREATE TRIGGER notification__keywords__trigger BEFORE INSERT OR UPDATE ON notification FOR EACH ROW EXECUTE PROCEDURE notification__keywords__func_trigger();

CREATE TABLE IF NOT EXISTS user_disabled_notification_categories (
	user_id BIGINT NOT NULL DEFAULT 0,
	category_id INTEGER NOT NULL DEFAULT 0,
	CONSTRAINT user_cat PRIMARY KEY(user_id, category_id)
);
CREATE INDEX IF NOT EXISTS user_disabled_notification_categories__user_id__index ON user_disabled_notification_categories(user_id);
CREATE INDEX IF NOT EXISTS user_disabled_notification_categories__category_id__index ON user_disabled_notification_categories(category_id);

CREATE TABLE user_awaiting_approval_notification_log (
	user_id BIGINT PRIMARY KEY NOT NULL
);

CREATE TABLE user_recv_emails_pardot_log (
	user_id BIGINT NOT NULL PRIMARY KEY,
	last_update_counter INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS user_recv_emails_pardot_log__last_update_counter__index ON user_recv_emails_pardot_log(last_update_counter);

CREATE TABLE user_not_created_copies_email_send_log(
	user_id BIGINT PRIMARY KEY NOT NULL,
	days INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS user_not_created_copies_email_send_log__days__index ON user_not_created_copies_email_send_log (days);

CREATE TABLE user_not_verified_email_send_log(
	user_id BIGINT PRIMARY KEY NOT NULL,
	hours INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS user_not_verified_email_send_log__hours__index ON user_not_verified_email_send_log(hours);

CREATE TABLE user_not_unlocked_email_send_log(
	user_id BIGINT PRIMARY KEY NOT NULL,
	days INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS user_not_unlocked_email_send_log__days__index ON user_not_unlocked_email_send_log(days);

CREATE TABLE IF NOT EXISTS unlock_image_upload (
	id SERIAL PRIMARY KEY,
	oid VARCHAR(36) UNIQUE NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	user_id BIGINT NOT NULL,
	asset_id INTEGER NOT NULL DEFAULT 0,
	status VARCHAR(255) NOT NULL,
	date_closed TIMESTAMPTZ,
	rejection_reason VARCHAR(100),
	pdf_isbn13 VARCHAR(13),
	closed_by VARCHAR(255),
	user_email_log VARCHAR(255),
	school_name_log VARCHAR(255),
	keywords TSVECTOR
);
CREATE INDEX IF NOT EXISTS unlock_image_upload__user_email_log__index ON unlock_image_upload(user_email_log);
CREATE INDEX IF NOT EXISTS unlock_image_upload__school_name_log__index ON unlock_image_upload(school_name_log);
CREATE INDEX IF NOT EXISTS unlock_image_upload__date_created__index ON unlock_image_upload(date_created);
CREATE INDEX IF NOT EXISTS unlock_image_upload__user_id__index ON unlock_image_upload(user_id);
CREATE INDEX IF NOT EXISTS unlock_image_upload__status__index ON unlock_image_upload(status);
CREATE INDEX IF NOT EXISTS unlock_image_upload__date_closed__index ON unlock_image_upload(date_closed);
CREATE INDEX IF NOT EXISTS unlock_image_upload__pdf_isbn13__index ON unlock_image_upload(pdf_isbn13);
CREATE INDEX IF NOT EXISTS unlock_image_upload__closed_by__index ON unlock_image_upload(closed_by);
CREATE INDEX IF NOT EXISTS unlock_image_upload__asset_id__index ON unlock_image_upload(asset_id);

CREATE OR REPLACE FUNCTION unlock_image_upload__keywords__func_trigger() RETURNS trigger AS $$
begin
	new.keywords :=
		setweight(to_tsvector('english', COALESCE(new.user_email_log, '')), 'A')
		|| setweight(to_tsvector('english', COALESCE(new.school_name_log, '')), 'B')
		|| setweight(to_tsvector('english', COALESCE(new.status, '')), 'C');
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS unlock_image_upload__keywords__trigger ON unlock_image_upload;
CREATE TRIGGER unlock_image_upload__keywords__trigger BEFORE INSERT OR UPDATE ON unlock_image_upload FOR EACH ROW EXECUTE PROCEDURE unlock_image_upload__keywords__func_trigger();

CREATE TABLE IF NOT EXISTS unlock_image_upload_ai_error_log (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	message TEXT NOT NULL,
	code INTEGER NOT NULL,
	ocr_text TEXT,
	user_id BIGINT NOT NULL DEFAULT 0,
	school_id BIGINT NOT NULL DEFAULT 0,
	unlock_image_upload_id INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS unlock_image_upload_ai_error_log__date_created__index ON unlock_image_upload_ai_error_log(date_created);
CREATE INDEX IF NOT EXISTS unlock_image_upload_ai_error_log__code__index ON unlock_image_upload_ai_error_log(code);
CREATE INDEX IF NOT EXISTS unlock_image_upload_ai_error_log__user_id__index ON unlock_image_upload_ai_error_log(user_id);
CREATE INDEX IF NOT EXISTS unlock_image_upload_ai_error_log__school_id__index ON unlock_image_upload_ai_error_log(school_id);
CREATE INDEX IF NOT EXISTS unlock_image_upload_ai_error_log__unlock_image_upload_id__index ON unlock_image_upload_ai_error_log(unlock_image_upload_id);


CREATE TABLE user_flyout_seen (
	user_id BIGINT NOT NULL,
	screen VARCHAR(100) NOT NULL,
	index INT NOT NULL,
	PRIMARY KEY(user_id, screen)
);

CREATE INDEX IF NOT EXISTS user_flyout_seen__user_id__index ON user_flyout_seen (user_id);
CREATE INDEX IF NOT EXISTS user_flyout_seen__screen__index ON user_flyout_seen (screen);

CREATE TABLE IF NOT EXISTS asset_upload_log (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMP NOT NULL DEFAULT NOW(),
	isbn13 VARCHAR(32) NOT NULL,
	alternate_isbn13 VARCHAR(32),
	pdf_isbn13 VARCHAR(32) NOT NULL,
	asset_id INTEGER NOT NULL DEFAULT 0,
	status VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS asset_upload_log__isbn13__index ON asset_upload_log(isbn13);
CREATE INDEX IF NOT EXISTS asset_upload_log__alternate_isbn13__index ON asset_upload_log(alternate_isbn13);
CREATE INDEX IF NOT EXISTS asset_upload_log__pdf_isbn13__index ON asset_upload_log(pdf_isbn13);
CREATE INDEX IF NOT EXISTS asset_upload_log__date_created__index ON asset_upload_log(date_created);
CREATE INDEX IF NOT EXISTS asset_upload_log__status__index ON asset_upload_log(status);
CREATE INDEX IF NOT EXISTS asset_upload_log__asset_id__index ON asset_upload_log(asset_id);

CREATE TABLE IF NOT EXISTS settings (
	id INTEGER NOT NULL PRIMARY KEY,
	home_screen_blog_category_names JSONB
);
INSERT INTO settings (id, home_screen_blog_category_names) VALUES (1, '[]'::jsonb) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS cached_latest_blog_post (
	id INTEGER NOT NULL PRIMARY KEY,
	image_relative_url TEXT,
	title TEXT NOT NULL,
	author_name TEXT,
	date_created TIMESTAMPTZ NOT NULL,
	relative_url TEXT NOT NULL,
	sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS cached_latest_blog_post__date_created__index ON cached_latest_blog_post(date_created);
CREATE INDEX IF NOT EXISTS cached_latest_blog_post__sort_order__index ON cached_latest_blog_post(sort_order);

CREATE TABLE IF NOT EXISTS email_activity_log (
	id SERIAL PRIMARY KEY,
	date_inserted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_event TIMESTAMPTZ NOT NULL,
	first_category TEXT,
	categories JSONB,
	target_email TEXT,
	event_type TEXT NOT NULL,
	reason TEXT,
	response TEXT,
	url TEXT,
	url_offset JSONB,
	sg_event_id TEXT NOT NULL,
	sg_message_id TEXT,
	user_agent TEXT,
	ip INET,
	status TEXT,
	smtp_id TEXT,
	content_type TEXT
);
CREATE INDEX IF NOT EXISTS email_activity_log__date_inserted__index ON email_activity_log(date_inserted);
CREATE INDEX IF NOT EXISTS email_activity_log__date_event__index ON email_activity_log(date_event);
CREATE INDEX IF NOT EXISTS email_activity_log__first_category__index ON email_activity_log(first_category);
CREATE INDEX IF NOT EXISTS email_activity_log__categories__index ON email_activity_log(categories);
CREATE INDEX IF NOT EXISTS email_activity_log__target_email__index ON email_activity_log(target_email);
CREATE INDEX IF NOT EXISTS email_activity_log__event_type__index ON email_activity_log(event_type);
CREATE INDEX IF NOT EXISTS email_activity_log__reason__index ON email_activity_log(reason);
CREATE INDEX IF NOT EXISTS email_activity_log__response__index ON email_activity_log(response);
CREATE INDEX IF NOT EXISTS email_activity_log__url__index ON email_activity_log(url);
CREATE INDEX IF NOT EXISTS email_activity_log__url_offset__index ON email_activity_log(url_offset);
CREATE UNIQUE INDEX IF NOT EXISTS email_activity_log__sg_event_id__index ON email_activity_log(sg_event_id);
CREATE INDEX IF NOT EXISTS email_activity_log__sg_message_id__index ON email_activity_log(sg_message_id);
CREATE INDEX IF NOT EXISTS email_activity_log__user_agent__index ON email_activity_log(user_agent);
CREATE INDEX IF NOT EXISTS email_activity_log__ip__index ON email_activity_log(ip);
CREATE INDEX IF NOT EXISTS email_activity_log__status__index ON email_activity_log(status);
CREATE INDEX IF NOT EXISTS email_activity_log__smtp_id__index ON email_activity_log(smtp_id);
CREATE INDEX IF NOT EXISTS email_activity_log__content_type__index ON email_activity_log(content_type);

CREATE TABLE IF NOT EXISTS trusted_domain (
	id SERIAL PRIMARY KEY,
	domain VARCHAR(255) NOT NULL,
	number_of_periods INTEGER NOT NULL DEFAULT 0,
	keywords TSVECTOR
);
CREATE UNIQUE INDEX IF NOT EXISTS trusted_domain__domain__index ON trusted_domain(domain);
CREATE INDEX IF NOT EXISTS trusted_domain__number_of_periods__index ON trusted_domain(number_of_periods);

CREATE OR REPLACE FUNCTION trusted_domain__onupsert__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.domain, '')), 'A')
		;
		new.number_of_periods = array_length(regexp_split_to_array(new.domain, '\.'), 1) - 1;
		return new;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trusted_domain__onupsert__trigger ON trusted_domain;
CREATE TRIGGER trusted_domain__onupsert__trigger BEFORE INSERT OR UPDATE ON trusted_domain FOR EACH ROW EXECUTE PROCEDURE trusted_domain__onupsert__func_trigger();

CREATE TABLE IF NOT EXISTS wonde_sync_log (
	type TEXT PRIMARY KEY,
	date_executed TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS extract_note (
	id SERIAL PRIMARY KEY,
	oid TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
	extract_id INTEGER NOT NULL,
	colour VARCHAR(10),
	position_x REAL,
	position_y REAL,
	width REAL,
	height REAL,
	content TEXT,
	zindex INTEGER,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	archive_date TIMESTAMPTZ,
	parent_id INT NOT NULL DEFAULT 0,
	page INTEGER
);
CREATE INDEX IF NOT EXISTS extract_note__extract_id__index ON extract_note(extract_id);
CREATE INDEX IF NOT EXISTS extract_note__width__index ON extract_note(width);
CREATE INDEX IF NOT EXISTS extract_note__height__index ON extract_note(height);
CREATE INDEX IF NOT EXISTS extract_note__zindex__index ON extract_note(zindex);
CREATE UNIQUE INDEX IF NOT EXISTS extract_note__oid__index ON extract_note(oid);
CREATE INDEX IF NOT EXISTS extract_note__archive_date__index ON extract_note(archive_date);
CREATE INDEX IF NOT EXISTS extract_note__parent_id__index ON extract_note(parent_id);
CREATE INDEX IF NOT EXISTS extract_note__page__index ON extract_note(page);

CREATE TABLE IF NOT EXISTS extract_highlight (
	id SERIAL PRIMARY KEY,
	oid TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
	extract_id INTEGER NOT NULL,
	colour VARCHAR(10),
	position_x REAL,
	position_y REAL,
	width REAL,
	height REAL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	archive_date TIMESTAMPTZ,
	parent_id INT NOT NULL DEFAULT 0,
	page INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS extract_highlight__oid__index ON extract_highlight(oid);
CREATE INDEX IF NOT EXISTS extract_highlight__extract_id__index ON extract_highlight(extract_id);
CREATE INDEX IF NOT EXISTS extract_highlight__date_created__index ON extract_highlight(date_created);
CREATE INDEX IF NOT EXISTS extract_highlight__archive_date__index ON extract_highlight(archive_date);
CREATE INDEX IF NOT EXISTS extract_highlight__parent_id__index ON extract_highlight(parent_id);
CREATE INDEX IF NOT EXISTS extract_highlight__page__index ON extract_highlight(page);

CREATE TABLE IF NOT EXISTS extract_page_join (
	extract_id INTEGER NOT NULL,
	first_highlight_name TEXT,
	first_highlight_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (extract_id, page),
	page INTEGER
);
CREATE INDEX IF NOT EXISTS extract_page_join__extract_id__index ON extract_page_join(extract_id);
CREATE INDEX IF NOT EXISTS extract_page_join__page__index ON extract_page_join(page);

CREATE TABLE IF NOT EXISTS wonde_school_block (
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	wonde_identifier TEXT NOT NULL PRIMARY KEY
);
CREATE INDEX IF NOT EXISTS wonde_school_block__date_created__index ON wonde_school_block(date_created);

CREATE TABLE IF NOT EXISTS wonde_class_block (
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	wonde_identifier TEXT NOT NULL PRIMARY KEY
);
CREATE INDEX IF NOT EXISTS wonde_class_block__date_created__index ON wonde_class_block(date_created);

CREATE TABLE IF NOT EXISTS wonde_user_block (
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	wonde_identifier TEXT NOT NULL PRIMARY KEY
);
CREATE INDEX IF NOT EXISTS wonde_user_block__date_created__index ON wonde_user_block(date_created);

CREATE OR REPLACE FUNCTION wonde_school_block__insert__trigger_func() RETURNS trigger AS $$
	begin
		execute '
			INSERT INTO
				wonde_school_block
				(wonde_identifier)
			VALUES
				(' || quote_literal(OLD.wonde_identifier) || ')
			ON CONFLICT
				DO NOTHING
		';
		return NULL;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wonde_school_block__insert__trigger ON school;
CREATE TRIGGER wonde_school_block__insert__trigger AFTER DELETE ON school FOR EACH ROW WHEN (OLD.wonde_identifier IS NOT NULL) EXECUTE PROCEDURE wonde_school_block__insert__trigger_func();

CREATE OR REPLACE FUNCTION wonde_class_block__insert__trigger_func() RETURNS trigger AS $$
	begin
		execute '
			INSERT INTO
				wonde_class_block
				(wonde_identifier)
			VALUES
				(' || quote_literal(OLD.wonde_identifier) || ')
			ON CONFLICT
				DO NOTHING
		';
		return NULL;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wonde_class_block__insert__trigger ON course;
CREATE TRIGGER wonde_class_block__insert__trigger AFTER DELETE ON course FOR EACH ROW WHEN (OLD.wonde_identifier IS NOT NULL) EXECUTE PROCEDURE wonde_class_block__insert__trigger_func();

CREATE OR REPLACE FUNCTION wonde_user_block__insert__trigger_func() RETURNS trigger AS $$
	begin
		execute '
			INSERT INTO
				wonde_user_block
				(wonde_identifier)
			VALUES
				(' || quote_literal(OLD.wonde_identifier) || ')
			ON CONFLICT
				DO NOTHING
		';
		return NULL;
	end
	$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wonde_user_block__insert__trigger ON cla_user;
CREATE TRIGGER wonde_user_block__insert__trigger AFTER DELETE ON cla_user FOR EACH ROW WHEN (OLD.wonde_identifier IS NOT NULL) EXECUTE PROCEDURE wonde_user_block__insert__trigger_func();

CREATE TABLE env_setting (
	key TEXT NOT NULL PRIMARY KEY,
	value JSONB
);

CREATE TABLE asset_user_info (
	asset_id INTEGER NOT NULL,
	user_id BIGINT NOT NULL,
	is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (asset_id, user_id)
);
CREATE INDEX IF NOT EXISTS asset_user_info__asset_id__index ON asset_user_info(asset_id);
CREATE INDEX IF NOT EXISTS asset_user_info__user_id__index ON asset_user_info(user_id);
CREATE INDEX IF NOT EXISTS asset_user_info__is_favorite__index ON asset_user_info(is_favorite);

CREATE TABLE IF NOT EXISTS carousel_slide (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	enabled BOOLEAN NOT NULL DEFAULT FALSE,
	sort_order REAL NOT NULL DEFAULT 0.0,
	image_url TEXT NOT NULL,
	image_alt_text TEXT,
	link_url TEXT
);
CREATE INDEX IF NOT EXISTS carousel_slide__date_created__index ON carousel_slide(date_created);
CREATE INDEX IF NOT EXISTS carousel_slide__date_edited__index ON carousel_slide(date_edited);
CREATE INDEX IF NOT EXISTS carousel_slide__enabled__index ON carousel_slide(enabled);
CREATE INDEX IF NOT EXISTS carousel_slide__sort_order__index ON carousel_slide(sort_order);

CREATE TABLE IF NOT EXISTS asset_processing_log (
	id SERIAL PRIMARY KEY,
	application TEXT,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	session_identifier TEXT NOT NULL,
	session_index INTEGER NOT NULL,
	stage TEXT NOT NULL,
	sub_stage TEXT,
	asset_identifier TEXT,
	high_priority BOOLEAN NOT NULL DEFAULT FALSE,
	success BOOLEAN NOT NULL DEFAULT TRUE,
	category TEXT,
	content TEXT,
	keywords TSVECTOR
);
CREATE INDEX IF NOT EXISTS asset_processing_log__application__index ON asset_processing_log(application);
CREATE INDEX IF NOT EXISTS asset_processing_log__date_created__index ON asset_processing_log(date_created);
CREATE INDEX IF NOT EXISTS asset_processing_log__session_identifier__index ON asset_processing_log(session_identifier);
CREATE INDEX IF NOT EXISTS asset_processing_log__session_index__index ON asset_processing_log(session_index);
CREATE INDEX IF NOT EXISTS asset_processing_log__stage__index ON asset_processing_log(stage);
CREATE INDEX IF NOT EXISTS asset_processing_log__sub_stage__index ON asset_processing_log(sub_stage);
CREATE INDEX IF NOT EXISTS asset_processing_log__asset_identifier__index ON asset_processing_log(asset_identifier);
CREATE INDEX IF NOT EXISTS asset_processing_log__high_priority__index ON asset_processing_log(high_priority);
CREATE INDEX IF NOT EXISTS asset_processing_log__success__index ON asset_processing_log(success);
CREATE INDEX IF NOT EXISTS asset_processing_log__category__index ON asset_processing_log(category);
CREATE INDEX IF NOT EXISTS asset_processing_log__keywords__index ON asset_processing_log USING GIN(keywords);

CREATE OR REPLACE FUNCTION asset_processing_log__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.asset_identifier, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.stage, '')), 'B')
			|| setweight(to_tsvector('english', COALESCE(new.sub_stage, '')), 'C')
			|| setweight(to_tsvector('english', COALESCE(new.content, '')), 'D');
		return new;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_processing_log__keywords__trigger ON asset_processing_log;
CREATE TRIGGER asset_processing_log__keywords__trigger BEFORE INSERT OR UPDATE ON asset_processing_log FOR EACH ROW EXECUTE PROCEDURE asset_processing_log__keywords__func_trigger();

CREATE TABLE IF NOT EXISTS oauth_challenge (
	oid TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex') PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	challenge TEXT NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex')
);
CREATE INDEX IF NOT EXISTS oauth_challenge__date_created__index ON oauth_challenge(date_created);
CREATE UNIQUE INDEX IF NOT EXISTS oauth_challenge__challenge__index ON oauth_challenge(challenge);

CREATE TABLE user_temp_unlock_email_send_log(
	user_id BIGINT NOT NULL,
	school_id BIGINT NOT NULL,
	asset_id INTEGER NOT NULL,
	days INTEGER NOT NULL,
	PRIMARY KEY(user_id, school_id, asset_id)
);

CREATE INDEX IF NOT EXISTS user_temp_unlock_email_send_log__user_id__index ON user_temp_unlock_email_send_log(user_id);
CREATE INDEX IF NOT EXISTS user_temp_unlock_email_send_log__school_id__index ON user_temp_unlock_email_send_log(school_id);
CREATE INDEX IF NOT EXISTS user_temp_unlock_email_send_log__asset_id__index ON user_temp_unlock_email_send_log(asset_id);
CREATE INDEX IF NOT EXISTS user_temp_unlock_email_send_log__days__index ON user_temp_unlock_email_send_log(days);

CREATE TABLE user_temp_unlock_attempt_email_alert_log(
	user_id BIGINT NOT NULL,
	PRIMARY KEY(user_id)
);

CREATE INDEX IF NOT EXISTS user_temp_unlock_attempt_email_alert_log__user_id__index ON user_temp_unlock_attempt_email_alert_log(user_id);

CREATE TABLE school_temp_unlock_attempt_email_alert_log(
	school_id BIGINT NOT NULL,
	PRIMARY KEY(school_id)
);

CREATE INDEX IF NOT EXISTS school_temp_unlock_attempt_email_alert_log__school_id__index ON school_temp_unlock_attempt_email_alert_log(school_id);

CREATE TABLE temp_unlock_alert_log(
	id SERIAL PRIMARY KEY,
	school_name VARCHAR(255) NOT NULL,
	school_id BIGINT NOT NULL,
	user_id BIGINT,
	number_of_temp_unlocked INT,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS temp_unlock_alert_log_school_name__index ON temp_unlock_alert_log(school_name);
CREATE INDEX IF NOT EXISTS temp_unlock_alert_log__school_id__index ON temp_unlock_alert_log(school_id);
CREATE INDEX IF NOT EXISTS temp_unlock_alert_log__user_id__index ON temp_unlock_alert_log(user_id);

/*
Ignored asset identifiers (i.e. ISBNs/ISSNs)

The asset upload script which transfers PDFs/ePubs to Azure Batch will
first check against this table and exclude any assets whose identifier
is in this table.

This is so that we can blacklist PDFs/ePubs that are known to always
fail processing so they don't clog up the Batch pool.

See scripts/asset_upload
*/
CREATE TABLE asset_processing_ignore (
	identifier TEXT NOT NULL,
	PRIMARY KEY(identifier)
);

CREATE TABLE rollover_job (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	active BOOLEAN NOT NULL DEFAULT FALSE,
	name TEXT NOT NULL,
	target_execution_date TIMESTAMPTZ NOT NULL,
	status TEXT NOT NULL DEFAULT 'scheduled',
	next_execution_date TIMESTAMPTZ,
	keywords TSVECTOR
);
CREATE INDEX IF NOT EXISTS rollover_job__date_created__index ON rollover_job(date_created);
CREATE INDEX IF NOT EXISTS rollover_job__active__index ON rollover_job(active);
CREATE INDEX IF NOT EXISTS rollover_job__name__index ON rollover_job(name);
CREATE INDEX IF NOT EXISTS rollover_job__target_execution_date__index ON rollover_job(target_execution_date);
CREATE INDEX IF NOT EXISTS rollover_job__status__index ON rollover_job(status);
CREATE INDEX IF NOT EXISTS rollover_job__next_execution_date__index ON rollover_job(next_execution_date);
CREATE INDEX IF NOT EXISTS rollover_job__keywords__index ON rollover_job USING GIN(keywords);

CREATE OR REPLACE FUNCTION rollover_job__keywords__func_trigger() RETURNS trigger AS $$
	begin
		new.keywords :=
			setweight(to_tsvector('english', COALESCE(new.name, '')), 'A')
			|| setweight(to_tsvector('english', COALESCE(new.status, '')), 'B');
		return new;
	end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rollover_job__keywords__trigger ON rollover_job;
CREATE TRIGGER rollover_job__keywords__trigger BEFORE INSERT OR UPDATE ON rollover_job FOR EACH ROW EXECUTE PROCEDURE rollover_job__keywords__func_trigger();

CREATE TABLE rollover_progress (
	user_id BIGINT NOT NULL,
	rollover_job_id INT NOT NULL,
	status TEXT NOT NULL,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY(user_id, rollover_job_id, status)
);
CREATE INDEX IF NOT EXISTS rollover_progress__rollover_job_id__index ON rollover_progress(rollover_job_id);
CREATE INDEX IF NOT EXISTS rollover_progress__status__index ON rollover_progress(status);

CREATE TABLE extract_status_change_event (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	category TEXT,
	user_id BIGINT NOT NULL DEFAULT 0,
	extract_id INT NOT NULL DEFAULT 0,
	old_page_range JSONB,
	new_page_range JSONB,
	page_range_changed BOOLEAN,
	old_course_id INTEGER,
	new_course_id INTEGER,
	course_changed BOOLEAN
);
CREATE INDEX IF NOT EXISTS extract_status_change_event__date_created__index ON extract_status_change_event(date_created);
CREATE INDEX IF NOT EXISTS extract_status_change_event__category__index ON extract_status_change_event(category);
CREATE INDEX IF NOT EXISTS extract_status_change_event__user_id__index ON extract_status_change_event(user_id);
CREATE INDEX IF NOT EXISTS extract_status_change_event__extract_id__index ON extract_status_change_event(extract_id);
CREATE INDEX IF NOT EXISTS extract_status_change_event__page_range_changed__index ON extract_status_change_event(page_range_changed);
CREATE INDEX IF NOT EXISTS extract_status_change_event__course_changed__index ON extract_status_change_event(course_changed);

CREATE TABLE IF NOT EXISTS content_request (
	id SERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	user_id BIGINT NOT NULL DEFAULT 0,
	school_id BIGINT NOT NULL DEFAULT 0,
	school_name_log VARCHAR(255) NOT NULL,
	request_type content_request_type[] NOT NULL,
	isbn VARCHAR(32),
	book_title TEXT,
	authors JSONB,
	book_request_author TEXT,
	publishers JSONB,
	book_request_publisher TEXT,
	publication_year TEXT,
	url TEXT,
	content_type_note TEXT,
	other_note TEXT
);

CREATE INDEX IF NOT EXISTS content_request__date_created__index ON content_request(date_created);
CREATE INDEX IF NOT EXISTS content_request__date_edited__index ON content_request(date_edited);
CREATE INDEX IF NOT EXISTS content_request__user_id__index ON content_request(user_id);
CREATE INDEX IF NOT EXISTS content_request__school_id__index ON content_request(school_id);
CREATE INDEX IF NOT EXISTS content_request__request_type__index ON content_request(request_type);
CREATE INDEX IF NOT EXISTS content_request__isbn__index ON content_request(isbn);
CREATE INDEX IF NOT EXISTS content_request__book_title__index ON content_request(book_title);

CREATE TABLE IF NOT EXISTS content_type (
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO content_type (title) VALUES
('Biographies and Autobiographies'),
('Beauty and Complementary Therapies'),
('Building Services'),
('Business'),
('Childcare and Teaching'),
('Classics'),
('Cookbooks'),
('Comic Books and Graphic Novels'),
('Contemporary Fiction'),
('Construction'),
('Detective and Mystery'),
('Engineering'),
('Fantasy'),
('Hairdressing'),
('Health and Social Care'),
('Historical Fiction'),
('Hospitality and Catering'),
('Horror'),
('International English'),
('Land Based Services'),
('Manufacturing Industry'),
('Oil and Gas'),
('Plays'),
('Podcasts'),
('Poetry'),
('Picture books'),
('Primary Art and Design'),
('Primary Ancient and Modern Foreign Languages'),
('Primary English'),
('Primary Design and Technology'),
('Primary History'),
('Primary Geography'),
('Primary IT and Computing'),
('Primary Mathematics'),
('Primary Music'),
('Primary Personal, Social and Health Education (PSHE)'),
('Primary Physical Education'),
('Primary Religious Education'),
('Primary Science'),
('Science Fiction'),
('Secondary Ancient and Modern Foreign Languages'),
('Secondary Art and Design'),
('Secondary Design and Technology'),
('Secondary English'),
('Secondary Geography'),
('Secondary History'),
('Secondary IT and Computing'),
('Secondary Mathematics'),
('Secondary Music'),
('Secondary Personal, Social and Health Education (PSHE)'),
('Secondary Physical Education'),
('Secondary Religious Education'),
('Secondary Science'),
('Sex Education'),
('Short Stories'),
('SEN'),
('Retail and Warehousing'),
('Travel Tourism and Aviation'),
('Videos')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS content_request_content_type_join (
	content_request_id INTEGER NOT NULL,
	content_type_id INTEGER NOT NULL,
	PRIMARY KEY(content_request_id, content_type_id)
);

CREATE INDEX IF NOT EXISTS content_request_content_type_join__content_request_id__index ON content_request_content_type_join(content_request_id);
CREATE INDEX IF NOT EXISTS content_request_content_type_join__content_type_id__index ON content_request_content_type_join(content_type_id);

CREATE TABLE activation_reminder_email_send_log(
	id SERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL,
	invite_email_type VARCHAR(64) NOT NULL,
	date_sent TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activation_reminder_email_send_log__user_id__index ON activation_reminder_email_send_log(user_id);
CREATE INDEX IF NOT EXISTS activation_reminder_email_send_log__invite_email_type__index ON activation_reminder_email_send_log(invite_email_type);
CREATE INDEX IF NOT EXISTS activation_reminder_email_send_log__date_sent__index ON activation_reminder_email_send_log(date_sent);

CREATE TABLE IF NOT EXISTS born_digital_extract (
	id BIGSERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	asset_id INTEGER NOT NULL,
	isbn13 TEXT NOT NULL,
	date_began_running TIMESTAMPTZ,
	date_completed TIMESTAMPTZ,
	status TEXT NOT NULL DEFAULT 'unstarted',
	error TEXT,
	pages JSONB NOT NULL,
	name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS born_digital_extract__date_created__index ON born_digital_extract(date_created);
CREATE INDEX IF NOT EXISTS born_digital_extract__asset_id__index ON born_digital_extract(asset_id);
CREATE INDEX IF NOT EXISTS born_digital_extract__isbn13__index ON born_digital_extract(isbn13);
CREATE INDEX IF NOT EXISTS born_digital_extract__date_began_running__index ON born_digital_extract(date_began_running);
CREATE INDEX IF NOT EXISTS born_digital_extract__date_completed__index ON born_digital_extract(date_completed);
CREATE INDEX IF NOT EXISTS born_digital_extract__status__index ON born_digital_extract(status);
CREATE UNIQUE INDEX IF NOT EXISTS born_digital_extract__name__index ON born_digital_extract(name);

CREATE OR REPLACE FUNCTION born_digital_extract__status__func() RETURNS trigger AS $$
begin
	IF new.status = 'completed' THEN
		new.date_completed = NOW();
	ELSIF new.status = 'running' THEN
		new.date_began_running = NOW();
	END IF;
	return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS born_digital_extract__status__trigger ON born_digital_extract;
CREATE TRIGGER
	born_digital_extract__status__trigger
BEFORE UPDATE ON
	born_digital_extract
FOR EACH ROW
WHEN
	(OLD.status IS DISTINCT FROM NEW.status)
EXECUTE PROCEDURE
	born_digital_extract__status__func();

CREATE TABLE IF NOT EXISTS born_digital_log (
	id BIGSERIAL PRIMARY KEY,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	url TEXT,
	api_key TEXT,
	http_status INT,
	http_request_body TEXT,
	http_response_body TEXT,
	time_taken_ms REAL,
	request_id TEXT,
	ip_address INET,
	user_agent TEXT,
	extract_id BIGINT,
	exception_message TEXT,
	exception_stack TEXT,
	message TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS born_digital_log__date_created__index ON born_digital_log(date_created);
CREATE INDEX IF NOT EXISTS born_digital_log__url__index ON born_digital_log(url);
CREATE INDEX IF NOT EXISTS born_digital_log__api_key__index ON born_digital_log(api_key);
CREATE INDEX IF NOT EXISTS born_digital_log__http_status__index ON born_digital_log(http_status);
CREATE INDEX IF NOT EXISTS born_digital_log__time_taken_ms__index ON born_digital_log(time_taken_ms);
CREATE INDEX IF NOT EXISTS born_digital_log__request_id__index ON born_digital_log(request_id);
CREATE INDEX IF NOT EXISTS born_digital_log__ip_address__index ON born_digital_log(ip_address);
CREATE INDEX IF NOT EXISTS born_digital_log__user_agent__index ON born_digital_log(user_agent);
CREATE INDEX IF NOT EXISTS born_digital_log__extract_id__index ON born_digital_log(extract_id);

CREATE TABLE IF NOT EXISTS asset_metadata (
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_edited TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	isbn TEXT NOT NULL PRIMARY KEY,
	page_count INT NOT NULL,
	color_scale TEXT NOT NULL,
	ocr BOOLEAN NOT NULL
);
CREATE INDEX IF NOT EXISTS asset_metadata__date_created__index ON asset_metadata(date_created);
CREATE INDEX IF NOT EXISTS asset_metadata__date_edited__index ON asset_metadata(date_edited);

EOSQL
