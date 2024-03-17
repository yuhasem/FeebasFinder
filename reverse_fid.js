const CONDITIONS = ['HOT','EXISTS','EXCESS','APPROVED','HAS','GOOD','LESS','MOMENTUM','GOING','WEIRD','BUSY','TOGETHER','FULL','ABSENT','BEING','NEED','TASTY','SKILLED','NOISY','BIG','LATE','CLOSE','DOCILE','AMUSING','ENTERTAINING','PERFECTION','PRETTY','HEALTHY','EXCELLENT','UPSIDE DOWN','COLD','REFRESHING','UNAVOIDABLE','MUCH','OVERWHELMING','FABULOUS','ELSE','EXPENSIVE','CORRECT','IMPOSSIBLE','SMALL','DIFFERENT','TIRED','SKILL','TOP','NON STOP','PREPOSTEROUS','NONE','NOTHING','NATURAL','BECOMES','LUKEWARM','FAST','LOW','AWFUL','ALONE','BORED','SECRET','MYSTERY','LACKS','BEST','LOUSY','MISTAKE','KIND','WELL','WEAKENED','SIMPLE','SEEMS','BADLY'];
const LIFESTYLE = ['CHORES','HOME','MONEY','ALLOWANCE','BATH','CONVERSATION','SCHOOL','COMMEMORATE','HABIT','GROUP','WORD','STORE','SERVICE','WORK','SYSTEM','TRAIN','CLASS','LESSONS','INFORMATION','LIVING','TEACHER','TOURNAMENT','LETTER','EVENT','DIGITAL','TEST','DEPT STORE','TELEVISION','PHONE','ITEM','NAME','NEWS','POPULAR','PARTY','STUDY','MACHINE','MAIL','MESSAGE','PROMISE','DREAM','KINDERGARTEN','LIFE','RADIO','RENTAL','WORLD'];
const HOBBIES = ['IDOL','ANIME','SONG','MOVIE','SWEETS','CHAT','CHILD\'S PLAY','TOYS','MUSIC','CARDS','SHOPPING','CAMERA','VIEWING','SPECTATOR','GOURMET','GAME','RPG','COLLECTION','COMPLETE','MAGAZINE','WALK','BIKE','HOBBY','SPORTS','SOFTWARE','SONGS','DIET','TREASURE','TRAVEL','DANCE','CHANNEL','MAKING','FISHING','DATE','DESIGN','LOCOMOTIVE','PLUSH DOLL','PC','FLOWERS','HERO','NAP','HEROINE','FASHION','ADVENTURE','BOARD','BALL','BOOK','FESTIVAL','COMICS','HOLIDAY','PLANS','TRENDY','VACATION','LOOK'];


function MatchInfo(firstWord, secondWord, extraFirstWord, extraSecondWord,
  lottoNumber, extraWordFirstDay) {
	extraFirstWord = extraFirstWord || "";
	extraSecondWord = extraSecondWord || "";
	lottoNumber = lottoNumber || -1;
	
	firstWord = firstWord.toUpperCase();
	secondWord = secondWord.toUpperCase();
	extraFirstWord = extraFirstWord.toUpperCase();
	extraSecondWord = extraSecondWord.toUpperCase();

	this.firstIndex = CONDITIONS.indexOf(firstWord);
	if (LIFESTYLE.indexOf(secondWord) >= 0) {
		this.secondList = 0;
		this.secondIndex = LIFESTYLE.indexOf(secondWord);
	} else {
		this.secondList = 1;
		this.secondIndex = HOBBIES.indexOf(secondWord);
	}

	this.hasExtraPhrase = extraFirstWord && extraSecondWord;
	this.extraFirstIndex = CONDITIONS.indexOf(extraFirstWord);
	if (LIFESTYLE.indexOf(extraSecondWord) >= 0) {
		this.extraSecondList = 0;
		this.extraSecondIndex = LIFESTYLE.indexOf(extraSecondWord);
	} else {
		this.extraSecondList = 1;
		this.extraSecondIndex = HOBBIES.indexOf(extraSecondWord);
	}
	
	this.lottoNumber = lottoNumber;
	this.endSeed = 0;
	this.extraWordFirstDay = extraWordFirstDay;
}

