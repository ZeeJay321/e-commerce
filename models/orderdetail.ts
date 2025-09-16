export interface ProductItem {
  key: number;
  id: number; // order item id
  productId: number;
  img: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  color: string;
  colorCode: string;
  size: string;
}

export interface OrderInfo {
  id: number;
  userId: number;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}
