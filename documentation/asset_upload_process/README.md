# Asset Upload Process

This document outlines the process for uploading assets and meta-data to the Education Platform.

EDIT: The Asset Upload process is now mostly automated. Please see: `scripts/asset_upload/README.md`.

## Overview

The overall process is described below, and described in detail afterwards.

1. The raw PDF files (books) are uploaded to the Education Platform Azure Blob Storage account.
2. The raw PDF files are processed (cover pages generated, page counts extracted, watermarked page previews generated, high-quality pages generated) and the resultant assets uploaded to another part of the Azure Blob Storage account.
3. The ONIX 3.0 XML meta-data is uploaded and the data is inserted into the database.

### Stage 1: Raw PDF uploaded to Azure

The first step is to upload all the raw PDFs to the Azure Blob Storage account.
PDFs are uploaded to the `occclastagestorage` Storage Account in Azure - specifically to the `rawuploads` container.
The `rawuploads` container is highly sensitive and should be treated very carefully because it contains the raw, high-quality PDFs of the books as sent directly from the publishers. These PDFs must absolutely never be publicly exposed - even momentarily for 'testing'.
The `rawuploads` container is therefore configured within Azure to not be publicly accessible.
Some of the raw PDFs are only 150kb, whereas others can be up to 450MB.
All the files in `rawuploads` are named `<ISBN13>.pdf` - e.g. `9780007436750.pdf`.

Note that the PDFs are uploaded specifically to the `occclastagestorage` Blob Storage account, and *not* the production Blob Storage account.
This is because, at least currently, all PDF uploads and processing happens on `occclastagestorage` and the files on the stage Blob Storage are copied across to the live Blob Storage when changes are pushed from Stage to Production.
This may change in future.

There are currently two command-line NodeJS scripts which handle uploading raw PDFs to Azure Blob Storage.
Both scripts require you to have NodeJS v10 installed on your machine (may work with later versions), and both scripts have only been tested on OSX/Linux.

Eventually the functionality exposed by these scripts (namely: uploading PDFs to Azure) will be driven via a web interface on the Education Platform website.
However we simply haven't begun this development yet.

The first script is `scripts/upload_pdfs_to_azure`. Please see `scripts/upload_pdfs_to_azure/README.md` for detailed documentation on what this script does.
In short, this script takes a directory on your local computer containing PDF files and uploads them to Azure Blob Storage.
The PDFs don't have to be named in the `<ISBN13>.pdf` format - as long as the files contain the ISBN13 somewhere in the filename, the system will recognise the ISBN and upload it to Azure with the correct filename.

The second script is `scripts/check_pdfs_on_cla_cloud`. Please see `scripts/check_pdfs_on_cla_cloud/README.md` for detailed documentation on what this script does.
In short, this script downloads PDFs from CLA Cloud and uploads them to Azure Blob Storage.
The PDFs don't have to be named in the `<ISBN13>.pdf` format - as long as the files contain the ISBN13 somewhere in the filename, the system will recognise the ISBN and upload it to Azure with the correct filename.

The script to be used depends on whether the PDFs that need uploading to Azure Blob Storage are on the CLA Cloud (in which case use the latter) or not (in which case use the former).

### Stage 2: Processing PDFs on Azure

Given that the raw PDFs are on Azure Blob Storage after Stage 1, it's now necessary to do the following:

- **Generate cover pages.** These are 300x300 or smaller PNG images of the first page of the PDF. This is used as a preview of the book on the Education Platform website.
- **Generate high quality page images.** These are 150dpi PNG images of each page of the PDF. When the user generates a copy on the Education Platform website, they are given access to (some of) these high quality page images.
- **Generate page counts.** These are simple plain text files containing the page count for each PDF. Each text file contains only the page count of the PDF.
- **Generate page preview images.** These are ~30dpi PNG images of each page of the PDF. These images are shown to users when they're previewing a book. Each PNG image is heavily watermarked.

Crucially, cover images, high quality page images, and page preview images are not generated dynamically.
They are generated just once when the assets are added to the system to maximise performance for teachers.

Generating all these assets unfortunately takes up to 1 hour per PDF - most of this time is spent generating the high quality page images.
So processing 1000 PDFs serially on a single machine would take 6 weeks!

Since this is an unacceptably long time (there will be 10000+ assets on the Education Platform at launch), it became necessary to find a faster way of processing the PDFs.
The solution was to use an Azure Batch job.