function candidateMatches(candidate, index1, list2, index2) {
	if ((candidate.trendyWord1 & 0x1FF) != index1) return false;
	if ((candidate.trendyWord2 >> 9) % 2 != list2) return false;
	if ((candidate.trendyWord2 & 0x1FF) != index2) return false;
	return true;
}

// matchInfo should have |hasExtraPhrase| and |extraWordFirstDay| both set to
// true.  Returns the Feebas Seed of the candidate which matches the given
// matchInfo or -1 if the given candidates list doesn't match.
function candidatesMatchTwoPhrasesOnKnownDay(candidates, matchInfo) {
	// console.log("checking");
	// console.log(candidates[0]);
	// The extra phrase must be in candidates[0].
	if (!candidateMatches(candidates[0], matchInfo.extraFirstIndex,
	  matchInfo.extraSecondList, matchInfo.extraSecondIndex)) {
		// console.log("no match " + matchInfo.extraFirstIndex + ", " + matchInfo.extraSecondIndex);
		return -1;
	}
	// And now we need to find the candidate with the primary phrase.
	for (var i = 0; i < candidates.length; i++) {
		// if (candidates[i].seed === 0x860F) {
			// console.log(candidates[i]);
		// }
		if (candidateMatches(candidates[i], matchInfo.firstIndex,
		  matchInfo.secondList, matchInfo.secondIndex)) {
			// console.log(candidates[i]);
			// console.log("match " + matchInfo.firstIndex + ", " + matchInfo.secondIndex);
			return candidates[i].seed;
		}
	}
	// We ignore lotto number when given an extra phrase.  Lotto numbers are
	// meaningless past the first day, and to have 2 phrases you must have a
	// multi-date file.
	// console.log("no match");
	return -1;
}

// Returns the Feebas Seed of the candidate which matches the given matchInfo,
// or -1 if the given candidates list doesn't match.
function candidatesMatch(candidates, matchInfo) {
	if (matchInfo.hasExtraPhrase) {
		// We treat the primary phrase as corresponding today, i.e. the FID
		// corresponding to that phrase is the one to use.
		if (matchInfo.extraWordFirstDay) {
			return candidatesMatchTwoPhrasesOnKnownDay(candidates, matchInfo);
		}
		// In this block we have an extra phrase given, but we don't know if it
		// was the phrase on the first day.  Find both phrases, and return the
		// FID of the primary phrase if both are found.
		extraPhraseFound = false;
		primaryFID = -1;
		for (var i = 0; i < candidates.length; i++) {
			if (candidateMatches(candidates[i], matchInfo.extraFirstIndex,
			  matchInfo.extraSecondList, matchInfo.extraSecondIndex)) {
				extraPhraseFound = true;
			}
			if (candidateMatches(candidates[i], matchInfo.firstIndex,
			  matchInfo.secondList, matchInfo.secondIndex)) {
				primaryFID = candidates[i].seed;
			}
		}
		return extraPhraseFound ? primaryFID : -1;
	}
	// In this block we only have one phrase and it must be first day.
	if (!candidateMatches(candidates[0], matchInfo.firstIndex,
	  matchInfo.secondList, matchInfo.secondIndex)) {
		return -1;
	}
	// Generate random numbers to see if this lotto number would be
	// generated nearby.
	// TODO: Figure out if there's a precise timing we can use to make this
	// more efficient.
	if (matchInfo.lottoNumber >= 0) {
		var count = 0;
		var seed = matchInfo.endSeed;
		while (rngTop(seed) != matchInfo.lottoNumber) {
			count++;
			if (count > 50) return -1;
			seed = advanceRng(seed, 1)>>>0;
		}
	}
	return candidates[0].seed;
}

var CANDIDATES_MEMO = {};

function memoKey(seed, inject) {
	if (inject < 0 || inject > 8) {
		inject = -1;
	}
	return `${seed},${inject}`;
}

