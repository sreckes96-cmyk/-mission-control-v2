/**
 * Data Schemas
 * Define validation rules for all data models
 */

/**
 * Student Schema
 */
export const studentSchema = {
  id: {
    type: 'number',
    required: true,
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  grade: {
    type: 'number',
    required: true,
    min: 1,
    max: 12,
  },
  age: {
    type: 'number',
    min: 5,
    max: 18,
    default: null,
  },
  parentName: {
    type: 'string',
    required: true,
    maxLength: 100,
  },
  parentPhone: {
    type: 'string',
    required: true,
    maxLength: 20,
  },
  parentEmail: {
    type: 'string',
    maxLength: 200,
    default: '',
  },
  parentFacebook: {
    type: 'string',
    maxLength: 200,
    default: '',
  },
  specialAttention: {
    type: 'boolean',
    default: false,
  },
  interests: {
    type: 'string',
    maxLength: 500,
    default: '',
  },
  triggerNotes: {
    type: 'string',
    maxLength: 500,
    default: '',
  },
  strategies: {
    type: 'string',
    maxLength: 500,
    default: '',
  },
  medical: {
    type: 'string',
    maxLength: 500,
    default: '',
  },
  notes: {
    type: 'string',
    maxLength: 1000,
    default: '',
  },
};

/**
 * Schedule Activity Schema
 */
export const scheduleActivitySchema = {
  id: {
    type: 'string',
    required: true,
  },
  time: {
    type: 'string',
    required: true,
  },
  category: {
    type: 'string',
    required: true,
    validate: (value) =>
      ['academics', 'fitness', 'music', 'cooking', 'games', 'program', 'cancelled'].includes(
        value
      ),
  },
  name: {
    type: 'string',
    required: true,
    maxLength: 200,
  },
  description: {
    type: 'string',
    maxLength: 1000,
    default: '',
  },
  date: {
    type: 'string', // ISO date format
    required: true,
  },
};

/**
 * Antwaun Session Schema
 */
export const antwaunSessionSchema = {
  id: {
    type: 'number',
    required: true,
  },
  date: {
    type: 'string', // ISO date format
    required: true,
  },
  lexiaMinutes: {
    type: 'number',
    min: 0,
    max: 180,
    default: 0,
  },
  lexiaCategory: {
    type: 'string',
    maxLength: 100,
    default: '',
  },
  mathMinutes: {
    type: 'number',
    min: 0,
    max: 180,
    default: 0,
  },
  mathFolder: {
    type: 'string',
    maxLength: 100,
    default: '',
  },
  musicMinutes: {
    type: 'number',
    min: 0,
    max: 180,
    default: 0,
  },
  fitnessActivity: {
    type: 'string',
    maxLength: 100,
    default: '',
  },
  fitnessMinutes: {
    type: 'number',
    min: 0,
    max: 180,
    default: 0,
  },
  notes: {
    type: 'string',
    maxLength: 1000,
    default: '',
  },
  badges: {
    type: 'array',
    default: [],
  },
};

/**
 * Music Booking Schema
 */
export const musicBookingSchema = {
  id: {
    type: 'string',
    required: true,
  },
  day: {
    type: 'string',
    required: true,
    validate: (value) => ['tuesday', 'wednesday', 'thursday', 'friday'].includes(value),
  },
  timeSlot: {
    type: 'string',
    required: true,
  },
  confirmed: {
    type: 'boolean',
    default: false,
  },
  notes: {
    type: 'string',
    maxLength: 500,
    default: '',
  },
  week: {
    type: 'string', // ISO week format: YYYY-Www
    required: true,
  },
};

/**
 * Create a typed object from schema
 * @param {Object} schema - Schema definition
 * @param {Object} data - Initial data
 * @returns {Object} Typed object with defaults
 */
export function createFromSchema(schema, data = {}) {
  const result = {};

  for (const [key, rules] of Object.entries(schema)) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    } else if (rules.default !== undefined) {
      result[key] = rules.default;
    } else if (!rules.required) {
      result[key] = null;
    }
  }

  return result;
}

/**
 * Get required fields from schema
 * @param {Object} schema
 * @returns {Array<string>} Required field names
 */
export function getRequiredFields(schema) {
  return Object.entries(schema)
    .filter(([_, rules]) => rules.required)
    .map(([key]) => key);
}

/**
 * Get field defaults from schema
 * @param {Object} schema
 * @returns {Object} Default values
 */
export function getSchemaDefaults(schema) {
  const defaults = {};

  for (const [key, rules] of Object.entries(schema)) {
    if (rules.default !== undefined) {
      defaults[key] = rules.default;
    }
  }

  return defaults;
}
