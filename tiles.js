const UNFISHABLE = new Set([105,119,132,144,296,297,298]);

// This uses a different addend than the game's normal RNG function.
function tileRng(seed) {
	return ((0x41C64E6D * seed + 0x3039)>>>0) & 0xFFFFFFFF;
}

function getTilesFromSeed(seed) {
	// I'm using a set here, because I don't want to deal with removing
	// duplicates later.
	var tiles = new Set();
	var i = 0;
	// The game will generate 6 tiles, but they can be duplicate or
	// unfishable.
	while (i < 6) {
		seed = tileRng(seed);
		var tile = ((seed >> 16) & 0xFFFF) % 0x1BF;
		if (tile == 0) {
			tile = 447;
		}
		// If the tile is 1, 2, or 3, the game generates a new tile
		// instead of using it.
		if (tile >= 4) {
			i++;
			tiles.add(tile);
		}
	}
	return tiles;
}