export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  skuCode: string;
  category: string;
  imageUrls: string[];
  stockQuantity: number;
  active: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface InventoryResponse {
  skuCode: string;
  isInStock: boolean;
  availableQuantity: number;
}
