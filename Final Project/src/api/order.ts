import { apiRequest } from "./client";

export interface CreateOrderRequest {
  workerId: string;
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

export async function getOrdersByWorkerId(workerId: string): Promise<Order[]> {
  const response = await apiRequest<{ data: Order[] }>(
    `/api/Order/GetByWorkerId/${workerId}`,
    {
      method: "GET",
    },
    true,
  );
  return response.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: number,
): Promise<any> {
  return apiRequest<any>(
    "/api/Order/UpdateStatus",
    {
      method: "PUT",
      body: JSON.stringify({ id: orderId, status }),
    },
    true,
  );
}
