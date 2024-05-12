# FeebasFinder

A tool to find which tiles you can get Feebas from in Ruby/Sapphire/Emerald.

[Click here to go the tool](https://yuhasem.github.io/FeebasFinder/)

Note that there may still be bugs.  If you find one, file a bug report with
as much information as you can (what the inputs were, and ideally a tile that
did have Feebas, and bonus points if you recorded inputs so the exact RNG
during the opening of the game can be replayed).  This should work on hardware,
but has not been tested for it yet.

For Ruby and Sapphire with a dry battery, results should be returned quickly
unless you played the start of the game very slow.

When using wet battery or where dry battery had to fall back because it
couldn't match your starting RNG seed, results will take 1-2 minutes to return.
With no second phrase, there will also be 60 or more Feebas seeds which might
narrow down only half the river.  Some seeds are more likely than others, and
they are displayed in a green color so you can target them first.

## How does it work?

### Ruby/Sapphire

At the start of the game, just after the character shrinking animation, the
game sets Trainer ID (TID), Secret ID (SID), the Feebas seed (FID), and the
Trendy Phrase.

TID and SID are straight forward.  They are copied directly from 2 back to back
RNG calls.

### Emerald

TID is set set just after naming your character, and RNG is set to the TID as
well.  Just after the character shrinking animation, the game sets SID and
Feebas Seed (FID).

### FID

FID and Trendy phrase are set the same way for Ruby, Sapphire, and Emerald.

To set FID and Trendy Phrase, the game first generates 5 pairs of FID and
Trendy Phrases, coupled with an extra 16 bits of "comparator" data.

The 5 "candidates" are sorted according to the comparator, and the FID and
Trendy Phrase ins the first slot are used in the game.

When a save file is loaded after a day has changed, the comparators are reset
and the list is resorted.  I don't fully understand this routine yet, and it
does not result in a perfect 20% chance for each candidate to be the primary
candidate on any given day.

Because RNG advances in a predictable manner, knowing the TID and Trendy Phrase
allows us to find which FID is possible to be generated.  Note that Because
there are 65536 starting RNG seeds which will yield the same TID, and there are
6831 possible Trendy Phrases, only providing 1 Trendy Phrase will find multiple
possible FIDs.

Taking into account a dry battery limits the potential RNG seeds that can
generate the TID.  This speeds up the search and returns more precise results,
at the expense that you can no longer see a second trendy phrase to narrow
reults even further.

## The nitty-gritty technical details

TODO