/**
 * Arena Component - Hockey & Skating Progress Tracker
 * Gamified skill progression system for individual student tracking
 */

import { Component } from '../../core/Component.js';
import { studentRepository } from '../../data/StudentRepository.js';
import { logger } from '../../utils/logger.js';
import { sanitize } from '../../utils/validators.js';

// Skating Progression Levels (Based on user's JSON structure)
const SKATING_LEVELS = [
  {
    id: 'pre-level',
    level: 'Pre-Level: Snowplow Sam',
    order: 0,
    focus: 'Balance & Intro Movement',
    keySkills: 'March then glide; Forward swizzles; Beginning snowplow stop',
    badge: '⛸️',
    color: '#60a5fa',
    drills: [
      {
        name: 'March & Glide Basics',
        video: 'https://www.youtube.com/watch?v=ZM-TX3m6FPc',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Snowplow-Sam-Segment.png',
      },
      {
        name: 'Two-Foot Glide',
        video: 'https://www.youtube.com/watch?v=k8YmH4Klm9s',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Two-Foot-Glide.png',
      },
      {
        name: 'Forward Swizzles',
        video: 'https://www.youtube.com/watch?v=xjY7xH9K5Oo',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Forward-Swizzles.png',
      },
      {
        name: 'Snowplow Stop',
        video: 'https://www.youtube.com/watch?v=AHH3gP7OZtA',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Snowplow-Stop.png',
      },
    ],
  },
  {
    id: 'level-1',
    level: 'Level 1: Rink Rat',
    order: 1,
    focus: 'Forward Stride & One-Foot Glides',
    keySkills: 'Forward stride; Two-foot snowplow stop; One-foot glide (left & right)',
    badge: '🐀',
    color: '#10b981',
    drills: [
      {
        name: 'Forward Stride Technique',
        video: 'https://www.youtube.com/watch?v=WXkbj3DdRNk',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Forward-Stride.png',
      },
      {
        name: 'One-Foot Glide (Left)',
        video: 'https://www.youtube.com/watch?v=M7vZ4kH9cqQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-One-Foot-Glide.png',
      },
      {
        name: 'One-Foot Glide (Right)',
        video: 'https://www.youtube.com/watch?v=M7vZ4kH9cqQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-One-Foot-Glide.png',
      },
      {
        name: 'Two-Foot Snowplow Stop',
        video: 'https://www.youtube.com/watch?v=AHH3gP7OZtA',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Snowplow-Stop.png',
      },
    ],
  },
  {
    id: 'level-2',
    level: 'Level 2: Puck Hog',
    order: 2,
    focus: 'Backwards & Control',
    keySkills: 'Backward swizzles; Hockey stop (left & right); Forward crossovers (left & right)',
    badge: '🐷',
    color: '#f97316',
    drills: [
      {
        name: 'Backward Swizzles',
        video: 'https://www.youtube.com/watch?v=zt5wHKZpUwk',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Backward-Swizzles.png',
      },
      {
        name: 'Hockey Stop (Left)',
        video: 'https://www.youtube.com/watch?v=rMM6dydvV4Y',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Hockey-Stop.png',
      },
      {
        name: 'Hockey Stop (Right)',
        video: 'https://www.youtube.com/watch?v=rMM6dydvV4Y',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Hockey-Stop.png',
      },
      {
        name: 'Forward Crossovers',
        video: 'https://www.youtube.com/watch?v=KUGNPyHZMjw',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Forward-Crossovers.png',
      },
    ],
  },
  {
    id: 'level-3',
    level: 'Level 3: Saucer King',
    order: 3,
    focus: 'Advanced Movement & Transitions',
    keySkills: 'Backward stride; Backward crossovers; Slalom (forward/backward)',
    badge: '👑',
    color: '#a78bfa',
    drills: [
      {
        name: 'Backward Stride',
        video: 'https://www.youtube.com/watch?v=Z2OvQt2RQDo',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Backward-Stride.png',
      },
      {
        name: 'Backward Crossovers',
        video: 'https://www.youtube.com/watch?v=G6Qw7m4nXiM',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Backward-Crossovers.png',
      },
      {
        name: 'Forward Slalom',
        video: 'https://www.youtube.com/watch?v=0R_XOzPXJG0',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Slalom.png',
      },
      {
        name: 'Backward Slalom',
        video: 'https://www.youtube.com/watch?v=0R_XOzPXJG0',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Slalom.png',
      },
    ],
  },
  {
    id: 'level-4',
    level: 'Level 4: Hat Trick',
    order: 4,
    focus: 'Mastery & Advanced Techniques',
    keySkills: 'Tight turns; Transition forward→backward; Full mastery of all prior levels',
    badge: '🎩',
    color: '#fbbf24',
    drills: [
      {
        name: 'Tight Turns (Inside Edge)',
        video: 'https://www.youtube.com/watch?v=NXRQ5VBfY9Q',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Tight-Turns.png',
      },
      {
        name: 'Tight Turns (Outside Edge)',
        video: 'https://www.youtube.com/watch?v=NXRQ5VBfY9Q',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Tight-Turns.png',
      },
      {
        name: 'Forward to Backward Transition',
        video: 'https://www.youtube.com/watch?v=2R3yrH8KZ2I',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Transitions.png',
      },
      {
        name: 'Backward to Forward Transition',
        video: 'https://www.youtube.com/watch?v=2R3yrH8KZ2I',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Transitions.png',
      },
    ],
  },
];

