# Controller

NodeJS application exposing all API endpoints needed by the application - this includes endpoints for authentication, searching for assets, updating extracts, creating extract share links, unlocking a book, resetting your password, and so on.

This is a purely back-end application and primarily accepts and returns JSON. HTML is not returned from any API endpoints - front-ends are responsible for displaying or parsing returned data.

## Hacking

This is a KoaJS application.

You should make sure the Docker instances are running before attempting to modify any files here.
See the top-level README for instructions on how to do this.

Once the Docker instances are running, this Application will listen for requests on port 13000.

You might find the request tester at `app/playground/index.html` useful for playing with the API.

## Folder structure

- Add common functions in `app/common`.
- Add admin related endpoints in `app/core/admin`.
- Add auth related endpoints in `app/core/auth`.
- Add public related endpoints in `app/core/public`.
- Add search related endpoints in `app/core/search`.
- Add session related endpoint in `app/core/session`.
- Add email template and images in `app/emails`.
- Add unit test cases in `app/test`.

## Running Tests

To run tests:

	$ cd /path/to/this/directory/app
	$ npm i
	$ npm test

Make sure you have NodeJS 10+ installed. There is no need for the Docker instances to be running for the tests.