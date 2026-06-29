---
title: Pokemon Generation I (Red, Green, Blue)
domain: games
tags: [pokemon, game-boy, game-freak, glitches, speedrun, arbitrary-code-execution, kanto]
vocab:
  - { term: MissingNo., def: "A glitch Pokemon that appears from undefined data and, on capture or encounter, adds 128 to the sixth bag item." }
  - { term: Mew Glitch, def: "A method to obtain Mew in retail Red and Blue by exploiting the Trainer-Fly glitch without an official event." }
  - { term: Link Cable, def: "The physical cable joining two Game Boys so players can trade and battle Pokemon." }
  - { term: Game Freak, def: "The studio that developed the Generation I Pokemon games, founded by Satoshi Tajiri." }
  - { term: Satoshi Tajiri, def: "Game Freak founder who conceived Pokemon out of childhood insect collecting." }
  - { term: Kanto, def: "The region where Generation I is set, home to its 151 Pokemon and eight Gyms." }
  - { term: Pokedex, def: "The in-game catalog of Pokemon that the player fills by seeing and catching each species." }
  - { term: Arbitrary Code Execution, def: "Forcing the game to run player-controlled bytes as program code, used to rewrite the game state." }
  - { term: Version Exclusive, def: "A Pokemon catchable in only one version of a paired release, pushing players to trade." }
  - { term: RNG Manipulation, def: "Steering the game's pseudorandom state to force a desired outcome on demand." }
related: [gamecube, zelda-speedruns]
source: "Bulbapedia, Wikipedia, Glitch City Wiki, Pokemon Speedruns wiki; verified June 2026"
links:
  - { title: "Bulbapedia: Kanto", url: "https://bulbapedia.bulbagarden.net/wiki/Kanto", kind: map }
  - { title: "Serebii Pokearth: Kanto", url: "https://www.serebii.net/pokearth/kanto/", kind: map }
  - { title: "Glitch City Wiki: MissingNo.", url: "https://glitchcity.wiki/wiki/MissingNo.", kind: wiki }
  - { title: "Glitch City Wiki: item duplication", url: "https://glitchcity.wiki/wiki/Item_duplication_glitch", kind: guide }
  - { title: "Nintendo UK: Pokemon Red", url: "https://www.nintendo.com/en-gb/Games/Game-Boy/Pokemon-Red-Version-266110.html", kind: manual }
---

# Pokemon Generation I (Red, Green, Blue)

## Release and origins

Pokemon began as Pocket Monsters Red and Green, released in Japan for the Game Boy on February 27, 1996. The games were developed by Game Freak and published by Nintendo. A third version, Blue, followed on October 15, 1996, first as a mail-order edition for subscribers of CoroCoro Comic. Blue carried revised art, script, and code; that revised build is what Nintendo localized for the wider world. Outside Japan the pairing shipped as Red and Blue, reaching North America in 1998 and Europe in 1999.

The original Japanese release nearly happened earlier. Development was finished by late 1995 and a December launch was planned, then pushed to February 1996 because tie-in products were not ready. The franchise that grew from those carts became the Game Boy's best-selling property; Red, Blue, and Yellow together sold more than 46 million copies. The Game Boy itself had launched in 1989, by then aging hardware, which makes the scale of the success more striking.

## Satoshi Tajiri and the trading idea

Satoshi Tajiri founded Game Freak and drove the project. The concept grew from his childhood habit of collecting insects in the fields around his home; as those fields gave way to development, he imagined a game that let children gather creatures the way he once gathered bugs. He pitched the idea to Nintendo in 1990 and met skepticism. Shigeru Miyamoto saw the potential and backed it, and the work stretched across roughly six years, with breaks for other projects.

The trading mechanic came from a specific frustration. Playing Dragon Quest II, Tajiri wanted a rare item that Ken Sugimori had a spare of, and found the Famicom offered no way to pass it across. When the Game Boy arrived with its link cable, he saw the fit at once. The two default rival names, Satoshi and Shigeru, point back at Tajiri and Miyamoto.

## The 151 and the Kanto region

