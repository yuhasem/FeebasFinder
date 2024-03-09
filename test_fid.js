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