// Hockey Skills Categories
const HOCKEY_SKILLS = [
  {
    id: 'stickhandling',
    category: 'Stickhandling',
    icon: '🏒',
    color: '#60a5fa',
    drills: [
      {
        name: 'Basic Stickhandling',
        video: 'https://www.youtube.com/watch?v=F6nqzqkEzGw',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Stickhandling.png',
      },
      {
        name: 'Wide Stickhandling',
        video: 'https://www.youtube.com/watch?v=EB5zpPDyN5g',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Wide-Stickhandling.png',
      },
      {
        name: 'Figure 8 Stickhandling',
        video: 'https://www.youtube.com/watch?v=yKlQQ6fCFYE',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Figure-8.png',
      },
      {
        name: 'Toe Drag',
        video: 'https://www.youtube.com/watch?v=T0wMVAl3YNM',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Toe-Drag.png',
      },
    ],
  },
  {
    id: 'passing',
    category: 'Passing',
    icon: '🎯',
    color: '#10b981',
    drills: [
      {
        name: 'Forehand Pass',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Forehand-Pass.png',
      },
      {
        name: 'Backhand Pass',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Backhand-Pass.png',
      },
      {
        name: 'Saucer Pass',
        video: 'https://www.youtube.com/watch?v=LMEinRGHHoU',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Saucer-Pass.png',
      },
      {
        name: 'Give and Go',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Give-Go.png',
      },
    ],
  },
  {
    id: 'shooting',
    category: 'Shooting',
    icon: '🥅',
    color: '#f97316',
    drills: [
      {
        name: 'Wrist Shot',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Wrist-Shot.png',
      },
      {
        name: 'Snap Shot',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Snap-Shot.png',
      },
      {
        name: 'Backhand Shot',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Backhand-Shot.png',
      },
      {
        name: 'One-Timer',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-One-Timer.png',
      },
    ],
  },
  {
    id: 'game-understanding',
    category: 'Game Understanding',
    icon: '🧠',
    color: '#a78bfa',
    drills: [
      {
        name: 'Positioning Basics',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Positioning.png',
      },
      {
        name: 'Reading the Play',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Reading-Play.png',
      },
      {
        name: 'Defensive Coverage',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Defense.png',
      },
      {
        name: 'Offensive Zone Play',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://hockeytrainingpro.com/wp-content/uploads/2018/02/HTP-Offensive-Zone.png',
      },
    ],
  },
];

export class Arena extends Component {
  constructor(container, props = {}) {
    super(container, props);

    this.state = {
      students: [],
      selectedStudent: null,
      view: 'overview', // 'overview' | 'student-detail'
      activeTab: 'overview', // 'overview' | 'skating' | 'hockey'
    };
  }

  /**
   * Initialize student progress if not exists
   */
  initializeStudentProgress(student) {
    if (!student.hockeyProgress) {
      student.hockeyProgress = {
        skatingLevel: 'pre-level',
        completedDrills: [],
        masteredSkills: [],
        achievements: [],
        lastUpdated: new Date().toISOString(),
      };
      studentRepository.update(student.id, student);
    }
    return student;
  }

  /**
   * Get current skating level details
   */
  getCurrentLevel(student) {
    const progress = student.hockeyProgress || {};
    return SKATING_LEVELS.find(l => l.id === progress.skatingLevel) || SKATING_LEVELS[0];
  }

