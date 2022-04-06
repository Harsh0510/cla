# SAS Token Generator

This script generates SAS tokens and automatically emails the tokens to their recipients.

**Requires the Azure 'az' command line tool to be globally installed and available in the path**

So if you create a configuration file like this:

```toml
# Fill these all out
SMTP_USERNAME = ""
SMTP_PASSWORD = ""
SMTP_HOST = ""
SMTP_PORT = ""
EMAIL_FROM = ""
EMAIL_SUBJECT = "CLA Education Platform - New Azure credentials"
AZURE_USERNAME = ""
AZURE_TENANT = ""
AZURE_PASSWORD = ""
AZURE_STORAGE_ACCOUNT_NAME = ""
AZURE_STORAGE_ACCOUNT_CONTAINER = ""

[[target]]
# Recipient of SAS token - will be automatically emailed
email = "foo@bar.com"

# For full list of permissions, see: https://docs.microsoft.com/en-us/rest/api/storageservices/create-service-sas#permissions-for-a-directory-container-or-blob
permissions = "acdlrw"

# Optional: a single IP address to restrict the SAS token
ip = "82.34.253.204"

[[target]]
email = "another@email.com"
permissions = "acdlrw"
```

Then it will create and email SAS tokens for foo@bar.com and another@email.com.

The tokens automatically expire every (EXPIRY_HOURS + 2) hours, so ideally the script should be executed every EXPIRY_HOURS hours.

Ideally you'd split up the configuration files as follows:

```toml
# /etc/cla-sas-token-generator.toml
SMTP_USERNAME = ""
SMTP_PASSWORD = ""
SMTP_HOST = ""
SMTP_PORT = ""
EMAIL_FROM = ""
EMAIL_SUBJECT = "CLA Education Platform - New Azure credentials"
AZURE_USERNAME = ""
AZURE_TENANT = ""
AZURE_PASSWORD = ""
AZURE_STORAGE_ACCOUNT_NAME = ""
AZURE_STORAGE_ACCOUNT_CONTAINER = ""
```

```toml
# /path/to/script/config.toml

[[target]]
email = "foo@bar.com"
permissions = "acdlrw"
ip = "82.34.253.204"

[[target]]
email = "another@email.com"
permissions = "acdlrw"
```

This way, sensitive credentials are kept away from the less sensitive information.

Also, the script takes an optional additional path to check for configuration. So you might execute the script like this:

	$ node index.js /another/path/to/config.toml

The script will then merge in the configuration file at /another/path/to/config.toml.

The script automatically checks for configuration files in this order:

- /etc/cla-sas-token-generator.toml
- $HOME/cla-sas-token-generator.toml
- Optional extra path (if provided)
- $SCRIPT_DIR/config.toml

## Deployment details

- This script is on the occclaepworkbench VM on CLA_Staging (IP: 51.11.185.251).
- It is in the `/root/sas_token_generator` directory. 
- The main configuration file (containing API keys etc) is at: `/etc/cla-sas-token-generator.toml`
- There is also an 'extra' configuration file that Dan Barker may edit at `/home/dbarker/cla-sas-token-generator.toml`
- There is a cron job that executes the script every day at 3am to generate new credentials. You can view the cronjob in the crontab as root (`crontab -e`).