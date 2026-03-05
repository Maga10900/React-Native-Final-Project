import { apiRequest } from "./client";

export interface NotificationModel {
  id: string;
  workerId: string;
  orderId: string;
  message: string;
  isRead: boolean;
  createdDate: string;
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
export interface AddNotificationRequest {
  workerId: string;
  clientId: string;
  orderId: string;
  message: string;
}

export async function addNotification(
  data: AddNotificationRequest,
): Promise<any> {
  return apiRequest<any>(
    "/api/Notification/Add",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true,
  );
}

export interface UpdateNotificationRequest {
  id: string;
  message: string;
  isRead: boolean;
}

export async function updateNotification(
  data: UpdateNotificationRequest,
): Promise<any> {
  return apiRequest<any>(
    "/api/Notification/Update",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true,
  );
}
