/**
 * Arena Drills Library
 * Hockey and skating training drills for youth programs
 */

export const SKATING_FUNDAMENTALS = [
  {
    id: 'skate-001',
    name: 'Forward Stride Development',
    category: 'Skating Basics',
    skillLevel: 'Beginner',
    duration: '10-15 min',
    equipment: 'Cones, pucks',
    groupSize: '6-12 students',
    description: 'Focus on proper forward skating technique with emphasis on knee bend and weight transfer.',
    setup: 'Set up cones in a straight line 10 feet apart down the ice',
    instructions: `
      1. Demonstrate proper forward stride: knee bend, push to the side, full extension
      2. Students skate through cones focusing on form
      3. Coach watches for common mistakes: stiff legs, toe pushing, upright posture
      4. Progress to speed skating once form improves
    `,
    variations: [
      'Add pucks for stickhandling while skating',
      'Race format for older/advanced students',
      'Partner races for motivation'
    ],
    coachingTips: [
      'Watch for proper knee bend - "sit in a chair"',
      'Encourage push to the side, not back',
      'Keep chest up, look forward not down'
    ]
  },
  {
    id: 'skate-002',
    name: 'Backward Skating Basics',
    category: 'Skating Basics',
    skillLevel: 'Beginner',
    duration: '10-15 min',
    equipment: 'Cones',
    groupSize: '6-12 students',
    description: 'Introduction to backward skating with C-cuts and proper body position.',
    setup: 'Students line up along boards with space between each',
    instructions: `
      1. Demonstrate C-cut technique and body position
      2. Practice stationary C-cuts holding the boards
      3. Progress to slow backward movement
      4. Add cones to weave through once comfortable
    `,
    variations: [
      'Backward skating races',
      'Red light/green light backward',
      'Backward figure-8s around cones'
    ],
    coachingTips: [
      'Keep weight on balls of feet',
      'Look over shoulder to see where going',
      'Small C-cuts first, gradually bigger'
    ]
  },
  {
    id: 'skate-003',
    name: 'Crossovers and Edges',
    category: 'Skating Basics',
    skillLevel: 'Intermediate',
    duration: '15-20 min',
    equipment: 'Cones in circle pattern',
    groupSize: '8-15 students',
    description: 'Develop crossover technique and edge control for turning.',
    setup: 'Create a large circle with cones in center ice',
    instructions: `
      1. Demonstrate crossover technique (inside leg crosses over outside)
      2. Students practice around circle going both directions
      3. Focus on pushing with outside edge of outside foot
      4. Gradually increase speed
    `,
    variations: [
      'Figure-8 pattern with crossovers',
      'Tight turns vs wide turns',
      'Add pucks for advanced students'
    ],
    coachingTips: [
      'Lean into the turn',
      'Outside leg pushes, inside leg crosses',
      'Keep shoulders level'
    ]
  },
  {
    id: 'skate-004',
    name: 'Hockey Stops',
    category: 'Skating Basics',
    skillLevel: 'Intermediate',
    duration: '15-20 min',
    equipment: 'Cones',
    groupSize: '6-12 students',
    description: 'Learn proper stopping technique on both sides.',
    setup: 'Cones placed at intervals down the ice for stop points',
    instructions: `
      1. Demonstrate one-foot snow plow stop first (easier)
      2. Progress to two-foot hockey stop
      3. Practice stopping on both sides
      4. Add "red light" game - blow whistle, everyone stops
    `,
    variations: [
      'Stop and start races',
      'Direction changes after stops',
      'Partner tag with stops'
    ],
    coachingTips: [
      'Turn hips and shoulders perpendicular to direction',
      'Bend knees and push ice forward',
      'Practice weaker side more'
    ]
  }
];

