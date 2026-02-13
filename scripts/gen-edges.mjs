import { readFileSync, writeFileSync } from 'fs';

const nodes = JSON.parse(readFileSync('public/data/nodes.json'));
const nodeMap = new Map(nodes.map(n => [n.id, n]));
const ids = new Set(nodes.map(n => n.id));

const edges = [];
const edgeKeys = new Set();

function add(s, t, rel, label, str) {
  if (!ids.has(s) || !ids.has(t) || s === t) return;
  const key = [s, t].sort().join('--');
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  edges.push({ source: s, target: t, relationship: rel, label, strength: str });
}

// Helper for director clusters
function directorCluster(films, name) {
  for (let i = 0; i < films.length; i++) {
    for (let j = i + 1; j < films.length; j++) {
      add(films[i], films[j], 'shared_director', `Both directed by ${name}`, 4);
    }
  }
}

// Helper for actor connections
function actorCluster(films, name) {
  for (let i = 0; i < films.length; i++) {
    for (let j = i + 1; j < films.length; j++) {
      add(films[i], films[j], 'shared_actor', `Both star ${name}`, 3);
    }
  }
}

// === DIRECTOR CLUSTERS ===
directorCluster(['inception', 'the-dark-knight', 'the-dark-knight-rises', 'batman-begins', 'interstellar', 'the-prestige', 'memento', 'oppenheimer'], 'Christopher Nolan');
directorCluster(['pulp-fiction', 'django-unchained', 'kill-bill-vol-1', 'inglourious-basterds', 'reservoir-dogs', 'once-upon-a-time-in-hollywood'], 'Quentin Tarantino');
directorCluster(['goodfellas', 'the-departed', 'the-wolf-of-wall-street', 'taxi-driver', 'raging-bull'], 'Martin Scorsese');
directorCluster(['jaws', 'jurassic-park', 'schindlers-list', 'et-the-extra-terrestrial', 'saving-private-ryan', 'raiders-of-the-lost-ark'], 'Steven Spielberg');
directorCluster(['fight-club', 'gone-girl', 'se7en', 'the-social-network', 'zodiac', 'mindhunter'], 'David Fincher');
directorCluster(['blade-runner-2049', 'dune', 'dune-part-two', 'prisoners', 'sicario'], 'Denis Villeneuve');
directorCluster(['the-grand-budapest-hotel', 'fantastic-mr-fox', 'isle-of-dogs'], 'Wes Anderson');

// === FRANCHISE CLUSTERS ===
// Batman trilogy
add('batman-begins', 'the-dark-knight', 'same_franchise', 'The Dark Knight Trilogy', 5);
add('the-dark-knight', 'the-dark-knight-rises', 'same_franchise', 'The Dark Knight Trilogy', 5);
add('batman-begins', 'the-dark-knight-rises', 'same_franchise', 'The Dark Knight Trilogy', 5);

// Dune
add('dune', 'dune-part-two', 'same_franchise', 'Dune series by Denis Villeneuve', 5);

// MCU
const mcu = ['iron-man', 'the-avengers', 'avengers-endgame', 'black-panther', 'doctor-strange'];
for (let i = 0; i < mcu.length; i++) {
  for (let j = i + 1; j < mcu.length; j++) {
    add(mcu[i], mcu[j], 'same_franchise', 'Marvel Cinematic Universe', 4);
  }
}
add('daredevil', 'the-avengers', 'same_franchise', 'Marvel Cinematic Universe', 3);
add('deadpool', 'the-avengers', 'same_franchise', 'Marvel Cinematic Universe', 3);

// Star Wars
add('star-wars', 'the-empire-strikes-back', 'same_franchise', 'Original Star Wars trilogy', 5);
add('star-wars', 'the-mandalorian', 'same_franchise', 'Star Wars universe', 4);
add('the-empire-strikes-back', 'the-mandalorian', 'same_franchise', 'Star Wars universe', 4);
add('star-wars-the-empire-strikes-back', 'star-wars', 'same_franchise', 'Original Star Wars trilogy', 5);

// LOTR
add('the-lord-of-the-rings-the-fellowship-of-the-ring', 'the-lord-of-the-rings-the-two-towers', 'same_franchise', 'Lord of the Rings trilogy', 5);
add('the-lord-of-the-rings-the-two-towers', 'the-lord-of-the-rings-the-return-of-the-king', 'same_franchise', 'Lord of the Rings trilogy', 5);
add('the-lord-of-the-rings-the-fellowship-of-the-ring', 'the-lord-of-the-rings-the-return-of-the-king', 'same_franchise', 'Lord of the Rings trilogy', 5);