  /**
   * Calculate progress percentage for a level
   */
  calculateLevelProgress(student, levelId) {
    const progress = student.hockeyProgress || {};
    const level = SKATING_LEVELS.find(l => l.id === levelId);
    if (!level) return 0;

    const totalDrills = level.drills.length;
    const completedDrills = level.drills.filter(drill =>
      progress.completedDrills?.includes(`${levelId}:${drill.name}`)
    ).length;

    return totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;
  }

  /**
   * Calculate overall skating progress
   */
  calculateOverallProgress(student) {
    const progress = student.hockeyProgress || {};
    const currentLevel = SKATING_LEVELS.find(l => l.id === progress.skatingLevel) || SKATING_LEVELS[0];
    const totalLevels = SKATING_LEVELS.length;

    const levelWeight = currentLevel.order / totalLevels;
    const currentLevelProgress = this.calculateLevelProgress(student, currentLevel.id) / 100;
    const levelIncrement = currentLevelProgress / totalLevels;

    return Math.round((levelWeight + levelIncrement) * 100);
  }

  template() {
    const { view } = this.state;

    return `
      <div class="arena-container">
        <div class="arena-header">
          <h2 class="section-title">⛸️ Arena - Hockey & Skating Progress</h2>
          <p class="section-subtitle">Gamified skill progression tracker for each student</p>
        </div>

        ${view === 'overview' ? this.renderStudentGrid() : this.renderStudentDetail()}
      </div>
    `;
  }

  /**
   * Render student grid overview
   */
  renderStudentGrid() {
    const { students } = this.state;

    return `
      <div class="student-progress-grid">
        ${students.length > 0
          ? students.map(student => this.renderStudentProgressCard(student)).join('')
          : this.renderEmptyState()}
      </div>
    `;
  }

  /**
   * Render individual student progress card
   */
  renderStudentProgressCard(student) {
    const currentLevel = this.getCurrentLevel(student);
    const overallProgress = this.calculateOverallProgress(student);
    const progress = student.hockeyProgress || {};

    return `
      <div class="student-progress-card" data-student-id="${student.id}">
        <div class="progress-card-header">
          <div class="student-avatar-sm">
            ${student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div class="progress-card-info">
            <h3 class="student-name-sm">${sanitize(student.name)}</h3>
            <div class="current-level-badge" style="background: ${currentLevel.color};">
              ${currentLevel.badge} ${currentLevel.level}
            </div>
          </div>
        </div>

        <div class="progress-stats">
          <div class="stat-box">
            <div class="stat-label">Overall Progress</div>
            <div class="stat-value">${overallProgress}%</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${overallProgress}%; background: ${currentLevel.color};"></div>
            </div>
          </div>

          <div class="stat-row">
            <div class="stat-mini">
              <span class="stat-mini-icon">⛸️</span>
              <span class="stat-mini-value">${progress.completedDrills?.length || 0} drills</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-icon">🏒</span>
              <span class="stat-mini-value">${progress.masteredSkills?.length || 0} skills</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-small view-student-btn" data-student-id="${student.id}">
          View Progress →
        </button>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">⛸️</div>
        <h3>No students found</h3>
        <p>Add students to start tracking their hockey progress</p>
      </div>
    `;
  }

