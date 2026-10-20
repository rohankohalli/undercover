export const ROLES = {
  INNOCENT: 'innocent',
  UNDERCOVER: 'undercover',
  STRANGER: 'stranger'
};

export const TIMER_OPTIONS = {
  CLUE: [20, 30, 45, 60],
  ROUND: [45, 60, 90, 120]
};

export const DEFAULT_SETTINGS = {
  playerCount: 6,
  undercovers: 1,
  strangers: 1,
  clueTimer: 45,
  roundTimer: 60,
  maxRounds: 4,
  category: 'random'
};

export const CATEGORIES = [
  { id: 'random', label: '🎲 Everything / Random' },
  { id: 'food', label: '🍕 Food & Drinks' },
  { id: 'movies', label: '🎬 Movies & Pop Culture' },
  { id: 'gaming', label: '🎮 Video Games' },
  { id: 'sports', label: '🏏 Sports' },
  { id: 'travel', label: '🌍 Travel & Places' },
  { id: 'tech', label: '💻 Tech & Gadgets' }
];

export function getMaxSpecialRoles(playerCount) {
  // Special roles (Undercover + Stranger) must strictly be < playerCount / 2
  // Meaning Innocents must strictly be > playerCount / 2
  return Math.floor((playerCount - 1) / 2);
}

export function getDefaultRoles(playerCount) {
  if (playerCount <= 3) return { undercovers: 1, strangers: 0 };
  if (playerCount <= 4) return { undercovers: 1, strangers: 0 };
  if (playerCount <= 6) return { undercovers: 1, strangers: 1 };
  if (playerCount <= 8) return { undercovers: 2, strangers: 1 };
  return { undercovers: 2, strangers: 1 };
}

export function getRecommendedRounds(playerCount) {
  if (playerCount <= 4) return 3;
  if (playerCount <= 6) return 4;
  if (playerCount <= 8) return 5;
  return 6;
}

export const FALLBACK_WORD_PAIRS = {
  random: [
    ['Coffee', 'Tea'], ['Cat', 'Dog'], ['Beach', 'Pool'], ['Pizza', 'Burger'],
    ['Moon', 'Sun'], ['Train', 'Bus'], ['Rain', 'Snow'], ['Guitar', 'Piano'],
    ['Apple', 'Orange'], ['School', 'College'], ['Cricket', 'Football'],
    ['Mountain', 'Hill'], ['Shark', 'Dolphin'], ['Book', 'Movie'], ['Cake', 'Ice cream'],
    ['Pen', 'Pencil'], ['River', 'Lake'], ['Doctor', 'Nurse'], ['Airplane', 'Helicopter'],
    ['Clock', 'Watch'], ['Mirror', 'Glass'], ['Shoe', 'Sandal'], ['Candle', 'Lamp']
  ],
  food: [
    ['Coffee', 'Tea'], ['Pizza', 'Burger'], ['Pancakes', 'Waffles'], ['Sushi', 'Ramen'],
    ['Apple', 'Orange'], ['Cake', 'Ice cream'], ['Taco', 'Burrito'], ['Chocolate', 'Candy'],
    ['Bread', 'Croissant'], ['Pasta', 'Noodles'], ['Donut', 'Muffin'], ['Butter', 'Cheese']
  ],
  movies: [
    ['Cinema', 'Theater'], ['Batman', 'Spider-Man'], ['Actor', 'Director'], ['Horror', 'Thriller'],
    ['Netflix', 'YouTube'], ['Popcorn', 'Soda'], ['Harry Potter', 'Lord of the Rings'],
    ['Alien', 'Monster'], ['Comics', 'Anime'], ['Sequel', 'Remake']
  ],
  gaming: [
    ['PlayStation', 'Xbox'], ['Minecraft', 'Roblox'], ['Keyboard', 'Controller'],
    ['Mario', 'Sonic'], ['Headset', 'Speakers'], ['Console', 'PC'], ['Quest', 'Mission'],
    ['Sword', 'Shield'], ['Steam', 'Epic Games'], ['Pokemon', 'Digimon']
  ],
  sports: [
    ['Cricket', 'Football'], ['Tennis', 'Badminton'], ['Marathon', 'Sprint'],
    ['Helmet', 'Cap'], ['Stadium', 'Gym'], ['Basketball', 'Volleyball'],
    ['Skiing', 'Snowboarding'], ['Referee', 'Coach'], ['Medal', 'Trophy']
  ],
  travel: [
    ['Beach', 'Pool'], ['Mountain', 'Hill'], ['Hotel', 'Resort'], ['Train', 'Bus'],
    ['Airplane', 'Helicopter'], ['Passport', 'Ticket'], ['Island', 'Coast'],
    ['Backpack', 'Suitcase'], ['Tent', 'Cabin'], ['Map', 'Compass']
  ],
  tech: [
    ['Laptop', 'Tablet'], ['iPhone', 'Android'], ['WiFi', 'Bluetooth'],
    ['Google', 'Microsoft'], ['Mouse', 'Trackpad'], ['Monitor', 'TV'],
    ['Python', 'JavaScript'], ['Robot', 'Drone'], ['AI', 'Algorithm']
  ]
};
