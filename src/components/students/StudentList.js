/**
 * Student List Component
 * Displays list of students with search and filtering
 */

import { Component } from '../../core/Component.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { logger } from '../../utils/logger.js';
import { sanitize } from '../../utils/validators.js';
import { debounce } from '../../utils/helpers.js';

export class StudentList extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      students: [],
      filteredStudents: [],
      searchQuery: '',
      filterGrade: 'all',
      sortBy: 'name',
    };

    // Debounced search
    this.debouncedSearch = debounce((query) => this.performSearch(query), 300);
  }

  /**
   * Component template
   */
  template() {
    const { filteredStudents, searchQuery, filterGrade } = this.state;

    return `
      <div class="student-list-view">
        <div class="student-list-header">
          <div class="student-list-controls">
            <input
              type="text"
              id="student-search"
              class="input-field"
              placeholder="🔍 Search students..."
              value="${sanitize(searchQuery)}"
              aria-label="Search students"
            />
            <select
              id="grade-filter"
              class="input-field"
              aria-label="Filter by grade"
            >
              <option value="all">All Grades</option>
              ${Array.from({ length: 12 }, (_, i) => i + 1)
                .map(
                  (grade) =>
                    `<option value="${grade}" ${filterGrade == grade ? 'selected' : ''}>Grade ${grade}</option>`
                )
                .join('')}
            </select>
            <button class="btn btn-primary" id="add-student-btn">
              + Add Student
            </button>
          </div>
          <div class="student-count">
            ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div class="student-grid">
          ${filteredStudents.length > 0 ? filteredStudents.map((student) => this.renderStudentCard(student)).join('') : this.renderEmptyState()}
        </div>
      </div>
    `;
  }

  /**
   * Render individual student card
   */
  renderStudentCard(student) {
    return `
      <div class="student-card ${student.specialAttention ? 'special-attention' : ''}" data-student-id="${student.id}">
        <div class="student-card-header">
          <div>
            <div class="student-name">${sanitize(student.name)}</div>
            <div class="student-grade">Grade ${student.grade}${student.age ? ` • Age ${student.age}` : ''}</div>
          </div>
          ${student.specialAttention ? '<span class="special-badge">⚠️ NEEDS ATTENTION</span>' : ''}
        </div>

        <div class="student-info">
          <div class="student-info-row">
            <span class="student-info-label">Parent:</span>
            <span class="student-info-value">${sanitize(student.parentName)}</span>
          </div>
          <div class="student-info-row">
            <span class="student-info-label">Phone:</span>
            <span class="student-info-value">${sanitize(student.parentPhone)}</span>
          </div>
          ${student.parentEmail ? `
            <div class="student-info-row">
              <span class="student-info-label">Email:</span>
              <span class="student-info-value">${sanitize(student.parentEmail)}</span>
            </div>
          ` : ''}
        </div>

        <div class="student-card-actions">
          <button class="btn btn-secondary btn-small view-student-btn" data-id="${student.id}">
            👁️ View
          </button>
          <button class="btn btn-secondary btn-small edit-student-btn" data-id="${student.id}">
            ✏️ Edit
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    const { searchQuery } = this.state;

    if (searchQuery) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No students found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      `;
    }

    return `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <h3>No students yet</h3>
        <p>Add your first student to get started</p>
        <button class="btn btn-primary" id="add-first-student-btn">
          + Add Student
        </button>
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

    // Grade filter
    const gradeFilter = this.$('#grade-filter');
    if (gradeFilter) {
      gradeFilter.addEventListener('change', (e) => {
        this.setState({ filterGrade: e.target.value });
        this.filterStudents();
      });
    }

    // Add student buttons
    const addButtons = this.$$('#add-student-btn, #add-first-student-btn');
    addButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.handleAddStudent());
    });

    // View student buttons
    const viewButtons = this.$$('.view-student-btn');
    viewButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        this.handleViewStudent(id);
      });
    });

    // Edit student buttons
    const editButtons = this.$$('.edit-student-btn');
    editButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        this.handleEditStudent(id);
      });
    });
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
   * Filter students based on search and grade
   */
  filterStudents() {
    let { students, searchQuery, filterGrade } = this.state;
    let filtered = [...students];

    // Apply grade filter
    if (filterGrade !== 'all') {
      filtered = filtered.filter((s) => s.grade === parseInt(filterGrade));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.parentName.toLowerCase().includes(query) ||
          (s.parentEmail && s.parentEmail.toLowerCase().includes(query))
      );
    }

    this.setState({ filteredStudents: filtered });
  }

  /**
   * Handle add student
   */
  handleAddStudent() {
    logger.info('Add student clicked');
    alert('Add student form would open here');
    // TODO: Open add student modal/form
  }

  /**
   * Handle view student
   */
  handleViewStudent(id) {
    const student = studentRepository.getById(id);
    if (student) {
      logger.info(`Viewing student: ${student.name}`);
      alert(`View details for ${student.name}`);
      // TODO: Open student details modal
    }
  }

  /**
   * Handle edit student
   */
  handleEditStudent(id) {
    const student = studentRepository.getById(id);
    if (student) {
      logger.info(`Editing student: ${student.name}`);
      alert(`Edit form for ${student.name}`);
      // TODO: Open edit student modal/form
    }
  }

  /**
   * Lifecycle: called after mount
   */
  onMount() {
    this.loadStudents();

    // Subscribe to student changes
    this.subscribe('students', () => {
      this.loadStudents();
    });

    logger.info('Student list mounted');
  }
}

/**
 * Add student list styles
 */
export function addStudentListStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .student-list-view {
      width: 100%;
    }

    .student-list-header {
      margin-bottom: 1.5rem;
    }

    .student-list-controls {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .student-list-controls input {
      flex: 1;
      min-width: 200px;
    }

    .student-list-controls select {
      min-width: 150px;
    }

    .student-count {
      color: var(--gray-soft);
      font-size: 0.9rem;
    }

    .student-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .student-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.3s ease;
    }

    .student-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
    }

    .student-card.special-attention {
      border-color: var(--alert);
      background: rgba(251, 146, 60, 0.1);
    }

    .student-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 0.5rem;
    }

    .student-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--cream);
    }

    .student-grade {
      font-size: 0.85rem;
      color: var(--gray-soft);
      margin-top: 0.25rem;
    }

    .special-badge {
      background: var(--alert);
      color: var(--navy-deep);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .student-info {
      margin-bottom: 1rem;
    }

    .student-info-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .student-info-label {
      color: var(--gray-soft);
      min-width: 60px;
    }

    .student-info-value {
      color: var(--cream);
      flex: 1;
    }

    .student-card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-state-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      color: var(--cream);
    }

    .empty-state p {
      color: var(--gray-soft);
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .student-grid {
        grid-template-columns: 1fr;
      }

      .student-list-controls {
        flex-direction: column;
      }

      .student-list-controls input,
      .student-list-controls select {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}
