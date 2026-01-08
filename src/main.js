/**
 * Mission Control v2.0 - Main Entry Point
 * Initializes application, loads data, sets up routing and state management
 */

import { store } from './core/Store.js';
import { router } from './core/Router.js';
import { logger } from './utils/logger.js';
import {
  loadFromStorage,
  createPersistenceMiddleware,
  needsMigration,
  getStorageVersion,
  setStorageVersion,
} from './core/Storage.js';

// Import repositories
import { studentRepository } from './data/StudentRepository.js';
import { scheduleRepository } from './data/ScheduleRepository.js';
import { antwaunSessionRepository } from './data/AntwaunSessionRepository.js';
import { musicBookingRepository } from './data/MusicBookingRepository.js';

// Import activity libraries
import { FITNESS_ACTIVITIES, COOKING_ACTIVITIES, GAMES_LIBRARY } from './data/activities.js';

// Import student data utilities
import { importStudents, getImportSummary, verifyImport } from './utils/importStudents.js';

// Import components
import { InteractiveCalendar, addInteractiveCalendarStyles } from './components/calendar/InteractiveCalendar.js';
import { StudentList, addStudentListStyles } from './components/students/StudentList.js';
import { AntwaunDashboard, addAntwaunDashboardStyles } from './components/antwaun/AntwaunDashboard.js';
import { QuickPlanner, addQuickPlannerStyles } from './components/planner/QuickPlanner.js';
import { ActivitiesLibrary, addActivitiesLibraryStyles } from './components/activities/ActivitiesLibrary.js';
import { MusicCoordination, addMusicCoordinationStyles } from './components/music/MusicCoordination.js';
import { Arena, addArenaStyles } from './components/arena/Arena.js';
import { addButtonStyles } from './components/shared/Button.js';
import { addCardStyles } from './components/shared/Card.js';
import { addModalStyles } from './components/shared/Modal.js';
import { addValidationStyles } from './utils/validation.js';
import { errorHandler } from './utils/errorHandler.js';
import { initializeAccessibility } from './utils/accessibility.js';

// Component instances
let calendarComponent = null;
let studentListComponent = null;
let antwaunComponent = null;
let plannerComponent = null;
let activitiesComponent = null;
let musicComponent = null;
let arenaComponent = null;

/**
 * Application Configuration
 */
const APP_CONFIG = {
  version: '2.0.0',
  name: 'Mission Control v2.0',
  dataVersion: 2,
  debug: true, // Set to false in production
};

/**
 * Initialize application
 */
async function initializeApp() {
  try {
    logger.info('Initializing Mission Control v2.0...');

    // Initialize logger with notification container
    logger.init('#notification-container');

    // Check for data migration
    if (needsMigration()) {
      await migrateData();
    }

    // Set up state persistence middleware
    setupStatePersistence();

    // Load data from storage into state
    loadInitialData();

    // Initialize router
    initializeRouter();

    // Set up navigation handlers
    setupNavigation();

    // Load activity libraries into state
    loadActivityLibraries();

    // Set up global error handling
    setupErrorHandling();

    // Mark app as ready
    store.set('appReady', true);

    // Initialize accessibility features
    initializeAccessibility();

    logger.success('Application initialized successfully');
    logger.info(`Running version ${APP_CONFIG.version}`);
  } catch (error) {
    logger.error('Failed to initialize application', error);
    showFatalError(error);
  }
}

/**
 * Migrate data from previous versions
 */
async function migrateData() {
  logger.info('Migrating data...');

  try {
    const currentVersion = getStorageVersion();
    logger.info(`Migrating from version ${currentVersion} to ${APP_CONFIG.dataVersion}`);

    // Add migration logic here as needed
    // For now, just update version
    setStorageVersion(APP_CONFIG.dataVersion);

    logger.success('Data migration completed');
  } catch (error) {
    logger.error('Data migration failed', error);
    throw error;
  }
}

/**
 * Set up state persistence
 */
