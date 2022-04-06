# Handlers

This directory contains the handlers for the ONIX XML processor.

Each file is a function which handles fetching the corresponding property for a single product.
E.g. 'isbn13.js' handles fetching the 13-digit ISBN, 'publicationDate.js' file handles fetching the publication date, and so on.

Each handler is run, one after the other (sequentially and synchronously), on each `<Product>` node in the XML.

Each handler should be responsible for one property only.

So if there are 10 handlers and 10 `<Product>` nodes, a total of 100 handler executions will be run.

These handlers do NOT perform error handling. That is done separately.

See `../handlers.js`.

Each handler receives two properties: `product` and `productNode`.
The `product` parameter is a regular javascript object which contains the properties for the product.

Once all the handlers have run on a single `<Product>` node, the object may look like this:

```
{
	isbn13: '1234567890123',
	authors: [
		{
			firstName: 'Bob',
			lastName: 'Jones',
		},
		{
			firstName: 'Bob2',
			lastName: 'Jones2',
		},
	],
	publisher: 'Hodder',
	title: 'Some title here',
	/* lots more properties - one per handler */
}
```

Each handler is responsible for adding their own property to the object, so the `isbn13.js` handler is responsible for adding the `product.isbn13` property for example.

The `productNode` parameter is an XML node object - it's basically the `<Product>` node that the handler is currently processing.

You can run queries on this node to fetch nodes. The most relevant methods you'll need are probably:

```
productNode.queryOne() -> get the first node matching the CSS query (similar to `element.querySelector(...)`)
productNode.query() -> get all the nodes matching the CSS query (similar to `element.querySelectorAll(...)`)

// There is also...

productNode.queryOneAsRoot() -> like productNode.queryOne, but anchors the `:root` pseudo-selector to the <Product> node instead of the root element of the entire XML file.
```

See the existing handlers for examples.

The system uses the `css-select` NodeJS module, so you can be very expressive with your CSS selectors.
You also have a few extra custom selectors (defined in `apps/Controller/app/core/admin/lib/XmlNode.js`):

- starts-with
- equals

E.g.

```
productNode.queryOneAsRoot(`
	:root:has(> DescriptiveDetail > ProductForm:starts-with(BS))
	> ProductIdentifier:has(> ProductIDType:equals(15))
	> IDValue:not(:empty)
`);
```

If necessary, more custom selectors can be added here.