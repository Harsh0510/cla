# Asset Re-lock

NodeJS-based command line tool to re-lock assets from a CSV file.

This should be used when books are accidentally unlocked for a school (e.g. accidentally selected the wrong school from the drop-down).

The CSV should contain a 'Read ISBN' column or an 'Asset ID' column. This is used to extract the asset DB ID.

The CSV should also contain a 'School' column (with the school's name) or a 'School ID' column. This is used to extract the school's DB ID.

The system then proceeds to remove the relevant row(s) from the asset_school_info table, and then deletes any orphaned records from the extract, extract_page, extract_page_by_school and extract_share tables.

## Running

	$ node index.js

You will be prompted to enter the path to a CSV file, as well as the credentials to the database.