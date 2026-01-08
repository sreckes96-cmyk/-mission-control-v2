# Mission Control v2.0 - Technical Architecture

## Executive Summary

This document details the technical architecture for transforming Mission Control v2.0 from a functional single-file application into a world-class, maintainable, performant web application - while preserving its offline-first, single-file deployment model.

## Current State Analysis

### Strengths
✅ **Functional & Complete:** All core features work reliably
✅ **Offline-First:** Single HTML file, no external dependencies
✅ **Well-Designed:** Clean UI, thoughtful UX, good color system
✅ **Purposeful:** Built for real users with real needs
✅ **Comprehensive:** 100+ activities, full student management, tracking system

### Technical Debt
⚠️ **Monolithic Structure:** 2979 lines in one file
⚠️ **Global State:** Variables scattered across closure
⚠️ **String-Based DOM:** Template strings without sanitization
⚠️ **No Error Handling:** Silent failures possible
⚠️ **No Testing:** Changes risk breaking features
⚠️ **Accessibility Gaps:** Limited keyboard nav, no ARIA
⚠️ **Performance:** Re-renders entire sections unnecessarily

## Target Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mission Control v2.0                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   UI Layer   │  │  Core Layer  │  │  Data Layer  │    │
│  │              │  │              │  │              │    │
│  │ Components   │→ │    Store     │→ │  Repository  │    │
│  │ Rendering    │  │    Events    │  │  localStorage│    │
│  │ Interactions │  │    Router    │  │  Validation  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                                │
│                   ┌────────▼─────────┐                     │
│                   │  Build System    │                     │
│                   │  (Vite + Rollup) │                     │
│                   └──────────────────┘                     │
│                            │                                │
│                   ┌────────▼─────────┐                     │
│                   │ mission-control- │                     │
│                   │     v2.html      │                     │
│                   │  (Single File)   │                     │
│                   └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. State Management

**Problem:** Current app has scattered state across multiple closures and global variables.

**Solution:** Centralized reactive state store with pub/sub pattern.

#### Implementation

```javascript
// src/core/store.js

class Store {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.middleware = [];
  }

  /**
   * Get current state value
   * @param {string} key - State key
   * @returns {any} State value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set state value and notify subscribers
   * @param {string} key - State key
   * @param {any} value - New value
   */
  set(key, value) {
    const oldValue = this.state[key];

    // Run middleware (validation, logging, etc.)
    for (const mw of this.middleware) {
      value = mw(key, value, oldValue);
    }

    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Called when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers of state change
   */
  notify(key, newValue, oldValue) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => {
        callback(newValue, oldValue);
      });
    }
  }

  /**
   * Add middleware function
   */
  use(middleware) {
    this.middleware.push(middleware);
  }
}

// Singleton instance
export const store = new Store();

// Add persistence middleware
store.use((key, value, oldValue) => {
  if (shouldPersist(key)) {
    localStorage.setItem(`mc_${key}`, JSON.stringify(value));
  }
  return value;
});
```

#### Usage

```javascript
// Component subscribes to students
store.subscribe('students', (students) => {
  renderStudentList(students);
});

// Update students
store.set('students', [...students, newStudent]);
// → Triggers re-render automatically
```

**Benefits:**
- Single source of truth
- Predictable state updates
- Easy debugging (middleware can log all changes)
- Automatic persistence
- Testable in isolation

---

### 2. Component System

**Problem:** DOM manipulation scattered throughout, making it hard to maintain and test.

**Solution:** Component-based architecture with lifecycle hooks.

#### Base Component

```javascript
// src/core/Component.js

export class Component {
  constructor(container, props = {}) {
    this.container = container;
    this.props = props;
    this.state = {};
    this.mounted = false;
  }

  /**
   * Override to define component template
   * @returns {string} HTML template
   */
  template() {
    return '';
  }

  /**
   * Override to attach event listeners
   */
  attachEvents() {}

  /**
   * Override to clean up on unmount
   */
  cleanup() {}

  /**
   * Render component
   */
  render() {
    if (!this.container) return;

    const html = this.template();
    this.container.innerHTML = html;
    this.attachEvents();

    if (!this.mounted) {
      this.mounted = true;
      this.onMount();
    }
  }

  /**
   * Update component with new props
   */
  update(newProps = {}) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  /**
   * Remove component
   */
  destroy() {
    this.cleanup();
    this.container.innerHTML = '';
    this.mounted = false;
  }

  /**
   * Lifecycle: called after first render
   */
  onMount() {}
}
```