// Breaking Bad
add('breaking-bad', 'better-call-saul', 'same_franchise', 'Breaking Bad universe by Vince Gilligan', 5);

// Godfather
add('the-godfather', 'the-godfather-part-ii', 'same_franchise', 'The Godfather saga', 5);

// Alien
add('alien', 'aliens', 'same_franchise', 'Alien franchise', 5);

// Terminator
add('the-terminator', 'terminator-2-judgment-day', 'same_franchise', 'Terminator franchise', 5);

// Blade Runner
add('blade-runner', 'blade-runner-2049', 'same_franchise', 'Blade Runner franchise', 5);

// Toy Story
add('toy-story', 'toy-story-3', 'same_franchise', 'Toy Story franchise', 5);

// Mad Max
add('mad-max', 'mad-max-fury-road', 'same_franchise', 'Mad Max franchise', 5);

// Rocky/Creed
add('rocky', 'creed', 'same_franchise', 'Rocky/Creed franchise', 5);

// The Witch
add('the-witch', 'the-witch-part-2', 'same_franchise', 'The Witch franchise', 5);

// Fargo
add('fargo', 'fargo-tv', 'same_franchise', 'TV adaptation of the Coen Brothers film', 5);

// === SHARED CREATOR (TV) ===
add('seinfeld', 'curb-your-enthusiasm', 'same_creator', 'Both created by Larry David', 5);
add('the-office', 'parks-and-recreation', 'same_creator', 'Both co-created by Greg Daniels and Michael Schur', 5);
add('parks-and-recreation', 'the-good-place', 'same_creator', 'Both created by Michael Schur', 5);
add('the-gilded-age', 'downton-abbey', 'same_creator', 'Both created by Julian Fellowes', 5);
add('twin-peaks', 'mulholland-drive', 'shared_director', 'Both by David Lynch', 5);
add('la-la-land', 'whiplash', 'shared_director', 'Both directed by Damien Chazelle', 5);
add('hunt-for-the-wilderpeople', 'jojo-rabbit', 'shared_director', 'Both directed by Taika Waititi', 5);
add('hot-fuzz', 'shaun-of-the-dead', 'shared_director', 'Both directed by Edgar Wright, with Simon Pegg and Nick Frost', 5);
add('a-clockwork-orange', 'the-shining', 'shared_director', 'Both directed by Stanley Kubrick', 5);
add('a-clockwork-orange', 'full-metal-jacket', 'shared_director', 'Both directed by Stanley Kubrick', 5);
add('full-metal-jacket', 'the-shining', 'shared_director', 'Both directed by Stanley Kubrick', 5);
add('rear-window', 'psycho', 'shared_director', 'Both directed by Alfred Hitchcock', 5);
add('the-big-lebowski', 'fargo', 'shared_director', 'Both directed by the Coen Brothers', 5);
add('no-country-for-old-men', 'fargo', 'shared_director', 'Both directed by the Coen Brothers', 5);
add('the-big-lebowski', 'no-country-for-old-men', 'shared_director', 'Both directed by the Coen Brothers', 5);
add('ferris-buellers-day-off', 'the-breakfast-club', 'shared_director', 'Both directed by John Hughes', 5);
add('get-out', 'nope', 'shared_director', 'Both directed by Jordan Peele', 5);
add('midsommar', 'hereditary', 'shared_director', 'Both directed by Ari Aster', 5);
add('aliens', 'the-terminator', 'shared_director', 'Both directed by James Cameron', 4);
add('aliens', 'terminator-2-judgment-day', 'shared_director', 'Both directed by James Cameron', 4);
add('aliens', 'avatar', 'shared_director', 'Both directed by James Cameron', 4);
add('aliens', 'titanic', 'shared_director', 'Both directed by James Cameron', 3);
add('avatar', 'titanic', 'shared_director', 'Both directed by James Cameron', 3);
add('blade-runner', 'alien', 'shared_director', 'Both directed by Ridley Scott', 4);
add('blade-runner', 'gladiator', 'shared_director', 'Both directed by Ridley Scott', 4);
add('alien', 'gladiator', 'shared_director', 'Both directed by Ridley Scott', 3);

