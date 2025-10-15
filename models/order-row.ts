export interface OrderRow {
  key: number;
  id: string;
  orderNumber: number;
  productsCount: number;
  orderStatus: string
  date: string;
  amount: number;
}

export interface OrderRowAdmin {
  key: number;
  id: string;
  orderNumber: number;
  products: { productId: string; quantity: number }[];
  orderStatus: string
  userid: string;
  date: string;
  amount: number;
}
