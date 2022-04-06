# What is this?

This is the Async Task Runner - a set of libraries that enables asynchronously running tasks - i.e. outside of any particular request. It's kind of like Linux CRON tasks.

Routes are passed an instance of an `AsyncTaskRunner` (see `AsyncTaskRunner.js`), which can be used to register async routes or be used to push initial tasks.

For example, let's say you add the following to the `apps/Controller/app/core/public/routes.js` file:

```javascript
module.exports = function (app, asyncRunner) {
	// A. Push a task.
	app.route("/public/some-random-route", async () => {
		await asyncRunner.pushTask({
			callback: `my custom name`, // this matches the name of the route given below.
			dateToExecute: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week in the future
			data: {
				any: "data can be",
				added: `here!`,
			},
		});
	});

	// B. Register an async route.
	asyncRunner.route("my custom name", async (task) => {
		// task = AsyncTaskDetails object (see apps/Controller/app/common/asyncTaskRunner/AsyncTaskDetails.js)
		// task.getTaskData() is the data supplied when pushing the task. In this case: {any: 'data can be', added: 'here!'}
	});
};
```

Consider step A. When you visit the `/public/some-random-route` endpoint, a task will be enqueued which is scheduled to run 1 week from now.

In a week's time (approx.), the Async Task Runner will execute the task. It will look for a route called `my custom name`. If found, it will execute the callback registered with that route. The callback will be passed an AsyncTaskDetails object which contains the task data, and other useful data (see `AsyncTaskDetails.js`).

Make sure that any data you specify in the `pushTask` call can be JSON stringified! This value is saved in the database.

### Why do we have this?

So that tasks can be executed asynchronously, which improves performance and user experience.

Suppose we need to send a notification email to the Institution Admin whenever a Teacher in their institution tries to create an extract that would exceed their limit.
The most sensible place to check the limit is in the `extract-create` endpoint, when a Teacher is actually trying to create an extract.
Sending an email can take a few seconds though, especially when the SMTP server is slow. If we waited for the email to be sent within the `extract-create` endpoint itself, then the teacher would have to potentially wait for several seconds for something they personally don't care about. That's not ideal. We can instead push an async task and return immediately from the `extract-create` endpoint. This would mean a faster response for the user, and the email would be enqueued to be sent out in the next few minutes.

Bear in mind that async tasks aren't executed immediately. It can up to a few minutes for an async task to be executed, even if it's scheduled for now.
