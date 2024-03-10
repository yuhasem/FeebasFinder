function testMatchInfo() {
	cases = [
		{
			description: "general case",
			firstWord: "HOT",
			secondWord: "CHORES",
			extraFirstWord: "",
			extraSecondWord: "",
			wantFirstIndex: 0,
			wantSecondList: 0,
			wantSecondIndex: 0,
			wantExtraPhrase: "",
		},
		{
			description: "one word of extra phrase doesn't set hasExtraPhrase",
			firstWord: "HOT",
			secondWord: "CHORES",
			extraFirstWord: "EXISTS",
			extraSecondWord: "",
			wantFirstIndex: 0,
			wantSecondList: 0,
			wantSecondIndex: 0,
			wantExtraPhrase: "",
		},
		{
			description: "both words specified set hasExtraPhrase",
			firstWord: "HOT",
			secondWord: "CHORES",
			extraFirstWord: "EXISTS",
			extraSecondWord: "MONEY",
			wantFirstIndex: 0,
			wantSecondList: 0,
			wantSecondIndex: 0,
			wantExtraPhrase: "MONEY",
			wantExtraFirstIndex: 1,
			wantExtraSecondList: 0,
			wantExtraSecondIndex: 2,
		},
		{
			description: "words can be taken from the second list",
			firstWord: "HOT",
			secondWord: "ANIME",
			extraFirstWord: "",
			extraSecondWord: "",
			wantFirstIndex: 0,
			wantSecondList: 1,
			wantSecondIndex: 1,
			wantExtraPhrase: "",
		},
		{
			description: "words may be lowercase",
			firstWord: "hot",
			secondWord: "anime",
			extraFirstWord: "",
			extraSecondWord: "",
			wantFirstIndex: 0,
			wantSecondList: 1,
			wantSecondIndex: 1,
			wantExtraPhrase: "",
		},
		{
			description: "those pesky apostrophes don't break things",
			firstWord: "EXCESS",
			secondWord: "CHILD'S PLAY",
			extraFirstWord: "",
			extraSecondWord: "",
			wantFirstIndex: 2,
			wantSecondList: 1,
			wantSecondIndex: 6,
			wantExtraPhrase: "",
		},
		{
			description: "incorrect word specified",
			firstWord: "EXCESS",
			secondWord: "not_in_the_list",
			extraFirstWord: "",
			extraSecondWord: "",
			wantFirstIndex: 2,
			wantSecondList: 1,  // TODO: potential for a bug?
			wantSecondIndex: -1,
			wantExtraPhrase: "",
		},
	];
	for (var c of cases) {
		var got = new MatchInfo(c.firstWord, c.secondWord, c.extraFirstWord, c.extraSecondWord, undefined, false);
		if (got.firstIndex != c.wantFirstIndex) {
			console.log(c.description + " for MatchInfo got firstIndex " + got.firstIndex + ", want " + c.wantFirstIndex);
		}
		if (got.secondList != c.wantSecondList) {
			console.log(c.description + " for MatchInfo got secondList " + got.secondList + ", want " + c.wantSecondList);
		}
		if (got.secondIndex != c.wantSecondIndex) {
			console.log(c.description + " for MatchInfo got secondIndex " + got.secondIndex + ", want " + c.wantSecondIndex);
		}
		if (got.hasExtraPhrase != c.wantExtraPhrase) {
			console.log(c.description + " for MatchInfo got extraPhrase " + got.hasExtraPhrase + ", want " + c.wantExtraPhrase);
		} 
		if (got.hasExtraPhrase && c.wantExtraPhrase) {
			if (got.extraFirstIndex != c.wantExtraFirstIndex) {
			console.log(c.description + " for MatchInfo got extraFirstIndex " + got.extraFirstIndex + ", want " + c.wantExtraFirstIndex);
			}
			if (got.extraSecondList != c.wantExtraSecondList) {
			console.log(c.description + " for MatchInfo got extraSecondList " + got.extraSecondList + ", want " + c.wantExtraSecondList);
			}
			if (got.extraSecondIndex != c.wantExtraSecondIndex) {
			console.log(c.description + " for MatchInfo got extraSecondIndex " + got.extraSecondIndex + ", want " + c.wantExtraSecondIndex);
			}
		}
	}
}

