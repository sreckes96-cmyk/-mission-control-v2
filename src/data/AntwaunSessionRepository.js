/**
 * Antwaun Session Repository
 * Manages Antwaun's 1-on-1 session tracking
 */

import { Repository } from '../core/Repository.js';
import { antwaunSessionSchema } from './schemas.js';

class AntwaunSessionRepository extends Repository {
  constructor() {
    super('antwaunSessions', antwaunSessionSchema);
  }

  /**
   * Get session for specific date
   * @param {string} date - ISO date string
   * @returns {Object|null} Session or null
   */
  getByDate(date) {
    return this.findOne((session) => session.date === date);
  }

  /**
   * Get today's session
   * @returns {Object|null} Today's session or null
   */
  getToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today);
  }

  /**
   * Add or update session for a date
   * @param {string} date - ISO date string
   * @param {Object} sessionData - Session data
   * @returns {Object} Created/updated session
   */
  setSession(date, sessionData) {
    const existing = this.getByDate(date);

    const session = {
      ...sessionData,
      date,
      id: existing ? existing.id : this.generateId(this.getAll()),
    };

    // Calculate badges
    session.badges = this.calculateBadges(session);

    if (existing) {
      return this.update(existing.id, session);
    } else {
      return this.add(session);
    }
  }

  /**
   * Calculate achievement badges for session
   * @param {Object} session - Session data
   * @returns {Array<string>} Badge names
   */
  calculateBadges(session) {
    const badges = [];

    // Lexia badges
    if (session.lexiaMinutes >= 30) badges.push('lexia_30');
    if (session.lexiaMinutes >= 45) badges.push('lexia_45');
    if (session.lexiaMinutes >= 60) badges.push('lexia_60');

    // Math badges
    if (session.mathMinutes >= 30) badges.push('math_30');
    if (session.mathMinutes >= 45) badges.push('math_45');
    if (session.mathMinutes >= 60) badges.push('math_60');

    // Music badge
    if (session.musicMinutes > 0) badges.push('music_attended');

    // Fitness badge
    if (session.fitnessMinutes >= 20) badges.push('fitness_20');
    if (session.fitnessMinutes >= 30) badges.push('fitness_30');

    // Perfect day (all categories met minimum)
    if (
      session.lexiaMinutes >= 30 &&
      session.mathMinutes >= 30 &&
      session.musicMinutes > 0 &&
      session.fitnessMinutes >= 20
    ) {
      badges.push('perfect_day');
    }

    return badges;
  }

  /**
   * Get sessions in date range
   * @param {string} startDate - Start date (ISO)
   * @param {string} endDate - End date (ISO)
   * @returns {Array} Sessions in range
   */
  getByDateRange(startDate, endDate) {
    return this.find((session) => session.date >= startDate && session.date <= endDate);
  }

  /**
   * Get last N sessions
   * @param {number} count - Number of sessions
   * @returns {Array} Recent sessions
   */
  getRecent(count = 7) {
    const sessions = this.getAll();
    return sessions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
  }

  /**
   * Get this week's sessions
   * @returns {Array} This week's sessions
   */
  getThisWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = sunday.toISOString().split('T')[0];

    return this.getByDateRange(startDate, endDate);
  }

  /**
   * Get weekly statistics
   * @returns {Object} Weekly stats
   */
  getWeeklyStats() {
    const sessions = this.getThisWeek();

    return {
      totalSessions: sessions.length,
      totalLexiaMinutes: sessions.reduce((sum, s) => sum + (s.lexiaMinutes || 0), 0),
      totalMathMinutes: sessions.reduce((sum, s) => sum + (s.mathMinutes || 0), 0),
      totalMusicMinutes: sessions.reduce((sum, s) => sum + (s.musicMinutes || 0), 0),
      totalFitnessMinutes: sessions.reduce((sum, s) => sum + (s.fitnessMinutes || 0), 0),
      perfectDays: sessions.filter((s) => s.badges?.includes('perfect_day')).length,
      averageLexia: sessions.length
        ? sessions.reduce((sum, s) => sum + (s.lexiaMinutes || 0), 0) / sessions.length
        : 0,
      averageMath: sessions.length
        ? sessions.reduce((sum, s) => sum + (s.mathMinutes || 0), 0) / sessions.length
        : 0,
    };
  }

  /**
   * Get all-time statistics
   * @returns {Object} All-time stats
   */
  getAllTimeStats() {
    const sessions = this.getAll();

    const badges = {};
    sessions.forEach((session) => {
      (session.badges || []).forEach((badge) => {
        badges[badge] = (badges[badge] || 0) + 1;
      });
    });

    return {
      totalSessions: sessions.length,
      totalLexiaMinutes: sessions.reduce((sum, s) => sum + (s.lexiaMinutes || 0), 0),
      totalMathMinutes: sessions.reduce((sum, s) => sum + (s.mathMinutes || 0), 0),
      totalMusicMinutes: sessions.reduce((sum, s) => sum + (s.musicMinutes || 0), 0),
      totalFitnessMinutes: sessions.reduce((sum, s) => sum + (s.fitnessMinutes || 0), 0),
      badges,
      streak: this.getCurrentStreak(),
      longestStreak: this.getLongestStreak(),
    };
  }

  /**
   * Get current consecutive day streak
   * @returns {number} Current streak
   */
  getCurrentStreak() {
    const sessions = this.getAll().sort((a, b) => b.date.localeCompare(a.date));
    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (sessionDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get longest streak in history
   * @returns {number} Longest streak
   */
  getLongestStreak() {
    const sessions = this.getAll().sort((a, b) => a.date.localeCompare(b.date));
    if (sessions.length === 0) return 0;

    let longest = 0;
    let current = 1;

    for (let i = 1; i < sessions.length; i++) {
      const prev = new Date(sessions[i - 1].date);
      const curr = new Date(sessions[i].date);
      const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return Math.max(longest, current);
  }

  /**
   * Get progress chart data for last N days
   * @param {number} days - Number of days
   * @returns {Object} Chart data
   */
  getChartData(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const sessions = this.getByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const sessionMap = {};
    sessions.forEach((session) => {
      sessionMap[session.date] = session;
    });

    const labels = [];
    const lexiaData = [];
    const mathData = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      const session = sessionMap[dateStr];
      lexiaData.push(session ? session.lexiaMinutes : 0);
      mathData.push(session ? session.mathMinutes : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Lexia',
          data: lexiaData,
          color: '#60a5fa',
        },
        {
          label: 'Math',
          data: mathData,
          color: '#10b981',
        },
      ],
    };
  }
}

// Export singleton
export const antwaunSessionRepository = new AntwaunSessionRepository();
