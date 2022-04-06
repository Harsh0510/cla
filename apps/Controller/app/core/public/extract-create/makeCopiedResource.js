const BlobResource = require("../../admin/azure/BlobResource");

module.exports = (extractOid, pageIndex) => new BlobResource("copiedpages", extractOid + "/" + pageIndex + ".png");