#### Example Component

```javascript
// src/components/students/StudentCard.js

import { Component } from '../../core/Component.js';
import { sanitize } from '../../utils/validators.js';

export class StudentCard extends Component {
  template() {
    const { student } = this.props;

    return `
      <div class="contact-card" data-student-id="${student.id}">
        <div class="contact-card-header">
          <div>
            <div class="contact-name">${sanitize(student.name)}</div>
            <div class="contact-grade">Grade ${student.grade}</div>
          </div>
          <div class="contact-actions">
            <button class="btn-small btn-secondary edit-btn" aria-label="Edit ${sanitize(student.name)}">
              ✏️ Edit
            </button>
            <button class="btn-small btn-secondary delete-btn" aria-label="Delete ${sanitize(student.name)}">
              🗑️ Delete
            </button>
          </div>
        </div>
        <div class="contact-info-grid">
          <div class="contact-info-row">
            <span class="contact-info-label">Parent:</span>
            <span class="contact-info-value">${sanitize(student.parentName)}</span>
          </div>
          <div class="contact-info-row">
            <span class="contact-info-label">Phone:</span>
            <span class="contact-info-value">${sanitize(student.parentPhone)}</span>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const card = this.container.querySelector('[data-student-id]');

    card.querySelector('.edit-btn').addEventListener('click', () => {
      this.props.onEdit(this.props.student.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', () => {
      this.props.onDelete(this.props.student.id);
    });
  }

  cleanup() {
    // Remove event listeners if needed
  }
}
```

**Benefits:**
- Reusable, testable components
- Clear lifecycle management
- Proper event cleanup (no memory leaks)
- Type-safe with JSDoc

---

### 3. Data Layer

**Problem:** Direct localStorage access throughout code, no validation, no abstraction.

**Solution:** Repository pattern with validation and migration support.

#### Base Repository

```javascript
// src/core/Repository.js

export class Repository {
  constructor(storageKey, schema) {
    this.storageKey = storageKey;
    this.schema = schema;
  }

  /**
   * Get all items
   * @returns {Array} All items
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const items = JSON.parse(data);
      return this.validate(items);
    } catch (error) {
      logger.error(`Failed to load ${this.storageKey}`, error);
      return [];
    }
  }

  /**
   * Get single item by ID
   * @param {number|string} id
   * @returns {Object|null}
   */
  getById(id) {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  /**
   * Save items
   * @param {Array} items
   */
  save(items) {
    try {
      const validated = this.validate(items);
      localStorage.setItem(this.storageKey, JSON.stringify(validated));
      return true;
    } catch (error) {
      logger.error(`Failed to save ${this.storageKey}`, error);
      return false;
    }
  }

  /**
   * Add single item
   * @param {Object} item
   */
  add(item) {
    const items = this.getAll();
    const validated = this.validateItem(item);
    items.push(validated);
    return this.save(items);
  }

  /**
   * Update single item
   * @param {number|string} id
   * @param {Object} updates
   */
  update(id, updates) {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Item ${id} not found`);
    }

    items[index] = { ...items[index], ...updates };
    return this.save(items);
  }

  /**
   * Delete item
   * @param {number|string} id
   */
  delete(id) {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    return this.save(filtered);
  }

  /**
   * Validate array of items against schema
   */
  validate(items) {
    if (!Array.isArray(items)) {
      throw new Error('Data must be an array');
    }
    return items.map(item => this.validateItem(item));
  }

  /**
   * Validate single item against schema
   */
  validateItem(item) {
    if (!this.schema) return item;

    const validated = {};

    for (const [key, rules] of Object.entries(this.schema)) {
      const value = item[key];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        throw new Error(`${key} is required`);
      }

      // Type check
      if (value !== undefined && rules.type && typeof value !== rules.type) {
        throw new Error(`${key} must be ${rules.type}`);
      }

      // String length
      if (rules.maxLength && value && value.length > rules.maxLength) {
        throw new Error(`${key} exceeds max length of ${rules.maxLength}`);
      }

      // Number range
      if (rules.min !== undefined && value < rules.min) {
        throw new Error(`${key} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        throw new Error(`${key} must be at most ${rules.max}`);
      }

      validated[key] = value;
    }

