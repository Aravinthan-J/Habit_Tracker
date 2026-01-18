/**
 * User entity
 */
export interface User {
    id: string;
    email: string;
    name: string | null;
    stepGoal: number;
    reminderTime: string;
    timezone: string;
    theme: 'light' | 'dark';
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}
/**
 * Registration data
 */
export interface RegisterData {
    email: string;
    password: string;
    name?: string;
}
/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}
/**
 * Authentication response
 */
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}
/**
 * Profile update data
 */
export interface ProfileUpdates {
    name?: string;
    stepGoal?: number;
    reminderTime?: string;
    timezone?: string;
    theme?: 'light' | 'dark';
}
/**
 * Password change data
 */
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
//# sourceMappingURL=user.types.d.ts.map