# Asset Upload

A one-stop shop to upload new books to the platform. This handles:

- Fetching, processing and uploading cover images.
- Uploading and processing PDF files into high quality pages, cover pages and page previews.
- Fetching and uploading ONIX metadata tiles.
- Copying the stage Storage Account onto Production.

## Usage

First install the package dependencies:

	$ npm i

Then copy and fill out the adjacent 'env.example' file into a `.env` file at one of the following locations (in order of preference):

- $HOME/.cla-ep-asset-upload.env
- /etc/.cla-ep-asset-upload.env
- In this directory (do NOT accidentally commit it!)

Please see the adjacent `env.example` file for a description of the available settings.

You may alternatively place your env settings into a file named something other than '.env'. If you do this, add '--envFile /path/to/custom/env/file' to the example commands described below (e.g. `DO_COVER_IMAGES=1 node index --envFile /path/to/custom/env/file`).

### STEP 1: Fetch, process and upload cover images.

#### Requirements

- Recent version of ImageMagick installed and in your path.

#### Command

	$ DO_COVER_IMAGES=1 node index

#### Description

This will download cover images to your local computer, process them with ImageMagick, and then upload them to the Azure Storage Account.

### STEP 2: Insert metadata (phase 1)

#### Requirements

- Access to the `dev` branch of the CLA GitHub repository.

#### Command

	$ DO_METADATA_PHASE_ONE=1 node index

#### Description

This will do the following:

1. Clone the `dev` branch of the CLA GitHub repository.
2. 'Chunk' up the XML files into ~1MB manageable chunks.
3. Upload all the chunks one-by-one to the Stage /admin/validate-and-upsert/phase-one endpoint. This will insert asset records into the database, but newly created assets will not be active until later in the upload process.

### STEP 3: Upload and process PDF/ePUB files

#### Requirements

None.

#### Command

	$ DO_PDFS=1 node index

#### Description

This will transfer the PDF/ePUB files from the specified directory on the CLA workbench into Azure, and then submit an Azure Batch job to process them.

This command will return when the Azure Batch job has been submitted. It will not wait until the Batch job finishes (which will take several hours).

Be sure to check Azure after a few hours to confirm that the Batch job has completed before moving on to the next step!

### STEP 4: Update the asset records

#### Requirements

None.

#### Command

	$ DO_METADATA_PHASE_TWO=1 node index

#### Description

This will check Azure to see which PDFs/ePUBs have been successfully processed and then set the `asset.active` database field to `true` for all (existing) assets that have associated high quality pages, page previews, etc.

This step must happen after the asset files are processed.

### STEP 5: Transfer to Production

#### Requirements

- Access to the `dev` branch of the CLA GitHub repository.

#### Command

	$ DO_TRANSFER_TO_LIVE=1 node index

#### Description

This does the following:

1. Sync the Stage Storage account with Production.
2. Uploads the metadata files (as in steps 2 and 4) to Production. Both 'phase one' and 'phase two' metadata steps are done on the production database.
