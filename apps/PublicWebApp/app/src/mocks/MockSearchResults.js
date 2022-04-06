/** Mock search result data for testing */
export default {
	unfiltered_count: 10,
	results: [
		{
			title: "title 1",
			publisher: "publisher 1",
			authors: [
				{
					role: "A",
					firstName: "name1",
					lastName: "name2",
				},
				{
					role: "B",
					firstName: "name1",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645364758789",
			pdf_isbn13: "9781444144215",
			sub_title: "sub_title 1",
			publication_date: "2000-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 2,
			auto_unlocked: true,
			is_system_asset: true,
		},
		{
			title: "title 2",
			publisher: "publisher 2",
			authors: [
				{
					role: "A",
					firstName: "name2",
					lastName: "name2",
				},
				{
					role: "A",
					firstName: "name2",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645364748789",
			pdf_isbn13: "9781444144215",
			sub_title: "sub_title 2",
			publication_date: "2000-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: true,
			is_system_asset: false,
			uploadedExtracts: [
				{ title: "test1", page_range: [1, 2, 3] },
				{ title: "test2", page_range: [1, 2, 3] },
			],
		},
		{
			title: "title 3",
			publisher: "publisher 3",
			authors: [
				{
					role: "A",
					firstName: "name3",
					lastName: "name2",
				},
				{
					role: "A",
					firstName: "name3",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645364658789",
			pdf_isbn13: "9781444144215",
			sub_title: "sub_title 3",
			publication_date: "2000-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 1,
			auto_unlocked: true,
			is_system_asset: true,
		},
		{
			title: "title 4",
			publisher: "publisher 4",
			authors: [
				{
					role: "A",
					firstName: "name4",
					lastName: "name2",
				},
				{
					role: "B",
					firstName: "name4",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9647364758789",
			pdf_isbn13: "9781444144215",
			sub_title: "sub_title 4",
			publication_date: "2001-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: true,
			is_system_asset: true,
		},
		{
			title: "title 5",
			publisher: "publisher 5",
			authors: [
				{
					firstName: "name5",
					lastName: "name2",
				},
				{
					firstName: "name5",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645364554789",
			sub_title: "sub_title 5",
			publication_date: "2002-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: true,
			is_system_asset: true,
		},
		{
			title: "title 6",
			publisher: "publisher 6",
			authors: [
				{
					firstName: "name6",
					lastName: "name2",
				},
				{
					firstName: "name6",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9445864758789",
			sub_title: "sub_title 6",
			publication_date: "2010-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: true,
			is_system_asset: true,
		},
		{
			title: "title 7",
			publisher: "publisher 7",
			authors: [
				{
					firstName: "name7",
					lastName: "name2",
				},
				{
					firstName: "name7",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645367958789",
			sub_title: "sub_title 7",
			publication_date: "2010-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: true,
			is_system_asset: true,
		},
		{
			title: "title 8",
			publisher: "publisher 8",
			authors: [
				{
					firstName: "name8",
					lastName: "name2",
				},
				{
					firstName: "name8",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9642164758789",
			sub_title: "sub_title 8",
			publication_date: "2070-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: true,
		},
		{
			title: "title 9",
			publisher: "publisher 9",
			authors: [
				{
					firstName: "name9",
					lastName: "name2",
				},
				{
					firstName: "name9",
					lastName: "name2",
				},
			],
			is_unlocked: false,
			isbn13: "9645364756659",
			sub_title: "sub_title 9",
			publication_date: "2001-12-01",
			edition: 2,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: false,
		},
		{
			title: "title 10",
			publisher: "publisher 10",
			authors: [
				{
					role: "A",
					firstName: "name10",
					lastName: "name2",
				},
				{
					role: "A",
					firstName: "name10",
					lastName: "name2",
				},
				{
					role: "B",
					firstName: "name10",
					lastName: "name2",
				},
				{
					role: "A",
					firstName: "name10",
					lastName: "name2",
				},
			],
			is_unlocked: false,
			isbn13: "9645355688789",
			sub_title: "sub_title 10",
			publication_date: "",
			edition: 1,
			subject_code: "Y",
			copies_count: 0,
			auto_unlocked: false,
		},
	],
	resultFilter: [
		{
			id: "misc",
			title: "My Library",
			data: [
				{
					id: "all_copies",
					title: "All Copies",
					count: 13,
				},
				{
					id: "unlock_books",
					title: "Unlocked Content",
					count: 57,
				},
			],
		},
		{
			id: "subject",
			title: "Subject",
			data: [
				{
					id: "ANC",
					title: "Acting techniques",
					count: "1",
					child_subjects: [],
				},
				{
					id: "YRD",
					title: "Dictionaries, school dictionaries (Children's / Teenage)",
					count: "1",
					child_subjects: [],
				},
				{
					id: "YND",
					title: "Drama & performing (Children's / Teenage)",
					count: "2",
					child_subjects: [
						{
							id: "YNDS",
							title: "Playscripts (Children's / Teenage)",
							count: "2",
						},
					],
				},
				{
					id: "YQA",
					title: "Educational: Art & design",
					count: "1",
					child_subjects: [],
				},
				{
					id: "YQV",
					title: "Educational: Business studies & economics",
					count: "11",
					child_subjects: [],
				},
				{
					id: "YQN",
					title: "Educational: Citizenship & social education",
					count: "2",
					child_subjects: [
						{
							id: "YQNP",
							title: "Educational: Personal, social & health education (PSHE)",
							count: "3",
						},
					],
				},
				{
					id: "YQC",
					title: "Educational: English language & literacy",
					count: "103",
					child_subjects: [
						{
							id: "YQCR",
							title: "Educational: English language: readers & reading schemes",
							count: "137",
						},
						{
							id: "YQCS",
							title: "Educational: English language: reading & writing skills",
							count: "314",
						},
					],
				},
				{
					id: "YQE",
					title: "Educational: English literature",
					count: "47",
					child_subjects: [
						{
							id: "YQES",
							title: "School editions of Shakespeare",
							count: "2",
						},
					],
				},
				{
					id: "YQG",
					title: "Educational: Geography",
					count: "15",
					child_subjects: [],
				},
				{
					id: "YQH",
					title: "Educational: History",
					count: "54",
					child_subjects: [],
				},
				{
					id: "YQF",
					title: "Educational: Languages other than English",
					count: "19",
					child_subjects: [],
				},
				{
					id: "YQM",
					title: "Educational: Mathematics & numeracy",
					count: "252",
					child_subjects: [
						{
							id: "YQMT",
							title: "Educational: Mathematics & numeracy: times tables",
							count: "1",
						},
					],
				},
				{
					id: "YQB",
					title: "Educational: Music",
					count: "1",
					child_subjects: [],
				},
				{
					id: "YQW",
					title: "Educational: Physical education (including dance)",
					count: "7",
					child_subjects: [],
				},
				{
					id: "JNC",
					title: "Educational psychology",
					count: "1",
					child_subjects: [],
				},
				{
					id: "YQR",
					title: "Educational: Religious studies",
					count: "12",
					child_subjects: [],
				},
				{
					id: "YQS",
					title: "Educational: Sciences, general science",
					count: "114",
					child_subjects: [
						{
							id: "YQSB",
							title: "Educational: Biology",
							count: "10",
						},
						{
							id: "YQSC",
							title: "Educational: Chemistry",
							count: "8",
						},
						{
							id: "YQSP",
							title: "Educational: Physics",
							count: "9",
						},
					],
				},
				{
					id: "YQJ",
					title: "Educational: Social sciences",
					count: "3",
					child_subjects: [
						{
							id: "YQJP",
							title: "Educational: Psychology",
							count: "3",
						},
					],
				},
				{
					id: "YQZ",
					title: "Educational: study & revision guides",
					count: "17",
					child_subjects: [],
				},
				{
					id: "YQY",
					title: "Educational: Vocational subjects",
					count: "18",
					child_subjects: [],
				},
				{
					id: "ELV",
					title: "ELT examination practice tests",
					count: "1",
					child_subjects: [],
				},
				{
					id: "ELS",
					title: "ELT self-study texts",
					count: "1",
					child_subjects: [],
				},
				{
					id: "TBC",
					title: "Engineering: general",
					count: "4",
					child_subjects: [],
				},
				{
					id: "KJH",
					title: "Entrepreneurship",
					count: "2",
					child_subjects: [],
				},
				{
					id: "HPQ",
					title: "Ethics & moral philosophy",
					count: "2",
					child_subjects: [],
				},
				{
					id: "HBG",
					title: "General & world history",
					count: "4",
					child_subjects: [],
				},
				{
					id: "YBG",
					title: "Interactive & activity books & packs",
					count: "1",
					child_subjects: [],
				},
				{
					id: "CJB",
					title: "Language teaching & learning material & coursework",
					count: "10",
					child_subjects: [
						{
							id: "CJBG",
							title: "Grammar & vocabulary",
							count: "12",
						},
					],
				},
				{
					id: "LAQ",
					title: "Law & society",
					count: "1",
					child_subjects: [],
				},
				{
					id: "DSB",
					title: "Literary studies: general",
					count: "1",
					child_subjects: [],
				},
				{
					id: "JFD",
					title: "Media studies",
					count: "1",
					child_subjects: [],
				},
				{
					id: "YNC",
					title: "Music: general interest (Children's / Teenage)",
					count: "5",
					child_subjects: [],
				},
				{
					id: "JNA",
					title: "Philosophy & theory of education",
					count: "1",
					child_subjects: [],
				},
				{
					id: "VFD",
					title: "Popular medicine & health",
					count: "2",
					child_subjects: [],
				},
				{
					id: "GBC",
					title: "Reference works",
					count: "1",
					child_subjects: [],
				},
				{
					id: "HBJ",
					title: "Regional & national history",
					count: "2",
					child_subjects: [
						{
							id: "HBJF",
							title: "Asian history",
							count: "1",
						},
						{
							id: "HBJD",
							title: "European history",
							count: "6",
						},
						{
							id: "HBJK",
							title: "History of the Americas",
							count: "2",
						},
					],
				},
				{
					id: "HRA",
					title: "Religion: general",
					count: "6",
					child_subjects: [
						{
							id: "HRAB",
							title: "Philosophy of religion",
							count: "1",
						},
					],
				},
				{
					id: "JHB",
					title: "Sociology",
					count: "5",
					child_subjects: [],
				},
				{
					id: "JNU",
					title: "Teaching of a specific subject",
					count: "13",
					child_subjects: [
						{
							id: "JNUM",
							title: "Teachers' classroom resources & material",
							count: "3",
						},
					],
				},
				{
					id: "JNS",
					title: "Teaching of specific groups & persons with special educational needs",
					count: "24",
					child_subjects: [],
				},
				{
					id: "JNT",
					title: "Teaching skills & techniques",
					count: "10",
					child_subjects: [],
				},
			],
		},
		{
			id: "level",
			title: "Level",
			data: [
				{
					id: "primary",
					title: "primary",
					count: "697",
				},
				{
					id: "secondary",
					title: "secondary",
					count: "776",
				},
			],
		},
		{
			id: "exam",
			title: "Exam",
			data: [
				{
					id: "A Level",
					title: "A Level",
					count: "194",
				},
				{
					id: "AS Level",
					title: "AS Level",
					count: "75",
				},
				{
					id: "BTEC",
					title: "BTEC",
					count: "53",
				},
				{
					id: "GCSE",
					title: "GCSE",
					count: "480",
				},
				{
					id: "IELTS",
					title: "IELTS",
					count: "1",
				},
				{
					id: "IGCSE",
					title: "IGCSE",
					count: "3",
				},
				{
					id: "SATs",
					title: "SATs",
					count: "31",
				},
			],
		},
		{
			id: "exam_board",
			title: "Exam Board",
			data: [
				{
					id: "AQA",
					title: "AQA",
					count: "303",
				},
				{
					id: "Edexcel",
					title: "Edexcel",
					count: "204",
				},
				{
					id: "Eduqas",
					title: "Eduqas",
					count: "5",
				},
				{
					id: "OCR",
					title: "OCR",
					count: "76",
				},
				{
					id: "SQA",
					title: "SQA",
					count: "1",
				},
				{
					id: "WJEC",
					title: "WJEC",
					count: "2",
				},
			],
		},
		{
			id: "key_stage",
			title: "Key Stage",
			data: [
				{
					id: "KS0",
					title: "KS0",
					count: "141",
				},
				{
					id: "KS1",
					title: "KS1",
					count: "282",
				},
				{
					id: "KS2",
					title: "KS2",
					count: "151",
				},
				{
					id: "KS3",
					title: "KS3",
					count: "133",
				},
				{
					id: "KS4",
					title: "KS4",
					count: "65",
				},
			],
		},
	],
	resultFilterCount: 2673,
};

export const MockPaginatedResults = {
	unfiltered_count: 10,
	results: [
		{
			title: "title 1",
			publisher: "publisher 1",
			authors: [
				{
					firstName: "name1",
					lastName: "name2",
				},
				{
					firstName: "name1",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645364758789",
			sub_title: "sub_title 1",
			publication_date: "2000-12-01",
			edition: 2,
		},
		{
			title: "title 2",
			publisher: "publisher 2",
			authors: [
				{
					firstName: "name2",
					lastName: "name2",
				},
				{
					firstName: "name2",
					lastName: "name2",
				},
			],
			is_unlocked: false,
			isbn13: "9645364748789",
			sub_title: "sub_title 2",
			publication_date: "2000-12-01",
			edition: 2,
			auto_unlocked: false,
		},
		{
			title: "title 3",
			publisher: "publisher 3",
			authors: [
				{
					firstName: "name3",
					lastName: "name2",
				},
				{
					firstName: "name3",
					lastName: "name2",
				},
			],
			is_unlocked: true,
			isbn13: "9645364658789",
			sub_title: "sub_title 3",
			publication_date: "2000-12-01",
			edition: 2,
			auto_unlocked: true,
		},
	],
	resultFilter: [
		{
			id: "level",
			title: "Level",
			data: [
				{
					id: "primary",
					title: "primary",
					count: "697",
				},
				{
					id: "secondary",
					title: "secondary",
					count: "776",
				},
			],
		},
	],
	resultFilterCount: 1,
};

export const Mockfilters = {
	result: [
		{
			id: "misc",
			title: "My Library",
			data: [
				{ id: "my_copies", title: "My Copies" },
				// {id: 'my_favourites', title: 'My Favourites'},
				{ id: "my_school_library", title: "My School Library" },
			],
		},
		// {
		// 	id: 'level',
		// 	title: 'Level',
		// 	data: levels,
		// },
		{
			id: "subject",
			title: "Subject",
			data: [
				{ id: "Y", title: "Children's, Teenage & educational" },
				{ id: "K", title: "Economics, finance, business & management" },
				{ id: "E", title: "English language teaching (ELT)" },
				{ id: "V", title: "Health & personal development" },
				{ id: "J", title: "Society & social sciences" },
				{ id: "A", title: "The arts" },
			],
			//subjects.rows.filter(row => (row.count > 0)).map(row => ({id: row.id, title: row.title})),
		},
		// {
		// 	id: 'key_stage',
		// 	title: 'Key Stages',
		// 	data: keyStages,
		// },
		// {
		// 	id: 'exam_board',
		// 	title: 'Exam Board',
		// 	data: examBoards,
		// },
	],
};

export const MockcopiesData = {
	extracts: [
		{
			oid: "d37eed3c906346dfe88148d509c8745f19be",
			title: "This is my extract title!",
			course_oid: "45d0b50a4a276e3f559bdaf55d713845667e",
			year_group: "Y13",
			course_name: "Maths 102",
			work_isbn13: "9780007226788",
			work_title: "Big Book 2B",
			work_authors: [{ lastName: "Law", firstName: "Karina" }],
			exam_board: "AQA",
			students_in_course: 45,
			page_count: 21,
			date_created: "2019-01-03T11:19:05.611Z",
			pages: [4, 5, 6, 7, 8, 9, 10, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30, 32, 35],
			user_id: 1,
			teacher: "tfname tlname",
			status: "editable",
		},
		{
			oid: "2c4963608858c852e467d0b4b1e5ab94079a",
			title: "Title",
			course_oid: "bd04e47394b4fe164ecaea0c2b83b7441814",
			year_group: "Y12",
			course_name: "Psychology 101",
			work_isbn13: "9780007431144",
			work_title: "Enriching Maths Resource Pack 2",
			work_authors: [{ lastName: "Clarke", firstName: "Peter" }],
			exam_board: "EdExcel",
			students_in_course: 2,
			page_count: 1,
			date_created: "2019-01-02T17:38:40.218Z",
			pages: [267],
			user_id: 1,
			teacher: "tfname tlname",
			status: "editable",
		},
	],
	unfiltered_count: 15,
	academic_year_end: [8, 15],
	filter_data: {
		result: [
			{
				id: "class",
				title: "class",
				data: [
					{ id: 1, title: "Demo class 1" },
					{ id: 2, title: "Demo class 2" },
					{ id: 3, title: "Demo class 3" },
				],
			},
		],
	},
	course_oid: {
		result: {
			courseOid: "1234",
		},
	},
};
