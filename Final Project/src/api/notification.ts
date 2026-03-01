import { apiRequest } from "./client";

export interface NotificationModel {
  id: string;
  workerId: string;
  orderId: string;
  message: string;
  isRead: boolean;
  createDate: string;
}

export async function getWorkerNotifications(
  workerId: string,
): Promise<NotificationModel[]> {
  const response = await apiRequest<{ data: NotificationModel[] }>(
    `/api/Notification/Worker/${workerId}`,
    { method: "GET" },
    true,
  );
  return response.data;
}

export async function getClientNotifications(
  clientId: string,
): Promise<NotificationModel[]> {
  const response = await apiRequest<{ data: NotificationModel[] }>(
    `/api/Notification/Client/${clientId}`,
    { method: "GET" },
    true,
  );
  return response.data;
}
