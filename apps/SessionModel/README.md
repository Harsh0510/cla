# Session Model

This component is the application session database (PostgreSQL).

This persistently stores session data - i.e. session tokens, session expiry dates, and session data. Application data is not stored here - see `ApplicationModel` for application data.

See the `docker/run.sh` file for the SQL commands needed to build the database. It's very simple - there is currently only one table (`cla_session`) in the database.

## Hacking

To access the database:

1. In a new terminal run the command `docker ps` to get a list of containers.
2. Note the ID for the `apps_cla_session_model` container.
3. Enter the following command to access the PostgreSQL container: `docker exec -it CONTAINER_ID /bin/bash`.
4. Run `psql -U $POSTGRES_USER -d $POSTGRES_DB` to access the database. This command needs to be run from within the PostgreSQL container - it won't work when run from the host machine.

Basic PostgreSQL commands:

- `$ cla_sm_db=# \d` retrieve the list of tables
- `$ cla_sm_db=# \d <table name>` retrieve the table schema

## Import a database dump

You may need to import a database dump:

1. Place the SQL dump into the `db_data` directory.
2. Login to the container (follow steps 1-3 above, but not 4).
3. Delete the current database by running `dropdb 'cla_sm_db' -U $POSTGRES_USER`
4. Create an empty database of the same name with `createdb 'cla_sm_db' -U $POSTGRES_USER`
5. Import the sql dump with `psql -U $POSTGRES_USER -d $POSTGRES_DB > /var/lib/postgresql/data/NAME_OF_DATABASE_DUMP.sql`

The `apps/SessionModel/db_data` directory on the host is mapped to the `/var/lib/postgresql/data` directory in the container.

## Dump the database

1. Login to the container.
2. Execute: `pg_dump -x -O --if-exists -c -U $POSTGRES_USER $POSTGRES_DB > /var/lib/postgresql/data/dump.sql`
3. Find the dump at `apps/SessionModel/db_data/dump.sql`.

