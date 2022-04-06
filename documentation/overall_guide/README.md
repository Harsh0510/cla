# Education Platform Developer Guide

- **Initial Project Launch:** 17 July 2019

## Education Application Overview

### Application Information

This application's target audience is the education sector, and is used by schools, teachers and students.

The primary purpose of the platform is to allow teachers to search for and find books (also called 'assets'), generate copies (also called 'extracts') of some pages in those books, and then share those copies with their students. This prevents teachers from illegally photocopying large portions of books - the platform enables teachers to stick within the contractually allowed limits for copying and also allows generating higher quality (and colour) extracts than would be possible at many photocopiers.

The most common flow is this:

1. Teacher lands on the website.
2. Teacher logs in.
3. Teacher searches for a book.
4. Teacher proves that they own the book by 'unlocking' it.
5. Teacher views the pages in the book online.
6. Teacher creates an extract of some of the pages in the book.
7. Teacher shares a link to a page containing the extracted pages with their students.
8. Students view the 'share link', which is publicly accessible.

Below is a selection of the most significant things a teacher can do on the platform:

- **Search for assets.** Teachers can search for assets by entering a keyword into a search field and/or by selecting one or more filter options. Pagination is also available. The functionality here is similar to e.g. ecommerce websites that allow users to filter and search through a large number of items.
- **Login.** A few pages are publicly accessible - e.g. the homepage, the search page, and a few other 'non-critical' pages (about us, terms and conditions, etc.). The most significant parts of the website require users to login though.
- **Unlock a book.** Users cannot create extracts of just any book. They first have to prove that their school owns the book. They do this is by 'unlocking' the book: users navigate to the 'unlock page', which prompts them to let the website use their webcam. The user holds the barcode of a physical copy of the book to the webcam, and the system detects the ISBN contained within the barcode. Assuming an asset with that ISBN exists on the platform, the book is unlocked for the school. A book only has to be unlocked once for a school - e.g. if Teachers A and B both belong to the same institution and A unlocks book T, then B will not need to unlock T. Teacher C who belongs to another institution will need to unlock it though.
- **Create an extract.** To create an extract, teachers browse the pages of an asset online. The platform displays low quality, watermarked snapshots of each page online - too low quality to be printed. The user scans through these pages, adds the pages they are interested in to their 'basket' or 'in progress extract', and then finally press a button to create their extract. There are contractual limits to how much of a book a teacher can copy - the application only allows extracts to be created if they stay within these limits.
- **Share an extract.** Once a teacher has created an extract, they'll want their students to see it. Teachers are therefore able to 'share' their extract - this generates a link to a webpage on the platform which students can access.
- **Administration.** Teachers have the ability to update their personal details and change their password via the platform, as well as manage (create, read, update, delete - CRUD) courses (extracts must be associated with a course), and their share links. Teachers are able to deactivate their share links at any time. School administrators have even more administration functions available to them - e.g. they can create users at their school, change school details, and unlock books in bulk via a spreadsheet. Finally, CLA administrators (the most privileged role) have even further administration functionalities.

### Project Architecture

#### Web Application

The Education Platform is composed of several independent components, each of which performs a focussed set of tasks. Each component resides as a directory in the `apps` directory.

- **ApplicationModel.** The main application database (PostgreSQL).
- **SessionModel.** The database which contains session tokens and data. This may be merged into the ApplicationModel in future.
- **Controller.** Back-end of the application. Exposes API endpoints which (for the most part) receive and return JSON. Handles authentication, session control, creation of extracts, and any other action that requires writing to the ApplicationModel. This component does not handle views at all - HTML is never returned from any endpoint.
- **PublicWebApp.** This is the UI/front-end application. This is where HTML, JS and CSS resides. The PublicWebApp sends AJAX requests to `Controller` and renders HTML, JS and CSS based on the response.

See the README.md in the `ApplicationModel`, `SessionModel`, `Controller` and `PublicWebApp` folders for more detail.

#### Docker

Each component runs in a separate Docker container - the entire application is Docker based.
There is a `Dockerfile` and `docker-compose.yml` file in each component folder which describes the docker environment for that component.
There is also a top level `apps/run.js` NodeJS script which handles bringing up the entire application (i.e. all the Docker boxes).

#### Hosting

The project runs on Azure.
The ApplicationModel and SessionModel components run as separate databases in an `Azure Database for PostgreSQL server` instance (a single `Azure Database for PostgreSQL server` can host multiple databases).
The Controller and PublicWebApp components run as separate `Azure Web App for Containers` instances.

There are also further Azure instances which are described below.

#### User Roles

