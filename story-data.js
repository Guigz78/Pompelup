/* Pompelup — mode Histoire : parcours d'artistes (écoute, anecdote, question) */
window.STORY_ARTISTS = [
  {
    id: 'michael-jackson', name: 'Michael Jackson', emoji: '🕺',
    color: '#3B4FE8', genre: 'Pop', origin: 'Gary, Indiana 🇺🇸', active: '1964 – 2009',
    bio: 'Le Roi de la Pop. Plus de 400 millions d\'albums vendus, une voix et un moonwalk uniques au monde.',
    requiredXP: 0,
    steps: [
      { type: 'listen', songId: 's2',  label: 'Son tube de 1982 — l\'un des plus joués de l\'histoire' },
      { type: 'fact',   text: 'Thriller (1982) est l\'album le plus vendu de l\'histoire avec plus de 70 millions d\'exemplaires vendus.', emoji: '🏆' },
      { type: 'listen', songId: 's31', label: 'Tiré du film Moonwalker (1988)' },
      { type: 'mcq',    question: 'Quel album de MJ s\'est vendu à plus de 30 millions d\'exemplaires en 1987 ?', opts: ['Dangerous', 'Bad', 'Off the Wall', 'Invincible'], correct: 1 },
    ]
  },
  {
    id: 'queen', name: 'Queen', emoji: '👑',
    color: '#FBBF24', genre: 'Rock', origin: 'Londres 🇬🇧', active: '1970 – présent',
    bio: 'Freddie Mercury, Brian May, Roger Taylor et John Deacon — le rock au format opéra, grandeur nature.',
    requiredXP: 0,
    steps: [
      { type: 'listen', songId: 's3',  label: 'Leur chef-d\'œuvre opéra-rock (1975)' },
      { type: 'fact',   text: 'Bohemian Rhapsody était si atypique (6 min) que les radios refusaient de la diffuser. Elle devint n°1 au Royaume-Uni pendant 9 semaines.', emoji: '🎭' },
      { type: 'listen', songId: 's68', label: 'L\'hymne des stades (1977)' },
      { type: 'mcq',    question: 'Quel film biographique sur Queen est sorti en 2018 ?', opts: ['Rocketman', 'Bohemian Rhapsody', 'Stardust', 'Yesterday'], correct: 1 },
    ]
  },
  {
    id: 'daft-punk', name: 'Daft Punk', emoji: '🤖',
    color: '#F97316', genre: 'Dance', origin: 'Paris 🇫🇷', active: '1993 – 2021',
    bio: 'Thomas Bangalter & Guy-Manuel de Homem-Christo. Casques d\'or et d\'argent, électro révolutionnaire.',
    requiredXP: 0,
    steps: [
      { type: 'listen', songId: 's11', label: 'Feat. Pharrell Williams (2013)' },
      { type: 'fact',   text: 'Random Access Memories (2013) a remporté 5 Grammy Awards dont Album de l\'année. Il a relancé la musique disco à l\'ère moderne.', emoji: '🏅' },
      { type: 'listen', songId: 's91', label: 'Tiré de Discovery (2001)' },
      { type: 'mcq',    question: 'En quelle année Daft Punk s\'est-il officiellement séparé ?', opts: ['2019', '2020', '2021', '2022'], correct: 2 },
      { type: 'listen', songId: 's92', label: 'Leur premier grand hit (1997)' },
    ]
  },
  {
    id: 'nirvana', name: 'Nirvana', emoji: '🤟',
    color: '#374151', genre: 'Rock', origin: 'Aberdeen, WA 🇺🇸', active: '1987 – 1994',
    bio: 'Kurt Cobain, Krist Novoselic, Dave Grohl. Le grunge qui a changé la face du rock pour toujours.',
    requiredXP: 80,
    steps: [
      { type: 'listen', songId: 's1',  label: 'L\'hymne du grunge (1991)' },
      { type: 'fact',   text: 'Nevermind (1991) a dépassé Dangerous de Michael Jackson dans les charts américains, symbolisant le passage du pouvoir au grunge.', emoji: '💥' },
      { type: 'listen', songId: 's54', label: 'Second single de Nevermind (1991)' },
      { type: 'mcq',    question: 'Quel batteur de Nirvana est devenu leader des Foo Fighters ?', opts: ['Pat Smear', 'Chad Channing', 'Dave Grohl', 'Aaron Burckhard'], correct: 2 },
    ]
  },
  {
    id: 'dua-lipa', name: 'Dua Lipa', emoji: '💫',
    color: '#8B5CF6', genre: 'Pop', origin: 'Londres 🇬🇧', active: '2015 – présent',
    bio: 'La reine de la pop disco britannique. Future Nostalgia a redéfini le son pop des années 2020.',
    requiredXP: 80,
    steps: [
      { type: 'listen', songId: 's129', label: 'Retour aux années 80 (2019)' },
      { type: 'fact',   text: 'Future Nostalgia (2020) a été entièrement conçu et enregistré avant le COVID. Il a ensuite accompagné le monde entier pendant le confinement.', emoji: '🕺' },
      { type: 'listen', songId: 's21',  label: 'Levitation Station (2020)' },
      { type: 'mcq',    question: 'De quelle nationalité est le père de Dua Lipa ?', opts: ['Albanaise', 'Serbe', 'Turque', 'Grecque'], correct: 0 },
    ]
  },
  {
    id: 'drake', name: 'Drake', emoji: '🦉',
    color: '#22C55E', genre: 'Hip-Hop', origin: 'Toronto 🇨🇦', active: '2006 – présent',
    bio: 'Aubrey Drake Graham — l\'artiste le plus streamé de Spotify pendant 7 années consécutives.',
    requiredXP: 120,
    steps: [
      { type: 'listen', songId: 's81', label: 'Clip culte à l\'escalator (2015)' },
      { type: 'fact',   text: 'En 2016, Drake a eu simultanément 9 chansons dans le Top 10 du Billboard Hot 100, battant le record de The Beatles (14 en 1964 mais pas 9 simultanément).', emoji: '📊' },
      { type: 'listen', songId: 's83', label: 'God\'s Plan (2018)' },
      { type: 'mcq',    question: 'Dans quelle série télévisée Drake a-t-il joué avant sa carrière musicale ?', opts: ['The Wire', 'Degrassi', 'Euphoria', 'Power'], correct: 1 },
    ]
  },
  {
    id: 'edith-piaf', name: 'Édith Piaf', emoji: '🌹',
    color: '#EF4444', genre: 'Pop Française', origin: 'Paris 🇫🇷', active: '1935 – 1963',
    bio: 'La Môme. La voix de la France. Son héritage transcende les générations et les frontières.',
    requiredXP: 120,
    steps: [
      { type: 'listen', songId: 's155', label: 'Son testament musical (1960)' },
      { type: 'fact',   text: '"Piaf" signifie "moineau" en argot parisien. Édith a été découverte à 20 ans en chantant dans la rue par Louis Leplée, gérant d\'un cabaret parisien.', emoji: '🐦' },
      { type: 'listen', songId: 's156', label: 'Composée en 1946, version 1947' },
      { type: 'mcq',    question: 'Qui a composé "Non, Je Ne Regrette Rien" pour Édith Piaf ?', opts: ['Charles Aznavour', 'Gilbert Bécaud', 'Charles Dumont', 'Jacques Brel'], correct: 2 },
    ]
  },
  {
    id: 'taylor-swift', name: 'Taylor Swift', emoji: '🌟',
    color: '#F472B6', genre: 'Pop', origin: 'West Reading, PA 🇺🇸', active: '2004 – présent',
    bio: 'La plus grande artiste de sa génération. Elle possède les masters re-enregistrés de ses 10 albums.',
    requiredXP: 200,
    steps: [
      { type: 'listen', songId: 's114', label: 'Album 1989 — nouvelle ère pop (2014)' },
      { type: 'fact',   text: 'The Eras Tour (2023) a généré plus de 1 milliard de dollars, devenant la tournée la plus rentable de l\'histoire du monde entier.', emoji: '💰' },
      { type: 'listen', songId: 's42',  label: 'Midnights — son aveu le plus personnel (2022)' },
      { type: 'mcq',    question: 'Combien Taylor Swift a-t-elle remporté de Grammy Awards Album de l\'année ?', opts: ['2', '3', '4', '5'], correct: 2 },
    ]
  }
];

