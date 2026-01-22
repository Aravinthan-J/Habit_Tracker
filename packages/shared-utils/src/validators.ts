/**
 * Validation Utilities
 * Common validation functions
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate habit title
 */
export function validateHabitTitle(title: string): {
  isValid: boolean;
  error?: string;
} {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }

  if (title.length > 100) {
    return { isValid: false, error: 'Title must be less than 100 characters' };
  }

  return { isValid: true };
}

/**
 * Validate monthly goal (1-31)
 */
export function validateMonthlyGoal(goal: number): {
  isValid: boolean;
  error?: string;
} {
  if (!Number.isInteger(goal)) {
    return { isValid: false, error: 'Monthly goal must be a whole number' };
  }

  if (goal < 1) {
    return { isValid: false, error: 'Monthly goal must be at least 1' };
  }

  if (goal > 31) {
    return { isValid: false, error: 'Monthly goal cannot exceed 31' };
  }

  return { isValid: true };
}

/**
 * Validate hex color format
 */
export function validateHexColor(color: string): boolean {
  const hexColorRegex = /^#[0-9A-F]{6}$/i;
  return hexColorRegex.test(color);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(dateStr: string): {
  isValid: boolean;
  error?: string;
} {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateStr)) {
    return { isValid: false, error: 'Invalid date format (use YYYY-MM-DD)' };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }

  return { isValid: true };
}

/**
 * Validate time format (HH:MM)
 */
export function validateTime(timeStr: string): {
  isValid: boolean;
  error?: string;
} {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timeRegex.test(timeStr)) {
    return { isValid: false, error: 'Invalid time format (use HH:MM, 24-hour)' };
  }

  return { isValid: true };
}

/**
 * Sanitize string (remove special characters)
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '');
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
