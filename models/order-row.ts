export interface OrderRow {
  key: number;
  id: string;
  orderNumber: number;
  products: { productId: string; quantity: number }[];
  date: string;
  amount: number;
}