    return validated;
  }

  /**
   * Export data
   * @returns {string} JSON string
   */
  export() {
    const items = this.getAll();
    return JSON.stringify(items, null, 2);
  }

  /**
   * Import data
   * @param {string} jsonString
   */
  import(jsonString) {
    try {
      const items = JSON.parse(jsonString);
      const validated = this.validate(items);
      return this.save(validated);
    } catch (error) {
      logger.error('Import failed', error);
      throw new Error('Invalid import data: ' + error.message);
    }
  }

  /**
   * Clear all data
   */
  clear() {
    localStorage.removeItem(this.storageKey);
  }
}
```

#### Student Repository

```javascript
// src/data/StudentRepository.js

import { Repository } from '../core/Repository.js';

const studentSchema = {
  id: { type: 'number', required: true },
  name: { type: 'string', required: true, maxLength: 100 },
  grade: { type: 'number', required: true, min: 1, max: 12 },
  age: { type: 'number', min: 5, max: 18 },
  parentName: { type: 'string', required: true, maxLength: 100 },
  parentPhone: { type: 'string', required: true },
  parentEmail: { type: 'string', maxLength: 200 },
  parentFacebook: { type: 'string', maxLength: 200 },
  specialAttention: { type: 'boolean' },
  interests: { type: 'string', maxLength: 500 },
  triggerNotes: { type: 'string', maxLength: 500 },
  strategies: { type: 'string', maxLength: 500 },
  medical: { type: 'string', maxLength: 500 },
  notes: { type: 'string', maxLength: 1000 }
};

export const studentRepository = new Repository('missionControl_v2_students', studentSchema);
```

**Benefits:**
- Data validation at storage boundary
- Easy to test
- Swap storage backend without changing app code
- Export/import built-in
- Type-safe operations

---

### 4. Router System

**Problem:** Manual tab switching with scattered state.

**Solution:** Hash-based router with lifecycle hooks.

```javascript
// src/core/Router.js

export class Router {
  constructor() {
    this.routes = new Map();
    this.current = null;
    this.beforeChange = [];

    window.addEventListener('hashchange', () => this.navigate());
  }

  /**
   * Register route
   */
  register(path, component) {
    this.routes.set(path, component);
  }

  /**
   * Navigate to route
   */
  navigate(path) {
    if (path) {
      window.location.hash = path;
      return;
    }

    const hash = window.location.hash.slice(1) || 'calendar';

    // Run beforeChange hooks
    for (const hook of this.beforeChange) {
      if (hook(this.current, hash) === false) {
        return; // Navigation cancelled
      }
    }

    // Cleanup current route
    if (this.current && this.routes.get(this.current)) {
      const currentComponent = this.routes.get(this.current);
      if (currentComponent.onLeave) {
        currentComponent.onLeave();
      }
    }

    // Activate new route
    if (this.routes.has(hash)) {
      this.current = hash;
      const component = this.routes.get(hash);

      if (component.onEnter) {
        component.onEnter();
      }

      this.updateUI(hash);
    }
  }

  /**
   * Update UI for active route
   */
  updateUI(hash) {
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === hash);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.toggle('active', section.id === `${hash}-section`);
    });
  }

  /**
   * Add beforeChange hook
   */
  onBeforeChange(callback) {
    this.beforeChange.push(callback);
  }
}

export const router = new Router();
```

**Benefits:**
- Proper cleanup on route change
- URL reflects current state
- Hooks for validation (unsaved changes warning)
- Lazy load route content

---

### 5. Error Handling & Logging

**Problem:** Silent failures, hard to debug issues.

**Solution:** Centralized error handling with user-friendly messages.

```javascript
// src/utils/logger.js

