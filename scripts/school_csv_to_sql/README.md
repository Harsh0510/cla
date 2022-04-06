# School CSV to SQL

NodeJS-based command line tool to upsert schools from a CSV file into the database.

Only handles creating schools - does not create users.

Schools are UPSERTED. If a school already exists with the given identifier, the details will be updated.

## Running

	$ node index.js

You will be prompted to enter the path to a CSV file, as well as the credentials to the database.

The CSV file should be in the same format as the 'example.csv' file.