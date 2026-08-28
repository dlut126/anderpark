import type { VitalityStage } from './vitality';

export interface Activity {
  id: string;
  emoji: string;
  lines: Record<VitalityStage, string>;
}

// {name} gets substituted with the character's nickname. Four tiers per
// activity (not a generic templated suffix) so the tone actually changes,
// not just the ending — thriving is triumphant, critical is bleak, and nobody
// reads the same joke twice in a row across 30 activities.
export const AWAY_ACTIVITIES: Activity[] = [
  {
    id: 'tennis',
    emoji: '🎾',
    lines: {
      thriving: '{name} played an incredible game of tennis and won every set.',
      healthy: '{name} played a game of tennis.',
      struggling: '{name} played a game of tennis but got tired early and had to stop.',
      critical: '{name} wanted to play tennis but was too weak to even lift the racket.',
    },
  },
  {
    id: 'swimming',
    emoji: '🏊',
    lines: {
      thriving: '{name} swam twenty laps and barely broke a sweat.',
      healthy: '{name} went for a swim.',
      struggling: '{name} tried to swim a few laps but had to get out early, exhausted.',
      critical: "{name} stared at the pool and decided the walk there wasn't worth it.",
    },
  },
  {
    id: 'baking',
    emoji: '🧁',
    lines: {
      thriving: '{name} baked a three-tier cake from scratch. It was perfect.',
      healthy: '{name} baked a batch of cookies.',
      struggling: '{name} tried to bake cookies but fell asleep before they came out of the oven.',
      critical: "{name} wanted to bake but couldn't find the energy to turn on the oven.",
    },
  },
  {
    id: 'painting',
    emoji: '🎨',
    lines: {
      thriving: '{name} painted a masterpiece and is already planning a gallery show.',
      healthy: '{name} painted a little landscape.',
      struggling: '{name} started a painting but gave up halfway through.',
      critical: '{name} picked up a paintbrush, put it back down, and took a nap instead.',
    },
  },
  {
    id: 'gardening',
    emoji: '🌱',
    lines: {
      thriving: '{name} spent the whole afternoon gardening and everything is blooming.',
      healthy: '{name} watered the plants and pulled a few weeds.',
      struggling: '{name} pulled one weed and called it a day.',
      critical: '{name} looked at the garden through the window and sighed.',
    },
  },
  {
    id: 'karaoke',
    emoji: '🎤',
    lines: {
      thriving: '{name} hosted a one-pet karaoke night and absolutely brought the house down.',
      healthy: '{name} sang a couple songs at karaoke.',
      struggling: '{name} tried to sing but their voice gave out halfway through the chorus.',
      critical: '{name} opened their mouth to sing and nothing came out.',
    },
  },
  {
    id: 'climbing',
    emoji: '🧗',
    lines: {
      thriving: '{name} conquered a new climbing route and celebrated at the top.',
      healthy: '{name} went rock climbing for a bit.',
      struggling: "{name} made it halfway up the wall before their arms gave out.",
      critical: '{name} looked at the climbing wall and decided against it entirely.',
    },
  },
  {
    id: 'skateboarding',
    emoji: '🛹',
    lines: {
      thriving: "{name} landed a trick they've been practicing for weeks.",
      healthy: '{name} cruised around on a skateboard.',
      struggling: '{name} tried a few tricks, fell twice, and called it quits.',
      critical: "{name} couldn't even balance on the skateboard today.",
    },
  },
  {
    id: 'yoga',
    emoji: '🧘',
    lines: {
      thriving: '{name} held a perfect tree pose for five whole minutes.',
      healthy: '{name} did a short yoga session.',
      struggling: "{name} tried a few stretches but couldn't find the energy to finish.",
      critical: '{name} attempted downward dog and just... stayed down.',
    },
  },
  {
    id: 'dance',
    emoji: '💃',
    lines: {
      thriving: '{name} choreographed an entire dance routine and nailed it.',
      healthy: '{name} practiced some dance moves.',
      struggling: '{name} tried to dance but ran out of breath after one song.',
      critical: "{name} wanted to dance but couldn't get off the couch.",
    },
  },
  {
    id: 'chess',
    emoji: '♟️',
    lines: {
      thriving: '{name} played chess against themselves and somehow still won.',
      healthy: '{name} played a game of chess.',
      struggling: '{name} started a game of chess but lost track of it halfway through.',
      critical: "{name} stared at the chessboard and couldn't remember how the pieces move.",
    },
  },
  {
    id: 'fishing',
    emoji: '🎣',
    lines: {
      thriving: '{name} caught the biggest fish of their life.',
      healthy: '{name} went fishing for a while.',
      struggling: '{name} cast a line but gave up before anything bit.',
      critical: "{name} didn't have the energy to even grab the fishing rod.",
    },
  },
  {
    id: 'hiking',
    emoji: '🥾',
    lines: {
      thriving: '{name} hiked to the summit and took in the whole view.',
      healthy: '{name} went for a nice hike.',
      struggling: '{name} started a hike but turned back early, worn out.',
      critical: '{name} made it to the trailhead and turned right back around.',
    },
  },
  {
    id: 'cooking',
    emoji: '🍳',
    lines: {
      thriving: '{name} cooked a five-course meal, and it was restaurant-quality.',
      healthy: '{name} made themselves a nice meal.',
      struggling: '{name} started cooking but ran out of energy and ordered takeout instead.',
      critical: '{name} opened the fridge, closed it, and went to lie down.',
    },
  },
  {
    id: 'reading',
    emoji: '📚',
    lines: {
      thriving: '{name} finished an entire novel in one sitting.',
      healthy: '{name} read a few chapters of a book.',
      struggling: '{name} read a page and a half before falling asleep.',
      critical: "{name} picked up a book but couldn't focus enough to read it.",
    },
  },
  {
    id: 'juggling',
    emoji: '🤹',
    lines: {
      thriving: '{name} learned to juggle five balls at once.',
      healthy: '{name} practiced juggling for a bit.',
      struggling: '{name} dropped the balls more than they caught them.',
      critical: "{name} tried to juggle and just didn't have it in them today.",
    },
  },
  {
    id: 'kite',
    emoji: '🪁',
    lines: {
      thriving: '{name} flew a kite higher than they ever have before.',
      healthy: '{name} flew a kite for a while.',
      struggling: "{name} got the kite up for a minute before it crashed, and didn't bother retrying.",
      critical: '{name} watched the wind blow and decided to stay inside.',
    },
  },
  {
    id: 'bikeride',
    emoji: '🚴',
    lines: {
      thriving: '{name} went on a long bike ride and felt unstoppable.',
      healthy: '{name} rode their bike around for a bit.',
      struggling: '{name} started a bike ride but turned back halfway, legs burning.',
      critical: "{name} looked at the bike and decided it wasn't happening today.",
    },
  },
  {
    id: 'fort',
    emoji: '🏰',
    lines: {
      thriving: '{name} built the most elaborate blanket fort anyone has ever seen.',
      healthy: '{name} built a small blanket fort.',
      struggling: '{name} started building a fort but abandoned it half-finished.',
      critical: "{name} thought about building a fort but couldn't find the energy to grab a blanket.",
    },
  },
  {
    id: 'stargazing',
    emoji: '🔭',
    lines: {
      thriving: '{name} stayed up all night stargazing and spotted three shooting stars.',
      healthy: '{name} did a little stargazing.',
      struggling: '{name} looked up at the sky for a minute before heading back inside, tired.',
      critical: "{name} couldn't even keep their eyes open long enough to look up.",
    },
  },
  {
    id: 'bubbles',
    emoji: '🫧',
    lines: {
      thriving: '{name} blew the biggest bubble anyone has ever seen.',
      healthy: '{name} blew some bubbles.',
      struggling: '{name} blew a couple bubbles before giving up.',
      critical: "{name} couldn't even blow a single bubble today.",
    },
  },
  {
    id: 'treasure',
    emoji: '🗺️',
    lines: {
      thriving: '{name} went on a treasure hunt and actually found something shiny.',
      healthy: '{name} went looking for treasure.',
      struggling: '{name} started a treasure hunt but lost interest partway through.',
      critical: "{name} didn't have it in them to go looking for anything today.",
    },
  },
  {
    id: 'snowball',
    emoji: '⛄',
    lines: {
      thriving: '{name} won an epic snowball fight single-handedly.',
      healthy: '{name} had a quick snowball fight.',
      struggling: '{name} threw one snowball and retreated.',
      critical: '{name} watched the snow fall from the window instead.',
    },
  },
  {
    id: 'talentshow',
    emoji: '🎭',
    lines: {
      thriving: '{name} put on a one-pet talent show, and it was a smash hit.',
      healthy: '{name} practiced a little talent show routine.',
      struggling: '{name} tried to put on a show but forgot the routine halfway through.',
      critical: '{name} did not have the energy for a show today.',
    },
  },
  {
    id: 'squirrel',
    emoji: '🐿️',
    lines: {
      thriving: '{name} made friends with a squirrel and they had a whole conversation.',
      healthy: '{name} tried to befriend a squirrel.',
      struggling: '{name} chased a squirrel for a bit but gave up.',
      critical: "{name} saw a squirrel and didn't even react.",
    },
  },
  {
    id: 'magic',
    emoji: '🎩',
    lines: {
      thriving: '{name} pulled off a magic trick so good it startled themselves.',
      healthy: '{name} practiced a magic trick.',
      struggling: "{name} tried a magic trick and it just didn't work out.",
      critical: "{name} couldn't even find the energy to pull a rabbit out of a hat.",
    },
  },
  {
    id: 'sandcastle',
    emoji: '🏖️',
    lines: {
      thriving: '{name} built a sandcastle worthy of a magazine cover.',
      healthy: '{name} built a small sandcastle.',
      struggling: "{name} started a sandcastle but the tide (or their energy) got to it first.",
      critical: '{name} sat by the sand and did not build anything.',
    },
  },
  {
    id: 'boardgame',
    emoji: '🎲',
    lines: {
      thriving: '{name} played a board game solo and somehow still won by a landslide.',
      healthy: '{name} played a board game.',
      struggling: '{name} set up a board game but never finished it.',
      critical: '{name} looked at the board game box and left it on the shelf.',
    },
  },
  {
    id: 'photography',
    emoji: '📸',
    lines: {
      thriving: '{name} took a photo so good it could win an award.',
      healthy: '{name} went out taking some photos.',
      struggling: '{name} took a couple photos before losing interest.',
      critical: "{name} didn't have the energy to pick up the camera.",
    },
  },
  {
    id: 'balloons',
    emoji: '🎈',
    lines: {
      thriving: '{name} made a whole balloon animal zoo.',
      healthy: '{name} made a balloon animal.',
      struggling: '{name} tried to make a balloon animal, but it popped.',
      critical: "{name} couldn't even blow up a balloon today.",
    },
  },
];

export function activityLine(activity: Activity, stage: VitalityStage, nickname: string): string {
  return activity.lines[stage].replace(/\{name\}/g, nickname);
}

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickAwayActivities(count: number): Activity[] {
  return shuffled(AWAY_ACTIVITIES).slice(0, Math.min(count, AWAY_ACTIVITIES.length));
}

// How much there is to "catch up on" scales with how long you were gone —
// long enough away to matter (30min+) shows one, a full day away shows a
// little digest of a few, capping out so it never becomes a wall of text.
export function awayActivityCount(hoursAway: number): number {
  if (hoursAway < 0.5) return 0;
  if (hoursAway < 6) return 1;
  if (hoursAway < 24) return 2;
  return 3;
}
