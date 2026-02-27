/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Password must be at least 8 chars with one uppercase, one lowercase, one digit
 */
export function isValidPassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return { valid: errors.length === 0, errors };
}

/**
 * Password strength (0-4)
 */
export function passwordStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
}

/**
 * Validate habit title
 */
export function validateHabitTitle(title: string): string | null {
    if (!title.trim()) return 'Habit title is required';
    if (title.trim().length < 2) return 'Title must be at least 2 characters';
    if (title.trim().length > 100) return 'Title must be 100 characters or less';
    return null;
}

/**
 * Validate monthly goal
 */
export function validateMonthlyGoal(goal: number): string | null {
    if (!Number.isInteger(goal)) return 'Goal must be a whole number';
    if (goal < 1) return 'Goal must be at least 1';
    if (goal > 31) return 'Goal cannot exceed 31';
    return null;
}
