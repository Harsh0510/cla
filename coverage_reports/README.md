# Coverage Reports

Code coverage reports are added here at the end of each sprint, replacing the reports that were there previously.

There are several files/directories:

- **PublicWebApp** contains the coverage report of the unit tests in the `apps/PublicWebApp` directory.
- **PublicWebApp.metadata.txt** contains information about when the PublicWebApp coverage report was last updated. NB: The commit hash refers to the commit hash within the OCC GitLab repository, NOT the CLA GitHub repository!
- **Controller** contains the coverage report of the unit tests in the `apps/Controller` directory.
- **Controller.metadata.txt** contains information about when the Controller coverage report was last updated. NB: The commit hash refers to the commit hash within the OCC GitLab repository, NOT the CLA GitHub repository!

## Opening the reports

Coverage reports are in the lcov HTML format - the `index.html` file in each directory should be opened in a browser.

So specifically, these files should be opened:

- coverage_reports/Controller/index.html
- coverage_reports/PublicWebApp/index.html

## Viewing previous reports

Since the directories are replaced every sprint with updated coverage reports, previous reports can be viewed by checking out an older git revision.

## Generating reports

See: `scripts/code_coverage_report_gen`