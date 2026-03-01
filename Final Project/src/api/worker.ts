import { apiRequest } from "./client";
import { WorkerProfile } from "./workerProfile";

export async function getAllWorkers(): Promise<WorkerProfile[]> {
  const response = await apiRequest<{ data: WorkerProfile[] }>(
    "/api/Worker/GetAll",
    { method: "GET" },
    true,
  );
  return response.data;
}
