# Code Coverage Report Generator

Generates unit test coverage reports and places them in `/coverage_reports`.

This is intended to be executed at least once per sprint.

## Running

Install packages:

	$ cd /path/to/this/directory
	$ npm i

Execute:

	$ node index.js

Will do the following:

1. Run the unit tests.
2. Copy over the coverage reports into the `coverage_reports` directory (replacing what's already there).
3. Generate the metadata files containing last run date and OCC GitLab (not CLA GitHub!) commit hash.

## Requirements

- NodeJS v12+
- A Linux or Mac machine. Windows will not work.
