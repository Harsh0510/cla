A wrapper around the KoaJS library intending to make it easier to create new NodeJS-based applications.

Example usage:

```javascript
const App = require('tvf-app');

const app = new App();

app.route('/asset-get-one', async (params, ctx) {
	// params: a map of the request data parameters
});

module.exports = app;
```

This library makes it easy to do common things like:

- Perform queries on the ApplicationModel and SessionModel databases.
- Fetch session data.
- Get the remote client IP.
- Registering API endpoints (routes).

It also automatically handles:

- Setting up CORS correctly.
- Initializing database connections.
- Guarding against CSRF attacks.
- Setting the correct HTTP Content-Type repsonse headers.
