# Duplicate school merger

This scripts handles merging duplicate schools. Duplicate schools may come about because e.g. some schools were inserted from two different sources, such as Wonde and manually.

There are two ways duplicate schools may be merged:

## Automatically

By default the script will query the database to find duplicate schools, where 'duplicate' means 'has exactly the same name and post_code'. For each set of duplicate schools, it deletes all except one school **if any only if** at most one school has users. If more than one school in the set has users, nothing happens. If one school in the set has users, then that is the school that is kept (the rest removed).

## Manually

Add a file in this directory called `manual-sets.js` and add the following:

```js
// file: manual-sets.js
module.exports = [
	[51864, 33482],
	[14763, 40770],
	[8898, 43567],
	[45592, 24556],
	[48135, 25660],
	[37001, 8843]
];
```

Each sub-array should be a set of duplicate school IDs in any order.

Then modify the `index.js` file as follows. First, uncomment the line that reads `const duplicateSchoolIds = require("./manual-sets");`. Then comment out the lines above that fetch the duplicateSchoolIds from the database.

# Running

	$ cd /path/to/this/directory
	$ npm i
	$ node index

When prompted, enter the credentials for the database that should be updated.