/**
 * Validation utility functions
 */

/**
 * Validate email format
 *
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 *
 * @param password - Password string to validate
 * @returns True if password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) {
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  if (!/\d/.test(password)) {
    return false;
  }
  return true;
};

/**
 * Get password strength description
 *
 * @param password - Password string
 * @returns Strength description (weak, medium, strong)
 */
export const getPasswordStrength = (
  password: string
): 'weak' | 'medium' | 'strong' => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Validate habit title
 *
 * @param title - Habit title
 * @returns True if title is valid
 */
export const validateHabitTitle = (title: string): boolean => {
  return title.length >= 1 && title.length <= 100;
};

/**
 * Validate monthly goal
 *
 * @param goal - Monthly goal number
 * @returns True if goal is valid
 */
export const validateMonthlyGoal = (goal: number): boolean => {
  return Number.isInteger(goal) && goal >= 1 && goal <= 31;
};

/**
 * Validate hex color code
 *
 * @param color - Hex color string
 * @returns True if color is valid hex format
 */
export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6})$/;
  return hexRegex.test(color);
};

/**
 * Validate date string (YYYY-MM-DD)
 *
 * @param dateString - Date string to validate
 * @returns True if date is valid
 */
export const validateDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
};

/**
 * Validate time string (HH:MM)
 *
 * @param timeString - Time string to validate
 * @returns True if time is valid
 */
export const validateTime = (timeString: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * Sanitize user input (remove potentially dangerous characters)
 *
 * @param input - User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .substring(0, 1000); // Limit length
};

/**
 * Validate UUID format
 *
 * @param uuid - UUID string to validate
 * @returns True if UUID is valid
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
