const consts = require("../../../../core/admin/lib/generatePdfHighQualityImages/consts");

test("Consts component returns value", async () => {
	expect(consts).toEqual({ GHOSTSCRIPT_DPI: 450, IMAGEMAGICK_DPI: 150 });
});