// The given seed should be the RNG that the Trainer ID came from.
// Yields lists of candidates that can be generated from the given seed.
function* candidatesAt(seed) {
	// Advance 1 for SID, 1 for frame advance.
	seed = advanceRng(seed, 2)>>>0;
	
	// There are 45 possible places a VBlank RNG advancement could be injected.
	// Each yields a potentially different candidates list and we don't know
	// when this VBlank will happen.
	// TODO: find out if we can decrease the number of injects we do, or get
	// rid of duplicates early.
	for (var inject = 0; inject < 45; inject++) {
		// We maniplulate inject in each iteration, so we need a copy.
		var thisInject = inject;
		var trySeed = seed;
		candidates = [];
		// The game generates 5 Candidates and then sorts them.
		for (var i = 0; i < 5; i++) {
			var key = memoKey(trySeed, thisInject);
			var candidate;
			if (key in CANDIDATES_MEMO) {
				candidate = CANDIDATES_MEMO[key];
			} else {
				candidate = generateCandidate(trySeed, thisInject);
				CANDIDATES_MEMO[key] = candidate;
			}
			trySeed = candidate.seed;
			// if (candidate.seed === 0x860F) {
				// console.log(candidate);
			// }
			candidates.push(candidate.candidate);
			thisInject -= 9;
		}
		candidates.sort(compareCandidates);
		yield {'seed': trySeed, 'candidates': candidates};
	}
}

function findAllMatches(tid, matchInfo) {
	// For each of the 2^16 seeds that could have generated the TID, generate
	// the possible candidates for that seed, then collect fids that match
	// the information gathered above.
	// TODO: It should be possible to get a narrower set of starting seeds
	// if we know the game started in a reasonable time from power on with a
	// dry battery.  This should be offered as a feature to save compute time.
	var topTID = (tid << 16)>>>0;
	var matches = new Set();
	for (var i = 0; i < (1 << 16); i++) {
		// TODO: progress bar?
		// console.log(i);
		var seed = topTID + i;
		for (candidates of candidatesAt(seed)) {
			matchInfo.endSeed = candidates.seed;
			var fid = candidatesMatch(candidates.candidates, matchInfo);
			if (fid >= 0) {
				console.log("match from i " + i);
				console.log(candidates.candidates);
				matches.add(fid);
			}
		}
	}
	return matches
}

function findTiles(){
	var tidElement = document.getElementById("trainer-id");
	try {
		var tid = parseInt(tidElement.value);
	} catch (error) {
		console.log("Couldn't parse trainer ID");
		return;
	}
	if (tid < 0 || tid >= (1 << 16)) {
		// TODO: I need an element that can display a user friendly error
		// message back to the user.
		console.log("Not a valid trainer ID");
		return;
	}
	var trendyWordOneElement = document.getElementById("trendy-word1");
	var trendyWord1 = trendyWordOneElement.value;
	var trendyWordTwoElement = document.getElementById("trendy-word2");
	var trendyWord2 = trendyWordTwoElement.value;
	var trendyWordThreeElement = document.getElementById("trendy-word3");
	var trendyWord3 = trendyWordThreeElement.value;
	var trendyWordFourElement = document.getElementById("trendy-word4");
	var trendyWord4 = trendyWordFourElement.value;
	// TODO: I'd rather make these a drop down or have some other way to do the
	// validation outside of this.
	if (CONDITIONS.indexOf(trendyWord1.toUpperCase()) < 0) {
		console.log("Trendy Word 1 not in Conditions list");
		return;
	}
	if (LIFESTYLE.indexOf(trendyWord2.toUpperCase()) < 0 && HOBBIES.indexOf(trendyWord2.toUpperCase()) < 0) {
		console.log("Trendy Word 2 not in Lifestyle or Hobbies list");
		return;
	}
	if (trendyWord3 != "" && CONDITIONS.indexOf(trendyWord3.toUpperCase()) < 0) {
		console.log("Trendy Word 3 not in Conditions list");
		return;
	}
	if (trendyWord4 != "" && LIFESTYLE.indexOf(trendyWord4.toUpperCase()) < 0 && HOBBIES.indexOf(trendyWord4.toUpperCase()) < 0) {
		console.log("Trendy Word 4 not in Lifestyle or Hobbies list");
		return;
	}
	var extraPhraseIsFirstDay = document.getElementById("extra-first-day").checked;
	
	var matchInfo = new MatchInfo(trendyWord1, trendyWord2, trendyWord3, trendyWord4, 0, extraPhraseIsFirstDay, 0);
	
	matches = findAllMatches(tid, matchInfo);
	// TODO: Surface an error if there were no matches found.
	console.log(matches);
	
	// Find the tiles for the possible fids.
	var seedToTiles = {};
	var allTiles = new Set();
	for (var fid of matches) {
		var tiles = getTilesFromSeed(fid);
		seedToTiles[fid] = tiles;
		for (tile of tiles) {
			allTiles.add(tile);
		}
	}
	console.log(allTiles);
	
	// Display the tiles.
	showTiles(allTiles);
	
	// And write the list at the end, for easier debugging.
	writeTiles(seedToTiles);
}

