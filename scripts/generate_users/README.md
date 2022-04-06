# Generate Users

Simple NodeJS-based command-line tool to upsert users into the database.

The script assumes that schools already exist, and that you're simply adding users against existing schools.

Users will always be created as teachers.

Users will always be created in the 'activated' state - i.e. they won't have to activate their accounts.

Passwords will always be automatically generated and then outputted to stdout after the script finishes.

Users can be provided in one of two ways:

1. Via CSV. The columns should be: Email, First Name, Last Name, School ID, Title. Do not include a header row. Do not include any trailing blank rows.
1. Interactively. In this case, do not enter a path to a CSV file when prompted. You will subsequently be prompted to add zero or more users interactively.

The script is quite fragile. Make sure the CSV has no extra columns or extra empty rows! There is limited validation.

Users are UPSERTED. If a user already exists with the given email address, their details will be updated.

## Running

	$ node index.js

When you begin running the script, you should eventually see something like this once you've entered all the information:

```
✔ Remote PostgreSQL database: DB name … cla_am_db
✔ Remote PostgreSQL database: Username … cla_am_user
✔ Remote PostgreSQL database: Host … localhost
✔ Remote PostgreSQL database: Password … ***********
✔ Remote PostgreSQL database: Port … 19000
✔ Remote PostgreSQL database: Use SSL? … no
✔ Path to CSV file. Leave value blank to use interactive mode. …
✔ Email … admin@cla2.com
✔ Title … Mr
✔ First Name … Admin-CLA
✔ Last Name … CLA
✔ School ID … 1
✔ Role … cla-admin
✔ Add another? … no
```

You're then given an automatically generated password of the user you just created:

```
Email: admin@cla2.com
Password: fa1bba4e7fb40a62
```