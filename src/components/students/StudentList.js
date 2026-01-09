/**
 * Student List Component
 * Displays list of students with search and filtering by grade groups
 */

import { Component } from '../../core/Component.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { logger } from '../../utils/logger.js';
import { sanitize } from '../../utils/validators.js';
import { debounce } from '../../utils/helpers.js';
import { StudentProfileModal } from './StudentProfileModal.js';

export class StudentList extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      students: [],
      filteredStudents: [],
      searchQuery: '',
      filterGradeGroup: 'all',
      sortBy: 'name',
    };

    // Debounced search
    this.debouncedSearch = debounce((query) => this.performSearch(query), 300);
    this.profileModal = null;
  }

  /**
   * Grade groups for filtering
   */
  getGradeGroups() {
    return [
      { id: 'all', label: 'All Students', grades: [] },
      { id: 'kindergarten', label: 'Kindergarten', grades: [0] },
      { id: 'grade-1-2', label: 'Grade 1-2', grades: [1, 2] },
      { id: 'grade-3-4', label: 'Grade 3-4', grades: [3, 4] },
      { id: 'grade-5-6', label: 'Grade 5-6', grades: [5, 6] },
      { id: 'grade-7-8', label: 'Grade 7-8', grades: [7, 8] },
    ];
  }

  /**
   * Component template
   */
  template() {
    const { filteredStudents, searchQuery, filterGradeGroup } = this.state;
    const gradeGroups = this.getGradeGroups();

    return `
      <div class="student-list-view">
        <div class="student-list-header">
          <h2 class="section-title">Student Database</h2>
          <div class="student-list-controls">
            <input
              type="text"
              id="student-search"
              class="input-field search-input"
              placeholder="🔍 Search by name..."
              value="${sanitize(searchQuery)}"
              aria-label="Search students"
            />
            <div class="grade-group-filters">
              ${gradeGroups.map(group => `
                <button
                  class="grade-filter-btn ${filterGradeGroup === group.id ? 'active' : ''}"
                  data-group-id="${group.id}">
                  ${group.label}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="student-count">
            <strong>${filteredStudents.length}</strong> ${filteredStudents.length === 1 ? 'student' : 'students'}
          </div>
        </div>

        <div class="student-grid">
          ${filteredStudents.length > 0
            ? filteredStudents.map((student) => this.renderStudentCard(student)).join('')
            : this.renderEmptyState()}
        </div>

        <div id="profile-modal-container"></div>
      </div>
    `;
  }

  /**
   * Render individual student card (clickable)
   */
  renderStudentCard(student) {
    const gradeDisplay = student.grade === 0 ? 'Kindergarten' : `Grade ${student.grade}`;

    return `
      <div class="student-card ${student.specialAttention ? 'special-attention' : ''}"
           data-student-id="${student.id}"
           role="button"
           tabindex="0"
           aria-label="View ${student.name}'s profile">
        <div class="student-card-header">
          <div class="student-avatar">
            ${student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div class="student-header-info">
            <div class="student-name">${sanitize(student.name)}</div>
            <div class="student-grade">${gradeDisplay}${student.age ? ` • ${student.age} years` : ''}</div>
          </div>
          ${student.specialAttention ? '<span class="special-badge">⚠️</span>' : ''}
        </div>

        <div class="student-info">
          ${student.parentName ? `
            <div class="student-info-row">
              <span class="info-icon">👨‍👩‍👧</span>
              <span class="student-info-value">${sanitize(student.parentName)}</span>
            </div>
          ` : ''}
          ${student.parentPhone ? `
            <div class="student-info-row">
              <span class="info-icon">📞</span>
              <span class="student-info-value">${sanitize(student.parentPhone)}</span>
            </div>
          ` : ''}
        </div>

        <div class="click-hint">Click to view profile →</div>
      </div>
    `;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    const { searchQuery, filterGradeGroup } = this.state;

    if (searchQuery || filterGradeGroup !== 'all') {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No students found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      `;
    }

    return `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <h3>No students yet</h3>
        <p>Your student database is empty</p>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEvents() {
    // Search input
    const searchInput = this.$('#student-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setState({ searchQuery: e.target.value });
        this.debouncedSearch(e.target.value);
      });
    }

    // Grade group filter buttons
    const filterButtons = this.$$('.grade-filter-btn');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const groupId = btn.dataset.groupId;
        this.setState({ filterGradeGroup: groupId });
        this.filterStudents();
      });
    });

    // Student card clicks - open profile modal
    const studentCards = this.$$('.student-card');
    studentCards.forEach((card) => {
      const studentId = parseInt(card.dataset.studentId);

      // Click event
      card.addEventListener('click', () => {
        this.openStudentProfile(studentId);
      });

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openStudentProfile(studentId);
        }
      });
    });
  }

  /**
   * Open student profile modal
   */
  openStudentProfile(studentId) {
    const student = studentRepository.getById(studentId);
    if (!student) {
      logger.error(`Student with ID ${studentId} not found`);
      return;
    }

    logger.info(`Opening profile for: ${student.name}`);

    const modalContainer = this.$('#profile-modal-container');
    if (!modalContainer) {
      logger.error('Modal container not found');
      return;
    }

    // Clean up existing modal if any
    if (this.profileModal) {
      this.profileModal.destroy();
      this.profileModal = null;
    }

    // Create and mount profile modal
    this.profileModal = new StudentProfileModal(modalContainer, {
      student,
      isEditing: false, // Always start in view mode
      onClose: () => this.closeProfileModal(),
      onSave: (updatedStudent) => this.handleSaveStudent(updatedStudent),
    });

    this.profileModal.render();
  }

  /**
   * Close profile modal
   */
  closeProfileModal() {
    if (this.profileModal) {
      this.profileModal.destroy();
      this.profileModal = null;
    }
    const modalContainer = this.$('#profile-modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }
  }

  /**
   * Handle save student
   */
  handleSaveStudent(updatedStudent) {
    try {
      studentRepository.update(updatedStudent.id, updatedStudent);
      logger.success(`Updated ${updatedStudent.name}`);
      this.loadStudents();
      this.closeProfileModal();
    } catch (error) {
      logger.error('Failed to save student', error);
    }
  }

  /**
   * Load students from repository
   */
  loadStudents() {
    try {
      const students = studentRepository.getAllSorted();
      this.setState({ students });
      this.filterStudents();
      logger.info(`Loaded ${students.length} students`);
    } catch (error) {
      logger.error('Failed to load students', error);
    }
  }

  /**
   * Perform search
   */
  performSearch(query) {
    this.filterStudents();
  }

  /**
   * Filter students based on search and grade group
   */
  filterStudents() {
    let { students, searchQuery, filterGradeGroup } = this.state;
    let filtered = [...students];

    // Apply grade group filter
    if (filterGradeGroup !== 'all') {
      const gradeGroups = this.getGradeGroups();
      const selectedGroup = gradeGroups.find(g => g.id === filterGradeGroup);
      if (selectedGroup && selectedGroup.grades.length > 0) {
        filtered = filtered.filter((s) => selectedGroup.grades.includes(s.grade));
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.parentName && s.parentName.toLowerCase().includes(query))
      );
    }

    this.setState({ filteredStudents: filtered });
  }

  /**
   * Component mounted
   */
  onMount() {
    this.loadStudents();
  }
}

export function addStudentListStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .student-list-view {
      padding: 1.5rem;
    }

    .student-list-header {
      margin-bottom: 2rem;
    }

    .section-title {
      margin: 0 0 1.5rem 0;
      font-size: 1.75rem;
      color: var(--cream);
      font-weight: 700;
    }

    .student-list-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      max-width: 500px;
    }

    .grade-group-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .grade-filter-btn {
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--cream);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .grade-filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--amber-warm);
    }

    .grade-filter-btn.active {
      background: var(--amber-warm);
      border-color: var(--amber-warm);
      color: var(--navy-deep);
      font-weight: 600;
    }

    .student-count {
      font-size: 1rem;
      color: var(--gray-soft);
    }

    .student-count strong {
      color: var(--amber-warm);
      font-size: 1.2rem;
    }

    .student-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .student-card {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .student-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--amber-warm);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 167, 38, 0.3);
    }

    .student-card:focus {
      outline: 3px solid var(--amber-warm);
      outline-offset: 2px;
    }

    .student-card.special-attention {
      border-color: rgba(239, 68, 68, 0.5);
      background: rgba(239, 68, 68, 0.05);
    }

    .student-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      position: relative;
    }

    .student-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--amber-warm), var(--color-academics));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .student-header-info {
      flex: 1;
    }

    .student-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--cream);
      margin-bottom: 0.25rem;
    }

    .student-grade {
      font-size: 0.85rem;
      color: var(--gray-soft);
    }

    .special-badge {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 1.5rem;
    }

    .student-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .student-info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--gray-soft);
    }

    .info-icon {
      font-size: 1rem;
    }

    .student-info-value {
      color: var(--cream);
    }

    .click-hint {
      text-align: center;
      font-size: 0.8rem;
      color: var(--amber-warm);
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .student-card:hover .click-hint {
      opacity: 1;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray-soft);
    }

    .empty-state-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--cream);
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .student-grid {
        grid-template-columns: 1fr;
      }

      .grade-group-filters {
        flex-direction: column;
      }

      .grade-filter-btn {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}
