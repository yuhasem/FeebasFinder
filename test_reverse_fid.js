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

function testFindAllMatches() {
	// The previous tests should (mostly) robustly cover edge cases.  These
	// cases are all from real examples and may not cover all edge cases.
	// TODO: some bounds on the number of seeds returned?  Obviously if it
	// returns all seeds then there's 100% recall but 0% precision.
	var cases = [
		// {
			// from the Sapphire POC TAS
			// tid: 54716,
			// matchInfo: new MatchInfo("SKILL", "DATE", "", "", undefined, false),
			// actualSeed: 0x8550,
		// },
		// {
			// It doesn't find anything...
			// tid: 54815,
			// matchInfo: new MatchInfo("MISTAKE", "CLASS", "SIMPLE", "LIFE", undefined, true),
			// 0x143E, 0x1810, 0x1442, 0x1829; 5182, 6160, 5186, 6185
			// actualSeed: 0x860F,  // 34319
		// },
		// potentially valid 894 offset 44
// potentially valid 15091 offset 29
// potentially valid 15396 offset 42
// potentially valid 16482 offset 35
// potentially valid 19327 offset 18
// potentially valid 20972 offset 8
// potentially valid 23970 offset 9
// potentially valid 28574 offset 36
// potentially valid 30208 offset 19
// potentially valid 30443 offset 22
// potentially valid 31069 offset 32
// potentially valid 31690 offset 41
// potentially valid 34756 offset 25
// potentially valid 35541 offset 34
// potentially valid 37349 offset 16
// potentially valid 38170 offset 23
// potentially valid 42856 offset 13
// potentially valid 45622 offset 27
// potentially valid 47170 offset 8
// potentially valid 48812 offset 43
// potentially valid 48888 offset 11
// potentially valid 52473 offset 33
// potentially valid 54394 offset 39
// potentially valid 57820 offset 42
// potentially valid 58251 offset 39
// potentially valid 59664 offset 45
// potentially valid 62428 offset 28
// potentially valid 62954 offset 26
// potentially valid 65318 offset 35
// Of these, 4 can match trendy word 1: 20443, 45622, 48812, 57820
// And here are the ones that can match trendy word 2: 28574, 48812, 57820, 59664
// So the interesect: 48812, 57820 is where I should start searching.
// 48812 I never see a matching 2nd trendy phrase.
// 57820 I immediately see the 2nd trendy phrase and the Feebas seed in the correct places.
// Great, so this is the actual seed, but I don't know why my generator didn't match reality.
// This is the tough part :)
// Possibly a bug in the comparator? Needs more digging.
// How would it alter the comparator without altering the seed?
// By modifying rng before the start of the comparator being generated, leading to the same
//   end of rng but with a different result.
// This 7546 that's sticking in front is 0x1D7A
// 0b0001'1101'0111'1010
//   -^ not set
//     --------^ rand[0x1E, 0x80)
//              ^  ? whatever was there before | RNG, so the fact that it's 1 now means it will always be 1 on hardware.
//                ------^ rand[0x0, 0x80)
// Huh.  0b111'1010 should be the first comparison, and if it's smaller it gets swapped down.
// So the fact that this is so large makes it weird that it end up in first.
// But there's no way I have this straight up backward right?  There are too many other non-
// failures for that to be the case...
// What are the other numbers...
// 0x1D7A = 0b0001'1101'0111'1010
// 0x3564 = 0b0011'0101'0110'0100
// 0x1862 = 0b0001'1000'0110'0010
// 0x0FDF = 0b0000'1111'1101'1111
// 0x331F = 0b0011'0011'0001'1111
//
// 0x6375 = 0b0110'0011'0111'0101
// 0x27E5 = 0b0010'0111'1110'0101 (10213) off by one from not being first... inject=6
// 0x27F9 = 0b0010'0111'1111'1001 (10233) also off by one from being first... inject=16
// It is backward!?!?!
// Hang on let me look at a real example...
// 0x6CAF = 0b0110'1100'1010'1111
// 0x182C = 0b0001'1000'0010'1100
// 0x64AA = 0b0110'0100'1010'1010
// 0x1FAA = 0b0001'1111'1010'1010
// 0x11A1 = 0b0001'0001'1010'0001
// The highest are first, I do have that correct.
// Inject of -1 or 45 don't catch it either
// Inject 32 looks like a promising path.
// It generates a comparator of 134389 which puts it in the first slot
// But also changes the trendy phrase and FID.
// Inject 34-41 not quite there... +43
// Hang on, don't I want the 2nd trendy phrase to be in slot 0?
// 2 potential off by one errors on inject 5 and 15, we should explore these more in depth.
// inject 5 destroys the trendy phrase, 15 does not.
// What would it take for inject 6 to not destroy hte phrase and pass the sort?
		// {
			// Of course when I record everything works first try.
			// tid: 13901,
			// matchInfo: new MatchInfo("BUSY", "PARTY", "WELL", "HEROINE", undefined, true),
			// actualSeed: 0x24AA,
		// },
		// {
			// tid: 15838,
			// matchInfo: new MatchInfo("LATE", "MAGAZINE", "MUCH", "LOOK", undefined, true),
			// actualSeed: 0x6E0D,
		// },
		// {
			// tid: 4168,
			// matchInfo: new MatchInfo("NOTHING", "SHOPPING", "BIG", "BIKE", undefined, true),
			// actualSeed: 0x6884,
		// },
		// {
			// tid: 7213,
			// matchInfo: new MatchInfo("SECRET", "GROUP", "GOING", "LOOK", undefined, true),
			// actualSeed: 0xCE6A,
		// },
		// {
			// tid: 4469,
			// matchInfo: new MatchInfo("EXPENSIVE", "MUSIC", "LATE", "TEST", undefined, true),
			// actualSeed: 0x53EF,
		// },
		{
			tid: 63617,
			matchInfo: new MatchInfo("WELL", "HOBBY", "", "", undefined, false, true, "R"),
			actualSeed: 0xC39C,
		},
		{
			tid: 43620,
			matchInfo: new MatchInfo("MOMENTUM", "ALLOWANCE", "", "", undefined, false, true, "R"),
			actualSeed: 0x854A,
		},
		{
			tid: 41633,
			matchInfo: new MatchInfo("BUSY", "KINDERGARTEN", "", "", undefined, false, true, "R"),
			actualSeed: 0xADF0,
		},
	];
	for (var c of cases) {
		var got = findAllMatches(c.tid, c.matchInfo)
		if (!got.has(c.actualSeed)) {
			console.log("findAllMatches(" + c.tid + ", " + c.matchInfo + ") = " + got + ", wanted it to contain " + c.actualSeed);
		}
	}
}