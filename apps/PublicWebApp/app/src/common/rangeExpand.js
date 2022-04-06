import romanToArabic from "../common/romanToArabic";
function rangeExpand(rangeExpr, page_offset_roman = 0, page_offset_arabic = 0, pageCount = 0) {
	function getFactors(term, max_non_arabic, max_roman, max_arabic) {
		var matches = term.match(/(-?[0-9mdclxvi\[\]]+)-(-?[0-9mdclxvi\[\]]+)$/i);
		if (!matches) {
			let first = term;
			if (term.match(/^\[[0-9]*]$/)) {
				first = term.replace(/[\[\]]+/g, "");
				if (first > max_non_arabic) {
					first = 0;
				}
			} else if (term.match(/^[m,d,c,l,x,v,i]/i)) {
				let arabicValue = romanToArabic(term);
				first = arabicValue;
				if (first > max_roman) {
					first = 0;
				}
			} else {
				if (first > max_arabic) {
					first = 0;
				}
			}
			return {
				first: Number(first) > 0 ? Number(first) : 0,
			};
		} else if (matches && matches.length > 0) {
			let first = matches[1];
			let last = matches[2];

			let first_pattern = 2;
			let last_pattern = 2;

			if (first.match(/^\[[0-9]*]$/)) {
				first = first.replace(/[\[\]]+/g, "");
				first_pattern = 0;
				if (first > max_non_arabic) {
					first = 0;
				}
			} else if (first.match(/^[m,d,c,l,x,v,i]+$/i)) {
				first = romanToArabic(first);
				first_pattern = 1;
				if (first > max_roman) {
					first = 0;
				}
			} else {
				if (first > max_arabic) {
					first = 0;
				}
			}

			if (last.match(/^\[[0-9]*]$/)) {
				last = last.replace(/[\[\]]+/g, "");
				last_pattern = 0;
				if (last > max_non_arabic) {
					last = 0;
				}
			} else if (last.match(/^[m,d,c,l,x,v,i]+$/i)) {
				last = romanToArabic(last);
				last_pattern = 1;
				if (last > max_roman) {
					last = 0;
				}
			} else {
				if (last > max_arabic) {
					last = 0;
				}
			}

			return {
				first: Number(first) > 0 ? Number(first) : 0,
				last: Number(last) > 0 ? Number(last) : 0,
				isValid: first_pattern < last_pattern ? true : false,
			};
		} else {
			return {
				first: Number(term) > 0 ? Number(term) : 0,
			};
		}
	}

	function expandTerm(term, max_non_arabic, max_roman, max_arabic) {
		var factors = getFactors(term, max_non_arabic, max_roman, max_arabic);
		if (factors.length < 2) {
			return [factors.first];
		}
		var range = [];
		if (factors.last) {
			if (factors.first >= factors.last && !factors.isValid) {
				range.push(0);
			} else {
				for (var n = factors.first; n <= factors.last; n++) {
					range.push(n);
				}
			}
		} else {
			if (factors.last === 0) {
				range.push(0);
			} else {
				range.push(factors.first);
			}
		}
		return range;
	}

	var result = [];
	var terms = rangeExpr.split(/,/);
	var max_non_arabic = page_offset_roman;
	var max_roman = page_offset_arabic - page_offset_roman;
	var max_arabic = pageCount - page_offset_arabic;
	for (var t in terms) {
		result = result.concat(expandTerm(terms[t], max_non_arabic, max_roman, max_arabic));
	}
	return result;
}

export { rangeExpand };
