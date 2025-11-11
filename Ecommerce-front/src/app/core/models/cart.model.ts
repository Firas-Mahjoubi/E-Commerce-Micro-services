import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppliedVoucher {
  code: string;
  discountPercentage: number;
  applicableCategory?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  appliedVoucher?: AppliedVoucher;
  discountAmount?: number;
  finalPrice?: number;
}
