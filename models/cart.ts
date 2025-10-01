export interface CartItem {
  img: string;
  id: string;
  product: string;
  colorcode: string;
  color: string;
  size: string;
  qty: number;
  stock: number;
  price: number;
}

export type OutOfStockItem = {
  productId: string;
  availableStock: number;
};