function Row(start, row, column) {
	// `start` is the tile index at the start of this row.
	this.start = start;
	// `row` is the row on the map where this row starts.
	this.row = row;
	// `column` is the column on the map where this row starts.
	this.column = column;
}

const rows = [
	new Row(4, 2, 18),
	new Row(5, 3, 18),
	new Row(7, 4, 16),
	new Row(11, 5, 17),
	new Row(14, 6, 17),
	new Row(17, 7, 17),
	new Row(20, 8, 17),
	new Row(23, 13, 17),
	new Row(26, 14, 17),
	new Row(29, 15, 16),
	new Row(34, 16, 16),
	new Row(39, 19, 16),
	new Row(44, 20, 16),
	new Row(49, 21, 16),
	new Row(54, 22, 16),
	new Row(61, 23, 16),
	new Row(68, 24, 16),
	new Row(75, 25, 16),
	new Row(82, 26, 16),
	new Row(90, 27, 16),
	new Row(105, 28, 19),
	new Row(119, 29, 20),
	new Row(132, 30, 23),
	new Row(144, 31, 27),
	new Row(152, 32, 30),
	new Row(157, 33, 31),
	new Row(162, 34, 31),
	new Row(165, 35, 31),
	new Row(168, 36, 31),
	new Row(173, 37, 31),
	new Row(178, 38, 33),
	new Row(181, 39, 33),
	new Row(184, 40, 31),
	new Row(189, 41, 31),
	new Row(194, 42, 30),
	new Row(200, 43, 27),
	new Row(208, 44, 26),
	new Row(216, 45, 26),
	new Row(222, 46, 26),
	new Row(228, 47, 26),
	new Row(235, 48, 24),
	new Row(241, 49, 24),
	new Row(246, 50, 22),
	new Row(253, 51, 22),
	new Row(260, 52, 22),
	new Row(265, 53, 20),
	new Row(272, 54, 20),
	new Row(278, 55, 20),
	new Row(284, 56, 20),
	new Row(290, 57, 20),
	new Row(294, 58, 21),
	new Row(295, 59, 21),
	new Row(299, 82, 14),
	new Row(300, 83, 14),
	new Row(301, 84, 14),
	new Row(304, 84, 19),
	new Row(306, 84, 23),
	new Row(308, 85, 14),
	new Row(319, 86, 14),
	new Row(330, 87, 14),
	new Row(341, 88, 14),
	new Row(353, 89, 14),
	new Row(365, 90, 9),
	new Row(377, 90, 23),
	new Row(380, 91, 7),
	new Row(394, 91, 23),
	new Row(397, 92, 9),
	new Row(414, 93, 9),
	new Row(429, 94, 8),
	new Row(441, 95, 8),
	new Row(446, 96, 7),
];
const tileSize = 16;

function getCoordinatesForTile(tile) {
	currentRow = rows[0];
	for (row of rows) {
		if (row.start > tile) {
			break;
		}
		currentRow = row;
	}
	// x and y as the x and y axes in the html canvas
	var y = currentRow.row;
	var x = currentRow.column + (tile - currentRow.start);
	return {'x': x, 'y': y};
}

function showTiles(tiles) {
	const ctx = document.getElementById("canvas").getContext("2d");
	const img = new Image();
	img.src = "route.png";
	img.onload = () => {
		ctx.drawImage(img, 0, 0);
		for (tile of tiles) {
			// black outline with white fill.
			// TODO: maybe choose different colors for the different seeds?
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			var coord = getCoordinatesForTile(tile);
			var x = tileSize/2 + tileSize*coord.x;
			var y = tileSize/2 + tileSize*coord.y;
			ctx.arc(x, y, tileSize/2, 0, 2*Math.PI, true);
			ctx.fill();
		}
	}
}

function writeTiles(seedToTiles) {
	var listElement = document.getElementById("fid-list");
	// Clear anything that was there previously.
	listElement.innerHTML = "";
	for (seed in seedToTiles) {
		var line = document.createElement("li");
		var words = seed.toString(16) + ": ";
		for (tile of seedToTiles[seed]) {
			words += tile.toString() + ", ";
		}
		line.innerHTML = words;
		listElement.appendChild(line);
	}
}