# Application Model

This component is the main application database (PostgreSQL).

This handles all persistent data storage *except* sessions. Sessions are stored in the `SessionModel`.

Here are the most significant tables stored in this database:

- **Users.** First name, email, job title, etc. are stored.
- **Schools.** School title, address, extract limits, etc.
- **Assets.** Asset ISBN, page count, title, description, table of contents, etc.
- **Publishers.** E.g. name.
- **Courses.** Teachers create these - extracts must be associated with a course.
- **Extracts.** Date created, expiry date, creator, exam board, etc.

Other tables are also stored, but these are the main application objects.

See the `docker/run.sh` file for the SQL commands needed to build the database.

## Hacking

To access the database:

1. In a new terminal run the command `docker ps` to get a list of containers.
2. Note the ID for the `apps_cla_application_model` container.
3. Enter the following command to access the PostgreSQL container: `docker exec -it CONTAINER_ID /bin/bash`.
4. Run `psql -U $POSTGRES_USER -d $POSTGRES_DB` to access the database. This command needs to be run from within the PostgreSQL container - it won't work when run from the host machine.

Basic PostgreSQL commands:

- `$ cla_am_db=# \d` retrieve the list of tables
- `$ cla_am_db=# \d <table name>` retrieve the table schema

## Import a database dump

You may need to import a database dump:

1. Place the SQL dump into the `db_data` directory.
2. Login to the container (follow steps 1-3 above, but not 4).
3. Delete the current database by running `dropdb 'cla_am_db' -U $POSTGRES_USER`
4. Create an empty database of the same name with `createdb 'cla_am_db' -U $POSTGRES_USER`
5. Import the sql dump with `psql -U $POSTGRES_USER -d $POSTGRES_DB < /var/lib/postgresql/data/NAME_OF_DATABASE_DUMP.sql`

The `apps/ApplicationModel/db_data` directory on the host is mapped to the `/var/lib/postgresql/data` directory in the container.

## Backup the database

1. Login to the container.
2. Execute: `pg_dump -x -O --if-exists -c -U $POSTGRES_USER $POSTGRES_DB > /var/lib/postgresql/data/dump.sql`
3. Find the dump at `apps/ApplicationModel/db_data/dump.sql`.
