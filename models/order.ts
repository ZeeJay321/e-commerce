import { Product } from './product';

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  userId: number;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  products: OrderItem[];
}