function setupStatePersistence() {
  // Keys that should be persisted to localStorage
  const persistKeys = ['students', 'schedules', 'antwaunSessions', 'musicBookings', 'preferences'];

  // Add persistence middleware
  const persistenceMiddleware = createPersistenceMiddleware(persistKeys);
  store.use(persistenceMiddleware);

  logger.info('State persistence configured');
}

/**
 * Load initial data from storage
 */
function loadInitialData() {
  logger.info('Loading data from storage...');

  try {
    // Load students
    let students = studentRepository.getAll();

    // Auto-import seed data on first launch if no students exist
    if (students.length === 0) {
      logger.info('No students found - importing seed data...');
      const importResult = importStudents(false);
      if (importResult.success) {
        students = studentRepository.getAll();
        logger.success(`Auto-imported ${students.length} students on first launch!`);
      }
    }

    store.set('students', students, { silent: true });
    logger.info(`Loaded ${students.length} students`);

    // Load schedules
    const schedules = scheduleRepository.getAll();
    store.set('schedules', schedules, { silent: true });
    logger.info(`Loaded ${schedules.length} schedule activities`);

    // Load Antwaun sessions
    const sessions = antwaunSessionRepository.getAll();
    store.set('antwaunSessions', sessions, { silent: true });
    logger.info(`Loaded ${sessions.length} Antwaun sessions`);

    // Load music bookings
    const bookings = musicBookingRepository.getAll();
    store.set('musicBookings', bookings, { silent: true });
    logger.info(`Loaded ${bookings.length} music bookings`);

    // Load user preferences
    const preferences = loadFromStorage('preferences', {
      theme: 'dark',
      notifications: true,
    });
    store.set('preferences', preferences, { silent: true });

    logger.info('All data loaded successfully');
  } catch (error) {
    logger.error('Failed to load data', error);
    throw error;
  }
}

/**
 * Load activity libraries into state
 */
function loadActivityLibraries() {
  store.set('fitnessActivities', FITNESS_ACTIVITIES, { silent: true });
  store.set('cookingActivities', COOKING_ACTIVITIES, { silent: true });
  store.set('gamesLibrary', GAMES_LIBRARY, { silent: true });

  logger.info(
    `Loaded ${FITNESS_ACTIVITIES.length} fitness, ${COOKING_ACTIVITIES.length} cooking, ${GAMES_LIBRARY.length} games`
  );
}

/**
 * Initialize router with routes
 */