// === ACTOR CLUSTERS ===
actorCluster(['inception', 'titanic', 'the-departed', 'the-wolf-of-wall-street', 'the-revenant', 'shutter-island'], 'Leonardo DiCaprio');
actorCluster(['forrest-gump', 'cast-away', 'the-green-mile'], 'Tom Hanks');
actorCluster(['fight-club', 'se7en', 'inglourious-basterds', 'once-upon-a-time-in-hollywood', 'moneyball'], 'Brad Pitt');
actorCluster(['pulp-fiction', 'the-avengers', 'django-unchained', 'the-incredibles'], 'Samuel L. Jackson');
actorCluster(['the-dark-knight', 'batman-begins', 'the-big-short', 'the-prestige'], 'Christian Bale');
actorCluster(['logan', 'the-prestige', 'x-men-days-of-future-past'], 'Hugh Jackman');
actorCluster(['good-will-hunting', 'the-departed', 'saving-private-ryan', 'interstellar'], 'Matt Damon');
actorCluster(['goodfellas', 'my-cousin-vinny', 'raging-bull'], 'Joe Pesci');
actorCluster(['goodfellas', 'taxi-driver', 'the-deer-hunter', 'raging-bull', 'the-godfather-part-ii'], 'Robert De Niro');

add('the-matrix', 'john-wick', 'shared_actor', 'Both star Keanu Reeves as an iconic action hero', 4);
add('the-shawshank-redemption', 'se7en', 'shared_actor', 'Both star Morgan Freeman', 3);
add('iron-man', 'oppenheimer', 'shared_actor', 'Both star Robert Downey Jr.', 3);
add('top-gun-maverick', 'mission-impossible', 'shared_actor', 'Both star Tom Cruise', 4);
add('scarface', 'the-godfather-part-ii', 'shared_actor', 'Both star Al Pacino in iconic gangster roles', 4);

// === COMPOSER ===
add('interstellar', 'inception', 'composer', 'Both scored by Hans Zimmer', 3);
add('the-dark-knight', 'interstellar', 'composer', 'Both scored by Hans Zimmer', 3);
add('gladiator', 'the-dark-knight', 'composer', 'Both scored by Hans Zimmer', 2);
add('star-wars', 'jurassic-park', 'composer', 'Both scored by John Williams', 3);
add('jaws', 'et-the-extra-terrestrial', 'composer', 'Both scored by John Williams', 3);
add('star-wars', 'raiders-of-the-lost-ark', 'composer', 'Both scored by John Williams', 3);
add('harry-potter-and-the-sorcerers-stone', 'star-wars', 'composer', 'Both scored by John Williams', 3);
add('the-lord-of-the-rings-the-fellowship-of-the-ring', 'pirates-of-the-caribbean-the-curse-of-the-black-pearl', 'composer', 'Both scored by Howard Shore / Hans Zimmer influence', 2);

// === GENRE/THEMATIC ===
// Crime
add('the-sopranos', 'the-wire', 'genre_thematic', 'Landmark HBO crime dramas that redefined television', 4);
add('the-sopranos', 'breaking-bad', 'genre_thematic', 'Both are prestige crime dramas about antiheroes', 4);
add('the-wire', 'breaking-bad', 'genre_thematic', 'Critically acclaimed crime dramas about the drug trade', 3);
add('breaking-bad', 'narcos', 'genre_thematic', 'Both chronicle the drug trade with intense character studies', 3);
add('the-sopranos', 'peaky-blinders', 'genre_thematic', 'Both follow charismatic crime family leaders', 3);
add('breaking-bad', 'dexter', 'genre_thematic', 'Both follow protagonists living double lives', 3);
add('the-sopranos', 'the-godfather', 'influence', 'The Sopranos reimagined gangster storytelling for TV', 4);
add('goodfellas', 'the-godfather', 'genre_thematic', 'Landmark Italian-American crime sagas', 4);
add('goodfellas', 'scarface', 'genre_thematic', 'Rise-and-fall crime epics', 3);
add('the-godfather', 'scarface', 'genre_thematic', 'Iconic crime epics about gangster empires', 4);

// Horror
add('get-out', 'hereditary', 'genre_thematic', 'Modern horror masterpieces that elevated the genre', 3);
add('the-exorcist', 'the-conjuring', 'genre_thematic', 'Supernatural horror about demonic possession', 3);
add('halloween', 'psycho', 'influence', 'Halloween was heavily influenced by Psycho', 4);
add('the-shining', 'the-exorcist', 'genre_thematic', 'Landmark 1970s-80s horror films', 3);
add('the-witch', 'hereditary', 'genre_thematic', 'Slow-burn folk horror about family disintegration', 4);
add('the-witch', 'midsommar', 'genre_thematic', 'Folk horror exploring ritualistic dread', 3);
add('the-conjuring', 'the-exorcist', 'influence', 'The Conjuring draws from The Exorcist tradition', 3);
add('hereditary', 'the-exorcist', 'genre_thematic', 'Demonic horror through family trauma', 3);
add('talk-to-me', 'hereditary', 'genre_thematic', 'Terrifying modern horror about supernatural forces', 3);
add('it', 'stranger-things', 'genre_thematic', 'Both feature young friends battling supernatural evil', 4);
add('halloween', 'stranger-things', 'influence', 'Stranger Things borrows from Halloween small-town horror aesthetic', 3);

