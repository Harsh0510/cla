#!/usr/bin/env sh

# Delete all BD API PDFs that are older than 120 minutes.
find /tmp -type f -name 'bdapi-*.pdf' -mmin +120 -delete > /dev/null 2>&1