class Logger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  error(message, error) {
    console.error(message, error);

    this.errors.push({
      timestamp: new Date(),
      message,
      error: error ? error.message : null,
      stack: error ? error.stack : null
    });

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Show user-friendly notification
    this.showNotification('error', this.getUserMessage(message));
  }

  warn(message) {
    console.warn(message);
  }

  info(message) {
    console.info(message);
  }

  getUserMessage(technicalMessage) {
    // Map technical errors to user-friendly messages
    const messages = {
      'Failed to save': 'Could not save your changes. Please try again.',
      'Failed to load': 'Could not load data. Your information might be temporarily unavailable.',
      'Validation error': 'Please check your input and try again.'
    };

    for (const [key, userMsg] of Object.entries(messages)) {
      if (technicalMessage.includes(key)) {
        return userMsg;
      }
    }

    return 'Something went wrong. Your data is safe.';
  }

  showNotification(type, message) {
    // Implementation: toast notification system
  }

  exportLogs() {
    return JSON.stringify(this.errors, null, 2);
  }
}

export const logger = new Logger();
```

---

### 6. Performance Optimizations

#### Virtual Scrolling

```javascript
// src/utils/VirtualScroller.js

export class VirtualScroller {
  constructor(container, items, renderItem, itemHeight = 80) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = itemHeight;

    this.visibleStart = 0;
    this.visibleEnd = 0;

    this.init();
  }

  init() {
    this.containerHeight = this.container.clientHeight;
    this.visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + 2;

    this.container.addEventListener('scroll', () => this.onScroll());
    this.render();
  }

  onScroll() {
    const scrollTop = this.container.scrollTop;
    const newStart = Math.floor(scrollTop / this.itemHeight);

    if (newStart !== this.visibleStart) {
      this.visibleStart = newStart;
      this.render();
    }
  }

  render() {
    this.visibleEnd = Math.min(
      this.visibleStart + this.visibleCount,
      this.items.length
    );

    const visible = this.items.slice(this.visibleStart, this.visibleEnd);

    const offsetY = this.visibleStart * this.itemHeight;
    const totalHeight = this.items.length * this.itemHeight;

    this.container.innerHTML = `
      <div style="height: ${totalHeight}px; position: relative;">
        <div style="transform: translateY(${offsetY}px);">
          ${visible.map(item => this.renderItem(item)).join('')}
        </div>
      </div>
    `;
  }
}
```

#### Debounced Updates

```javascript
// src/utils/helpers.js

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const saveSchedule = debounce((schedule) => {
  scheduleRepository.save(schedule);
}, 500);
```

---

## Build System

### Vite Configuration

```javascript
// vite.config.js

import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true
    })
  ],
  build: {
    target: 'es2020',
    outDir: 'build',
    assetsInlineLimit: 100000000, // Inline everything
    rollupOptions: {
      output: {
        entryFileNames: 'mission-control-v2.html',
        inlineDynamicImports: true
      }
    }
  }
});
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

---

## Migration Strategy

### Phase 1: Foundation
1. Set up build system
2. Create file structure
3. Implement core systems (Store, Component, Repository)
4. Add testing infrastructure

### Phase 2: Component Migration
1. Extract calendar component
2. Extract student components
3. Extract Antwaun dashboard
4. Extract planner
5. Extract activities library

### Phase 3: Enhancement
1. Add data export/import
2. Implement accessibility improvements
3. Add keyboard navigation
4. Performance optimizations

### Phase 4: Modern Features
1. Service Worker
2. PWA manifest
3. Web Share API
4. Advanced features

### Backward Compatibility

All localStorage keys remain the same. Data structures are backward-compatible with v1 format.

```javascript
// src/data/migrations.js

export function migrateData() {
  const version = localStorage.getItem('mc_version') || '1';

  if (version === '1') {
    // Migrate v1 to v2
    migrateV1ToV2();
    localStorage.setItem('mc_version', '2');
  }
}

function migrateV1ToV2() {
  // Add any new required fields with defaults
  const students = JSON.parse(localStorage.getItem('missionControl_v2_students') || '[]');

  students.forEach(student => {
    if (!student.id) {
      student.id = Date.now() + Math.random();
    }
  });

  localStorage.setItem('missionControl_v2_students', JSON.stringify(students));
}
```

