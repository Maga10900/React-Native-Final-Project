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
  status: number; // 1: Pending, 2: Accepted, 3: Rejected
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

// Backend has no dedicated GetByWorkerId endpoint.
// We fetch all orders and filter by workerId on the client side.
export async function getOrdersByWorkerId(workerId: string): Promise<Order[]> {
  const allOrders = await getAllOrders();
  if (!allOrders) return [];

  return allOrders.filter((order) => order.workerId === workerId);
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
