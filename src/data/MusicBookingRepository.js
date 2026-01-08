/**
 * Music Booking Repository
 * Manages weekly music class bookings
 */

import { Repository } from '../core/Repository.js';
import { musicBookingSchema } from './schemas.js';
import { generateId } from '../utils/helpers.js';

class MusicBookingRepository extends Repository {
  constructor() {
    super('musicBookings', musicBookingSchema);
  }

  /**
   * Get current week identifier (ISO week format)
   * @returns {string} Week identifier (YYYY-Www)
   */
  getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get bookings for a specific week
   * @param {string} week - Week identifier (YYYY-Www)
   * @returns {Array} Bookings for that week
   */
  getByWeek(week) {
    return this.find((booking) => booking.week === week);
  }

  /**
   * Get this week's bookings
   * @returns {Array} This week's bookings
   */
  getThisWeek() {
    return this.getByWeek(this.getCurrentWeek());
  }

  /**
   * Get booking for specific day and time
   * @param {string} day - Day name (tuesday, wednesday, thursday, friday)
   * @param {string} timeSlot - Time slot
   * @param {string} week - Week identifier (defaults to current week)
   * @returns {Object|null} Booking or null
   */
  getBooking(day, timeSlot, week = null) {
    const weekStr = week || this.getCurrentWeek();
    return this.findOne(
      (booking) =>
        booking.day === day && booking.timeSlot === timeSlot && booking.week === weekStr
    );
  }

  /**
   * Create or update booking
   * @param {string} day - Day name
   * @param {string} timeSlot - Time slot
   * @param {Object} bookingData - Booking data
   * @param {string} week - Week identifier (defaults to current week)
   * @returns {Object} Created/updated booking
   */
  setBooking(day, timeSlot, bookingData = {}, week = null) {
    const weekStr = week || this.getCurrentWeek();
    const existing = this.getBooking(day, timeSlot, weekStr);

    const booking = {
      ...bookingData,
      day,
      timeSlot,
      week: weekStr,
      id: existing ? existing.id : generateId('booking'),
    };

    if (existing) {
      return this.update(existing.id, booking);
    } else {
      return this.add(booking);
    }
  }

  /**
   * Confirm booking
   * @param {string} day - Day name
   * @param {string} timeSlot - Time slot
   * @param {string} week - Week identifier
   * @returns {Object} Updated booking
   */
  confirmBooking(day, timeSlot, week = null) {
    const weekStr = week || this.getCurrentWeek();
    const booking = this.getBooking(day, timeSlot, weekStr);

    if (!booking) {
      throw new Error('Booking not found');
    }

    return this.update(booking.id, { ...booking, confirmed: true });
  }

  /**
   * Unconfirm booking
   * @param {string} day - Day name
   * @param {string} timeSlot - Time slot
   * @param {string} week - Week identifier
   * @returns {Object} Updated booking
   */
  unconfirmBooking(day, timeSlot, week = null) {
    const weekStr = week || this.getCurrentWeek();
    const booking = this.getBooking(day, timeSlot, weekStr);

    if (!booking) {
      throw new Error('Booking not found');
    }

    return this.update(booking.id, { ...booking, confirmed: false });
  }

  /**
   * Delete booking
   * @param {string} day - Day name
   * @param {string} timeSlot - Time slot
   * @param {string} week - Week identifier
   * @returns {boolean} Success status
   */
  deleteBooking(day, timeSlot, week = null) {
    const weekStr = week || this.getCurrentWeek();
    const booking = this.getBooking(day, timeSlot, weekStr);

    if (booking) {
      return this.delete(booking.id);
    }

    return false;
  }

  /**
   * Get bookings grouped by day
   * @param {string} week - Week identifier
   * @returns {Object} Bookings grouped by day
   */
  getByDay(week = null) {
    const weekStr = week || this.getCurrentWeek();
    const bookings = this.getByWeek(weekStr);

    const grouped = {
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    bookings.forEach((booking) => {
      if (grouped[booking.day]) {
        grouped[booking.day].push(booking);
      }
    });

    return grouped;
  }

  /**
   * Get confirmed bookings for the week
   * @param {string} week - Week identifier
   * @returns {Array} Confirmed bookings
   */
  getConfirmed(week = null) {
    const weekStr = week || this.getCurrentWeek();
    return this.find((booking) => booking.week === weekStr && booking.confirmed);
  }

  /**
   * Get unconfirmed bookings for the week
   * @param {string} week - Week identifier
   * @returns {Array} Unconfirmed bookings
   */
  getUnconfirmed(week = null) {
    const weekStr = week || this.getCurrentWeek();
    return this.find((booking) => booking.week === weekStr && !booking.confirmed);
  }

  /**
   * Copy bookings from one week to another
   * @param {string} fromWeek - Source week
   * @param {string} toWeek - Target week
   * @returns {Array} Copied bookings
   */
  copyWeek(fromWeek, toWeek) {
    const bookings = this.getByWeek(fromWeek);
    const copied = [];

    bookings.forEach((booking) => {
      const newBooking = {
        ...booking,
        week: toWeek,
        id: generateId('booking'),
        confirmed: false, // Reset confirmation
      };
      const added = this.add(newBooking);
      copied.push(added);
    });

    return copied;
  }

  /**
   * Clear old bookings
   * @param {number} weeksToKeep - Number of weeks to keep
   * @returns {number} Number of deleted bookings
   */
  clearOldBookings(weeksToKeep = 4) {
    const currentWeek = this.getCurrentWeek();
    const [year, week] = currentWeek.split('-W').map(Number);

    const cutoffWeek = week - weeksToKeep;
    const cutoffYear = cutoffWeek < 1 ? year - 1 : year;
    const cutoffWeekNum = cutoffWeek < 1 ? 52 + cutoffWeek : cutoffWeek;

    const cutoff = `${cutoffYear}-W${cutoffWeekNum.toString().padStart(2, '0')}`;

    return this.deleteWhere((booking) => booking.week < cutoff);
  }

  /**
   * Get booking statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const thisWeek = this.getThisWeek();

    return {
      total: thisWeek.length,
      confirmed: this.getConfirmed().length,
      unconfirmed: this.getUnconfirmed().length,
      byDay: Object.entries(this.getByDay()).reduce((acc, [day, bookings]) => {
        acc[day] = bookings.length;
        return acc;
      }, {}),
    };
  }
}

// Export singleton
export const musicBookingRepository = new MusicBookingRepository();