// Sci-Fi
add('the-matrix', 'blade-runner', 'genre_thematic', 'Cyberpunk sci-fi exploring identity and reality', 4);
add('ex-machina', 'blade-runner', 'genre_thematic', 'Both explore what it means to be human through AI', 4);
add('ex-machina', 'her', 'genre_thematic', 'Both examine human-AI relationships and consciousness', 4);
add('interstellar', 'gravity', 'genre_thematic', 'Visually stunning space films about survival', 3);
add('westworld', 'blade-runner', 'genre_thematic', 'Both explore artificial consciousness and free will', 3);
add('westworld', 'ex-machina', 'genre_thematic', 'Both examine AI sentience and ethics', 4);
add('black-mirror', 'the-twilight-zone', 'influence', 'Black Mirror is a spiritual successor to The Twilight Zone', 4);
add('dark', 'stranger-things', 'genre_thematic', 'Sci-fi mystery series about missing children in small towns', 4);
add('severance', 'black-mirror', 'genre_thematic', 'Both explore dystopian workplace technology', 3);
add('mr-robot', 'fight-club', 'influence', 'Mr. Robot echoes Fight Club with unreliable narrator and anti-capitalism', 4);
add('the-expanse', 'blade-runner-2049', 'genre_thematic', 'Hard sci-fi with political intrigue', 3);
add('inception', 'the-matrix', 'genre_thematic', 'Mind-bending sci-fi exploring the nature of reality', 4);
add('the-truman-show', 'the-matrix', 'genre_thematic', 'Both explore characters discovering their reality is fabricated', 4);
add('children-of-men', 'blade-runner', 'genre_thematic', 'Dystopian sci-fi with stunning cinematography', 3);
add('children-of-men', 'the-handmaids-tale', 'genre_thematic', 'Dystopian futures where reproduction is central', 4);
add('the-thing', 'alien', 'genre_thematic', 'Claustrophobic sci-fi horror about a deadly alien presence', 4);
add('person-of-interest', 'mr-robot', 'genre_thematic', 'Both explore surveillance, AI, and technology ethics', 3);

// Comedy TV
add('seinfeld', 'friends', 'genre_thematic', 'Iconic 1990s NYC sitcoms', 4);
add('the-office', 'friends', 'genre_thematic', 'Beloved ensemble sitcoms', 3);
add('community', 'arrested-development', 'genre_thematic', 'Meta, self-referential comedies with cult followings', 3);
add('its-always-sunny-in-philadelphia', 'seinfeld', 'influence', 'Always Sunny follows Seinfeld tradition of horrible people', 3);
add('silicon-valley', 'the-office', 'genre_thematic', 'Workplace comedies satirizing corporate culture', 3);
add('veep', 'the-west-wing', 'genre_thematic', 'Political shows set in Washington DC', 3);
add('ted-lasso', 'schitts-creek', 'genre_thematic', 'Heartwarming comedies about finding community', 3);
add('fleabag', 'please-like-me', 'genre_thematic', 'Raw comedies with fourth-wall-breaking narration', 3);
add('atlanta', 'fleabag', 'genre_thematic', 'Auteur-driven, genre-defying comedy-dramas', 3);
add('south-park', 'the-simpsons', 'genre_thematic', 'Long-running animated satires of American culture', 4);
add('arrested-development', 'the-office', 'genre_thematic', 'Revolutionized TV comedy with single-camera styles', 3);
add('curb-your-enthusiasm', 'its-always-sunny-in-philadelphia', 'genre_thematic', 'Both feature self-centered characters creating chaos', 3);
add('how-i-met-your-mother', 'friends', 'genre_thematic', 'NYC sitcoms about friends navigating love and life', 4);
add('south-park', 'its-always-sunny-in-philadelphia', 'genre_thematic', 'Both push boundaries with offensive humor and social satire', 3);

// Period Drama
add('the-crown', 'downton-abbey', 'genre_thematic', 'British period dramas about upper-class life', 3);
add('the-crown', 'the-favourite', 'genre_thematic', 'Both dramatize British royalty with sharp wit', 3);
add('mad-men', 'the-crown', 'genre_thematic', 'Period dramas exploring power and social change', 3);
add('the-kings-speech', 'the-crown', 'genre_thematic', 'Both dramatize the British monarchy', 4);

