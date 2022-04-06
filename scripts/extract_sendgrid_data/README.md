# Extract sendgrid data in excel file

## Running

```
$ node index.js
```

When you begin running the script, you should eventually see something like this once you've entered all the information:

```
✔ Remote PostgreSQL database: DB name … cla_am_db
✔ Remote PostgreSQL database: Username … cla_am_user
✔ Remote PostgreSQL database: Host … localhost
✔ Remote PostgreSQL database: Password … ***********
✔ Remote PostgreSQL database: Port … 19000
✔ Remote PostgreSQL database: Use SSL? … no
```

When success than it will show the log message as per below

```
Successfully generated excel file.
```

Note: You will get the generated excel file `out.xlsx` in the same directory

## Extract sendgrid data

Extract sendgrid data filters of date can be change in `index.js` file with follwong keys value present in top of the file.

For Email counts coulmns (sent, delivered, click, open)

```
const EMAIL_SENT_TIME_FRAME_SINCE = "2021-10-05 00:00:00.00+00";
```

For registration count column (registrations)

```
const REGISTRATION_TIME_FRAME_SINCE = "2021-09-23 00:00:00.00+00";
```
