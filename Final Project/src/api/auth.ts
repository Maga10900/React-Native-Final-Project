import { apiRequest } from './client';

export type RegisterRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    age: number;
    userType: number; // usually 1 for standard user, 4 for worker
    job?: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    refreshToken?: string;
    // include other fields if your API returns them
};

/**
 * Registers a new user.
 */
export async function registerUser(data: RegisterRequest): Promise<void> {
    return apiRequest<void>('/api/Auth/Register', {
        method: 'POST',
        body: JSON.stringify(data),
    }, false);
}

/**
 * Authenticates a user and returns their JWT.
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiRequest<{ data: LoginResponse }>('/api/Auth/Login', {
        method: 'POST',
        body: JSON.stringify(data),
    }, false);
    return response.data;
}