// War
add('saving-private-ryan', 'schindlers-list', 'genre_thematic', 'Both WWII films directed by Spielberg', 4);
add('apocalypse-now', 'full-metal-jacket', 'genre_thematic', 'Harrowing Vietnam War films', 4);
add('apocalypse-now', 'platoon', 'genre_thematic', 'Both depict the madness of the Vietnam War', 4);
add('full-metal-jacket', 'platoon', 'genre_thematic', 'Unflinching Vietnam War films', 3);
add('saving-private-ryan', 'the-hurt-locker', 'genre_thematic', 'Both portray intense bonds and trauma of soldiers in combat', 3);
add('the-deer-hunter', 'apocalypse-now', 'genre_thematic', 'Haunting Vietnam War dramas about lost innocence', 4);
add('the-pianist', 'schindlers-list', 'genre_thematic', 'Devastating Holocaust dramas about survival', 4);
add('hotel-rwanda', 'schindlers-list', 'genre_thematic', 'Both portray individuals saving lives during genocide', 4);
add('braveheart', 'gladiator', 'genre_thematic', 'Epic historical action dramas about warriors fighting for freedom', 4);

// Thrillers
add('silence-of-the-lambs', 'se7en', 'genre_thematic', 'Dark psychological thrillers about hunting serial killers', 4);
add('silence-of-the-lambs', 'zodiac', 'genre_thematic', 'Procedural thrillers about hunting serial killers', 3);
add('psycho', 'silence-of-the-lambs', 'influence', 'Silence draws from Psycho tradition of psychological horror', 3);
add('the-usual-suspects', 'memento', 'genre_thematic', 'Twisty neo-noir thrillers with unreliable narratives', 3);
add('gone-girl', 'the-talented-mr-ripley', 'genre_thematic', 'Psychological thrillers about sociopaths hiding in plain sight', 3);
add('nightcrawler', 'joker', 'genre_thematic', 'Both feature unhinged loners exploiting broken systems', 3);
add('drive', 'nightcrawler', 'genre_thematic', 'Tense LA-set thrillers with enigmatic protagonists', 3);
add('prisoners', 'se7en', 'genre_thematic', 'Dark atmospheric thrillers about desperate investigations', 3);
add('shutter-island', 'the-sixth-sense', 'genre_thematic', 'Psychological thrillers with shocking twist endings', 3);
add('la-confidential', 'chinatown', 'genre_thematic', 'LA-set neo-noir crime classics', 4);
add('the-french-connection', 'chinatown', 'genre_thematic', 'Gritty 1970s crime thrillers', 3);

// Western
add('unforgiven', 'the-good-the-bad-and-the-ugly', 'genre_thematic', 'Landmark westerns that redefined the genre', 4);
add('django-unchained', 'the-good-the-bad-and-the-ugly', 'influence', 'Django is a love letter to Spaghetti Westerns', 4);
add('deadwood', 'unforgiven', 'genre_thematic', 'Revisionist westerns deconstructing frontier mythology', 4);
add('yellowstone', 'deadwood', 'genre_thematic', 'Both are westerns about land, power, and the American frontier', 3);

// Superhero
add('the-dark-knight', 'joker', 'genre_thematic', 'Both feature the Joker as a complex, terrifying villain', 4);
add('the-batman', 'the-dark-knight', 'genre_thematic', 'Both are gritty, noir-influenced Batman films', 4);
add('deadpool', 'the-boys', 'genre_thematic', 'R-rated, irreverent takes on the superhero genre', 3);
add('logan', 'the-dark-knight', 'genre_thematic', 'Mature superhero films that transcend the genre', 3);
add('spider-man-into-the-spider-verse', 'the-incredibles', 'genre_thematic', 'Inventive animated superhero films', 3);
add('the-incredibles', 'iron-man', 'genre_thematic', 'Both feature superheroes balancing family and heroism', 3);

// Animated
add('spirited-away', 'pan-s-labyrinth', 'genre_thematic', 'Both follow young girls entering dark fantasy worlds', 4);
add('spider-man-into-the-spider-verse', 'scott-pilgrim-vs-the-world', 'genre_thematic', 'Both use comic book visual language in groundbreaking ways', 3);
add('everything-everywhere-all-at-once', 'scott-pilgrim-vs-the-world', 'genre_thematic', 'Kinetic action-comedies inspired by video game aesthetics', 3);
add('spirited-away', 'coco', 'genre_thematic', 'Animated masterpieces about journeying through spirit worlds', 3);
add('frozen', 'coco', 'genre_thematic', 'Disney animated musicals about family bonds', 3);

