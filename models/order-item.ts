export type OrderItemInput = {
  productId: string;
  quantity: number;
  price: number;
};

export type PlaceOrderInput = {
  userId: string;
  items: OrderItemInput[];
  amount: number;
};