Generation I is set in Kanto, a region modeled loosely on the real Kanto area of Japan. The player starts in Pallet Town, picks one of three starters, and works across the map collecting eight Gym Badges before challenging the Elite Four to become Champion. Running alongside that path is the Pokedex, the catalog the player fills by encountering and catching each species.

There are 151 Pokemon in this generation, from Bulbasaur at number 1 to Mew at 151. A small team designed them; Ken Sugimori led the art with fewer than ten people, and Atsuko Nishida drew Pikachu and several starters. Mew sits apart from the rest. Its trademark was filed in 1990, years before the games shipped, and Tajiri later said he kept Mew hidden inside the cartridge on purpose to seed rumor and keep interest alive. That single hidden creature shaped much of the lore that followed.

## Trading as core design

You cannot complete the Pokedex alone. This is built into the design at two layers. First, the paired versions hold different wild Pokemon: a species exclusive to Red is absent from Blue, and the reverse, so two players with opposite versions must trade to fill both dexes. Sandshrew is one version's catch and Ekans the other's, as one example among many.

Second, four Pokemon evolve only through trading and through no other means in Generation I. Kadabra becomes Alakazam, Machoke becomes Machamp, Graveler becomes Golem, and Haunter becomes Gengar, each transforming the instant it arrives in the other game over the link cable. A solo player can raise a Machoke forever and never see Machamp without a second Game Boy and a friend. The cable is not a bonus feature here. It is the spine of the whole catalog.

## MissingNo. and item duplication

The Generation I battle code reserves 256 internal slots but defines only 151 Pokemon. The leftover slots hold glitch creatures, the most famous of which is MissingNo., short for Missing Number. Players reach it through the Old Man trick: watch the old man's catching tutorial in Viridian City, fly to Cinnabar Island, then surf along the east coast. The coastline tile has no encounter table, so the game reuses leftover data from the tutorial, and the player's name letters decide which glitch Pokemon appears.

Encountering or catching MissingNo. usually adds 128 to the quantity of the sixth item in the bag. Tossing the stack down to 127 and repeating yields a full stack of 255. The duplication made the trick a fixture in 1990s strategy guides, even as Nintendo warned it could corrupt save data. The corruption risk is real but uneven; the Hall of Fame display reliably glitches, while harder crashes depend on which variant is encountered. Some forms, such as the Ghost and fossil MissingNo., duplicate items without the freezing seen elsewhere.

## The Mew glitch

Mew was meant to be obtainable only through official distribution events. The Mew glitch is the documented way to get it on a retail cartridge without one. It works by exploiting the Trainer-Fly glitch, which leaves a trainer's battle data hanging when the player escapes a sightline at the right moment, then triggers a fresh encounter whose species is read from the leftover special stat. By controlling which trainer and which intervening encounter set that value, a player can force a wild level-7 Mew to appear.

The procedure is precise and easy to spoil, and accounts of the exact step order vary in their framing across sources, so the safe summary is the mechanism rather than a keystroke list. There is a later wrinkle for transfers. A Mew caught this way generally cannot move forward through Poke Transporter on the 3DS Virtual Console unless its original trainer and ID match the distributed Mew's, a check that arbitrary code execution can sidestep by editing those fields.

## Arbitrary code execution and speedruns

Generation I has become a celebrated speedrun and glitch-exploitation game, in large part because its quirks let runners reprogram the cartridge mid-run. The chain starts with the 255-item stack from item duplication. Glitch items such as 8F, obtained through further setup, jump the program counter into RAM rather than ROM. The bytes it lands on are player-controllable: party data, bag contents, box names, Pokemon nicknames. Runners spell out a short jump there, then a longer payload elsewhere, and effectively write new code into a running game.

Arbitrary code execution is powerful enough that the fastest Any% runs use it to warp straight to the credits, while categories like Glitchless and the 151-Pokemon run ban it outright to preserve a real challenge. ACE is not itself a single leaderboard category; it is a technique used across some and forbidden in others. Related practices like RNG manipulation, steering the pseudorandom state to force encounters or outcomes, sit in the same toolbox. A 2013 tool-assisted run that exposed an item underflow is often credited with opening the modern era of these exploits.
