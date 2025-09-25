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
  userId: string;
  user?: string;
  orderNumber: number;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  products: OrderItem[];
}