  /**
   * Render detailed student view
   */
  renderStudentDetail() {
    const { selectedStudent, activeTab } = this.state;
    if (!selectedStudent) return '';

    const currentLevel = this.getCurrentLevel(selectedStudent);

    return `
      <div class="student-detail-view">
        <div class="detail-header">
          <button class="btn btn-secondary btn-small" id="back-to-grid">
            ← Back to All Students
          </button>
          <div class="detail-student-info">
            <div class="student-avatar-lg">
              ${selectedStudent.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 class="detail-student-name">${sanitize(selectedStudent.name)}</h2>
              <div class="current-level-badge-lg" style="background: ${currentLevel.color};">
                ${currentLevel.badge} ${currentLevel.level}
              </div>
            </div>
          </div>
        </div>

        <div class="detail-tabs">
          <button class="detail-tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            📊 Overview
          </button>
          <button class="detail-tab ${activeTab === 'skating' ? 'active' : ''}" data-tab="skating">
            ⛸️ Skating Levels
          </button>
          <button class="detail-tab ${activeTab === 'hockey' ? 'active' : ''}" data-tab="hockey">
            🏒 Hockey Skills
          </button>
        </div>

        <div class="detail-content">
          ${activeTab === 'overview' ? this.renderOverviewTab(selectedStudent) : ''}
          ${activeTab === 'skating' ? this.renderSkatingTab(selectedStudent) : ''}
          ${activeTab === 'hockey' ? this.renderHockeyTab(selectedStudent) : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render overview tab
   */
  renderOverviewTab(student) {
    const overallProgress = this.calculateOverallProgress(student);
    const currentLevel = this.getCurrentLevel(student);
    const currentLevelProgress = this.calculateLevelProgress(student, currentLevel.id);
    const progress = student.hockeyProgress || {};

    return `
      <div class="overview-tab">
        <div class="overview-stats-grid">
          <div class="overview-stat-card">
            <div class="overview-stat-icon" style="background: ${currentLevel.color};">⛸️</div>
            <div class="overview-stat-content">
              <div class="overview-stat-label">Current Level</div>
              <div class="overview-stat-value">${currentLevel.level}</div>
              <div class="overview-stat-sub">${currentLevelProgress}% Complete</div>
            </div>
          </div>

          <div class="overview-stat-card">
            <div class="overview-stat-icon" style="background: #10b981;">📈</div>
            <div class="overview-stat-content">
              <div class="overview-stat-label">Overall Progress</div>
              <div class="overview-stat-value">${overallProgress}%</div>
              <div class="overview-stat-sub">Across all levels</div>
            </div>
          </div>

          <div class="overview-stat-card">
            <div class="overview-stat-icon" style="background: #f97316;">✓</div>
            <div class="overview-stat-content">
              <div class="overview-stat-label">Completed Drills</div>
              <div class="overview-stat-value">${progress.completedDrills?.length || 0}</div>
              <div class="overview-stat-sub">Total mastered</div>
            </div>
          </div>

          <div class="overview-stat-card">
            <div class="overview-stat-icon" style="background: #a78bfa;">🏒</div>
            <div class="overview-stat-content">
              <div class="overview-stat-label">Hockey Skills</div>
              <div class="overview-stat-value">${progress.masteredSkills?.length || 0}</div>
              <div class="overview-stat-sub">Skills mastered</div>
            </div>
          </div>
        </div>

        <div class="roadmap-section">
          <h3 class="section-subtitle-sm">🗺️ Skating Progression Roadmap</h3>
          <div class="level-roadmap">
            ${SKATING_LEVELS.map(level => this.renderRoadmapLevel(student, level)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render roadmap level
   */
  renderRoadmapLevel(student, level) {
    const currentLevel = this.getCurrentLevel(student);
    const progress = this.calculateLevelProgress(student, level.id);

    let status = 'locked';
    if (level.order < currentLevel.order) status = 'completed';
    else if (level.id === currentLevel.id) status = 'current';

    return `
      <div class="roadmap-level ${status}" style="border-color: ${level.color};">
        <div class="roadmap-level-badge" style="background: ${level.color};">
          ${level.badge}
        </div>
        <div class="roadmap-level-info">
          <div class="roadmap-level-name">${level.level}</div>
          <div class="roadmap-level-focus">${level.focus}</div>
          ${status === 'current' ? `
            <div class="roadmap-progress">
              <div class="roadmap-progress-bar">
                <div class="roadmap-progress-fill" style="width: ${progress}%; background: ${level.color};"></div>
              </div>
              <span class="roadmap-progress-text">${progress}%</span>
            </div>
          ` : ''}
          ${status === 'completed' ? '<div class="roadmap-status">✓ Completed</div>' : ''}
          ${status === 'locked' ? '<div class="roadmap-status">🔒 Locked</div>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render skating tab
   */
  renderSkatingTab(student) {
    const currentLevel = this.getCurrentLevel(student);

    return `
      <div class="skating-tab">
        <div class="level-selector">
          <h3 class="section-subtitle-sm">Select Level to View Drills</h3>
          <div class="level-buttons">
            ${SKATING_LEVELS.map(level => {
              const isCurrent = level.id === currentLevel.id;
              const isLocked = level.order > currentLevel.order;
              const isCompleted = level.order < currentLevel.order;
              return `
                <button
                  class="level-btn ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}"
                  data-level-id="${level.id}"
                  ${isLocked ? 'disabled' : ''}
                  style="border-color: ${level.color};">
                  <span class="level-btn-badge" style="background: ${level.color};">${level.badge}</span>
                  <span class="level-btn-text">${level.level}</span>
                  ${isCompleted ? '<span class="level-btn-status">✓</span>' : ''}
                  ${isLocked ? '<span class="level-btn-status">🔒</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="level-detail" id="level-detail-container">
          ${this.renderLevelDetail(student, currentLevel)}
        </div>
      </div>
    `;
  }

  /**
   * Render level detail with drills
   */
  renderLevelDetail(student, level) {
    const progress = student.hockeyProgress || {};
    const levelProgress = this.calculateLevelProgress(student, level.id);

    return `
      <div class="level-detail-card">
        <div class="level-detail-header" style="background: linear-gradient(135deg, ${level.color}, ${level.color}cc);">
          <div class="level-detail-badge">${level.badge}</div>
          <div class="level-detail-info">
            <h3>${level.level}</h3>
            <p class="level-detail-focus">${level.focus}</p>
            <p class="level-detail-skills"><strong>Key Skills:</strong> ${level.keySkills}</p>
          </div>
        </div>

        <div class="level-detail-progress">
          <div class="level-progress-header">
            <span>Level Progress</span>
            <span class="level-progress-percent">${levelProgress}%</span>
          </div>
          <div class="level-progress-bar-lg">
            <div class="level-progress-fill-lg" style="width: ${levelProgress}%; background: ${level.color};"></div>
          </div>
        </div>

        <div class="drill-cards-grid">
          ${level.drills.map(drill => {
            const drillKey = `${level.id}:${drill.name}`;
            const isCompleted = progress.completedDrills?.includes(drillKey);
            return `
              <div class="drill-card-item ${isCompleted ? 'completed' : ''}">
                <div class="drill-card-image" style="background-image: url('${drill.image}');">
                  ${isCompleted ? '<div class="drill-completed-badge">✓</div>' : ''}
                </div>
                <div class="drill-card-content">
                  <h4 class="drill-card-name">${drill.name}</h4>
                  <a href="${drill.video}" target="_blank" class="drill-video-link">
                    📺 Watch Video Tutorial
                  </a>
                  <button
                    class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-small mark-complete-btn"
                    data-level-id="${level.id}"
                    data-drill-name="${drill.name}">
                    ${isCompleted ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${levelProgress === 100 && level.order < SKATING_LEVELS.length - 1 ? `
          <div class="level-advance-section">
            <p class="level-advance-message">🎉 Congratulations! All drills completed!</p>
            <button class="btn btn-primary advance-level-btn" data-level-id="${level.id}">
              Advance to Next Level →
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render hockey skills tab
   */
  renderHockeyTab(student) {
    const progress = student.hockeyProgress || {};

    return `
      <div class="hockey-tab">
        <h3 class="section-subtitle-sm">🏒 Hockey Skill Development</h3>
        <p class="hockey-tab-intro">Master these essential hockey skills to become a complete player</p>

        <div class="hockey-skills-grid">
          ${HOCKEY_SKILLS.map(skillCategory => {
            const masteredCount = skillCategory.drills.filter(drill =>
              progress.masteredSkills?.includes(`${skillCategory.id}:${drill.name}`)
            ).length;
            const totalDrills = skillCategory.drills.length;
            const categoryProgress = totalDrills > 0 ? Math.round((masteredCount / totalDrills) * 100) : 0;

            return `
              <div class="hockey-skill-category">
                <div class="hockey-skill-header" style="background: ${skillCategory.color};">
                  <span class="hockey-skill-icon">${skillCategory.icon}</span>
                  <h4>${skillCategory.category}</h4>
                </div>

                <div class="hockey-skill-progress-bar">
                  <div class="hockey-skill-progress-fill" style="width: ${categoryProgress}%; background: ${skillCategory.color};"></div>
                </div>
                <div class="hockey-skill-progress-text">${masteredCount}/${totalDrills} Mastered</div>

                <div class="hockey-drill-list">
                  ${skillCategory.drills.map(drill => {
                    const drillKey = `${skillCategory.id}:${drill.name}`;
                    const isMastered = progress.masteredSkills?.includes(drillKey);

                    return `
                      <div class="hockey-drill-item ${isMastered ? 'mastered' : ''}">
                        <div class="hockey-drill-image" style="background-image: url('${drill.image}');">
                          ${isMastered ? '<div class="drill-mastered-badge">✓</div>' : ''}
                        </div>
                        <div class="hockey-drill-content">
                          <h5 class="hockey-drill-name">${drill.name}</h5>
                          <a href="${drill.video}" target="_blank" class="hockey-video-link">
                            📺 Watch Tutorial
                          </a>
                          <button
                            class="btn ${isMastered ? 'btn-secondary' : 'btn-primary'} btn-small mark-mastered-btn"
                            data-category-id="${skillCategory.id}"
                            data-drill-name="${drill.name}">
                            ${isMastered ? '✓ Mastered' : 'Mark as Mastered'}
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  attachEvents() {
    // View student buttons
    const viewBtns = this.$$('.view-student-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const studentId = parseInt(btn.dataset.studentId);
        this.viewStudent(studentId);
      });
    });

    // Back to grid button
    const backBtn = this.$('#back-to-grid');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.setState({ view: 'overview', selectedStudent: null });
      });
    }

    // Tab buttons
    const tabBtns = this.$$('.detail-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.setState({ activeTab: tab });
      });
    });

    // Level selector buttons
    const levelBtns = this.$$('.level-btn');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const levelId = btn.dataset.levelId;
        this.showLevelDetail(levelId);
      });
    });

