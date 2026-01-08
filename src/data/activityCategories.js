/**
 * Activity Categories and Colors
 * Defines all activity types with color coding
 */

export const ACTIVITY_CATEGORIES = {
  antwaun: {
    id: 'antwaun',
    name: "Antwaun 1-on-1",
    emoji: '⭐',
    color: '#a78bfa', // Purple
    description: 'Individual session with Antwaun',
  },
  math: {
    id: 'math',
    name: 'Math',
    emoji: '🔢',
    color: '#60a5fa', // Blue
    description: 'Mathematics activities and lessons',
  },
  lexia: {
    id: 'lexia',
    name: 'Lexia',
    emoji: '📖',
    color: '#10b981', // Green
    description: 'Lexia reading program',
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness',
    emoji: '💪',
    color: '#f97316', // Orange
    description: 'Physical activities and exercise',
  },
  music: {
    id: 'music',
    name: 'Music',
    emoji: '🎵',
    color: '#14b8a6', // Teal
    description: 'Music class and activities',
  },
  skating: {
    id: 'skating',
    name: 'Skating',
    emoji: '⛸️',
    color: '#06b6d4', // Cyan
    description: 'Ice skating sessions',
  },
  lunch: {
    id: 'lunch',
    name: 'Lunch',
    emoji: '🍽️',
    color: '#fbbf24', // Yellow
    description: 'Lunch break activities',
  },
  cooking: {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    color: '#fb923c', // Orange-red
    description: 'Cooking activities',
  },
  games: {
    id: 'games',
    name: 'Games',
    emoji: '🎮',
    color: '#ec4899', // Pink
    description: 'Board games and activities',
  },
  arts: {
    id: 'arts',
    name: 'Arts & Crafts',
    emoji: '🎨',
    color: '#8b5cf6', // Purple-blue
    description: 'Creative arts activities',
  },
  outdoor: {
    id: 'outdoor',
    name: 'Outdoor',
    emoji: '🌲',
    color: '#22c55e', // Bright green
    description: 'Outdoor activities',
  },
  free: {
    id: 'free',
    name: 'Free Time',
    emoji: '✨',
    color: '#94a3b8', // Gray
    description: 'Unstructured free time',
  },
};

/**
 * Get all categories as array
 */
export function getAllCategories() {
  return Object.values(ACTIVITY_CATEGORIES);
}

/**
 * Get category by ID
 */
export function getCategoryById(id) {
  return ACTIVITY_CATEGORIES[id] || ACTIVITY_CATEGORIES.free;
}

/**
 * Get category color
 */
export function getCategoryColor(categoryId) {
  const category = getCategoryById(categoryId);
  return category.color;
}
