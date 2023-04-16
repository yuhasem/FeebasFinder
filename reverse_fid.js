var CONDITIONS = ['HOT','EXISTS','EXCESS','APPROVED','HAS','GOOD','LESS','MOMENTUM','GOING','WEIRD','BUSY','TOGETHER','FULL','ABSENT','BEING','NEED','TASTY','SKILLED','NOISY','BIG','LATE','CLOSE','DOCILE','AMUSING','ENTERTAINING','PERFECTION','PRETTY','HEALTHY','EXCELLENT','UPSIDE DOWN','COLD','REFRESHING','UNAVOIDABLE','MUCH','OVERWHELMING','FABULOUS','ELSE','EXPENSIVE','CORRECT','IMPOSSIBLE','SMALL','DIFFERENT','TIRED','SKILL','TOP','NON STOP','PREPOSTEROUS','NONE','NOTHING','NATURAL','BECOMES','LUKEWARM','FAST','LOW','AWFUL','ALONE','BORED','SECRET','MYSTERY','LACKS','BEST','LOUSY','MISTAKE','KIND','WELL','WEAKENED','SIMPLE','SEEMS','BADLY'];
var LIFESTYLE = ['CHORES','HOME','MONEY','ALLOWANCE','BATH','CONVERSATION','SCHOOL','COMMEMORATE','HABIT','GROUP','WORD','STORE','SERVICE','WORK','SYSTEM','TRAIN','CLASS','LESSONS','INFORMATION','LIVING','TEACHER','TOURNAMENT','LETTER','EVENT','DIGITAL','TEST','DEPT STORE','TELEVISION','PHONE','ITEM','NAME','NEWS','POPULAR','PARTY','STUDY','MACHINE','MAIL','MESSAGE','PROMISE','DREAM','KINDERGARTEN','LIFE','RADIO','RENTAL','WORLD'];
var HOBBIES = ['IDOL','ANIME','SONG','MOVIE','SWEETS','CHAT','CHILD\'S PLAY','TOYS','MUSIC','CARDS','SHOPPING','CAMERA','VIEWING','SPECTATOR','GOURMET','GAME','RPG','COLLECTION','COMPLETE','MAGAZINE','WALK','BIKE','HOBBY','SPORTS','SOFTWARE','SONGS','DIET','TREASURE','TRAVEL','DANCE','CHANNEL','MAKING','FISHING','DATE','DESIGN','LOCOMOTIVE','PLUSH DOLL','PC','FLOWERS','HERO','NAP','HEROINE','FASHION','ADVENTURE','BOARD','BALL','BOOK','FESTIVAL','COMICS','HOLIDAY','PLANS','TRENDY','VACATION','LOOK'];


function MatchInfo(firstWord, secondWord, extraFirstWord, extraSecondWord,
 lottoNumber, extraWordFirstDay, endSeed) {
	this.firstIndex = CONDITIONS.indexOf(firstWord.toUpperCase());
	if (LIFESTYLE.indexOf(secondWord) >= 0) {
		this.secondList = 0;
		this.secondIndex = LIFESTYLE.indexOf(secondWord.toUpperCase());
	} else {
		this.secondList = 1;
		this.secondIndex = HOBBIES.indexOf(secondWord.toUpperCase());
	}

	this.hasExtraWord = extraFirstWord || extraSecondWord;
	this.extraFirstIndex = CONDITIONS.indexOf(extraFirstWord.toUpperCase());
	if (LIFESTYLE.indexOf(extraSecondWord) >= 0) {
		this.extraSecondList = 0;
		this.extraSecondIndex = LIFESTYLE.indexOf(extraSecondWord.toUpperCase());
	} else {
		this.extraSecondList = 1;
		this.extraSecondIndex = HOBBIES.indexOf(extraSecondWord.toUpperCase());
	}
	
	this.lottoNumber = lottoNumber;
	this.endSeed = endSeed;
	this.extraWordFirstDay = extraWordFirstDay;
}

function candidateMatches(candidate, index1, list2, index2) {
	if (candidate.trendyWord1 & 0x1FF != index1) return false;
	if ((candidate.trendyWord2 >> 9) % 2 != list2) return false;
	if (candidate.trendyWord2 & 0x1FF != index2) return false;
	return true;
}

// Returns the Feebas Seed of the candidate which matches the given matchInfo,
// or -1 if the given candidates list doesn't match.
function candidatesMatch(candidates, matchInfo) {
	if (matchInfo.hasExtraWord) {
		// We treat the primary phrase as corresponding today, i.e. the FID
		// corresponding to that phrase is the one to use.
		if (matchInfo.extraWordFirstDay) {
			// Then the extra phrase must be in candidates[0].
			if (!candidateMatches(candidates[0], matchInfo.extraFirstIndex,
			  matchInfo.extraSecondList, matchInfo.extraSecondList) {
				return -1;
			}
			// And now we need to find the candidate with the primary phrase.
			for (var i = 0; i < candidates.length; i++) {
				if candidateMatches(candidates[i], matchInfo.firstIndex,
				  matchInfo.secondList, matchInfo.secondIndex) {
					return candidates[i].seed;
				}
			}
			// We ignore lotto number when given an extra phrase.  Lotto numbers
			// are meaningless past the first day, and to have 2 phrases you
			// must have a multi-day file.
			return -1;
		}
		// In this block we have an extra phrase given, but we don't know if it
		// was the phrase on the first day.  Find both phrases, and return the
		// FID of the primary phrase if both are found.
		extraPhraseFound = false;
		primaryFID = -1;
		for (var i = 0; i < candidates.length; i++) {
			if (candidateMatches(candidates[i], matchInfo.extraFirstIndex,
			  matchInfo.extraSecondList, matchInfo.extraSecondIndex) {
				extraPhraseFound = true;
			}
			if (candidateMatches(candidates[i], matchInfo.firstIndex,
			  matchInfo.secondList, matchInfo.secondIndex) {
				primaryFID = candidates[i].seed;
			}
		}
		return extraPhraseFound ? primaryFID : -1;
	}
	// In this block we only have one phrase and it must be first day.
	if (!candidateMatches(candidates[0], matchInfo.firstIndex,
	  matchInfo.secondList, matchInfo.secondIndex) {
		return -1;
	}
	// Generate random numbers to see if this lotto number would be
	// generated nearby.
	// TODO: Figure out if there's a precise timing we can use to make this
	// more efficient.
	if (matchInfo.lottoNumber >= 0) {
		var count = 0;
		var seed = matchInfo.endSeed;
		while (topRng(seed) != matchInfo.lottoNumber) {
			count++;
			if (count > 50) return -1;
			seed = advanceRng(seed, 1);
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
function candidatesAt(seed) {
	// Advance 1 for SID, one for frame advance.
	seed = advanceRng(seed, 2);
	
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
				trySeed = candidate.seed;
			} else {
				candidate = generateCandidate(trySeed, thisInject);
				CANDIDATES_MEMO[key] = candidate;
				trySeed = candidate.seed;
			}
			candidates.push(candidate.candidate);
			thisInject -= 9;
		}
		candidates.sort(compareCandidates);
		yield {'seed': trySeed, 'candidates': candidates};
	}
}