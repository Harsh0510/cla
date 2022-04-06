import { expect, test } from "@jest/globals";

import fetchExtractAzureBlobName from "../../../../src/routes/extract/lib/fetchExtractAzureBlobName";

test("works", () => {
	expect(fetchExtractAzureBlobName(123, [5])).toBe("123/489520c91a2b6e1c9976810f22e88423a4c9e1b2.pdf");
	expect(fetchExtractAzureBlobName(123, [5, 10])).toBe("123/e5027632826e8fe43a14f1dea68a8cb98a8afd1d.pdf");
	expect(fetchExtractAzureBlobName(123, [10, 5])).toBe("123/e5027632826e8fe43a14f1dea68a8cb98a8afd1d.pdf");
});
