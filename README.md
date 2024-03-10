# FeebasFinder

A tool to find which tiles you can get Feebas from

[Click here to go the tool](https://yuhasem.github.io/FeebasFinder/)

Note that this is still a work in progress, and there are known inputs that
will not produce the correct results.  If you find one, file a bug report with
as much information as you can (what those inputs were, and ideally a tile that
did have Feebas, and bonus points if you recorded inputs so the exact RNG
during the opening of the game can be replayed).  This should work on hardware,
but has not been tested for it yet.

It generally takes about 1-2 minutes to complete the search.  This can be
reduced when the battery is dry, and there is a plan to make that part of the
configuration.

## How does it work?

At the start of the game, just after the character shrinking animation, the
game sets Trainer ID (TID), Secret ID (SID), the Feebas seed (FID), and the
Trendy Phrase.

TID and SID are straight forward.  They are copied directly from 2 back to back
RNG calls.

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

Taking into account a dry battery will limit the starting RNG seeds for each
TID, and there is a plan to make that part of the configuration.

## The nitty-gritty technical details

TODO