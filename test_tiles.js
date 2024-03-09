cases = [
	{
		// general case
		seed: 0x8550,
		want: new Set([76, 374, 44, 135, 94, 238]),
	},
	{
		// test boundary condition 0 == 447
		seed: 0x0,
		want: new Set([447, 149, 291, 351, 369, 78]),
	},
	{
		// test boundary condition 4
		seed: 0x3,
		want: new Set([4, 402, 84, 403, 197, 151]),
	},
	{
		// test duplicates
		seed: 0x91D,
		want: new Set([437, 395, 64, 157]),
	},
	{
		// test 1-3 get skipped
		seed: 0xA0,
		want: new Set([257, 294, 204, 102, 47, 293]),
	},
];

function printSet(set){
	s = "["
	for (var e of set) {
		s += e + ", "
	}
	s += "]"
	return s
}

function setEquals(a, b) {
	for (var i of a) {
		if (!b.has(i)) {
			return false;
		}
	}
	for (var i of b) {
		if (!a.has(i)) {
			return false;
		}
	}
	return true;
}

function testTiles() {
	for (i in cases) {
		c = cases[i];
		var got = getTilesFromSeed(c.seed)
		if (!setEquals(got, c.want)) {
			console.log("getTilesFromSeed(" + c.seed + ") = " + printSet(got) + ", want " + printSet(c.want));
		}
	}
}