/**
 * Student Data Import Utility
 * Loads seed data into the application
 */

import { SEED_STUDENTS, TOTAL_STUDENTS, CLASS_ROSTER } from '../data/seedStudents.js';
import { studentRepository } from '../data/StudentRepository.js';
import { logger } from './logger.js';

/**
 * Import all students from seed data
 * @param {boolean} clearExisting - Clear existing students before import
 * @returns {Object} Import results
 */
export function importStudents(clearExisting = false) {
  try {
    logger.info('Starting student data import...');

    // Clear existing data if requested
    if (clearExisting) {
      const existing = studentRepository.getAll();
      logger.warn(`Clearing ${existing.length} existing students...`);
      existing.forEach((student) => {
        studentRepository.delete(student.id);
      });
    }

    // Add timestamp to all students
    const timestamp = new Date().toISOString();
    const studentsToImport = SEED_STUDENTS.map((student) => ({
      ...student,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    // Import students using bulk import
    const result = studentRepository.bulkImport(studentsToImport, !clearExisting);

    logger.success(
      `Successfully imported ${result.added} students, updated ${result.updated}, skipped ${result.skipped}`
    );

    return {
      success: true,
      total: TOTAL_STUDENTS,
      added: result.added,
      updated: result.updated,
      skipped: result.skipped,
      classRoster: CLASS_ROSTER,
    };
  } catch (error) {
    logger.error('Failed to import students', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get import summary
 * @returns {Object} Summary of student data
 */
export function getImportSummary() {
  return {
    totalStudents: TOTAL_STUDENTS,
    byGrade: {
      kindergarten: SEED_STUDENTS.filter((s) => s.grade === 0).length,
      grade1: SEED_STUDENTS.filter((s) => s.grade === 1).length,
      grade2: SEED_STUDENTS.filter((s) => s.grade === 2).length,
      grade3: SEED_STUDENTS.filter((s) => s.grade === 3).length,
      grade4: SEED_STUDENTS.filter((s) => s.grade === 4).length,
      grade5: SEED_STUDENTS.filter((s) => s.grade === 5).length,
      grade6: SEED_STUDENTS.filter((s) => s.grade === 6).length,
      grade7: SEED_STUDENTS.filter((s) => s.grade === 7).length,
      grade8: SEED_STUDENTS.filter((s) => s.grade === 8).length,
    },
    specialAttention: SEED_STUDENTS.filter((s) => s.specialAttention).length,
    withEmail: SEED_STUDENTS.filter((s) => s.parentEmail).length,
    classRoster: CLASS_ROSTER,
  };
}

/**
 * Verify import was successful
 * @returns {boolean} True if import looks good
 */
export function verifyImport() {
  const imported = studentRepository.getAll();
  const expected = SEED_STUDENTS.length;

  if (imported.length !== expected) {
    logger.error(`Import verification failed: Expected ${expected}, got ${imported.length}`);
    return false;
  }

  // Check a few key students
  const antwaun = studentRepository
    .getAll()
    .find((s) => s.name === 'Antwaun Wenjack');
  if (!antwaun || !antwaun.specialAttention) {
    logger.error('Antwaun Wenjack not found or missing special attention flag');
    return false;
  }

  logger.success(`Import verification passed: ${imported.length} students loaded`);
  return true;
}

/**
 * Export current students to JSON
 * @returns {string} JSON string of all students
 */
export function exportStudentsJSON() {
  const students = studentRepository.getAll();
  return JSON.stringify(students, null, 2);
}

/**
 * Create sample schedule data for testing
 * This could be expanded to create realistic schedule entries
 */
export function createSampleSchedule() {
  // TODO: Add sample schedule entries for testing
  logger.info('Sample schedule creation not yet implemented');
}
