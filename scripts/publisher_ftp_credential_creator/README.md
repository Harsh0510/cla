# Publisher FTP Credential Creator

This script creates publisher FTP credentials and emails then to the publisher by essentially automating the steps described in `documentation/publisher_ftp/README.md`.

## How to use

1. Log in to the `occclapublisherftp` VM at `51.104.209.100`.
2. Change user to `root`.
3. Create a `credentials.json` file at `/root/publisher_ftp_credential_creator/credentials.json` containing the publisher details in the following format:

```json
[
	{
		"publisherUsername": "foobarbaz",
		"publisherNiceName": "Foo Bar Baz",
		"recipientName": "Jen Adams",
		"recipientEmail": "akazim@tvf.co.uk"
	},
	{
		"publisherUsername": "fizzbang",
		"publisherNiceName": "Fizz Bang",
		"recipientName": "Adam Jensen",
		"recipientEmail": "alan.kazim@opencc.co.uk",
		"ftpDir": "fizzbang"
	}
]
```

All fields are required except for `ftpDir`, which will default to `publisherUsername`.

4. Execute the following:

	$ node /root/publisher_ftp_credential_creator/index.js

A bunch of logging messages should be dumped to the screen. If everything runs successfully, the `credentials.json` file will be deleted.

**This script must _not_ be executed locally! It must only be executed as `root` on the `occclapublisherftp` VM.**

## How to update

After modifying this script, you'll need to manually copy across the changes to the `/root/publisher_ftp_credential_creator` directory on the `occclapublisherftp` VM.

## Notes

If, for some reason, this script gets deleted from the `occclapublisherftp` VM and it's necessary to reinstall it again, then follow these steps:

1. Copy all the files in this directory into `/root/publisher_ftp_credential_creator` on the `occclapublisherftp` VM.
2. Create a JSON file at `/root/publisher_ftp_credential_creator/.config.json` with the following settings:

```json
// Production SendGrid credentials - see passwords document
{
	"SMTP_EMAIL_HOST": "smtp.sendgrid.net",
	"SMTP_EMAIL_USERNAME": "apikey",
	"SMTP_EMAIL_PASSWORD": "password goes here"
}
```
