/**
 * Student Profile Modal
 * Rich profile editor with likes/dislikes/triggers/notes
 */

import { Component } from '../../core/Component.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { logger } from '../../utils/logger.js';

export class StudentProfileModal extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      student: props.student || null,
      activeTab: 'overview',
      isEditing: false,
      likes: [],
      dislikes: [],
      favoriteActivities: [],
    };

    if (this.state.student) {
      this.loadStudentData();
    }
  }

  loadStudentData() {
    const { student } = this.state;
    this.setState({
      likes: student.likes || [],
      dislikes: student.dislikes || [],
      favoriteActivities: student.favoriteActivities || [],
    });
  }

  template() {
    const { student, activeTab, isEditing } = this.state;

    if (!student) return '';

    return `
      <div class="modal-overlay" id="student-profile-modal">
        <div class="modal-content student-profile-modal">
          ${this.renderHeader(student)}
          ${this.renderTabs()}
          ${this.renderTabContent(activeTab, student, isEditing)}
          ${this.renderFooter(isEditing)}
        </div>
      </div>
    `;
  }

  renderHeader(student) {
    const gradeDisplay = student.grade === 0 ? 'Kindergarten' : `Grade ${student.grade}`;
    const initials = student.name.split(' ').map(n => n[0]).join('');

    return `
      <div class="profile-header">
        <button class="modal-close" id="close-profile">✕</button>
        <div class="profile-avatar">
          <div class="avatar-circle">${initials}</div>
        </div>
        <div class="profile-info">
          <h2 class="student-name">${student.name}</h2>
          <div class="student-meta">
            <span class="meta-badge">${gradeDisplay}</span>
            ${student.age ? `<span class="meta-badge">${student.age} years old</span>` : ''}
            ${student.specialAttention ? '<span class="meta-badge special">⭐ Special Attention</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderTabs() {
    const { activeTab } = this.state;
    const tabs = [
      { id: 'overview', icon: '👤', label: 'Overview' },
      { id: 'profile', icon: '💫', label: 'Profile' },
      { id: 'behavior', icon: '🎯', label: 'Behavior' },
      { id: 'academic', icon: '📚', label: 'Academic' },
      { id: 'contact', icon: '📞', label: 'Contact' },
    ];

    return `
      <div class="profile-tabs">
        ${tabs.map(tab => `
          <button
            class="profile-tab ${activeTab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}">
            <span class="tab-icon">${tab.icon}</span>
            <span class="tab-label">${tab.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  renderTabContent(activeTab, student, isEditing) {
    return `
      <div class="profile-content">
        ${activeTab === 'overview' ? this.renderOverview(student) : ''}
        ${activeTab === 'profile' ? this.renderProfileTab(student, isEditing) : ''}
        ${activeTab === 'behavior' ? this.renderBehaviorTab(student, isEditing) : ''}
        ${activeTab === 'academic' ? this.renderAcademicTab(student, isEditing) : ''}
        ${activeTab === 'contact' ? this.renderContactTab(student, isEditing) : ''}
      </div>
    `;
  }

  renderOverview(student) {
    const { likes, dislikes, favoriteActivities } = this.state;

    return `
      <div class="overview-grid">
        <div class="overview-card">
          <h3 class="card-title">👍 Likes</h3>
          ${likes.length > 0 ? `
            <div class="tag-list">
              ${likes.map(like => `<span class="tag tag-green">${like}</span>`).join('')}
            </div>
          ` : '<p class="empty-state">No likes added yet</p>'}
        </div>

        <div class="overview-card">
          <h3 class="card-title">👎 Dislikes</h3>
          ${dislikes.length > 0 ? `
            <div class="tag-list">
              ${dislikes.map(dislike => `<span class="tag tag-red">${dislike}</span>`).join('')}
            </div>
          ` : '<p class="empty-state">No dislikes added yet</p>'}
        </div>

        <div class="overview-card">
          <h3 class="card-title">⭐ Favorite Activities</h3>
          ${favoriteActivities.length > 0 ? `
            <div class="tag-list">
              ${favoriteActivities.map(act => `<span class="tag tag-purple">${act}</span>`).join('')}
            </div>
          ` : '<p class="empty-state">No favorite activities yet</p>'}
        </div>

        <div class="overview-card">
          <h3 class="card-title">📝 Notes</h3>
          ${student.notes ? `
            <p class="notes-preview">${student.notes}</p>
          ` : '<p class="empty-state">No notes added yet</p>'}
        </div>

        ${student.triggerNotes ? `
          <div class="overview-card alert-card">
            <h3 class="card-title">⚠️ Triggers</h3>
            <p class="trigger-notes">${student.triggerNotes}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderProfileTab(student, isEditing) {
    const { likes, dislikes, favoriteActivities } = this.state;

    return `
      <div class="profile-section">
        <div class="form-group">
          <label class="form-label">👍 Likes</label>
          ${isEditing ? `
            <div class="tag-input-container">
              <input
                type="text"
                class="input-field"
                id="likes-input"
                placeholder="Type and press Enter to add..."
              />
            </div>
          ` : ''}
          <div class="tag-list editable" id="likes-list">
            ${likes.map((like, i) => `
              <span class="tag tag-green">
                ${like}
                ${isEditing ? `<button class="tag-remove" data-type="likes" data-index="${i}">×</button>` : ''}
              </span>
            `).join('')}
            ${likes.length === 0 ? '<span class="empty-hint">No likes added</span>' : ''}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">👎 Dislikes</label>
          ${isEditing ? `
            <div class="tag-input-container">
              <input
                type="text"
                class="input-field"
                id="dislikes-input"
                placeholder="Type and press Enter to add..."
              />
            </div>
          ` : ''}
          <div class="tag-list editable" id="dislikes-list">
            ${dislikes.map((dislike, i) => `
              <span class="tag tag-red">
                ${dislike}
                ${isEditing ? `<button class="tag-remove" data-type="dislikes" data-index="${i}">×</button>` : ''}
              </span>
            `).join('')}
            ${dislikes.length === 0 ? '<span class="empty-hint">No dislikes added</span>' : ''}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">⭐ Favorite Activities</label>
          ${isEditing ? `
            <div class="tag-input-container">
              <input
                type="text"
                class="input-field"
                id="favorite-activities-input"
                placeholder="Type and press Enter to add..."
              />
            </div>
          ` : ''}
          <div class="tag-list editable" id="favorite-activities-list">
            ${favoriteActivities.map((act, i) => `
              <span class="tag tag-purple">
                ${act}
                ${isEditing ? `<button class="tag-remove" data-type="favoriteActivities" data-index="${i}">×</button>` : ''}
              </span>
            `).join('')}
            ${favoriteActivities.length === 0 ? '<span class="empty-hint">No favorite activities</span>' : ''}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">💬 Interests & Hobbies</label>
          <textarea
            class="input-field"
            id="interests-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="What does this student enjoy? What are they passionate about?"
          >${student.interests || ''}</textarea>
        </div>
      </div>
    `;
  }

  renderBehaviorTab(student, isEditing) {
    return `
      <div class="profile-section">
        <div class="form-group">
          <label class="form-label">⚠️ Triggers & Sensitivities</label>
          <textarea
            class="input-field"
            id="triggers-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="What situations, topics, or environments should be avoided?"
          >${student.triggerNotes || ''}</textarea>
          <div class="form-hint">Sensitive information - handle with care</div>
        </div>

        <div class="form-group">
          <label class="form-label">🎯 Strategies & Approaches</label>
          <textarea
            class="input-field"
            id="strategies-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="What strategies work well with this student?"
          >${student.strategies || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">📋 Behavior Notes</label>
          <textarea
            class="input-field"
            id="behavior-notes-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="General behavioral observations and patterns..."
          >${student.behaviorNotes || ''}</textarea>
        </div>
      </div>
    `;
  }

  renderAcademicTab(student, isEditing) {
    return `
      <div class="profile-section">
        <div class="form-group">
          <label class="form-label">💪 Strengths</label>
          <textarea
            class="input-field"
            id="strengths-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="What is this student good at? Academic strengths?"
          >${student.strengths || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">🎯 Challenges & Areas for Growth</label>
          <textarea
            class="input-field"
            id="challenges-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="What does this student struggle with? What needs support?"
          >${student.challenges || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">🏥 Medical / Special Considerations</label>
          <textarea
            class="input-field"
            id="medical-input"
            rows="4"
            ${!isEditing ? 'disabled' : ''}
            placeholder="Allergies, medications, medical conditions, accommodations..."
          >${student.medical || ''}</textarea>
          <div class="form-hint">Confidential medical information</div>
        </div>
      </div>
    `;
  }

  renderContactTab(student, isEditing) {
    return `
      <div class="profile-section">
        <div class="form-group">
          <label class="form-label">👨‍👩‍👧 Parent/Guardian Name</label>
          <input
            type="text"
            class="input-field"
            id="parent-name-input"
            value="${student.parentName || ''}"
            ${!isEditing ? 'disabled' : ''}
          />
        </div>

        <div class="form-group">
          <label class="form-label">📞 Phone Number</label>
          <input
            type="tel"
            class="input-field"
            id="parent-phone-input"
            value="${student.parentPhone || ''}"
            ${!isEditing ? 'disabled' : ''}
          />
        </div>

        <div class="form-group">
          <label class="form-label">📧 Email</label>
          <input
            type="email"
            class="input-field"
            id="parent-email-input"
            value="${student.parentEmail || ''}"
            ${!isEditing ? 'disabled' : ''}
          />
        </div>

        <div class="form-group">
          <label class="form-label">📝 General Notes</label>
          <textarea
            class="input-field"
            id="notes-input"
            rows="6"
            ${!isEditing ? 'disabled' : ''}
            placeholder="Any additional notes, reminders, or important information..."
          >${student.notes || ''}</textarea>
        </div>
      </div>
    `;
  }

  renderFooter(isEditing) {
    return `
      <div class="profile-footer">
        <button class="btn btn-secondary" id="cancel-profile">
          ${isEditing ? 'Cancel' : 'Close'}
        </button>
        ${isEditing ? `
          <button class="btn btn-primary" id="save-profile">
            💾 Save Changes
          </button>
        ` : `
          <button class="btn btn-primary" id="edit-profile">
            ✏️ Edit Profile
          </button>
        `}
      </div>
    `;
  }

  attachEvents() {
    // Close button
    const closeBtn = this.$('#close-profile');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const cancelBtn = this.$('#cancel-profile');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());

    // Tab switching
    const tabs = this.$$('.profile-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        this.setState({ activeTab: tabId });
      });
    });

    // Edit/Save buttons
    const editBtn = this.$('#edit-profile');
    if (editBtn) editBtn.addEventListener('click', () => this.enableEditing());

    const saveBtn = this.$('#save-profile');
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveProfile());

    // Tag input handlers
    if (this.state.isEditing) {
      this.setupTagInput('likes');
      this.setupTagInput('dislikes');
      this.setupTagInput('favoriteActivities');

      // Tag remove buttons
      const removeBtns = this.$$('.tag-remove');
      removeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          const index = parseInt(btn.dataset.index);
          this.removeTag(type, index);
        });
      });
    }
  }

  setupTagInput(type) {
    const input = this.$(`#${type.replace(/([A-Z])/g, '-$1').toLowerCase()}-input`);
    if (!input) return;

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        this.addTag(type, input.value.trim());
        input.value = '';
      }
    });
  }

  addTag(type, value) {
    const current = this.state[type];
    if (!current.includes(value)) {
      this.setState({ [type]: [...current, value] });
    }
  }

  removeTag(type, index) {
    const current = this.state[type];
    this.setState({ [type]: current.filter((_, i) => i !== index) });
  }

  enableEditing() {
    this.setState({ isEditing: true });
  }

  saveProfile() {
    try {
      const { student, likes, dislikes, favoriteActivities } = this.state;

      // Collect all form data
      const updatedStudent = {
        ...student,
        likes,
        dislikes,
        favoriteActivities,
        interests: this.$('#interests-input')?.value || '',
        triggerNotes: this.$('#triggers-input')?.value || '',
        strategies: this.$('#strategies-input')?.value || '',
        behaviorNotes: this.$('#behavior-notes-input')?.value || '',
        strengths: this.$('#strengths-input')?.value || '',
        challenges: this.$('#challenges-input')?.value || '',
        medical: this.$('#medical-input')?.value || '',
        parentName: this.$('#parent-name-input')?.value || '',
        parentPhone: this.$('#parent-phone-input')?.value || '',
        parentEmail: this.$('#parent-email-input')?.value || '',
        notes: this.$('#notes-input')?.value || '',
      };

      // Save to repository
      studentRepository.update(updatedStudent);

      logger.success(`Profile updated for ${student.name}`);
      this.setState({ isEditing: false, student: updatedStudent });

      // Notify parent component
      if (this.props.onSave) {
        this.props.onSave(updatedStudent);
      }
    } catch (error) {
      logger.error('Failed to save profile', error);
    }
  }

  close() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  onMount() {
    logger.info(`Opened profile for ${this.state.student?.name}`);
    // Lock body scroll
    document.body.classList.add('modal-open');
  }

  onUnmount() {
    // Unlock body scroll
    document.body.classList.remove('modal-open');
  }
}

export function addStudentProfileModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .student-profile-modal {
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .profile-header {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(255, 167, 38, 0.1), rgba(96, 165, 250, 0.1));
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .profile-avatar {
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--amber-warm), var(--color-academics));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .profile-info {
      flex: 1;
    }

    .student-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      color: var(--cream);
    }

    .student-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .meta-badge {
      padding: 0.25rem 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 0.85rem;
      color: var(--cream);
    }

    .meta-badge.special {
      background: var(--amber-warm);
      color: var(--navy-deep);
      font-weight: 600;
    }

    /* Tabs */
    .profile-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      overflow-x: auto;
    }

    .profile-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--gray-soft);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .profile-tab:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--cream);
    }

    .profile-tab.active {
      border-bottom-color: var(--amber-warm);
      color: var(--amber-warm);
    }

    .tab-icon {
      font-size: 1.25rem;
    }

    /* Content */
    .profile-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    .profile-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Overview Grid */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .overview-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .overview-card.alert-card {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .card-title {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--cream);
    }

    /* Tags */
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .tag-green {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .tag-red {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .tag-purple {
      background: rgba(167, 139, 250, 0.2);
      color: #c4b5fd;
      border: 1px solid rgba(167, 139, 250, 0.3);
    }

    .tag-remove {
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: white;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tag-remove:hover {
      background: rgba(239, 68, 68, 0.8);
    }

    .empty-hint {
      color: var(--gray-soft);
      font-size: 0.85rem;
      font-style: italic;
    }

    .empty-state {
      color: var(--gray-soft);
      font-size: 0.9rem;
      font-style: italic;
    }

    .notes-preview {
      color: var(--cream);
      line-height: 1.6;
    }

    .trigger-notes {
      color: #fca5a5;
      line-height: 1.6;
    }

    /* Footer */
    .profile-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .profile-tabs {
        flex-wrap: wrap;
      }

      .profile-tab {
        flex: 1 1 auto;
        min-width: 100px;
      }

      .tab-label {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}
