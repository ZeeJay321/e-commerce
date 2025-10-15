import { Product } from './product';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  user?: string;
  amount: number;
  date: string;
  orderStatus: string
  createdAt: string;
  updatedAt: string;
  productsCount: number;
}
