# Public Web App

The static HTML, CSS and JS files for displaying the public-facing (i.e. teachers/students) sections of the website.

This is a NodeJS application. Source files are placed in `src`. These source files are built with `webpack`, and the generated files are placed in `public`.

NodeJS 10 or higher is required.

## Compiling

To build the source files, run:

	$ cd /path/to/this/directory/app
	$ npm i
	$ node build cla-ep dev-azure

The first two commands only need to be run the first time. Subsequent builds can just run `node build cla-ep dev-azure`.

You can also optionally run in 'watch' mode, which automatically rebuilds if a file change is made:

	$ node build cla-ep dev-watch

## Running tests

To execute the unit tests:

	$ cd /path/to/this/directory/app
	$ npm i
	$ npm test

Ensure that the source files are built before running the tests (see above).

The first two commands only need to be run the first time. Subsequent builds can just run `npm test`.

## Hacking

- Add css, images and fonts etc.. in the `src/assets`. Do *not* add CSS files unless absolutely necessary - you should use Styled Components wherever possible.
- Common javascript functions and constants should be placed in `src/common`.
- Add mocks for unit test cases in `src/mocks`.
- Add new pages in a `src/pages/<ModuleName>/` directory. See existing pages for inspiration.
- Add new widgets in `src/widgets`. Widgets are small UI components that are used by multiple pages (e.g. a pagination button set widget, an accordion widget).
- Unit tests for each widget should be placed in a `__tests__` directory inside each widget.