window.STORY_CHAPTERS = [
  {
    id: 'ch1', num: 1,
    title: 'Les Légendes', emoji: '👑',
    subtitle: 'Les artistes qui ont tout changé',
    gradient: 'linear-gradient(135deg,#F97316,#FBBF24)',
    minXP: 0,
    artists: ['michael-jackson', 'queen', 'edith-piaf']
  },
  {
    id: 'ch2', num: 2,
    title: 'Les Révolutions', emoji: '⚡',
    subtitle: 'Quand la musique a tout réinventé',
    gradient: 'linear-gradient(135deg,#3B4FE8,#6366F1)',
    minXP: 60,
    artists: ['nirvana', 'daft-punk', 'drake']
  },
  {
    id: 'ch3', num: 3,
    title: "L'Ère Moderne", emoji: '🌟',
    subtitle: "Les superstars qui définissent aujourd'hui",
    gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
    minXP: 160,
    artists: ['dua-lipa', 'taylor-swift']
  }
];

let HIST_STATE = { activeArtist: null, activeStep: 0, stepSong: null };


// Portraits illustrés (même direction artistique que le personnage)
window.STORY_LOOKS = {
  'michael-jackson': { seed: 'mj', opts: { hair: ['curlyShortHair'], hairColor: ['220f00'], skinColor: ['8c5a2b'], eyes: ['cheery'], mouth: ['openedSmile'] }, acc: { eyes: 'sunglasses' } },
  'queen': { seed: 'queen', opts: { hair: ['shortHair'], hairColor: ['220f00'], skinColor: ['c99c62'], eyes: ['normal'], mouth: ['teethSmile'] }, acc: { face: 'mustache-brown', head: 'crown-gold' } },
  'daft-punk': { seed: 'daft', opts: { hair: ['shavedHead'], hairColor: ['220f00'], skinColor: ['efcc9f'], eyes: ['normal'], mouth: ['awkwardSmile'] }, acc: { eyes: 'sunglasses-neon', face: 'facemask-black' } },
  'nirvana': { seed: 'kurt', opts: { hair: ['straightHair'], hairColor: ['e9b729'], skinColor: ['f5d7b1'], eyes: ['sleepy'], mouth: ['unimpressed'] } },
  'dua-lipa': { seed: 'dua', opts: { hair: ['straightHair'], hairColor: ['220f00'], skinColor: ['e2ba87'], eyes: ['winking'], mouth: ['openedSmile'] } },
  'drake': { seed: 'drake', opts: { hair: ['shavedHead'], hairColor: ['220f00'], skinColor: ['a47539'], eyes: ['normal'], mouth: ['awkwardSmile'] } },
  'edith-piaf': { seed: 'piaf', opts: { hair: ['bangs'], hairColor: ['3a1a00'], skinColor: ['ffe4c0'], eyes: ['cheery'], mouth: ['openedSmile'] } },
  'taylor-swift': { seed: 'taylor', opts: { hair: ['wavyBob'], hairColor: ['e9b729'], skinColor: ['ffe4c0'], eyes: ['cheery'], mouth: ['teethSmile'] }, acc: { head: 'crown-silver' } },
};