    // Mark complete buttons (skating drills)
    const completeButtons = this.$$('.mark-complete-btn');
    completeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const levelId = btn.dataset.levelId;
        const drillName = btn.dataset.drillName;
        this.markDrillComplete(levelId, drillName);
      });
    });

    // Mark mastered buttons (hockey skills)
    const masteredButtons = this.$$('.mark-mastered-btn');
    masteredButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const categoryId = btn.dataset.categoryId;
        const drillName = btn.dataset.drillName;
        this.markSkillMastered(categoryId, drillName);
      });
    });

    // Advance level button
    const advanceBtn = this.$('.advance-level-btn');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => {
        const currentLevelId = advanceBtn.dataset.levelId;
        this.advanceToNextLevel(currentLevelId);
      });
    }
  }

  /**
   * View student details
   */
  viewStudent(studentId) {
    const student = this.state.students.find(s => s.id === studentId);
    if (student) {
      this.initializeStudentProgress(student);
      this.setState({
        selectedStudent: student,
        view: 'student-detail',
        activeTab: 'overview',
      });
      logger.info(`Viewing progress for: ${student.name}`);
    }
  }

  /**
   * Show level detail
   */
  showLevelDetail(levelId) {
    const { selectedStudent } = this.state;
    if (!selectedStudent) return;

    const level = SKATING_LEVELS.find(l => l.id === levelId);
    if (!level) return;

    const container = this.$('#level-detail-container');
    if (container) {
      container.innerHTML = this.renderLevelDetail(selectedStudent, level);
      this.attachDrillButtons();
    }
  }

  /**
   * Attach drill buttons after dynamic render
   */
  attachDrillButtons() {
    // Reattach complete buttons
    const completeButtons = this.$$('.mark-complete-btn');
    completeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const levelId = btn.dataset.levelId;
        const drillName = btn.dataset.drillName;
        this.markDrillComplete(levelId, drillName);
      });
    });

    // Reattach advance button
    const advanceBtn = this.$('.advance-level-btn');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => {
        const currentLevelId = advanceBtn.dataset.levelId;
        this.advanceToNextLevel(currentLevelId);
      });
    }
  }

  /**
   * Mark drill as complete
   */
  markDrillComplete(levelId, drillName) {
    const { selectedStudent } = this.state;
    if (!selectedStudent) return;

    const drillKey = `${levelId}:${drillName}`;
    const progress = selectedStudent.hockeyProgress || {};

    if (!progress.completedDrills) {
      progress.completedDrills = [];
    }

    if (progress.completedDrills.includes(drillKey)) {
      // Unmark
      progress.completedDrills = progress.completedDrills.filter(d => d !== drillKey);
      logger.info(`Unmarked: ${drillName}`);
    } else {
      // Mark complete
      progress.completedDrills.push(drillKey);
      logger.success(`✓ Completed: ${drillName}`);
    }

    progress.lastUpdated = new Date().toISOString();
    selectedStudent.hockeyProgress = progress;
    studentRepository.update(selectedStudent.id, selectedStudent);

    // Re-render
    this.render();
  }

  /**
   * Mark hockey skill as mastered
   */
  markSkillMastered(categoryId, drillName) {
    const { selectedStudent } = this.state;
    if (!selectedStudent) return;

    const skillKey = `${categoryId}:${drillName}`;
    const progress = selectedStudent.hockeyProgress || {};

    if (!progress.masteredSkills) {
      progress.masteredSkills = [];
    }

    if (progress.masteredSkills.includes(skillKey)) {
      // Unmark
      progress.masteredSkills = progress.masteredSkills.filter(s => s !== skillKey);
      logger.info(`Unmarked: ${drillName}`);
    } else {
      // Mark mastered
      progress.masteredSkills.push(skillKey);
      logger.success(`✓ Mastered: ${drillName}`);
    }

    progress.lastUpdated = new Date().toISOString();
    selectedStudent.hockeyProgress = progress;
    studentRepository.update(selectedStudent.id, selectedStudent);

    // Re-render
    this.render();
  }

  /**
   * Advance to next skating level
   */
  advanceToNextLevel(currentLevelId) {
    const { selectedStudent } = this.state;
    if (!selectedStudent) return;

    const currentLevel = SKATING_LEVELS.find(l => l.id === currentLevelId);
    if (!currentLevel) return;

    const nextLevel = SKATING_LEVELS[currentLevel.order + 1];
    if (!nextLevel) {
      logger.info('Already at highest level!');
      return;
    }

    const progress = selectedStudent.hockeyProgress || {};
    progress.skatingLevel = nextLevel.id;
    progress.lastUpdated = new Date().toISOString();

    if (!progress.achievements) {
      progress.achievements = [];
    }
    progress.achievements.push({
      type: 'level-advance',
      level: nextLevel.id,
      date: new Date().toISOString(),
    });

    selectedStudent.hockeyProgress = progress;
    studentRepository.update(selectedStudent.id, selectedStudent);

    logger.success(`🎉 Advanced to ${nextLevel.level}!`);
    this.render();
  }

  /**
   * Load students on mount
   */
  loadStudents() {
    const students = studentRepository.getAllSorted();
    students.forEach(s => this.initializeStudentProgress(s));
    this.setState({ students });
    logger.info(`Loaded ${students.length} students for Arena`);
  }

  onMount() {
    this.loadStudents();
    logger.info('Arena component mounted');
  }
}

