export default {
	data: [
		{
			id: 1036,
			identifier: "9780415447096",
			title: "1001 Brilliant Writing Ideas: Teaching Inspirational Story-Writing for All Ages",
			publisher_name_log: "Taylor and Francis",
			active: true,
			buy_book_rules: ["www.google.com", "www.facebook.com"],
		},
		{
			id: 18210,
			identifier: "9781471849275",
			title: "11+ English Practice Papers 1",
			publisher_name_log: "Hodder Education Group",
			active: false,
			buy_book_rules: ["www.google.com", "http://google.com?q=ZZZ{{asset.parent_identifier}}"],
		},
		{
			id: 17121,
			identifier: "9781471869044",
			title: "11+ English Practice Papers 2",
			publisher_name_log: "Hodder Education Group",
			active: true,
			buy_book_rules: ["http://does.not.exist", "https://definitely.doesnt.exist/lol", "http://google.com?q=ZZZ{{asset.pdf_isbn13}}"],
		},
		{
			id: 16820,
			identifier: "9781471849220",
			title: "11+ English Revision Guide",
			publisher_name_log: "Hodder Education Group",
			active: null,
			buy_book_rules: null,
		},
	],
	unfiltered_count: 4,
};