function initializeRouter() {
  // Inject component styles
  addButtonStyles();
  addCardStyles();
  addModalStyles();
  addValidationStyles();
  addInteractiveCalendarStyles();
  addStudentListStyles();
  addAntwaunDashboardStyles();
  addQuickPlannerStyles();
  addActivitiesLibraryStyles();
  addMusicCoordinationStyles();
  addArenaStyles();

  // Register routes
  router
    .register('calendar', {
      onEnter: async () => {
        logger.info('Navigating to Calendar');
        const container = document.querySelector('#calendar-section .card');
        if (container) {
          if (!calendarComponent) {
            calendarComponent = new InteractiveCalendar(container, { store });
          }
          calendarComponent.render();
        }
      },
      onLeave: async () => {
        // Component cleanup handled automatically
      },
    })
    .register('students', {
      onEnter: async () => {
        logger.info('Navigating to Students');
        const container = document.querySelector('#students-section .card');
        if (container) {
          if (!studentListComponent) {
            studentListComponent = new StudentList(container, { store });
          }
          studentListComponent.render();
        }
      },
    })
    .register('antwaun', {
      onEnter: async () => {
        logger.info('Navigating to Antwaun Dashboard');
        const container = document.querySelector('#antwaun-section .card');
        if (container) {
          if (!antwaunComponent) {
            antwaunComponent = new AntwaunDashboard(container, { store });
          }
          antwaunComponent.render();
        }
      },
    })
    .register('planner', {
      onEnter: async () => {
        logger.info('Navigating to Quick Planner');
        const container = document.querySelector('#planner-section .card');
        if (container) {
          if (!plannerComponent) {
            plannerComponent = new QuickPlanner(container, { store });
          }
          plannerComponent.render();
        }
      },
    })
    .register('activities', {
      onEnter: async () => {
        logger.info('Navigating to Activities Library');
        const container = document.querySelector('#activities-section .card');
        if (container) {
          if (!activitiesComponent) {
            activitiesComponent = new ActivitiesLibrary(container, { store });
          }
          activitiesComponent.render();
        }
      },
    })
    .register('music', {
      onEnter: async () => {
        logger.info('Navigating to Music Coordination');
        const container = document.querySelector('#music-section .card');
        if (container) {
          if (!musicComponent) {
            musicComponent = new MusicCoordination(container, { store });
          }
          musicComponent.render();
        }
      },
    })
    .register('arena', {
      onEnter: async () => {
        logger.info('Navigating to Arena');
        const container = document.querySelector('#arena-section .card');
        if (container) {
          if (!arenaComponent) {
            arenaComponent = new Arena(container, { store });
          }
          arenaComponent.render();
        }
      },
    });

  // Add before/after change hooks
  router.beforeChange((from, to) => {
    logger.info(`Navigating from ${from} to ${to}`);
    return true; // Allow navigation
  });

  router.afterChange((from, to) => {
    // Update page title
    const titles = {
      calendar: 'Daily Calendar',
      students: 'Student Database',
      antwaun: "Antwaun's Dashboard",
      planner: 'Quick Planner',
      activities: 'Activities Library',
      music: 'Music Coordination',
      arena: 'Arena - Hockey & Skating',
    };

    document.title = `${titles[to] || 'Mission Control'} - Mission Control v2.0`;
  });

  // Initialize router
  router.init();

  logger.info('Router initialized');
}

/**
 * Set up navigation click handlers
 */
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const route = tab.dataset.tab;
      router.navigate(route);
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const route = tab.dataset.tab;
        router.navigate(route);
      }

      // Arrow key navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = Array.from(tabs).indexOf(tab);
        let nextIndex;

        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }

        tabs[nextIndex].focus();
      }
    });
  });

  logger.info('Navigation handlers set up');
}

/**
 * Set up global error handling
 */
function setupErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason);
    event.preventDefault();
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    logger.error('Global error', event.error);
  });

  // Handle storage quota exceeded
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      logger.warn('Storage was cleared');
    }
  });

  logger.info('Error handling configured');
}

/**
 * Show fatal error screen
 */
function showFatalError(error) {
  const appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem;">
        <h2 style="color: var(--alert); margin-bottom: 1rem;">⚠️ Application Error</h2>
        <p style="color: var(--gray-soft); margin-bottom: 2rem;">
          Mission Control encountered an error and cannot start.
        </p>
        <details style="text-align: left; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px;">
          <summary style="cursor: pointer; margin-bottom: 0.5rem;">Error Details</summary>
          <pre style="font-family: monospace; font-size: 0.85rem; overflow-x: auto;">${error.message}\n\n${error.stack}</pre>
        </details>
        <button
          onclick="location.reload()"
          style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: var(--amber-warm); color: var(--navy-deep); border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Reload Application
        </button>
      </div>
    `;
  }
}

/**
 * Export global app instance for debugging
 */
if (APP_CONFIG.debug) {
  window.MissionControl = {
    store,
    router,
    logger,
    repositories: {
      students: studentRepository,
      schedules: scheduleRepository,
      sessions: antwaunSessionRepository,
      music: musicBookingRepository,
    },
    utils: {
      importStudents,
      getImportSummary,
      verifyImport,
    },
    version: APP_CONFIG.version,
  };

  console.log('🚀 Mission Control v2.0 Debug Mode');
  console.log('Access app via window.MissionControl');
  console.log('');
  console.log('📚 To import student data:');
  console.log('  MissionControl.utils.importStudents()');
  console.log('  MissionControl.utils.getImportSummary()');
  console.log('  MissionControl.utils.verifyImport()');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for testing
export { initializeApp, APP_CONFIG };
