# Pardot CSV to SQL

NodeJS-based command line tool to update existing `cla_user` records in the EP database with their Pardot Prospect IDs from a CSV/XLSX file.

`cla_user` records must already exist in the EP database.

This script was created for [issue EP-1095](https://theclawiki.atlassian.net/browse/EP-1095) as a one-off script to associate existing EP users with their Pardot Prospect ID (new users will be added to Pardot automatically).

## Running

	$ node index.js

You will be prompted to enter the path to a CSV/XLSX file, as well as the credentials to the database.