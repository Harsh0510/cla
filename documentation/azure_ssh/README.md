# Azure SSH

It's possible to SSH into the `PublicWebApp` and `Controller` applications. This is useful to view error logs or make **urgent** minor changes for P0 issues.

## But how?

1. Install the `az` tool: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest
2. Log in to the Stage or Production environment as necessary: `az login` (passwords are in the TVF passwords document)
3. Open a terminal and execute one of the following commands to initialise a tunnel:

```sh
# Stage Controller
az webapp create-remote-connection --resource-group CLA_Staging -n cla-stage-controller

# Production Controller
az webapp create-remote-connection --resource-group CLA_Production -n cla-production-stage-controller

# Stage PublicWebApp
az webapp create-remote-connection --resource-group CLA_Staging -n cla-public-web-app

# Production PublicWebApp
az webapp create-remote-connection --resource-group CLA_Production -n cla-production-public-web-app
```


This will generate output like the following:

```
~$ az webapp remote-connection create --resource-group CLA_Staging -n cla-stage-controller
Auto-selecting port: 54071
SSH is available { username: root, password: Docker! }
Start your favorite client and connect to port 54071
```

4. Open a new terminal and enter the following command to SSH into the container (enter the password `Docker!` when prompted, and replace the port with the output of the previous command):

	$ ssh root@127.0.0.1 -p 54071

## Where are the Controller logs?

On the Controller, logs are saved in `/root/.pm2/logs`.