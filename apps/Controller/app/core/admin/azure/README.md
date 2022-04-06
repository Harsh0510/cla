# What is this?

When an asset (book) PDF is uploaded to Azure Blob Storage, it needs to be processed: low quality watermarked snapshots need to be created of each page, high quality snapshots need to be created of each page, the total page count needs to be calculated, and a cover image needs to be generated.

See `documentation/asset_upload_process/README.md` for a detailed explanation of the asset upload process.

This directory contains the script which does this processing.

This script is not executed locally though! The script is uploaded to Azure, and then executed many times in parallel as a Batch job.

# Hacking

If you don't change the command line arguments passed to the script, you should only change the following file: `apps/Controller/app/core/admin/azure/worker-lib.js`

If you need to change the command line arguments (add some, remove some, change order, etc.), you should change the `submit` function in `apps/Controller/app/core/admin/azure/Batch.js`.

# Preparing for Azure

After you've made modifications, you'll need to upload the changes to Azure.

Run the following commands (from this directory):

```
rm -rf package.json watermark.jpg bundle.js bundle.tar.gz
cp ../lib/generatePdfPagePreviews/watermark.jpg watermark.jpg
npx rollup -c
echo '{"name": "x","private": true,"version": "1.0.0","dependencies": {"@azure/storage-blob": "~12.5.0", "pg": "^8.5.1", "axios": "~0.21.1", "shell-quote": "1.7.2", "mime-types": "^2.1.30"}}' > package.json
tar -zcf bundle.tar.gz bundle.js watermark.jpg package.json
rm -rf package.json watermark.jpg bundle.js
```

Then upload `bundle.tar.gz` and `worker_init.sh` to the Azure Blob Storage `rawuploads` container