export function addArenaStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .arena-container {
      width: 100%;
      padding: 1.5rem;
    }

    .arena-header {
      margin-bottom: 2rem;
    }

    .section-subtitle {
      color: var(--gray-soft);
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    /* Student Grid */
    .student-progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .student-progress-card {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s;
    }

    .student-progress-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 167, 38, 0.2);
    }

    .progress-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .student-avatar-sm {
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

    .progress-card-info {
      flex: 1;
    }

    .student-name-sm {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      color: var(--cream);
      font-weight: 600;
    }

    .current-level-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
    }

    .progress-stats {
      margin-bottom: 1rem;
    }

    .stat-box {
      margin-bottom: 1rem;
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--gray-soft);
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--amber-warm);
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .stat-row {
      display: flex;
      gap: 1rem;
    }

    .stat-mini {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.5rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--cream);
    }

    .stat-mini-icon {
      font-size: 1.2rem;
    }

    /* Student Detail View */
    .student-detail-view {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .detail-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .detail-student-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .student-avatar-lg {
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
      flex-shrink: 0;
    }

    .detail-student-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      color: var(--cream);
    }

    .current-level-badge-lg {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }

    .detail-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }

    .detail-tab {
      background: transparent;
      border: none;
      color: var(--gray-soft);
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
      margin-bottom: -2px;
    }

    .detail-tab:hover {
      color: var(--cream);
      background: rgba(255, 255, 255, 0.05);
    }

    .detail-tab.active {
      color: var(--amber-warm);
      border-bottom-color: var(--amber-warm);
    }

    .detail-content {
      min-height: 400px;
    }

    /* Overview Tab */
    .overview-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .overview-stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .overview-stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      flex-shrink: 0;
    }

    .overview-stat-label {
      font-size: 0.85rem;
      color: var(--gray-soft);
      margin-bottom: 0.25rem;
    }

    .overview-stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--cream);
      margin-bottom: 0.25rem;
    }

    .overview-stat-sub {
      font-size: 0.8rem;
      color: var(--gray-soft);
    }

    .section-subtitle-sm {
      font-size: 1.25rem;
      color: var(--cream);
      margin-bottom: 1rem;
    }

    .roadmap-section {
      margin-top: 2rem;
    }

    .level-roadmap {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .roadmap-level {
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.2s;
    }

    .roadmap-level.locked {
      opacity: 0.5;
    }

    .roadmap-level.current {
      background: rgba(255, 167, 38, 0.1);
      box-shadow: 0 0 20px rgba(255, 167, 38, 0.3);
    }

    .roadmap-level.completed {
      background: rgba(16, 185, 129, 0.05);
    }

    .roadmap-level-badge {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      flex-shrink: 0;
      color: white;
    }

    .roadmap-level-info {
      flex: 1;
    }

    .roadmap-level-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--cream);
      margin-bottom: 0.25rem;
    }

    .roadmap-level-focus {
      font-size: 0.9rem;
      color: var(--gray-soft);
      margin-bottom: 0.5rem;
    }

    .roadmap-progress {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .roadmap-progress-bar {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .roadmap-progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .roadmap-progress-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--amber-warm);
    }

    .roadmap-status {
      font-size: 0.85rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    /* Skating Tab */
    .level-selector {
      margin-bottom: 2rem;
    }

    .level-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .level-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--cream);
      font-size: 0.95rem;
    }

    .level-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .level-btn.active {
      background: rgba(255, 167, 38, 0.2);
      border-color: var(--amber-warm);
    }

    .level-btn.locked {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .level-btn-badge {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      color: white;
    }

    .level-btn-text {
      flex: 1;
    }

    .level-btn-status {
      font-size: 1.25rem;
    }

    .level-detail-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .level-detail-header {
      padding: 2rem;
      color: white;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .level-detail-badge {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      flex-shrink: 0;
    }

    .level-detail-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
    }

    .level-detail-focus {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .level-detail-skills {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .level-detail-progress {
      padding: 1.5rem 2rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .level-progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: var(--cream);
    }

    .level-progress-percent {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--amber-warm);
    }

    .level-progress-bar-lg {
      height: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }

    .level-progress-fill-lg {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 6px;
    }

    .drill-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .drill-card-item {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s;
    }

    .drill-card-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }

    .drill-card-item.completed {
      border-color: var(--color-fitness);
      background: rgba(16, 185, 129, 0.1);
    }

    .drill-card-image {
      height: 150px;
      background-size: cover;
      background-position: center;
      background-color: rgba(255, 255, 255, 0.05);
      position: relative;
    }

    .drill-completed-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 40px;
      height: 40px;
      background: var(--color-fitness);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .drill-card-content {
      padding: 1rem;
    }

    .drill-card-name {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      color: var(--cream);
    }

    .drill-video-link {
      display: block;
      color: var(--amber-warm);
      text-decoration: none;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .drill-video-link:hover {
      text-decoration: underline;
    }

    .level-advance-section {
      padding: 2rem;
      text-align: center;
      background: rgba(255, 167, 38, 0.1);
      border-top: 2px solid var(--amber-warm);
    }

    .level-advance-message {
      font-size: 1.1rem;
      color: var(--cream);
      margin-bottom: 1rem;
    }

    /* Hockey Tab */
    .hockey-tab-intro {
      color: var(--gray-soft);
      margin-bottom: 2rem;
    }

    .hockey-skills-grid {
      display: grid;
      gap: 2rem;
    }

    .hockey-skill-category {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .hockey-skill-header {
      padding: 1.5rem;
      color: white;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .hockey-skill-icon {
      font-size: 2rem;
    }

    .hockey-skill-header h4 {
      margin: 0;
      font-size: 1.5rem;
    }

    .hockey-skill-progress-bar {
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
    }

    .hockey-skill-progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .hockey-skill-progress-text {
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      color: var(--gray-soft);
      background: rgba(0, 0, 0, 0.2);
    }

    .hockey-drill-list {
      padding: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .hockey-drill-item {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s;
    }

    .hockey-drill-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }

    .hockey-drill-item.mastered {
      border-color: var(--color-fitness);
      background: rgba(16, 185, 129, 0.1);
    }

    .hockey-drill-image {
      height: 150px;
      background-size: cover;
      background-position: center;
      background-color: rgba(255, 255, 255, 0.05);
      position: relative;
    }

    .drill-mastered-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 40px;
      height: 40px;
      background: var(--color-fitness);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .hockey-drill-content {
      padding: 1rem;
    }

    .hockey-drill-name {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      color: var(--cream);
    }

    .hockey-video-link {
      display: block;
      color: var(--amber-warm);
      text-decoration: none;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .hockey-video-link:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .student-progress-grid,
      .drill-cards-grid,
      .hockey-drill-list {
        grid-template-columns: 1fr;
      }

      .overview-stats-grid {
        grid-template-columns: 1fr;
      }

      .detail-tabs {
        overflow-x: auto;
      }

      .level-buttons {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
