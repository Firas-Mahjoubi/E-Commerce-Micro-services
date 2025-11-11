export interface RefundRequest {
  orderId: string;
  customerId: string;
  reason: string;
  refundAmount: number;
  fullOrderRefund: boolean;
  productIds: string[];
}

export interface RefundItemRequest {
  productId: string;
  quantity: number;
  reason: string;
}

export interface RefundResponse {
  refundId: number;
  orderId: string;
  customerId: string;
  sellerId: string;
  reason: string;
  refundAmount: number;
  status: RefundStatus;
  refundedAt: string;
  fullOrderRefund: boolean;
  productIds: string[];
}

export interface RefundItemResponse {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  reason: string;
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface SellerRefundResponse {
  id: number;
  orderId: number;
  customerId: number;
  customerName: string;
  reason: string;
  refundAmount: number;
  status: RefundStatus;
  createdDate: string;
  processedDate: string | null;
  items: RefundItemResponse[];
}
