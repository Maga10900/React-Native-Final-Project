import { getToken } from '../storage/token';

const BASE_URL = 'http://localhost:5232';

interface RequestOptions extends RequestInit {
    // Custom options can be added here if needed
}

export async function apiRequest<T>(path: string,options: RequestOptions = {},auth: boolean = false): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const headers: Record<string, string> = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (auth) {
        const token = await getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle generic non-2xx responses
    if (!response.ok) {
        let errorMessage = 'An unexpected error occurred';
        try {
            const errorData = await response.json();
            // Adjust based on how your .NET backend structures errors.
            // E.g., ValidationProblemDetails returns errors object or message array
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData.errors) || `Error ${response.status}`;
        } catch {
            errorMessage = `HTTP Error ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    const text = await response.text();
    // Sometimes API returns 200/204 with no content
    if (!text) {
        return {} as T;
    }

    return JSON.parse(text) as T;
}