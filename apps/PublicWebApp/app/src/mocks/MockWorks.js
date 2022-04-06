export default [
	{
		title: "Enter the Dragon",
		sub_title: "A collector's edition",
		description: "Exploring the insides of these magnificent beasts.",
		table_of_contents: `
		<ul>
			<li><span class="lable">Beginning</span><span class="page">2</span></li>
			<li><span class="lable">Middle<span class="page">3</span></li>
			<li><span class="lable">Ending<span class="page">4</span></li>
		</ul>
		`,
		edition: "First",
		publication_date: 878601600,
		subject_code: "2",
		publisher: "Penguin",
		page_count: 288,
		authors: [
			{
				role: "A",
				firstName: "Bob",
				lastName: "Johnson",
			},
			{
				firstName: "Alan",
				lastName: "Smith",
			},
		],
		isbn13: "4871836482365",
		is_unlocked: true,
		page_offset_arabic: 0,
		page_offset_roman: 0,
		can_copy_in_full: false,
	},
	{
		title: "Looking at the Plants",
		sub_title: "Why are they so green?",
		description: "An objective look and these verdant freaks of nature.",
		table_of_contents: `
		<ul>
			<li><span class="lable">Beginning</span><span class="page">2</span></li>
			<li><span class="lable">Middle<span class="page">3</span></li>
			<li><span class="lable">Ending<span class="page">4</span></li>
		</ul>
		`,
		edition: "First",
		publication_date: 928681600,
		subject_code: "4",
		publisher: "Penguin",
		page_count: 791,
		authors: [
			{
				firstName: "Jane",
				lastName: "Doe",
			},
			{
				firstName: "Rob E.",
				lastName: "Black",
			},
			{
				firstName: "Jimmy",
				lastName: "Brown",
			},
		],
		isbn13: "9870836489178",
		is_unlocked: false,
		page_offset_arabic: 0,
		page_offset_roman: 0,
		can_copy_in_full: true,
		file_format: "pdf",
	},
	{
		//created for page number with unlock book true
		title: "Looking at the Plants",
		sub_title: "Why are they so green?",
		description: "An objective look and these verdant freaks of nature.",
		table_of_contents: `
		<ul>
			<li><span class="lable">Beginning</span><span class="page">2</span></li>
			<li><span class="lable">Middle<span class="page">3</span></li>
			<li><span class="lable">Ending<span class="page"></span></li>
		</ul>
		`,
		edition: "First",
		publication_date: 928681600,
		subject_code: "4",
		publisher: "Penguin",
		page_count: 791,
		authors: [
			{
				firstName: "Jane",
				lastName: "Doe",
			},
			{
				firstName: "Rob E.",
				lastName: "Black",
			},
			{
				firstName: "Jimmy",
				lastName: "Brown",
			},
		],
		isbn13: "9870836489178",
		is_unlocked: true,
		page_offset_arabic: 2,
		page_offset_roman: 4,
		can_copy_in_full: true,
	},
];
