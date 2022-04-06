// We need to send the (3 days + 2 weeks) email first, then the (3 days + 1 weeks) day and then 3 days.
// This will ensure that, when this functionality first goes live, that existing users that haven't verified a email for more than (3 days + 2 weeks) days only receive a single email - the (3 days + 2 weeks) day one.
module.exports = {
	hours: [
		71 + 24 * 7 * 2, // 71 hours + 2 weeks
		71 + 24 * 7 * 1, // 71 hours + 1 weeks
		71, //Useed 71 hours instead of 72 hours due to avoid the day-light saving time change
	],
};
