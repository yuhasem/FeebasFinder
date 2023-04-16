function Candidate(comparator, seed, trendyWord1, trendyWord2) {
	this.comparator = comparator;
	this.seed = seed;
	this.trendyWord1 = trendyWord1;
	this.trendyWord2 = trendyWord2;
}

Candidate.prototype.logString = function () {
	return `seed: ${this.seed.toString(16)}, with comparator ${this.comparator.toString(16)}`;
}

Candidate.prototype.debugString = function () {
	return `${this.comparator.toString(16)},${this.seed.toString(16)},${this.trendyWord1.toString(16)},${this.trendyWord2.toString(16)}`;
}

// compareFn to be used when sorting an array of Candidates
function compareCandidates(a, b) {
	if (a.comparator & 0x3F == b.comparator & 0x3F) {
		return (b.comparator >> 7) - (a.comparator >> 7); 
	}
	return (b.comparator & 0x3F) - (a.comparator & 0x3F);
}

// Every step of RNG works as seed = 0x41C64E6D * seed + 0x6073
// These lists are precomputing what happens when you repeat this multiple
// times.  The entry at index i is what happens when it's repeated 2^i times.
// This makes computing many frames in advance more efficient.
var multiply = [
 0x41C64E6D, 0xC2A29A69, 0xEE067F11, 0xCFDDDF21,
 0x5F748241, 0x8B2E1481, 0x76006901, 0x1711D201,
 0xBE67A401, 0xDDDF4801, 0x3FFE9001, 0x90FD2001,
 0x65FA4001, 0xDBF48001, 0xF7E90001, 0xEFD20001,
 0xDFA40001, 0xBF480001, 0x7E900001, 0xFD200001,
 0xFA400001, 0xF4800001, 0xE9000001, 0xD2000001,
 0xA4000001, 0x48000001, 0x90000001, 0x20000001,
 0x40000001, 0x80000001, 0x00000001, 0x00000001];

var add = [
 0x00006073, 0xE97E7B6A, 0x31B0DDE4, 0x67DBB608,
 0xCBA72510, 0x1D29AE20, 0xBA84EC40, 0x79F01880,
 0x08793100, 0x6B566200, 0x803CC400, 0xA6B98800,
 0xE6731000, 0x30E62000, 0xF1CC4000, 0x23988000,
 0x47310000, 0x8E620000, 0x1CC40000, 0x39880000,
 0x73100000, 0xE6200000, 0xCC400000, 0x98800000,
 0x31000000, 0x62000000, 0xC4000000, 0x88000000,
 0x10000000, 0x20000000, 0x40000000, 0x80000000];

function advanceRng(seed, steps) {
	var i = 0;
	while (steps > 0) {
		if (steps % 2 == 1) {
			seed = (seed * multiply[i] + add [i]) & 0xFFFFFFFF;
		}
		steps >>= 1
		i += 1
		if (i >= 32) {
			break
		}
	}
	return seed;
}

// Useful helper function because the game only uses the top 16 bits of RNG.
function rngTop(value) { return value >> 16; }

// The game generates a random number up to a maximum size, determined by
// indexing this list.  Only the relevant numbers for FID generation are
// populated.
var MAX_NUMBERS = [0,0,0,0,0,0,0,0,0,0,0x45,0,0x2D,0x36];

function getTrendyWord(seed, list) {
	var max = MAX_NUMBERS[list];
	seed = advanceRng(seed, 1);
	var index = rngTop(seed) % max;
	var word = ((list & 0x7F) << 9) | (index & 0x1FF);
	return {'seed': seed, 'word': word};
}

function getComparator(seed, injectVBlank) {
	var comparator = 0x0000;
	
	// This one bit gets its own RNG call, no idea why.
	seed = advanceRng(seed, 1);
	if (rngTop(seed) % 2 == 0) {
		comparator = 0x0040;
	}
	
	if (injectVBlank == 4) { seed = advanceRng(seed, 1); }
	// The game is generating a random number of random numbers using random numbers.
	// The VBlank injection is what makes this actually random.
	seed = advanceRng(seed, 1):
	if (rngTop(seed) % 0x62 > 0x32) {
		if (injectVBlank == 5) { seed = advanceRng(seed, 1); }
		seed = advanceRng(seed, 1);
		if (rngTop(seed) % 0x62 > 0x50) {
			if (injectVBlank == 6) { seed = advanceRng(seed, 1); }
			seed = advanceRng(seed, 1);
		}
	}
	var rand = (rngTop(seed) % 0x62);
	var topRand = rand + 0x1E;
	// Technically the game also does `& 0x7F` to topRand, but this is guranteed
	// equivalent for out purposes.
	comparator |= topRand << 7;
	
	if (injectVBlank == 7) { seed = advanceRng(seed, 1); }
	seed = advanceRng(seed, 1);
	// Now the game uses the previous random number to set the maximum value for
	// this next random number.
	var bottomRand = rngTop(seed) % (rand + 1);
	bottomRand += 0x1E;
	// Again, the game does a `& 0x7F` to bottomRand, and again it's unnecessary.
	comparator |= bottomRand;

	return {'seed': seed, 'comparator': comparator};
}

// Generates a Candidate given the starting RNG seed.  Injects an extra RNG
// advancement at the index given by injectVBlank.
//
// Any injectVBlank can be given, but only values 0 through 8 inclusive will
// have an effect.
//
// See https://github.com/yuhasem/poc_utils/blob/master/tas/notes.md for an
// explanation of why the RNG injection is necessary to get accurate results.
// TODO: make a more accessible write up of this.
function generateCandidate(seed, injectVBlank) {
	injectVBlank = injectVBlank || -1;
	
	if (injectVBlank == 0) { seed = advanceRng(seed, 1); }
	trendyWord1 = getTrendyWord(seed, 0xA);
	seed = trendyWord1.seed;
	
	if (injectVBlank == 1) { seed = advanceRng(seed, 1); }
	seed = rng.advanceRng(seed, 1);
	nextList = (seed % 2 == 0) ? 0xD : 0xC;
	
	if (injectVBlank == 2) { seed = advanceRng(seed, 1); }
	trendyWord2 = getTrendyWord(seed, nextList);
	seed = trendyWord2.seed;
	
	if (injectVBlank == 3) { seed = advanceRng(seed, 1); }
	comparator = getComparator(seed, injectVBlank);
	seed = comparator.seed;
	
	if (injectVBlank == 8) { seed = advanceRng(seed, 1); }
	seed = advanceRng(seed, 1)
	feebas = rngTop(seed);
	
	return {'seed': seed, 'candidate': Candidate(comparator.comparator, feebas, trendyWord1.word, trendyWord2.word);
}