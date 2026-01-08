/**
 * Schedule Repository
 * Manages daily schedule activities
 */

import { Repository } from '../core/Repository.js';
import { scheduleActivitySchema } from './schemas.js';
import { generateId } from '../utils/helpers.js';

class ScheduleRepository extends Repository {
  constructor() {
    super('schedules', scheduleActivitySchema);
  }

  /**
   * Get activities for a specific date
   * @param {string} date - ISO date string (YYYY-MM-DD)
   * @returns {Array} Activities for that date
   */
  getByDate(date) {
    return this.find((activity) => activity.date === date);
  }

  /**
   * Get activities for today
   * @returns {Array} Today's activities
   */
  getToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today);
  }

  /**
   * Get activity at specific time on a date
   * @param {string} date - ISO date string
   * @param {string} time - Time string (e.g., "09:00")
   * @returns {Object|null} Activity or null
   */
  getByDateTime(date, time) {
    return this.findOne((activity) => activity.date === date && activity.time === time);
  }

  /**
   * Add or update activity
   * @param {string} date - ISO date string
   * @param {string} time - Time string
   * @param {Object} activityData - Activity data
   * @returns {Object} Created/updated activity
   */
  setActivity(date, time, activityData) {
    const existing = this.getByDateTime(date, time);

    const activity = {
      ...activityData,
      date,
      time,
      id: existing ? existing.id : generateId('activity'),
    };

    if (existing) {
      return this.update(existing.id, activity);
    } else {
      return this.add(activity);
    }
  }

  /**
   * Remove activity at specific time
   * @param {string} date - ISO date string
   * @param {string} time - Time string
   * @returns {boolean} Success status
   */
  removeActivity(date, time) {
    const activity = this.getByDateTime(date, time);
    if (activity) {
      return this.delete(activity.id);
    }
    return false;
  }

  /**
   * Get activities by category
   * @param {string} category - Category name
   * @returns {Array} Activities in that category
   */
  getByCategory(category) {
    return this.find((activity) => activity.category === category);
  }

  /**
   * Get activities in date range
   * @param {string} startDate - Start date (ISO)
   * @param {string} endDate - End date (ISO)
   * @returns {Array} Activities in range
   */
  getByDateRange(startDate, endDate) {
    return this.find((activity) => activity.date >= startDate && activity.date <= endDate);
  }

  /**
   * Get this week's activities
   * @returns {Array} This week's activities
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
   * Clear old activities
   * @param {number} daysToKeep - Number of days to keep
   * @returns {number} Number of deleted activities
   */
  clearOldActivities(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoff = cutoffDate.toISOString().split('T')[0];

    return this.deleteWhere((activity) => activity.date < cutoff);
  }

  /**
   * Get schedule statistics
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Object} Statistics
   */
  getStats(startDate = null, endDate = null) {
    let activities = this.getAll();

    if (startDate && endDate) {
      activities = this.getByDateRange(startDate, endDate);
    }

    const byCategory = {};
    activities.forEach((activity) => {
      if (!byCategory[activity.category]) {
        byCategory[activity.category] = 0;
      }
      byCategory[activity.category]++;
    });

    return {
      total: activities.length,
      byCategory,
      uniqueDates: [...new Set(activities.map((a) => a.date))].length,
    };
  }

  /**
   * Copy schedule from one date to another
   * @param {string} fromDate - Source date
   * @param {string} toDate - Target date
   * @returns {Array} Copied activities
   */
  copySchedule(fromDate, toDate) {
    const activities = this.getByDate(fromDate);
    const copied = [];

    activities.forEach((activity) => {
      const newActivity = {
        ...activity,
        date: toDate,
        id: generateId('activity'),
      };
      const added = this.add(newActivity);
      copied.push(added);
    });

    return copied;
  }

  /**
   * Get schedule as grouped by time
   * @param {string} date - ISO date string
   * @returns {Object} Activities grouped by time
   */
  getScheduleByTime(date) {
    const activities = this.getByDate(date);
    const grouped = {};

    activities.forEach((activity) => {
      grouped[activity.time] = activity;
    });

    return grouped;
  }
}

// Export singleton
export const scheduleRepository = new ScheduleRepository();
