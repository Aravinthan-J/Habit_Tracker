/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: ApiError;
}
/**
 * API error structure
 */
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
/**
 * Validation error detail
 */
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}
/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
/**
 * API request config
 */
export interface ApiConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}
/**
 * Authentication token storage
 */
export interface TokenStorage {
    accessToken: string | null;
    refreshToken?: string | null;
    expiresAt?: number;
}
//# sourceMappingURL=api.types.d.ts.map