function testCandidateMatches() {
	var cases = [
		{
			// matches
			candidate: new Candidate(0x0, 0x0, 0x1401, 0x1802),
			index1: 1,
			list2: 0,
			index2: 2,
			want: true,
		},
		{
			// different first word index
			candidate: new Candidate(0x0, 0x0, 0x1401, 0x1802),
			index1: 3,
			list2: 0,
			index2: 2,
			want: false,
		},
		{
			// different second list
			candidate: new Candidate(0x0, 0x0, 0x1401, 0x1802),
			index1: 1,
			list2: 1,
			index2: 2,
			want: false,
		},
		{
			// different second word index
			candidate: new Candidate(0x0, 0x0, 0x1401, 0x1802),
			index1: 1,
			list2: 0,
			index2: 4,
			want: false,
		},
	];
	for (var c of cases) {
		var got = candidateMatches(c.candidate, c.index1, c.list2, c.index2);
		if (got != c.want) {
			console.log("candidateMatches(" + c.candidate + ") = " + got + ", want " + want)
		}
	}
}

function testCandidatesMatch() {
	// Use a common candidates list for brevity.  This should also catch cases
	// where candidates are mutated (they should never be changed).
	var candidates = [
		new Candidate(0x0, 0x1, 0x1405, 0x180A),
		new Candidate(0x0, 0x2, 0x1406, 0x1A0A),
		new Candidate(0x0, 0x3, 0x1407, 0x180B),
		new Candidate(0x0, 0x4, 0x1408, 0x1A0B),
		new Candidate(0x0, 0x5, 0x1409, 0x180C),
	];
	var cases = [
		{
			description: "single phrase matches none",
			matchInfo: new MatchInfo("HOT", "TEACHER", "", "", undefined, false),
			want: -1,
		},
		{
			description: "single phrase matches first candidate",
			matchInfo: new MatchInfo("GOOD", "WORD", "", "", undefined, false),
			want: 0x1,
		},
		{
			description: "single phrase doesn't match candidate other than first",
			matchInfo: new MatchInfo("LESS", "SHOPPING", "", "", undefined, false),
			want: -1,
		},
		{
			description: "single phrase doesn't match on lotto number",
			matchInfo: new MatchInfo("GOOD", "WORD", "", "", 12345, false),
			want: -1,
		},
		{
			description: "single phrase matches candidate and lotto number",
			matchInfo: new MatchInfo("GOOD", "WORD", "", "", 0, false),
			want: 0x1,
		},
		{
			description: "dual phrase, unknown day, matches non-first and returns FID from phrase 1",
			matchInfo: new MatchInfo("LESS", "SHOPPING", "MOMENTUM", "STORE", undefined, false),
			want: 0x2,
		},
		{
			description: "dual phrase, unknown day, matches phrase 1 but not phrase 2",
			matchInfo: new MatchInfo("LESS", "SHOPPING", "HOT", "TEACHER", undefined, false),
			want: -1,
		},
		{
			description: "dual phrase, unknwon day, matches phrase 2 but not phrase 1",
			matchInfo: new MatchInfo("HOT", "TEACHER", "MOMENTUM", "STORE", undefined, false),
			want: -1,
		},
		{
			description: "dual phrase, first day, matches both and returns FID from phrase 1",
			matchInfo: new MatchInfo("LESS", "SHOPPING", "GOOD", "WORD", undefined, true),
			want: 0x2,
		},
		{
			description: "dual phrase, first day, doesn't match when phrase 2 is not in first solt",
			matchInfo: new MatchInfo("LESS", "SHOPPING", "MOMENTUM", "STORE", undefined, true),
			want: -1,
		},
	];
	for (var c of cases) {
		var got = candidatesMatch(candidates, c.matchInfo)
		if (got != c.want) {
			console.log(c.description + ": candidatesMatch(...) = " + got + ", want " + c.want)
		}
	}
}