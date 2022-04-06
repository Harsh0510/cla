# Scripts

A collated list of miscellaneous command-line NodeJS scripts (e.g. adding users in bulk, batch uploading files to Azure, etc.).

Some of these scripts will be removed when the functionality is added to the Education Platform website.

## Uploading assets

Until a robust web-based interface is developed, assets will be uploaded to the system via command-line scripts as follows:

1. Run the `upload_pdfs_to_azure` script. See README in that directory.
2. Run the `upload_cover_images_to_azure` script. See README in that directory.
3. Run the `process_pdfs_on_azure` script. See README in that directory.
4. Upload the ONIX XML meta-data files to the `/admin/validate-and-upsert` endpoint via the Controller playground.

## Pushing to Azure

The script in `push_to_azure` automates the process of pushing to Azure.