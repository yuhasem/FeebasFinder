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

// Unsigned 32-bit integer multiplication.  Because god forbid a dynamically
// typed language ever makes this easy.
function mult32(a, b) {
	// Step 1, coerce a and b to unsigend 32 bit integers.
	// This ensures the top bits are set and interpreted correctly.
	a = a>>>0;
	b = b>>>0;
	// Step 2, extract 16-bit pieces of a and b.  If we try to multiply a and
	// b as is, JS will coerce back to a floating point Number to fit the
	// bigger value and end up dropping information in the lower bits.
	var c = (a & 0xFFFF0000) >> 16;
	var d = a & 0xFFFF;
	var e = (b & 0xFFFF0000) >> 16;
	var f = b & 0xFFFF;
	// Step 3, multiply the smaller bits together.  They're now small enough
	// that the intermediate results now fit in 32 bits so JS doesn't lose
	// information even if tries to coerce back to Number.
	// Remember grade school long multiplication?
	//       c   d
	// *     e   f
	// -----------
	//     c*f d*f
	// c*e e*d   0
	// -----------
	// c*f+e*d d*f
	// We can drop c*e because all of it's info is outside the 32-bt bound.
	var g = (c*f + d*e) & 0xFFFF;
	var h = d*f;
	return (g << 16) + h;
}

// Every step of RNG works as seed = 0x41C64E6D * seed + 0x6073
// These lists are precomputing what happens when you repeat this multiple
// times.  The entry at index i is what happens when it's repeated 2^i times.
// This makes computing many frames in advance more efficient.
const multiply = [
 0x41C64E6D, 0xC2A29A69, 0xEE067F11, 0xCFDDDF21,
 0x5F748241, 0x8B2E1481, 0x76006901, 0x1711D201,
 0xBE67A401, 0xDDDF4801, 0x3FFE9001, 0x90FD2001,
 0x65FA4001, 0xDBF48001, 0xF7E90001, 0xEFD20001,
 0xDFA40001, 0xBF480001, 0x7E900001, 0xFD200001,
 0xFA400001, 0xF4800001, 0xE9000001, 0xD2000001,
 0xA4000001, 0x48000001, 0x90000001, 0x20000001,
 0x40000001, 0x80000001, 0x00000001, 0x00000001];

const add = [
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
			seed = (mult32(seed, multiply[i]) + add[i]) & 0xFFFFFFFF;
		}
		steps >>= 1;
		i++;
		if (i >= 32) {
			break
		}
	}
	// Cast to uint32
	return seed >>> 0;
}

// Useful helper function because the game only uses the top 16 bits of RNG.
function rngTop(value) { return value >>> 16; }

// The game generates a random number up to a maximum size, determined by
// indexing this list.  Only the relevant numbers for FID generation are
// populated.
// These are the lengths of the list of words you can select in dialogues.
// As it turns out the generated Trendy Phrase is always one word from set
// 10 (Conditions) and one word from either set 12 or 13 (Lifestyle and
// Hobbies).
var MAX_NUMBERS = [0,0,0,0,0,0,0,0,0,0,0x45,0,0x2D,0x36];

function getTrendyWord(seed, list) {
	var max = MAX_NUMBERS[list];
	seed = advanceRng(seed, 1);
	// console.log("trendy word with list " + list + " and seed " + seed.toString(16));
	var index = rngTop(seed) % max;
	// console.log("index " + index);
	var word = ((list & 0x7F) << 9) | (index & 0x1FF);
	return {'seed': seed, 'word': word};
}

function getComparator(seed, injectVBlank) {
	var comparator = 0x40;
	
	// This one bit gets its own RNG call, no idea why.
	seed = advanceRng(seed, 1);
	if ((rngTop(seed) & 1) == 0) {
		comparator = 0;
	}
	// console.log("starting comparator " + comparator);
	
	if (injectVBlank == 4) { seed = advanceRng(seed, 1); }
	// The game is generating a random number of random numbers using random numbers.
	// The VBlank injection is what makes this actually random.
	seed = advanceRng(seed, 1);
	// console.log(seed.toString(16));
	if (rngTop(seed) % 0x62 > 0x32) {
		// console.log("continue");
		if (injectVBlank == 5) { seed = advanceRng(seed, 1); }
		seed = advanceRng(seed, 1);
		// console.log(seed.toString(16));
		if (rngTop(seed) % 0x62 > 0x50) {
			// console.log("continue");
			if (injectVBlank == 6) { seed = advanceRng(seed, 1); }
			seed = advanceRng(seed, 1);
			// console.log(seed.toString(16));
		}
	}
	var rand = (rngTop(seed) % 0x62);
	// console.log("final rand " + rand.toString(16));
	var topRand = rand + 0x1E;
	// Technically the game also does `& 0x7F` to topRand, but this is guranteed
	// equivalent for our purposes.
	comparator |= topRand << 7;
	
	if (injectVBlank == 7) { seed = advanceRng(seed, 1); }
	seed = advanceRng(seed, 1);
	// Now the game uses the previous random number to set the maximum value for
	// this next random number.
	var bottomRand = rngTop(seed) % (rand + 1); // The game uses a different remainder function here, is there an edge case I missed?
	bottomRand += 0x1E;
	// console.log("bottom rand " + bottomRand.toString(16));
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
	if (injectVBlank == 0) { seed = advanceRng(seed, 1)>>>0; }
	trendyWord1 = getTrendyWord(seed, 0xA);
	seed = trendyWord1.seed;
	
	if (injectVBlank == 1) { seed = advanceRng(seed, 1)>>>0; }
	seed = advanceRng(seed, 1)>>>0;
	// console.log(rngTop(seed).toString(16));
	nextList = ((rngTop(seed) & 1) == 0) ? 0xD : 0xC;
	// console.log("picked random list " + nextList);
	
	if (injectVBlank == 2) { seed = advanceRng(seed, 1)>>>0; }
	trendyWord2 = getTrendyWord(seed, nextList);
	seed = trendyWord2.seed;
	
	if (injectVBlank == 3) { seed = advanceRng(seed, 1)>>>0; }
	comparator = getComparator(seed, injectVBlank);
	seed = comparator.seed;
	
	if (injectVBlank == 8) { seed = advanceRng(seed, 1)>>>0; }
	seed = advanceRng(seed, 1)>>>0;
	feebas = rngTop(seed);
	
	return {'seed': seed, 'candidate': new Candidate(comparator.comparator, feebas, trendyWord1.word, trendyWord2.word)};
}