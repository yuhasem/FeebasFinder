function testRng() {
	var cases = [
		{
			// general case.
			seed: 0x0,
			steps: 1,
			want: 0x6073,
			topWant: 0x0,
		},
		{
			// many steps.
			seed: 0x0,
			steps: 31,
			want: 0x639E7441,
			topWant: 0x639E,
		},
		{
			// multiply overflow
			seed: 0xFFFFFFFF,
			steps: 1,
			want: 0xBE3A1206,
			topWant: 0xBE3A,
		},
	];
	for (var c of cases) {
		var got = advanceRng(c.seed, c.steps)
		if (got != c.want) {
			console.log("advanceRng(" + c.seed + ", " + c.steps + ") = " + got + ", want " + c.want);
		}
		var topGot = rngTop(got)
		if (topGot != c.topWant) {
			console.log("rngTop(" + got + ") = " + topGot + ", want " + c.topWant);
		}
	}
}

function testGetTrendyWord() {
	cases = [
		{
			seed: 0x0,
			list: 0xA,
			wantSeed: 0x6073,
			wantWord: 0x1400,
		},
		{
			seed: 0xFFFF,
			list: 0xC,
			wantSeed: 0xCA71206,
			wantWord: 0x182C,
		},
		{
			seed: 0xDEADBEEF,
			list: 0xD,
			wantSeed: 0x1C017E36,
			wantWord: 0x1A29,
		},
	];
	for (var c of cases) {
		var got = getTrendyWord(c.seed, c.list);
		if (got.seed != c.wantSeed){
			console.log("getTrendyWord seed (" + c.seed + ", " + c.list + ") = " + got.seed + ", want " + c.wantSeed);
		}
		if (got.word != c.wantWord){
			console.log("getTrendyWord seed (" + c.seed + ", " + c.list + ") = " + got.word + ", want " + c.wantWord);
		}
	}
}

function testGetComparator() {
	var cases = [
		{
			seed: 0x0,
			inject: 0,
			wantSeed: 0x31B0DDE4,
			wantComparator: 0x20AA,
		},
		{
			seed: 0x0,
			inject: 4,
			wantSeed: 0x31B0DDE4,
			wantComparator: 0x20AA,
		},
		{
			seed: 0x0,
			inject: 5,
			wantSeed: 0x8E425287,
			wantComparator: 0x366C,
		},
		{
			seed: 0x0,
			inject: 7,
			wantSeed: 0x8E425287,
			wantComparator: 0x20B4,
		},
	];
	for (var c of cases) {
		var got = getComparator(c.seed, c.inject);
		if (got.seed != c.wantSeed){
			console.log("getComparator seed (" + c.seed + ", " + c.inject + ") = " + got.seed + ", want " + c.wantSeed);
		}
		if (got.comparator != c.wantComparator){
			console.log("getTrendyWord seed (" + c.seed + ", " + c.inject + ") = " + got.comparator + ", want " + c.wantComparator);
		}
	}
}

function testGenerateCandidate() {
	cases = [
		{
			seed: 0x0,
			inject: 0,
			wantSeed: 0x67DBB608,
			wantComparator: 0x2548,
			wantFeebas: 0x67DB,
			wantWord1: 0x1414,
			wantWord2: 0x181E,
		},
		{
			seed: 0x0,
			inject: -1,
			wantSeed: 0x67DBB608,
			wantComparator: 0x2548,
			wantFeebas: 0x67DB,
			wantWord1: 0x1400,
			wantWord2: 0x1A2D,
		},
		{
			seed: 0x0,
			inject: 1,
			wantSeed: 0x67DBB608,
			wantComparator: 0x2548,
			wantFeebas: 0x67DB,
			wantWord1: 0x1400,
			wantWord2: 0x181E,
		},
		{
			seed: 0x0,
			inject: 2,
			wantSeed: 0x67DBB608,
			wantComparator: 0x2548,
			wantFeebas: 0x67DB,
			wantWord1: 0x1400,
			wantWord2: 0x1A1E,
		},
		{
			seed: 0x0,
			inject: 3,
			wantSeed: 0x67DBB608,
			wantComparator: 0x2548,
			wantFeebas: 0x67DB,
			wantWord1: 0x1400,
			wantWord2: 0x1A2D,
		},
		{
			seed: 0x0,
			inject: 8,
			wantSeed: 0xFC3351DB,
			wantComparator: 0x2548,
			wantFeebas: 0xFC33,
			wantWord1: 0x1400,
			wantWord2: 0x1A2D,
		},
	];
	for (var c of cases) {
		var got = generateCandidate(c.seed, c.inject);
		if (got.seed != c.wantSeed){
			console.log("generateCandidate(" + c.seed + ", " + c.inject + ") seed = " + got.seed + ", want " + c.wantSeed)
		}
		if (got.candidate.comparator != c.wantComparator) {
			console.log("generateCandidate(" + c.seed + ", " + c.inject + ") comparator = " + got.candidate.comparator + ", want " + c.wantComparator)
		}
		if (got.candidate.seed != c.wantFeebas) {
			console.log("generateCandidate(" + c.seed + ", " + c.inject + ") FID = " + got.candidate.seed + ", want " + c.wantFeebas)
			
		}
		if (got.candidate.trendyWord1 != c.wantWord1) {
			console.log("generateCandidate(" + c.seed + ", " + c.inject + ") trendy 1 = " + got.candidate.trendyWord1 + ", want " + c.wantWord1)
			
		}
		if (got.candidate.trendyWord2 != c.wantWord2) {
			console.log("generateCandidate(" + c.seed + ", " + c.inject + ") trendy 2 = " + got.candidate.trendyWord2 + ", want " + c.wantWord2)
			
		}
	}
}