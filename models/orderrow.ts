export interface OrderRow {
  key: number;
  id: number;
  orderNumber: string;
  products: { productId: number; quantity: number }[];
  date: string;
  amount: number;
}