The idea is that the processing is divided into hundreds of spawned Azure VMs - each VM is responsible for processing just 1 PDF.
The basic idea when we want to process `N` raw PDFs is this:

1. Spawn `N` virtual machines.
2. Task each spawned virtual machine with processing 1 PDF.
3. Wait until all `N` virtual machines have completed processing.
4. Deallocate the `N` virtual machines.

This way, processing raw PDFs takes only ~1 hour regardless of whether 1 PDF or 500 needs to be processed.

How are the virtual machines spawned? They are *not* dedicated Azure Virtual Machines.
Instead there is an Azure Batch account. All processing requests go through the Azure Batch account, which handles spinning up and deallocating the VMs.

Note that Azure Batch is not cheap - processing 1000 PDFs may only take around an hour, but it costs around 70GBP (for processing 1000 PDFs).

There is currently just one script which handles processing the raw PDFs, which is located in: `scripts/process_pdfs_on_azure`
Please see the README file located at `scripts/process_pdfs_on_azure/README.md` for documentation on this script.
In short, this script prompts you to enter the Azure Batch account details and the Azure Blob Storage account details, and then initiates the processing of the PDFs.

The processed files are written to Azure Blob Storage with the following formats:

#### Cover Pages

These are written to the `coverpages` container.
This container is publicly accessible.
The format is: `coverpages/<IBBN13>.png` (e.g. `coverpages/9780007185641.png`).

#### High Quality Page Images

These are written to the `highqualitypages` container.
This container is *not* publicly accessible.
The format is: `highqualitypages/9780007131983/<PAGE_NUMBER>.png` (e.g. `highqualitypages/9780007131983/4.png`).
So the `highqualitypages` container is filled with directories as the ISBN, with many PNG images in each directory (one for each page).
Note that pages start from 0 - so the first page is `0.png`.

#### Page Counts

Written to the `pagecounts` container.
The container is publicly accessible.
The format is `pagecounts/<ISBN13>.txt` (e.g. `pagecounts/9780007131983.txt`).

#### Page Preview Images

These are written to the `pagepreviews` container.
This container is publicly accessible.
The format is: `pagepreviews/9780007131983/<PAGE_NUMBER>.png` (e.g. `pagepreviews/9780007131983/4.png`).
So the `pagepreviews` container is filled with directories as the ISBN, with many PNG images in each directory (one for each page).
Note that pages start from 0 - so the first page is `0.png`.

### Stage 3: Uploading the ONIX 3.0 XML meta-data to the database

After Stages 1 and 2, all the PDFs, cover pages, page previews, page counts, and high quality pages are sitting in Azure Blob Storage.
Information about those books hasn't actually been added to the Education Platform yet though so the Education Platform has no idea they exist.
The final step is therefore to upload the ONIX 3.0 XML meta-data, which contains all the meta-data associated with each PDF, to the system.
This step basically upserts rows into the Education Platform database, after which point the platform recognises that the books exist.
It is only after this step that books become searchable on the platform.

Unlike the previous stages, there isn't currently a command-line script for this stage.
Instead, there is a route available: `/admin/validate-and-upsert`
You should use the Controller playground (`apps/Controller/app/playground/index.html`) to access this endpoint.
You should pass in the following parameters:

```json
{
	"data_only": true,
	"azure_connection_string": "the_azure_connection_string"
}
```

This endpoint expects to receive one or more ONIX 3.0 XML meta-data files.
It processes each file to find meta-data associated with each asset.
Please also see `metadata/README.md` for a description of what meta-data *should* be extracted. Note that this file is maintained by Dan Barker (as of Feb 2019), not by OCC.
Please see `apps/Controller/app/core/admin/parseUploads/handlers/README.md` for an explanation of which information is actually extracted by the system.
Note that the information that is actually extracted may lag behind what *should* be extracted (as specified by Dan Barker's file) - if this happens, the system should be updated to match Dan Barker's file.

Once the system extracts all the Asset records from all the uploaded ONIX files, it then checks against Azure Blob Storage to determine which records have actually been processed (as defined by the previous stages).
The system then uploads only the Asset records to the Education Platform PostgreSQL database that have corresponding files in Azure Blob Storage (as matched by the 'PDF file name' ISBN specified on line 56 of `metadata/README.md` as of commit ID `176d2e14b2ea0f5f53a8ddc32c75976d21cda90f`).

This 'meta-data parsing' step inserts lots of information into the database, including (but not limited to):

- The Book title.
- Description.
- Table of Contents.
- Authors, Editors, and other Contributors.
- Publication Date.
