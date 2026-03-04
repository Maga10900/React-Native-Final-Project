import { apiRequest } from "./client";

export interface CreateOrderRequest {
  workerId: string;
  clientId: string;
  salary: number;
  address: string;
  photos: string[];
  details: string;
}

export async function createOrder(data: CreateOrderRequest): Promise<any> {
  return apiRequest<any>(
    "/api/Order/Create",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true,
  );
}

export interface Order {
  id: string;
  workerId: string;
  clientId: string;
  salary: number;
  address: string;
  details: string;
  status: number; // 0: Pending, 1: Accepted, 2: Rejected
  photos?: string[];
  createdDate?: string;
}

export async function getAllOrders(): Promise<Order[]> {
  const response = await apiRequest<{ data: Order[] }>(
    "/api/Order/GetAll",
    {
      method: "GET",
    },
    true,
  );
  return response.data;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const response = await apiRequest<{ data: Order }>(
    `/api/Order/GetById/${orderId}`,
    {
      method: "GET",
    },
    true,
  );
  return response.data;
}

export async function getOrdersByClientId(clientId: string): Promise<Order[]> {
  const response = await apiRequest<{ data: Order[] }>(
    `/api/Order/GetByClientId/client/${clientId}`,
    {
      method: "GET",
    },
    true,
  );
  return response.data;
}

// Backend has no GetByWorkerId endpoint and GetAll may be admin-only.
// We use the worker's notifications (which contain orderId) to get the worker's orders.
export async function getOrdersByWorkerId(workerId: string): Promise<Order[]> {
  const { getWorkerNotifications } = await import("./notification");
  const notifications = await getWorkerNotifications(workerId);
  if (!notifications || notifications.length === 0) return [];

  // Deduplicate order IDs from notifications
  const orderIds = [...new Set(notifications.map((n) => n.orderId))];

  // Fetch each order by ID in parallel
  const orders = await Promise.allSettled(
    orderIds.map((orderId) => getOrderById(orderId)),
  );

  return orders
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<Order>).value);
}

export async function acceptOrder(orderId: string): Promise<any> {
  return apiRequest<any>(
    `/api/Order/Accept/${orderId}`,
    { method: "POST" },
    true,
  );
}

export async function rejectOrder(orderId: string): Promise<any> {
  return apiRequest<any>(
    `/api/Order/Reject/${orderId}`,
    { method: "POST" },
    true,
  );
}
