export type OrderItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
};

export type PlaceOrderInput = {
  userId: string;
  items: OrderItemInput[];
  amount: number;
};
