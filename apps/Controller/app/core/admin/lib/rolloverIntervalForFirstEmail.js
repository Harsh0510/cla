/**
 * The number of days before rollover target_execution_date that the first
 * email is sent to users.
 *
 * This must be just a simple integer (so can't do any DB queries or fetch
 * from process.env) because the PublicWebApp directly require()s this file.
 */
module.exports = 7;
