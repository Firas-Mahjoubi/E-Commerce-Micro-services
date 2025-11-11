export interface OrderItem {
  id?: number;
  productId: string;
  quantity: number;
  price: number;
  totalPrice?: number;
}

export interface Order {
  id?: number;
  customerId?: string;
  orderDate?: string;
  totalAmount?: number;
  status?: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  items: OrderItem[];
}

export interface OrderResponse {
  id: number;
  customerId: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}