---

## Testing Strategy

### Unit Tests

```javascript
// tests/unit/StudentRepository.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { studentRepository } from '../../src/data/StudentRepository';

describe('StudentRepository', () => {
  beforeEach(() => {
    studentRepository.clear();
  });

  it('should add a student', () => {
    const student = {
      id: 1,
      name: 'Test Student',
      grade: 8,
      parentName: 'Test Parent',
      parentPhone: '555-1234'
    };

    studentRepository.add(student);
    const students = studentRepository.getAll();

    expect(students).toHaveLength(1);
    expect(students[0].name).toBe('Test Student');
  });

  it('should validate required fields', () => {
    const invalid = { name: 'Test' }; // Missing required fields

    expect(() => {
      studentRepository.add(invalid);
    }).toThrow();
  });
});
```

### Integration Tests

```javascript
// tests/integration/calendar.test.js

import { describe, it, expect } from 'vitest';
import { CalendarComponent } from '../../src/components/calendar/Calendar';
import { store } from '../../src/core/store';

describe('Calendar Integration', () => {
  it('should save schedule to store', () => {
    const calendar = new CalendarComponent(document.body);

    calendar.addActivity('09:00', {
      category: 'fitness',
      name: 'Jumping Jacks',
      description: 'Morning warmup'
    });

    const schedule = store.get('schedule');
    expect(schedule['09:00']).toBeDefined();
  });
});
```

---

## Accessibility Implementation

### Keyboard Navigation

```javascript
// src/utils/keyboard.js

export class KeyboardNav {
  constructor() {
    this.shortcuts = new Map();
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e);

      if (this.shortcuts.has(key)) {
        e.preventDefault();
        this.shortcuts.get(key)();
      }
    });
  }

  getKeyCombo(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }

  register(combo, callback) {
    this.shortcuts.set(combo, callback);
  }
}

// Usage
const keyboard = new KeyboardNav();
keyboard.register('ctrl+n', () => openNewStudentModal());
keyboard.register('ctrl+s', () => saveCurrentWork());
keyboard.register('ctrl+/', () => showKeyboardHelp());
```

### ARIA Labels

```javascript
// Component templates include proper ARIA
template() {
  return `
    <button
      class="btn-primary"
      aria-label="Add new student"
      aria-describedby="help-add-student"
    >
      Add Student
    </button>
    <span id="help-add-student" class="sr-only">
      Opens a form to add a new student to the database
    </span>
  `;
}
```

---

## Performance Targets

### Metrics
- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s
- **Lighthouse Score:** 95+
- **Bundle Size:** < 200KB gzipped

### Monitoring

```javascript
// src/utils/performance.js

export function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 100) {
    logger.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
}

// Usage
measurePerformance('renderStudentList', () => {
  studentList.render();
});
```

---

## Security Considerations

### Input Sanitization

```javascript
// src/utils/validators.js

export function sanitize(input) {
  if (typeof input !== 'string') return input;

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;">
```

---

## Deployment

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build
# → Outputs to build/mission-control-v2.html

# Test production build
npm run preview
```

### Quality Checks

```bash
# Before commit
npm run lint
npm run test
npm run build
```

---

## Success Criteria

### Technical
- ✅ All tests passing (>80% coverage)
- ✅ Lighthouse score 95+
- ✅ Zero console errors
- ✅ WCAG 2.1 AA compliant

### Functional
- ✅ All existing features work
- ✅ Data migrates from v1 successfully
- ✅ Export/import functionality works
- ✅ Keyboard navigation complete

### User Experience
- ✅ Faster than current version
- ✅ More accessible
- ✅ Better error messages
- ✅ No data loss

---

## Conclusion

This architecture transforms Mission Control v2.0 into a maintainable, scalable, performant application while preserving what makes it special: offline-first simplicity and purpose-driven design.

Every decision serves the mission: empowering youth workers to spend less time on admin and more time with youth.

**Next Steps:** Begin Phase 1 implementation.
