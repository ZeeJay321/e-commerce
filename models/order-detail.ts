export interface ProductItem {
  key: number;
  id: string; // order item id
  productId: string;
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
  id: string;
  userId: string;
  fullname: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

