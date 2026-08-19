// Utility functions for date and time calculations

export class DateUtils {
  /**
   * Parse ISO date string to Date object
   */
  static parseDate(isoString: string): Date {
    return new Date(isoString);
  }

  /**
   * Get today's date as ISO string (date only, no time)
   */
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get tomorrow's date as ISO string
   */
  static tomorrow(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get a date N days from now
   */
  static daysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if a date string is today
   */
  static isToday(dateString: string): boolean {
    return dateString === this.today();
  }

  /**
   * Check if a date string is in the past
   */
  static isPast(dateString: string): boolean {
    return dateString < this.today();
  }

  /**
   * Check if a date string is in the future
   */
  static isFuture(dateString: string): boolean {
    return dateString > this.today();
  }

  /**
   * Get days remaining until a deadline
   */
  static daysUntil(deadline: string): number {
    const today = new Date(this.today());
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if a task is overdue
   */
  static isOverdue(deadline: string, status: string): boolean {
    if (status === 'completed') return false;
    return this.isPast(deadline);
  }

  /**
   * Calculate hours remaining between now and a datetime
   */
  static hoursUntil(isoDatetime: string): number {
    const now = new Date();
    const target = new Date(isoDatetime);
    const diffMs = target.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string (HH:MM)
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Create an ISO datetime string from date and time
   */
  static createDateTime(dateString: string, timeString: string): string {
    const time = timeString || '00:00';
    return `${dateString}T${time}:00Z`;
  }

  /**
   * Extract date part from ISO datetime
   */
  static extractDate(isoDatetime: string): string {
    return isoDatetime.split('T')[0];
  }

  /**
   * Extract time part from ISO datetime (HH:MM)
   */
  static extractTime(isoDatetime: string): string {
    const [time] = isoDatetime.split('T')[1].split(':');
    const [, minutes] = isoDatetime.split('T')[1].split(':');
    return `${time}:${minutes}`;
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format datetime for display
   */
  static formatDateTime(isoDatetime: string): string {
    const date = new Date(isoDatetime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get day of week (0-6, where 0 is Sunday)
   */
  static getDayOfWeek(dateString: string): number {
    return new Date(dateString + 'T00:00:00Z').getDay();
  }

  /**
   * Get day name
   */
  static getDayName(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

export class TimeUtils {
  /**
   * Calculate minutes between two times (in same day)
   */
  static minutesBetween(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return end - start;
  }

  /**
   * Parse time string to minutes
   */
  static timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Convert minutes to time string
   */
  static minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Add minutes to a time string
   */
  static addMinutes(timeString: string, minutes: number): string {
    let totalMinutes = this.timeToMinutes(timeString) + minutes;
    if (totalMinutes >= 24 * 60) {
      totalMinutes -= 24 * 60;
    }
    return this.minutesToTime(totalMinutes);
  }

  /**
   * Format duration as human-readable string
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  }
}

export class ValidationUtils {
  /**
   * Validate if a date string is valid ISO format
   */
  static isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString + 'T00:00:00Z');
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate if a time string is valid HH:MM format
   */
  static isValidTime(timeString: string): boolean {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeString)) return false;
    const [h, m] = timeString.split(':').map(Number);
    return h >= 0 && h < 24 && m >= 0 && m < 60;
  }

  /**
   * Validate if a task title is valid
   */
  static isValidTaskTitle(title: string): boolean {
    return title.trim().length > 0 && title.trim().length <= 200;
  }

  /**
   * Validate if duration is positive
   */
  static isValidDuration(minutes: number): boolean {
    return minutes > 0 && minutes <= 24 * 60;
  }
}
