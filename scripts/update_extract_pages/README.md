# Update extract pages

In Sprint 43 (1-15 February 2021) we added functionality to exclude certain pages ('copy_excluded_pages') from counting towards your copy limit.

Unfortunately this change broke any existing extracts that contained copy_excluded_pages that were made before this update.

The purpose of this script is to remove copy_excluded_pages from any extracts that have them.

If an extract has no pages left after the copy_excluded_pages are removed (i.e. the extract consisted of _only_ copy_excluded_pages) then it is removed.

- extract
- extract_access
- extract_highlight
- extract_note
- extract_page_join
- extract_share
- extract_user_info

This script can be deleted after Sprint 43 is pushed to Production and this script is executed on the Production database - most likely on 1st March 2021.
## Running

    $ node index.js

You will be prompted to enter the the credentials to the database.

You only need to execute this script once.