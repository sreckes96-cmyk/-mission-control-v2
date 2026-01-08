/**
 * Student Repository
 * Manages student data with validation and CRUD operations
 */

import { Repository } from '../core/Repository.js';
import { studentSchema } from './schemas.js';

class StudentRepository extends Repository {
  constructor() {
    super('students', studentSchema);
  }

  /**
   * Find students by grade
   * @param {number} grade - Grade level
   * @returns {Array} Students in that grade
   */
  findByGrade(grade) {
    return this.find((student) => student.grade === grade);
  }

  /**
   * Find students needing special attention
   * @returns {Array} Students with special attention flag
   */
  findSpecialAttention() {
    return this.find((student) => student.specialAttention === true);
  }

  /**
   * Search students by name
   * @param {string} query - Search query
   * @returns {Array} Matching students
   */
  searchByName(query) {
    const lowerQuery = query.toLowerCase();
    return this.find((student) => student.name.toLowerCase().includes(lowerQuery));
  }

  /**
   * Find students by age range
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @returns {Array} Students in age range
   */
  findByAgeRange(minAge, maxAge) {
    return this.find((student) => student.age >= minAge && student.age <= maxAge);
  }

  /**
   * Get students sorted by name
   * @returns {Array} Sorted students
   */
  getAllSorted() {
    const students = this.getAll();
    return students.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get students grouped by grade
   * @returns {Object} Students grouped by grade
   */
  getByGrade() {
    const students = this.getAll();
    const grouped = {};

    students.forEach((student) => {
      if (!grouped[student.grade]) {
        grouped[student.grade] = [];
      }
      grouped[student.grade].push(student);
    });

    return grouped;
  }

  /**
   * Bulk import students
   * @param {Array} students - Students to import
   * @param {boolean} merge - Merge with existing or replace
   * @returns {boolean} Success status
   */
  bulkImport(students, merge = true) {
    try {
      // Validate all students
      const validated = students.map((student, index) => {
        try {
          return this.validate(student);
        } catch (error) {
          throw new Error(`Student ${index + 1} validation failed: ${error.message}`);
        }
      });

      // Assign IDs if missing
      const existing = merge ? this.getAll() : [];
      let maxId = existing.length > 0 ? Math.max(...existing.map((s) => s.id)) : 0;

      validated.forEach((student) => {
        if (!student.id) {
          maxId++;
          student.id = maxId;
        }
      });

      // Save
      const combined = merge ? [...existing, ...validated] : validated;
      return this.save(combined);
    } catch (error) {
      console.error('Bulk import failed:', error);
      throw error;
    }
  }

  /**
   * Get student statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const students = this.getAll();

    return {
      total: students.length,
      byGrade: this.getByGrade(),
      specialAttention: this.findSpecialAttention().length,
      averageAge: students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length || 0,
      withEmail: students.filter((s) => s.parentEmail).length,
      withFacebook: students.filter((s) => s.parentFacebook).length,
    };
  }
}

// Export singleton
export const studentRepository = new StudentRepository();