// Pixar
const pixar = ['finding-nemo', 'inside-out', 'coco', 'toy-story', 'toy-story-3', 'up', 'wall-e', 'ratatouille', 'the-incredibles'];
for (let i = 0; i < pixar.length; i++) {
  for (let j = i + 1; j < pixar.length; j++) {
    add(pixar[i], pixar[j], 'shared_producer', 'Both Pixar Animation Studios films', 3);
  }
}

// TV Misc
add('lost', 'the-x-files', 'genre_thematic', 'Mystery-heavy sci-fi shows with complex mythologies', 3);
add('lost', 'stranger-things', 'genre_thematic', 'Ensemble mystery shows with supernatural elements', 3);
add('twin-peaks', 'the-x-files', 'genre_thematic', 'Eerie 1990s shows blending horror, mystery, and the paranormal', 4);
add('house-of-cards', 'succession', 'genre_thematic', 'Both follow ruthless power players manipulating for control', 3);
add('house-of-cards', 'the-west-wing', 'genre_thematic', 'Political dramas set in Washington DC', 3);
add('homeland', 'the-americans', 'genre_thematic', 'Tense spy thrillers about hidden identities', 4);
add('mr-robot', 'black-mirror', 'genre_thematic', 'Both explore the dark side of technology', 3);
add('true-detective', 'mindhunter', 'genre_thematic', 'Crime dramas about detectives hunting serial killers', 4);
add('the-last-of-us', 'the-walking-dead', 'genre_thematic', 'Post-apocalyptic survival dramas', 3);
add('chernobyl', 'the-americans', 'genre_thematic', 'Both portray Soviet-era secrets with gripping tension', 3);
add('succession', 'mad-men', 'genre_thematic', 'Prestige dramas about power in elite institutions', 3);
add('the-white-lotus', 'succession', 'genre_thematic', 'Both satirize the moral bankruptcy of the ultra-wealthy', 3);
add('yellowjackets', 'lost', 'genre_thematic', 'Both feature survivors grappling with extreme circumstances', 4);
add('severance', 'westworld', 'genre_thematic', 'Both explore consciousness, identity, and corporate control', 3);
add('you', 'dexter', 'genre_thematic', 'Both follow charming killers narrating their inner monologue', 4);
add('orange-is-the-new-black', 'oz', 'genre_thematic', 'Both are ensemble prison dramas', 4);
add('killing-eve', 'the-americans', 'genre_thematic', 'Cat-and-mouse spy thrillers with complex female leads', 3);
add('squid-game', 'the-hunger-games', 'genre_thematic', 'Deadly competitions that critique class inequality', 4);

// Comedy Films
add('superbad', 'napoleon-dynamite', 'genre_thematic', 'Quotable teen comedies about awkward outsiders', 3);
add('bridesmaids', 'mean-girls', 'genre_thematic', 'Smart female-led comedies with sharp ensemble casts', 3);
add('groundhog-day', 'edge-of-tomorrow', 'genre_thematic', 'Both feature protagonists trapped in repeating time loops', 4);
add('hot-fuzz', 'in-bruges', 'genre_thematic', 'Genre-savvy comedies set in quaint locales with dark twists', 3);
add('knives-out', 'the-grand-budapest-hotel', 'genre_thematic', 'Stylish, witty ensemble whodunits', 3);
add('jojo-rabbit', 'the-grand-budapest-hotel', 'genre_thematic', 'Whimsical comedies set during WWII', 3);
add('little-miss-sunshine', 'jojo-rabbit', 'genre_thematic', 'Quirky family comedies with heartfelt cores', 3);
add('the-princess-bride', 'the-goonies', 'genre_thematic', 'Beloved 1980s adventure films for all ages', 3);
add('la-la-land', 'grease', 'genre_thematic', 'Romantic musicals with iconic choreography', 3);
add('legally-blonde', 'mean-girls', 'genre_thematic', 'Iconic comedies about women in competitive social worlds', 3);
add('miss-congeniality', 'legally-blonde', 'genre_thematic', 'Both star strong women proving themselves', 3);
add('office-space', 'the-office', 'genre_thematic', 'Both satirize soul-crushing corporate workplace culture', 3);

