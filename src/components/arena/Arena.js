/**
 * Arena Component
 * Hockey and skating drill browser with lesson planning
 */

import { Component } from '../../core/Component.js';
import { getAllArenaDrillsFlat, getDrillsBySkillLevel, getDrillsByCategory, searchDrills } from '../../data/arenaDrills.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { logger } from '../../utils/logger.js';
import { debounce } from '../../utils/helpers.js';

export class Arena extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      allDrills: [],
      filteredDrills: [],
      selectedDrill: null,
      lessonPlan: [],
      filterCategory: 'all',
      filterSkillLevel: 'all',
      searchTerm: '',
      selectedStudents: [],
      showDrillModal: false,
    };
  }

  template() {
    const { filteredDrills, selectedDrill, lessonPlan, filterCategory, filterSkillLevel, showDrillModal } = this.state;

    return `
      <div class="arena-container">
        <div class="arena-header">
          <h2 class="section-title">⛸️ Arena - Hockey & Skating Drills</h2>
          <p class="section-subtitle">Browse drills and create lesson plans for your skating sessions</p>
        </div>

        <div class="arena-layout">
          <!-- Drill Browser -->
          <div class="drill-browser">
            <div class="browser-header">
              <h3>🏒 Drill Library</h3>
            </div>

            <!-- Filters -->
            <div class="drill-filters">
              <div class="filter-group">
                <label class="filter-label">Search</label>
                <input
                  type="text"
                  id="drill-search"
                  class="input-field"
                  placeholder="Search drills..."
                />
              </div>

              <div class="filter-group">
                <label class="filter-label">Category</label>
                <select id="category-filter" class="input-field">
                  <option value="all" ${filterCategory === 'all' ? 'selected' : ''}>All Categories</option>
                  <option value="Warmup" ${filterCategory === 'Warmup' ? 'selected' : ''}>Warmup</option>
                  <option value="Skating Basics" ${filterCategory === 'Skating Basics' ? 'selected' : ''}>Skating Basics</option>
                  <option value="Puck Control" ${filterCategory === 'Puck Control' ? 'selected' : ''}>Puck Control</option>
                  <option value="Shooting" ${filterCategory === 'Shooting' ? 'selected' : ''}>Shooting</option>
                  <option value="Fun Games" ${filterCategory === 'Fun Games' ? 'selected' : ''}>Fun Games</option>
                  <option value="Small-Sided Games" ${filterCategory === 'Small-Sided Games' ? 'selected' : ''}>Small-Sided Games</option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Skill Level</label>
                <select id="skill-filter" class="input-field">
                  <option value="all" ${filterSkillLevel === 'all' ? 'selected' : ''}>All Levels</option>
                  <option value="Beginner" ${filterSkillLevel === 'Beginner' ? 'selected' : ''}>Beginner</option>
                  <option value="Intermediate" ${filterSkillLevel === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                  <option value="Advanced" ${filterSkillLevel === 'Advanced' ? 'selected' : ''}>Advanced</option>
                </select>
              </div>
            </div>

            <!-- Drill List -->
            <div class="drill-list">
              ${filteredDrills.length > 0 ? this.renderDrillList() : this.renderEmptyState()}
            </div>
          </div>

          <!-- Lesson Plan Builder -->
          <div class="lesson-builder">
            <div class="builder-header">
              <h3>📋 Lesson Plan</h3>
              ${lessonPlan.length > 0 ? `
                <button class="btn btn-secondary btn-small" id="clear-lesson-btn">Clear All</button>
              ` : ''}
            </div>

            ${lessonPlan.length > 0 ? this.renderLessonPlan() : this.renderEmptyLesson()}

            ${lessonPlan.length > 0 ? `
              <div class="lesson-actions">
                <button class="btn btn-primary" id="save-lesson-btn">💾 Save Lesson</button>
                <button class="btn btn-secondary" id="print-lesson-btn">🖨️ Print</button>
              </div>
            ` : ''}
          </div>
        </div>

        ${showDrillModal && selectedDrill ? this.renderDrillModal() : ''}
      </div>
    `;
  }

  renderDrillList() {
    const { filteredDrills } = this.state;

    return filteredDrills.map((drill) => `
      <div class="drill-card" data-drill-id="${drill.id}">
        <div class="drill-card-header">
          <h4 class="drill-name">${drill.name}</h4>
          <span class="drill-badge">${drill.category}</span>
        </div>
        <div class="drill-meta">
          <span class="meta-item">⏱️ ${drill.duration}</span>
          <span class="meta-item">👥 ${drill.groupSize}</span>
          <span class="meta-item">📊 ${drill.skillLevel}</span>
        </div>
        <p class="drill-description">${drill.description}</p>
        <div class="drill-actions">
          <button class="btn btn-small btn-secondary view-drill-btn" data-drill-id="${drill.id}">
            👁️ View Details
          </button>
          <button class="btn btn-small btn-primary add-to-lesson-btn" data-drill-id="${drill.id}">
            ➕ Add to Lesson
          </button>
        </div>
      </div>
    `).join('');
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🏒</div>
        <h3>No drills found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    `;
  }

  renderEmptyLesson() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No drills added yet</h3>
        <p>Click "Add to Lesson" on drills to build your lesson plan</p>
      </div>
    `;
  }

  renderLessonPlan() {
    const { lessonPlan } = this.state;
    const totalDuration = this.calculateTotalDuration();

    return `
      <div class="lesson-summary">
        <div class="summary-stat">
          <span class="stat-label">Total Drills</span>
          <span class="stat-value">${lessonPlan.length}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Estimated Time</span>
          <span class="stat-value">${totalDuration}</span>
        </div>
      </div>

      <div class="lesson-drill-list">
        ${lessonPlan.map((drill, index) => `
          <div class="lesson-drill-item">
            <div class="lesson-drill-number">${index + 1}</div>
            <div class="lesson-drill-content">
              <h4>${drill.name}</h4>
              <div class="lesson-drill-meta">
                <span>${drill.category}</span>
                <span>⏱️ ${drill.duration}</span>
              </div>
            </div>
            <div class="lesson-drill-actions">
              <button class="btn-icon move-up-btn" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
              <button class="btn-icon move-down-btn" data-index="${index}" ${index === lessonPlan.length - 1 ? 'disabled' : ''}>↓</button>
              <button class="btn-icon remove-drill-btn" data-index="${index}">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderDrillModal() {
    const { selectedDrill } = this.state;

    return `
      <div class="modal-overlay" id="drill-modal">
        <div class="modal-content drill-modal">
          <div class="modal-header">
            <h2>${selectedDrill.name}</h2>
            <button class="modal-close" id="close-drill-modal">✕</button>
          </div>
          <div class="modal-body">
            <div class="drill-detail-header">
              <span class="drill-badge-large">${selectedDrill.category}</span>
              <span class="drill-skill-badge">${selectedDrill.skillLevel}</span>
            </div>

            <div class="drill-detail-meta">
              <div class="meta-box">
                <div class="meta-icon">⏱️</div>
                <div class="meta-content">
                  <div class="meta-label">Duration</div>
                  <div class="meta-value">${selectedDrill.duration}</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="meta-icon">👥</div>
                <div class="meta-content">
                  <div class="meta-label">Group Size</div>
                  <div class="meta-value">${selectedDrill.groupSize}</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="meta-icon">🎒</div>
                <div class="meta-content">
                  <div class="meta-label">Equipment</div>
                  <div class="meta-value">${selectedDrill.equipment}</div>
                </div>
              </div>
            </div>

            <div class="drill-section">
              <h3>📝 Description</h3>
              <p>${selectedDrill.description}</p>
            </div>

            ${selectedDrill.setup ? `
              <div class="drill-section">
                <h3>🔧 Setup</h3>
                <p>${selectedDrill.setup}</p>
              </div>
            ` : ''}

            ${selectedDrill.instructions ? `
              <div class="drill-section">
                <h3>📋 Instructions</h3>
                <div class="drill-instructions">${selectedDrill.instructions.trim()}</div>
              </div>
            ` : ''}

            ${selectedDrill.variations && selectedDrill.variations.length > 0 ? `
              <div class="drill-section">
                <h3>🔄 Variations</h3>
                <ul class="drill-list-items">
                  ${selectedDrill.variations.map(v => `<li>${v}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${selectedDrill.coachingTips && selectedDrill.coachingTips.length > 0 ? `
              <div class="drill-section">
                <h3>💡 Coaching Tips</h3>
                <ul class="drill-list-items">
                  ${selectedDrill.coachingTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="drill-modal-actions">
              <button class="btn btn-primary" id="add-to-lesson-from-modal">
                ➕ Add to Lesson Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Search
    const searchInput = this.$('#drill-search');
    if (searchInput) {
      const debouncedSearch = debounce((value) => {
        this.setState({ searchTerm: value });
        this.filterDrills();
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // Category filter
    const categoryFilter = this.$('#category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.setState({ filterCategory: e.target.value });
        this.filterDrills();
      });
    }

    // Skill level filter
    const skillFilter = this.$('#skill-filter');
    if (skillFilter) {
      skillFilter.addEventListener('change', (e) => {
        this.setState({ filterSkillLevel: e.target.value });
        this.filterDrills();
      });
    }

    // View drill buttons
    const viewBtns = this.$$('.view-drill-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const drillId = btn.dataset.drillId;
        this.viewDrill(drillId);
      });
    });

    // Add to lesson buttons
    const addBtns = this.$$('.add-to-lesson-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const drillId = btn.dataset.drillId;
        this.addToLesson(drillId);
      });
    });

    // Remove from lesson
    const removeBtns = this.$$('.remove-drill-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.removeFromLesson(index);
      });
    });

    // Move drills up/down
    const moveUpBtns = this.$$('.move-up-btn');
    moveUpBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.moveDrill(index, 'up');
      });
    });

    const moveDownBtns = this.$$('.move-down-btn');
    moveDownBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.moveDrill(index, 'down');
      });
    });

    // Clear lesson
    const clearBtn = this.$('#clear-lesson-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all drills from lesson plan?')) {
          this.setState({ lessonPlan: [] });
        }
      });
    }

    // Save lesson
    const saveBtn = this.$('#save-lesson-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveLesson();
      });
    }

    // Print lesson
    const printBtn = this.$('#print-lesson-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printLesson();
      });
    }

    // Modal events
    const closeDrillModal = this.$('#close-drill-modal');
    if (closeDrillModal) {
      closeDrillModal.addEventListener('click', () => {
        this.setState({ showDrillModal: false, selectedDrill: null });
      });
    }

    const addFromModal = this.$('#add-to-lesson-from-modal');
    if (addFromModal) {
      addFromModal.addEventListener('click', () => {
        const { selectedDrill } = this.state;
        if (selectedDrill) {
          this.addToLesson(selectedDrill.id);
          this.setState({ showDrillModal: false, selectedDrill: null });
        }
      });
    }

    // Close modal on backdrop click
    const drillModal = this.$('#drill-modal');
    if (drillModal) {
      drillModal.addEventListener('click', (e) => {
        if (e.target === drillModal) {
          this.setState({ showDrillModal: false, selectedDrill: null });
        }
      });
    }
  }

  loadDrills() {
    const allDrills = getAllArenaDrillsFlat();
    this.setState({
      allDrills,
      filteredDrills: allDrills,
    });
    logger.info(`Loaded ${allDrills.length} arena drills`);
  }

  filterDrills() {
    const { allDrills, filterCategory, filterSkillLevel, searchTerm } = this.state;
    let filtered = [...allDrills];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(drill => drill.category === filterCategory);
    }

    // Apply skill level filter
    if (filterSkillLevel !== 'all') {
      filtered = getDrillsBySkillLevel(filterSkillLevel).filter(drill =>
        filtered.includes(drill)
      );
    }

    // Apply search
    if (searchTerm && searchTerm.trim()) {
      const searchResults = searchDrills(searchTerm);
      filtered = filtered.filter(drill => searchResults.includes(drill));
    }

    this.setState({ filteredDrills: filtered });
  }

  viewDrill(drillId) {
    const { allDrills } = this.state;
    const drill = allDrills.find(d => d.id === drillId);
    if (drill) {
      this.setState({
        selectedDrill: drill,
        showDrillModal: true,
      });
    }
  }

  addToLesson(drillId) {
    const { allDrills, lessonPlan } = this.state;
    const drill = allDrills.find(d => d.id === drillId);
    if (drill) {
      // Check if already in lesson
      if (lessonPlan.some(d => d.id === drillId)) {
        logger.warn('Drill already in lesson plan');
        return;
      }
      this.setState({
        lessonPlan: [...lessonPlan, drill],
      });
      logger.success(`Added ${drill.name} to lesson plan`);
    }
  }

  removeFromLesson(index) {
    const { lessonPlan } = this.state;
    const newPlan = lessonPlan.filter((_, i) => i !== index);
    this.setState({ lessonPlan: newPlan });
  }

  moveDrill(index, direction) {
    const { lessonPlan } = this.state;
    const newPlan = [...lessonPlan];

    if (direction === 'up' && index > 0) {
      [newPlan[index - 1], newPlan[index]] = [newPlan[index], newPlan[index - 1]];
    } else if (direction === 'down' && index < newPlan.length - 1) {
      [newPlan[index], newPlan[index + 1]] = [newPlan[index + 1], newPlan[index]];
    }

    this.setState({ lessonPlan: newPlan });
  }

  calculateTotalDuration() {
    const { lessonPlan } = this.state;
    // Simple estimate - just sum the max minutes from each drill
    let totalMinutes = 0;
    lessonPlan.forEach(drill => {
      const match = drill.duration.match(/(\d+)/g);
      if (match) {
        const max = Math.max(...match.map(Number));
        totalMinutes += max;
      }
    });
    return `${totalMinutes} min`;
  }

  saveLesson() {
    const { lessonPlan } = this.state;
    // For now, save to localStorage
    const lessonData = {
      timestamp: new Date().toISOString(),
      drills: lessonPlan,
      totalDuration: this.calculateTotalDuration(),
    };

    const savedLessons = JSON.parse(localStorage.getItem('arenaLessons') || '[]');
    savedLessons.push(lessonData);
    localStorage.setItem('arenaLessons', JSON.stringify(savedLessons));

    logger.success('Lesson plan saved!');
  }

  printLesson() {
    const { lessonPlan } = this.state;
    const totalDuration = this.calculateTotalDuration();

    // Create printable HTML
    const printContent = `
      <html>
        <head>
          <title>Arena Lesson Plan</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0a1828; }
            .drill { margin-bottom: 20px; page-break-inside: avoid; }
            .drill-header { background: #1e3a5f; color: white; padding: 10px; }
            .drill-body { border: 1px solid #ccc; padding: 10px; }
            .meta { color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h1>⛸️ Arena Lesson Plan</h1>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Drills:</strong> ${lessonPlan.length} | <strong>Duration:</strong> ${totalDuration}</p>
          <hr />
          ${lessonPlan.map((drill, index) => `
            <div class="drill">
              <div class="drill-header">
                <h2>${index + 1}. ${drill.name}</h2>
              </div>
              <div class="drill-body">
                <p class="meta">${drill.category} | ${drill.skillLevel} | ${drill.duration} | ${drill.groupSize}</p>
                <p><strong>Description:</strong> ${drill.description}</p>
                ${drill.setup ? `<p><strong>Setup:</strong> ${drill.setup}</p>` : ''}
                ${drill.instructions ? `<p><strong>Instructions:</strong><pre>${drill.instructions}</pre></p>` : ''}
                ${drill.equipment ? `<p><strong>Equipment:</strong> ${drill.equipment}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }

  onMount() {
    this.loadDrills();
    logger.info('Arena component mounted');
  }
}

export function addArenaStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .arena-container {
      width: 100%;
      padding: 1rem;
    }

    .arena-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .drill-browser,
    .lesson-builder {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
    }

    .browser-header,
    .builder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .browser-header h3,
    .builder-header h3 {
      margin: 0;
      color: var(--cream);
      font-size: 1.25rem;
    }

    .drill-filters {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.85rem;
      color: var(--gray-soft);
      font-weight: 500;
    }

    .drill-list {
      max-height: 600px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .drill-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.2s;
    }

    .drill-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(4px);
    }

    .drill-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .drill-name {
      margin: 0;
      font-size: 1.1rem;
      color: var(--cream);
      font-weight: 600;
    }

    .drill-badge {
      background: var(--amber-warm);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .drill-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .meta-item {
      font-size: 0.8rem;
      color: var(--gray-soft);
    }

    .drill-description {
      font-size: 0.9rem;
      color: var(--gray-soft);
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .drill-actions {
      display: flex;
      gap: 0.5rem;
    }

    .lesson-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-stat {
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: var(--gray-soft);
      margin-bottom: 0.5rem;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      color: var(--amber-warm);
      font-weight: 700;
    }

    .lesson-drill-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .lesson-drill-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
    }

    .lesson-drill-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--amber-warm);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .lesson-drill-content {
      flex: 1;
    }

    .lesson-drill-content h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      color: var(--cream);
    }

    .lesson-drill-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--gray-soft);
    }

    .lesson-drill-actions {
      display: flex;
      gap: 0.25rem;
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--cream);
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-icon:hover:not(:disabled) {
      background: var(--amber-warm);
    }

    .btn-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .lesson-actions {
      display: flex;
      gap: 0.75rem;
    }

    .drill-modal {
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
    }

    .drill-detail-header {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .drill-badge-large {
      background: var(--amber-warm);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .drill-skill-badge {
      background: rgba(255, 255, 255, 0.1);
      color: var(--cream);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .drill-detail-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .meta-box {
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .meta-icon {
      font-size: 1.5rem;
    }

    .meta-label {
      font-size: 0.75rem;
      color: var(--gray-soft);
      margin-bottom: 0.25rem;
    }

    .meta-value {
      font-size: 0.9rem;
      color: var(--cream);
      font-weight: 500;
    }

    .drill-section {
      margin-bottom: 1.5rem;
    }

    .drill-section h3 {
      color: var(--amber-warm);
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    .drill-section p {
      color: var(--gray-soft);
      line-height: 1.6;
    }

    .drill-instructions {
      white-space: pre-line;
      color: var(--gray-soft);
      line-height: 1.8;
      font-size: 0.95rem;
    }

    .drill-list-items {
      list-style: none;
      padding: 0;
    }

    .drill-list-items li {
      padding-left: 1.5rem;
      position: relative;
      margin-bottom: 0.5rem;
      color: var(--gray-soft);
      line-height: 1.6;
    }

    .drill-list-items li:before {
      content: '•';
      color: var(--amber-warm);
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .drill-modal-actions {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 1024px) {
      .arena-layout {
        grid-template-columns: 1fr;
      }

      .drill-detail-meta {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
