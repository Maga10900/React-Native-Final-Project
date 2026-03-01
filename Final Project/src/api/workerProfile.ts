import { getToken } from "../storage/token";
import { decodeJwt } from "../utils/jwt";
import { apiRequest } from "./client";

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
  email: string;
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
  return (
    decoded?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    decoded?.id ||
    decoded?.sub ||
    null
  );
}

export async function getCurrentUserRole(): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  const decoded = decodeJwt(token);
  return (
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    decoded?.role ||
    null
  );
}

/**
 * Fetches the currently authenticated user's profile (Worker or Client)
 */
export async function getWorkerProfile(): Promise<WorkerProfile | null> {
  const id = await getCurrentWorkerId();
  if (!id) throw new Error("Could not find authenticated user ID");

  const role = await getCurrentUserRole();
  const endpoint =
    role === "Worker"
      ? `/api/Worker/GetById/${id}`
      : `/api/Client/GetById/${id}`;

  const response = await apiRequest<{ data: WorkerProfile }>(
    endpoint,
    {
      method: "GET",
    },
    true,
  );

  return response.data;
}

/**
 * Updates the currently authenticated user's profile
 */
export async function updateWorkerProfile(
  data: UpdateWorkerRequest,
): Promise<any> {
  const role = await getCurrentUserRole();
  const endpoint =
    role === "Worker" ? "/api/Worker/Update" : "/api/Client/Update";

  return apiRequest<any>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true,
  );
}
