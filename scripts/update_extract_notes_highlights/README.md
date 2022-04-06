# Update extract pages

In Sprint 52 (02-13 August 2021) we added functionality to extract edit and delete.

Unfortunately this change broke any existing extracts_note and extract_highlight that contained extract page_index (Based on extract pages).

The purpose of this script is to store the page value based on existing page_index associated with the extract pages array value.

## Update Database Tables before run the script

Before run this script, you need to be update the datbase tables with following queries:

```
ALTER TABLE extract_note ADD COLUMN page INTEGER;
CREATE INDEX IF NOT EXISTS extract_note__page__index ON extract_note(page);
```

```
ALTER TABLE extract_highlight ADD COLUMN page INTEGER;
CREATE INDEX IF NOT EXISTS extract_highlight__page__index ON extract_highlight(page);
```

```
ALTER TABLE extract_page_join ADD COLUMN page INTEGER;
CREATE INDEX IF NOT EXISTS extract_page_join__page__index ON extract_page_join(page);
```

## Running

    $ node index.js

You will be prompted to enter the the credentials to the database.

You only need to execute this script once.

## After Running Script scuccessfully check with data

### Kindly make sure the page value from `extract_note` table by run the below SELECT query:

```
SELECT extract_note.id AS extract_note_id, extract_note.extract_id, extract.asset_id, extract_note.page_index, extract.pages, extract_note.page FROM extract_note INNER JOIN extract ON extract_note.extract_id= extract.id ORDER BY extract_note.id ASC;
```

- Review the below examples for page value based on page_index and pages:

  > - If page_index is 0 and pages[1,2] than page value should be the 1.
  > - If page_index is 2 and pages[1, 2, 3, 4] than page value should be the 3.
  > - If page_index is 4 and pages[1, 2, 3, 4, 5] than page value should be the 5.

### Kindly make sure the page value from `extract_highlight` table by run the below SELECT query:

```
SELECT extract_highlight.id AS extract_highlight_id, extract_highlight.extract_id, extract.asset_id, extract_highlight.page_index, extract.pages, extract_highlight.page FROM extract_highlight INNER JOIN extract ON extract_highlight.extract_id= extract.id ORDER BY extract_highlight.id ASC;
```

- Review the below examples for page value based on page_index and pages:

  > - If page_index is 0 and pages[1,2] than page value should be the 1.
  > - If page_index is 2 and pages[1, 2, 3, 4] than page value should be the 3.
  > - If page_index is 4 and pages[1, 2, 3, 4, 5] than page value should be the 5.

### Kindly make sure the page value from `extract_page_join` table by run the below SELECT query:

```
SELECT extract_page_join.extract_id, extract.asset_id, extract_page_join.page_index, extract.pages, extract_page_join.page FROM extract_page_join INNER JOIN extract ON extract_page_join.extract_id = extract.id ORDER BY extract_page_join.extract_id ASC;
```

- Review the below examples for page value based on page_index and pages:

> - If page_index is 0 and pages[1,2] than page value should be the 1.
> - If page_index is 2 and pages[1, 2, 3, 4] than page value should be the 3.
> - If page_index is 4 and pages[1, 2, 3, 4, 5] than page value should be the 5.

## Remove `page_index` field from database tables

### Remove `page_index` field from `extract_note`:

```
ALTER TABLE extract_note DROP COLUMN page_index;
```

### Remove `page_index` field from `extract_highlight`:

```
ALTER TABLE extract_highlight DROP COLUMN page_index;
```

### Remove `page_index` field from `extract_page_join`:

```
ALTER TABLE extract_page_join DROP COLUMN page_index;
```

## Update Primary key constrainst

### Update primary_key in `extract_page_join`

```
ALTER TABLE extract_page_join ALTER COLUMN page set not null;
ALTER TABLE extract_page_join ADD PRIMARY KEY(extract_id, page);
```