// Bio/Drama Misc
add('the-social-network', 'moneyball', 'genre_thematic', 'Aaron Sorkin-penned dramas about innovators challenging systems', 3);
add('oppenheimer', 'the-social-network', 'genre_thematic', 'Biopics about brilliant men whose creations have consequences', 3);
add('a-beautiful-mind', 'the-social-network', 'genre_thematic', 'Both portray brilliant but troubled geniuses', 3);
add('jerry-maguire', 'moneyball', 'genre_thematic', 'Sports dramas about challenging industry conventions', 3);
add('the-queen-s-gambit', 'whiplash', 'genre_thematic', 'Both follow prodigies driven to obsessive mastery', 3);
add('uncut-gems', 'whiplash', 'genre_thematic', 'Intensely stressful films about obsessive personalities pushed to the edge', 3);
add('inside-llewyn-davis', 'whiplash', 'genre_thematic', 'Both portray the brutal toll of pursuing musical artistry', 4);

// Misc connections
add('american-beauty', 'fight-club', 'genre_thematic', 'Late-90s critiques of suburban American malaise', 4);
add('american-psycho', 'fight-club', 'genre_thematic', 'Dark satires of toxic masculinity and consumerism', 4);
add('trainspotting', 'fight-club', 'genre_thematic', 'Visually kinetic films about countercultural rebellion', 3);
add('city-of-god', 'scarface', 'genre_thematic', 'Visceral crime films about young men in violent worlds', 3);
add('parasite', 'get-out', 'genre_thematic', 'Genre-bending social commentaries disguised as thrillers', 4);
add('parasite', 'the-white-lotus', 'genre_thematic', 'Both satirize class dynamics with dark humor', 3);
add('network', 'the-social-network', 'genre_thematic', 'Prescient satires about media manipulation and power', 3);
add('mulholland-drive', 'eternal-sunshine-of-the-spotless-mind', 'genre_thematic', 'Surreal explorations of memory and identity', 3);
add('her', 'eternal-sunshine-of-the-spotless-mind', 'genre_thematic', 'Melancholy love stories about connection and loss', 4);
add('one-flew-over-the-cuckoos-nest', 'the-shawshank-redemption', 'genre_thematic', 'Institutional dramas about fighting for freedom', 4);
add('the-truman-show', 'her', 'genre_thematic', 'Both explore how technology mediates our experience of reality', 3);
add('rain-man', 'forrest-gump', 'genre_thematic', 'Heartfelt dramas about exceptional individuals', 3);
add('old-boy', 'parasite', 'genre_thematic', 'Korean thrillers with shocking twists', 3);
add('into-the-wild', 'the-revenant', 'genre_thematic', 'Both follow men alone in the wilderness', 3);
add('this-is-us', 'forrest-gump', 'genre_thematic', 'Sweeping family sagas spanning decades', 3);
add('the-pursuit-of-happyness', 'forrest-gump', 'genre_thematic', 'Inspirational stories about perseverance against the odds', 3);
add('justified', 'deadwood', 'genre_thematic', 'Modern westerns with sharp dialogue', 3);
add('penny-dreadful', 'buffy-the-vampire-slayer', 'genre_thematic', 'Genre shows about fighting supernatural evil', 3);
add('happy-gilmore', 'elf', 'genre_thematic', 'Beloved comedies with endlessly quotable performances', 2);
add('the-other-guys', 'rush-hour', 'genre_thematic', 'Buddy-cop action comedies', 3);
add('national-treasure', 'indiana-jones-and-the-raiders-of-the-lost-ark', 'genre_thematic', 'Adventure films about treasure hunters solving historical puzzles', 3);
add('pacific-rim', 'edge-of-tomorrow', 'genre_thematic', 'Sci-fi action about humanity battling alien invaders', 3);
add('gravity', 'alien', 'genre_thematic', 'Both feature a lone woman fighting for survival in space', 3);
add('nurse-jackie', 'house', 'genre_thematic', 'Medical dramas about brilliant but flawed professionals', 3);
add('law-and-order', 'the-wire', 'genre_thematic', 'Crime dramas examining the justice system', 2);
add('our-planet', 'the-grand-tour', 'genre_thematic', 'Visually stunning unscripted series', 2);
add('outlander', 'game-of-thrones', 'genre_thematic', 'Epic historical/fantasy dramas with political intrigue', 3);
add('raging-bull', 'rocky', 'genre_thematic', 'Landmark boxing films about fighters from rough backgrounds', 4);
add('shaun-of-the-dead', 'the-walking-dead', 'genre_thematic', 'Both explore zombie apocalypse scenarios', 3);
add('drive', 'john-wick', 'genre_thematic', 'Both feature skilled protagonists in LA criminal underworld', 3);
add('twister', 'jaws', 'genre_thematic', 'Thrilling blockbusters about humans confronting deadly natural forces', 3);
add('fargo-tv', 'true-detective', 'genre_thematic', 'Anthology crime series with literary ambitions', 3);
add('american-history-x', 'a-clockwork-orange', 'genre_thematic', 'Both explore violence, redemption, and societal dysfunction', 3);
add('the-talented-mr-ripley', 'american-psycho', 'genre_thematic', 'Both follow charming sociopaths hiding their true nature', 3);
add('roma', 'moonlight', 'genre_thematic', 'Intimate, lyrical character studies', 3);
add('squid-game', 'money-heist', 'genre_thematic', 'International thriller series about life-or-death stakes', 3);
add('harry-potter-and-the-sorcerers-stone', 'the-lord-of-the-rings-the-fellowship-of-the-ring', 'genre_thematic', 'Both launched massive fantasy franchises in 2001', 3);
add('harry-potter-and-the-sorcerers-stone', 'stranger-things', 'genre_thematic', 'Both feature young outcasts discovering supernatural powers', 3);
add('my-cousin-vinny', 'legally-blonde', 'genre_thematic', 'Comedies about fish-out-of-water characters succeeding in law', 3);
add('the-bear', 'uncut-gems', 'genre_thematic', 'Relentlessly stressful dramas about intense professionals', 3);
add('succession', 'the-wolf-of-wall-street', 'genre_thematic', 'Both satirize the moral bankruptcy of the ultra-wealthy', 3);
add('daredevil', 'the-batman', 'genre_thematic', 'Dark, street-level superhero stories focused on crime', 3);
add('logan', 'mad-max-fury-road', 'genre_thematic', 'Brutal, stripped-down action films about aging warriors', 3);
add('wonka', 'the-grand-budapest-hotel', 'genre_thematic', 'Whimsical, colorful films with eccentric protagonists', 2);
add('dungeons-and-dragons-honor-among-thieves', 'the-lord-of-the-rings-the-fellowship-of-the-ring', 'genre_thematic', 'Ensemble fantasy adventures drawing from classic RPG quests', 2);
add('nope', 'jaws', 'genre_thematic', 'Both use blockbuster spectacle to explore how humans exploit nature', 3);
add('nope', 'alien', 'genre_thematic', 'Sci-fi horror about encounters with alien predators', 3);
add('la-confidential', 'se7en', 'genre_thematic', 'Neo-noir crime thrillers with dark twists', 3);
add('the-graduate', 'eternal-sunshine-of-the-spotless-mind', 'genre_thematic', 'Bittersweet films about love and searching for meaning', 2);
add('roma', 'city-of-god', 'genre_thematic', 'Masterful Latin American films with stunning visual poetry', 3);
add('pride-and-prejudice', 'the-favourite', 'genre_thematic', 'Visually stunning British period films', 2);
add('ghostbusters', 'back-to-the-future', 'genre_thematic', 'Iconic 1980s sci-fi comedies', 3);
add('ghostbusters', 'the-goonies', 'genre_thematic', 'Quintessential 1980s adventure comedies', 2);

