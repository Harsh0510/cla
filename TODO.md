# TODO

A misc. unordered list of things to do.

## Should do - high priority

* **ApplicationModel**: Can we improve naming conversation of table fields for extract_share and extract table
(Current field name is 'date_expired', can we do as 'exiry_date')

* **PublicWebApp**: Need to be fully utilised by the theme.js in style component

* **Controller**: Add Controller/app/core/auth/disable-security-emails end-point in playground

## Could do - medium priority
* Move the Controller endpoints into folders grouped by the type of object. So e.g. we'd have /core/admin/class/create.js, /core/admin/class/delete.js instead of /core/admin/class-create.js, /core/admin/class-delete.js etc. We should also change the API endpoints for these to be e.g. /admin/class/delete instead of /admin/class-delete etc.


## Would be nice - low priority
* Could we add the some of the packages from `PublicWebApp/app/packages.json` to devDependencies instead of dependencies? 
* In package.json file, `"core-js": "^2.6.5"` is installed in ` dependencies` and ‘devDependencies’.  Could we remove it from the “devDependencies”? 
* Need to be uninstall the package 'command-exists' from  Controller/app/ and install this package in devDependencies
* Need to be uninstall the package walk-sync  from Controller/app/

