export const STICKHANDLING_DRILLS = [
  {
    id: 'stick-001',
    name: 'Stationary Stickhandling',
    category: 'Puck Control',
    skillLevel: 'Beginner',
    duration: '10 min',
    equipment: 'Pucks',
    groupSize: '10-20 students',
    description: 'Basic puck control while standing still.',
    setup: 'Students spread out with space around them',
    instructions: `
      1. Side-to-side stickhandling in front of body
      2. Wide movements first, gradually tighter
      3. Add forward/backward movements
      4. Practice with head up (not looking at puck)
    `,
    variations: [
      'Figure-8 pattern around cones',
      'Stickhandle while doing squats',
      'Partner mirrors your movements'
    ],
    coachingTips: [
      'Soft hands - top hand guides, bottom hand cups',
      'Use whole blade, not just toe',
      'Keep puck in "triangle" - both skates and stick'
    ]
  },
  {
    id: 'stick-002',
    name: 'Cone Weave Stickhandling',
    category: 'Puck Control',
    skillLevel: 'Beginner-Intermediate',
    duration: '15 min',
    equipment: 'Cones (5-6 per line), pucks',
    groupSize: '8-16 students',
    description: 'Stickhandling through obstacles to develop control.',
    setup: 'Set up 3-4 lines of cones (5-6 cones per line, 3 feet apart)',
    instructions: `
      1. Students weave through cones with puck
      2. Focus on keeping puck close to stick
      3. Increase speed as control improves
      4. Time trials for motivation
    `,
    variations: [
      'Backward stickhandling through cones',
      'Only forehand or only backhand',
      'Add shooting at end'
    ],
    coachingTips: [
      'Head up, use peripheral vision',
      'Quick hands, slow feet for beginners',
      'Protect puck with body when turning'
    ]
  },
  {
    id: 'stick-003',
    name: 'Keep Away (Puck Protection)',
    category: 'Puck Control',
    skillLevel: 'Intermediate-Advanced',
    duration: '10-15 min',
    equipment: 'Pucks',
    groupSize: '6-12 students',
    description: 'Learn to protect puck from defenders.',
    setup: 'Mark small zones (10x10 feet) with cones',
    instructions: `
      1. One player with puck, one defender
      2. Player tries to keep puck for 30 seconds
      3. Defender tries to poke puck away (no body contact)
      4. Switch roles
    `,
    variations: [
      '2 on 1 keep away',
      'Larger zones for more space',
      'Add second puck for chaos'
    ],
    coachingTips: [
      'Use body as shield between puck and defender',
      'Keep moving, don\'t stand still',
      'Quick small movements better than big moves'
    ]
  }
];

export const SHOOTING_DRILLS = [
  {
    id: 'shoot-001',
    name: 'Wrist Shot Technique',
    category: 'Shooting',
    skillLevel: 'Beginner-Intermediate',
    duration: '15-20 min',
    equipment: 'Pucks, net',
    groupSize: '8-15 students',
    description: 'Develop proper wrist shot mechanics.',
    setup: 'Form lines at hash marks on both sides',
    instructions: `
      1. Demonstrate proper wrist shot: puck behind, weight transfer, follow through
      2. Students shoot from stationary position
      3. Focus on accuracy before power
      4. Add movement once form is solid
    `,
    variations: [
      'Shoot while skating forward',
      'Receive pass then shoot',
      'Target corners of net'
    ],
    coachingTips: [
      'Puck starts behind body, finishes in front',
      'Weight transfers from back to front foot',
      'Point stick at target after shot'
    ]
  },
  {
    id: 'shoot-002',
    name: 'Snap Shot Practice',
    category: 'Shooting',
    skillLevel: 'Intermediate',
    duration: '15 min',
    equipment: 'Pucks, net',
    groupSize: '8-15 students',
    description: 'Quick-release snap shots.',
    setup: 'Students in line at top of circles',
    instructions: `
      1. Demonstrate snap shot: quick load and release
      2. Practice from various angles
      3. Emphasize speed over power
      4. Add receiving pass before shooting
    `,
    variations: [
      'One-timer progression',
      'Snap shot off the rush',
      'Snap shot competitions'
    ],
    coachingTips: [
      'Quick weight transfer',
      'Don\'t wind up - fast and deceptive',
      'Snap through the puck'
    ]
  }
];

export const GAME_DRILLS = [
  {
    id: 'game-001',
    name: 'Red Light Green Light',
    category: 'Fun Games',
    skillLevel: 'Beginner',
    duration: '10 min',
    equipment: 'None',
    groupSize: '10-20 students',
    description: 'Classic game adapted for skating.',
    setup: 'Students line up at goal line',
    instructions: `
      1. "Green light" - skate forward
      2. "Red light" - stop immediately
      3. Anyone moving on red light goes back to start
      4. First to far end wins
    `,
    variations: [
      'Backward skating version',
      'Add pucks for stickhandling',
      'Call out different skills (crossovers, etc.)'
    ],
    coachingTips: [
      'Great for teaching stops and starts',
      'Keep it fun and energetic',
      'Vary speed of calls'
    ]
  },
  {
    id: 'game-002',
    name: 'Sharks and Minnows',
    category: 'Fun Games',
    skillLevel: 'All Levels',
    duration: '15 min',
    equipment: 'Pucks (optional)',
    groupSize: '12-25 students',
    description: 'Tag game on ice - develops agility and awareness.',
    setup: 'Mark playing area with cones (half ice or full ice)',
    instructions: `
      1. Choose 2-3 "sharks" (taggers)
      2. Everyone else is "minnows"
      3. Minnows try to cross ice without being tagged
      4. Tagged minnows become sharks
      5. Last minnow wins
    `,
    variations: [
      'Add pucks - protect puck while crossing',
      'Backward skating only',
      'Different locomotions (one-foot skating, etc.)'
    ],
    coachingTips: [
      'Teaches quick direction changes',
      'Great conditioning drill disguised as fun',
      'Adjust boundaries based on skill level'
    ]
  },
  {
    id: 'game-003',
    name: 'Relay Races',
    category: 'Fun Games',
    skillLevel: 'All Levels',
    duration: '15 min',
    equipment: 'Cones, pucks',
    groupSize: '12-25 students',
    description: 'Team relay races with various skills.',
    setup: 'Divide into 3-4 teams, set up relay course',
    instructions: `
      1. Create course with different challenges
      2. Teams compete to finish first
      3. Rotate through different skills
      4. Keep it fast-paced and fun
    `,
    variations: [
      'Skating only',
      'Stickhandling through cones',
      'Shoot then race back',
      'Backward skating legs',
      'Partner races'
    ],
    coachingTips: [
      'Even teams by skill level',
      'Positive encouragement for all',
      'Mix up teams frequently'
    ]
  },
  {
    id: 'game-004',
    name: '3 vs 3 Small Area Games',
    category: 'Small-Sided Games',
    skillLevel: 'Intermediate-Advanced',
    duration: '20 min',
    equipment: 'Pucks, nets or goals',
    groupSize: '12-18 students',
    description: 'Small-sided games for skill development.',
    setup: 'Divide ice into 2-3 zones, 3v3 in each',
    instructions: `
      1. Play 3-on-3 in confined space
      2. Emphasize quick transitions
      3. Rotate teams every 2-3 minutes
      4. Add rules: 3-pass minimum, one-touch, etc.
    `,
    variations: [
      '2v2 for more touches',
      'No goalies - all scoring',
      'Specific rules (no slapshots, backhand only, etc.)'
    ],
    coachingTips: [
      'Lots of touches and decisions',
      'Stop play to coach moments',
      'Keep shifts short (2-3 min max)'
    ]
  }
];

