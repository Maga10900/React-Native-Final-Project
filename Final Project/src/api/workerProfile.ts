import { getToken } from '../storage/token';
import { decodeJwt } from '../utils/jwt';
import { apiRequest } from './client';

export interface WorkerProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    age: number;
    profilePhoto?: string;
    description?: string;
    rating: number;
    job?: string;
}

export interface UpdateWorkerRequest {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    age: number;
    profilePhoto?: string;
    description?: string;
    rating: number;
    job?: string;
}

export async function getCurrentWorkerId(): Promise<string | null> {
    const token = await getToken();
    if (!token) return null;

    const decoded = decodeJwt(token);
    // In many .NET apps, the nameidentifier claim holds the ID.
    // If the JWT puts it directly in 'id' or 'sub', check those.
    return decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded?.id || decoded?.sub || null;
}

/**
 * Fetches the currently authenticated Worker's profile
 */
export async function getWorkerProfile(): Promise<WorkerProfile | null> {
    const id = await getCurrentWorkerId();
    if (!id) throw new Error("Could not find authenticated user ID");

    // The backend endpoint is: /api/Worker/GetById/{id}
    const response = await apiRequest<{ data: WorkerProfile }>(`/api/Worker/GetById/${id}`, {
        method: 'GET'
    }, true);

    // Check if wrapped in a generic response model based on CQRS patterns
    return response.data;
}

/**
 * Updates the currently authenticated Worker's profile
 */
export async function updateWorkerProfile(data: UpdateWorkerRequest): Promise<any> {
    // The backend endpoint is: /api/Worker/Update
    return apiRequest<any>('/api/Worker/Update', {
        method: 'PUT',
        body: JSON.stringify(data),
    }, true);
}
