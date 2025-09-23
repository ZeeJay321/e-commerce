export interface OrderRow {
  key: number;
  id: string;
  orderNumber: number;
  products: { productId: string; quantity: number }[];
  date: string;
  amount: number;
}

export interface OrderRowAdmin {
  key: number;
  id: string;
  orderNumber: number;
  products: { productId: string; quantity: number }[];
  userid: string;
  date: string;
  amount: number;
}