export const WARMUP_DRILLS = [
  {
    id: 'warm-001',
    name: 'Dynamic Skating Warmup',
    category: 'Warmup',
    skillLevel: 'All Levels',
    duration: '10 min',
    equipment: 'Cones',
    groupSize: 'Full team',
    description: 'Comprehensive skating warmup routine.',
    setup: 'Students line up on goal line',
    instructions: `
      1. Forward skating (length of ice, 2 laps)
      2. Backward skating (length, 1 lap)
      3. Crossovers around circles (both directions)
      4. Transitions (forward to backward, backward to forward)
      5. Quick feet (fast feet in place, blow whistle to move)
    `,
    variations: [
      'Add partner skating',
      'Include stretches at each end',
      'Progression to higher intensity'
    ],
    coachingTips: [
      'Start slower, build to game speed',
      'Watch for students struggling - adjust pace',
      'Positive energy sets tone for practice'
    ]
  },
  {
    id: 'warm-002',
    name: 'Puck Handling Warmup',
    category: 'Warmup',
    skillLevel: 'All Levels',
    duration: '8 min',
    equipment: 'Pucks',
    groupSize: 'Full team',
    description: 'Get touches on puck before main practice.',
    setup: 'Students spread out across ice with pucks',
    instructions: `
      1. Stationary stickhandling (2 min)
      2. Skate around perimeter with puck (2 min)
      3. Figure-8s around center circles (2 min)
      4. Free skate with puck (2 min)
    `,
    variations: [
      'Partner passing while skating',
      'Add music for energy',
      'Challenges (toe drags, between legs, etc.)'
    ],
    coachingTips: [
      'Encourage creativity',
      'Head up, feel the puck',
      'Keep it fun and loose'
    ]
  }
];

/**
 * Get all arena drills organized by category
 */
export function getAllArenaDrills() {
  return {
    warmup: WARMUP_DRILLS,
    skating: SKATING_FUNDAMENTALS,
    stickhandling: STICKHANDLING_DRILLS,
    shooting: SHOOTING_DRILLS,
    games: GAME_DRILLS,
  };
}

/**
 * Get all drills as flat array
 */
export function getAllArenaDrillsFlat() {
  return [
    ...WARMUP_DRILLS,
    ...SKATING_FUNDAMENTALS,
    ...STICKHANDLING_DRILLS,
    ...SHOOTING_DRILLS,
    ...GAME_DRILLS,
  ];
}

/**
 * Get drills by skill level
 */
export function getDrillsBySkillLevel(skillLevel) {
  const allDrills = getAllArenaDrillsFlat();
  return allDrills.filter(drill =>
    drill.skillLevel.toLowerCase().includes(skillLevel.toLowerCase()) ||
    drill.skillLevel === 'All Levels'
  );
}

/**
 * Get drills by category
 */
export function getDrillsByCategory(category) {
  const allDrills = getAllArenaDrillsFlat();
  return allDrills.filter(drill => drill.category === category);
}

/**
 * Search drills by keyword
 */
export function searchDrills(keyword) {
  const allDrills = getAllArenaDrillsFlat();
  const searchTerm = keyword.toLowerCase();
  return allDrills.filter(drill =>
    drill.name.toLowerCase().includes(searchTerm) ||
    drill.description.toLowerCase().includes(searchTerm) ||
    drill.category.toLowerCase().includes(searchTerm)
  );
}