This application have three user roles as per below:
* cla-admin
* school-admin
* teacher

**cla-admin**
- can access and manage all aministration operations as follow:
	- Users
	- Class Management
	- Registration Queue
	- Schools
	- Imprints
	- Assets
	- Approved Domain
	- Download list of attempted unlocks
	- Download list of content accesses
	- Publishers
	- Unlock content for school
- can not create the extract from unlocked book
- can not access to see My copies page link from the Tag menu.

**school-admin**
- can edit the his own school information
- can access for following modules from aministration section:
	- Users (can only view and manage the users which are associated with this school)
	- Class Management
	- Edit School
	- Registration Queue
	- Unlock content for school
- can create the extract from unlock book and share the asset or extract link by email or facebook and twitter.

**teacher**
- can only access the class Management from Aministration section.
- can create the extract from unlock assets and share the link with viewers.
- can access for the My Copies page.

#### Assets

Books are not committed to git. There is instead a separate process for uploading assets (and associated meta-data) to the platform. This process can be summarised as follows:

1. PDFs of the books are uploaded by the publisher to an agreed location (not currently in Azure). The filename includes the ISBN of the book.
2. The PDFs are are transferred to an `Azure Blob Storage` instance on Azure.
3. An Azure 'batch job' is initiated which generates snapshots of each page in the PDF. The snapshots are placed in a web-accessible location elsewhere on the same `Azure Blob Storage` instance.
4. One or more ONIX 3 XML files containing asset meta-data is uploaded to the platform.

The process is described in more detail at `documentation/asset_upload_process/README.md`.

When developing locally, the asset page snapshots still reference the Stage `Azure Blob Storage` instance.
So even when developing locally, you'll still see URLs like `https://occclastagestorage.blob.core.windows.net/coverpages/9781444144215.png`.

## Development Environment

### System Requirement

**Operating System:** Linux or OSX machine. Linux 18.04+ recommended. Does not currently work on Windows.

### Software Installation

Recent version of Docker and NodeJS (NodeJS 10 or higher is required).
Installation instruction for Docker CE can be found here: https://docs.docker.com/install/ 

It's not necessary to use any particular IDE, but using Visual Studio Code with the Docker and Git-history extensions is recommended.
- [Download VS source code](https://code.visualstudio.com/)
- For Docker Extension: [click here](https://marketplace.visualstudio.com/items?itemName=PeterJausovec.vscodedocker)

## Project Set-up

You can bring up the application by following these steps:

	$ cd /path/to/this/directory/apps/
	$ node run.js up

The `app/run.js` sets up a few things and then basically calls `docker-compose up`.

Once the application starts up, you can run `docker ps` to see a list of running containers.

The following containers should be in the list:

- apps_cla_application_model
- apps_cla_public_web_app
- apps_cla_session_model
- apps_cla_controller

## Technology Used

### React-JS

The `PublicWebApp` component (i.e. the front-end) uses ReactJS.

React is a JavaScript library for building user interfaces. Learn what React is all about [in the tutorial](https://reactjs.org/docs/getting-started.html).

### NodeJS

The `Controller` component (i.e. the back-end), the scripts in `scripts`, and several build scripts directly inside `apps` all use NodeJS.

NodeJS is a very powerful JavaScript-based platform built on Google Chrome's JavaScript V8 Engine. [Learn more here](https://nodejs.org/api/documentation.html).

The `Controller` component also uses the KoaJS library for handling routing. For more details [click here](https://koajs.com/), o [watch the sample application](https://www.youtube.com/watch?v=z84uTk5zmak).

### Unit Testing

The project uses Jest and Enzyme for unit testing. The target is 80% line, statement and branch coverage.

#### Jest Resources
- [Documentation](https://jestjs.io/docs/en/getting-started)
- [Cheat sheet](https://devhints.io/jest)

#### Enzyme Resources
- [Documentation](https://airbnb.io/enzyme/)
- [Cheat sheet](https://devhints.io/enzyme)

## Notes

- The `apps`, `lib` and `scripts` directories are managed entirely by OCC (the development team). Nobody else should write to these folders without consulting with the development team first.
- The `documentation` directory is mostly managed by OCC, however CLA may add documentation files here as well. OCC should not write to documentation files created by CLA or vice versa.
- The `metadata` and `SSIS` directories are managed exclusively by CLA. The development team must never commit anything that touches this folder.

## Further Information

- `README.md` files immediately inside each component directory in the `apps` directory.
- The `README.md` files inside the `documentation` directory.
- The `README.md` files inside each script directory in `scripts`.
- The `README.md` file in `lib`.