// === FILL ORPHANS ===
// Get connected set
const connected = new Set();
for (const e of edges) {
  connected.add(e.source);
  connected.add(e.target);
}

// Connect any remaining orphans
for (const id of ids) {
  if (connected.has(id)) continue;
  const node = nodeMap.get(id);
  if (!node) continue;
  let linked = 0;
  for (const other of nodes) {
    if (other.id === id || linked >= 2) break;
    const shared = node.genres.filter(g => other.genres.includes(g));
    if (shared.length > 0 && connected.has(other.id)) {
      add(id, other.id, 'genre_thematic', `Both are ${shared[0].toLowerCase()} titles with shared sensibilities`, 2);
      if (edgeKeys.has([id, other.id].sort().join('--'))) {
        connected.add(id);
        linked++;
      }
    }
  }
}

// Stats
const counts = new Map();
for (const e of edges) {
  counts.set(e.source, (counts.get(e.source) || 0) + 1);
  counts.set(e.target, (counts.get(e.target) || 0) + 1);
}
const orphans = [...ids].filter(id => !counts.has(id));
const vals = [...counts.values()];
const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

console.log(`Total edges: ${edges.length}`);
console.log(`Connected nodes: ${counts.size}/${ids.size}`);
console.log(`Orphans: ${orphans.length}`);
console.log(`Avg connections: ${avg.toFixed(1)}`);
console.log(`Max connections: ${Math.max(...vals)}`);
if (orphans.length > 0) console.log(`Orphan IDs: ${orphans.join(', ')}`);

writeFileSync('public/data/edges.json', JSON.stringify(edges, null, 2));
console.log('Written edges.json');
