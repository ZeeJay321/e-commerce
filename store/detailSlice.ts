import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  title: string;
  price: number;
  img: string;
  color: string;
  colorCode: string;
  size: string;
  stock: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

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

interface OrderDetailState {
  orderInfo: OrderInfo | null;
  products: ProductItem[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderDetailState = {
  orderInfo: null,
  products: [],
  loading: false,
  error: null
};

interface FetchOrderDetailParams {
  orderId: number;
  userId: number;
}

// ✅ Async thunk to fetch order detail
export const fetchOrderDetail = createAsyncThunk<
  { orderInfo: OrderInfo; products: ProductItem[] },
  FetchOrderDetailParams
>('orderDetail/fetch', async ({ orderId, userId }) => {
  const res = await fetch(`/api/orders/getdetail/${orderId}?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch order details');

  const order: {
    id: number;
    userId: number;
    amount: number;
    date: string;
    createdAt: string;
    updatedAt: string;
    products: OrderItem[]
  } = await res.json();

  const products: ProductItem[] = order.products.map((item, index) => ({
    key: index + 1,
    id: item.id,
    productId: item.productId,
    img: item.product.img,
    title: item.product.title,
    price: item.price,
    quantity: item.quantity,
    stock: item.product.stock,
    color: item.product.color,
    colorCode: item.product.colorCode,
    size: item.product.size
  }));

  const orderInfo: OrderInfo = {
    id: order.id,
    userId: order.userId,
    amount: order.amount,
    date: order.date,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };

  return { orderInfo, products };
});

const orderDetailSlice = createSlice({
  name: 'orderDetail',
  initialState,
  reducers: {
    clearOrderDetail: (state) => {
      state.orderInfo = null;
      state.products = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (
        state,
        action: PayloadAction<{ orderInfo: OrderInfo; products: ProductItem[] }>
      ) => {
        state.orderInfo = action.payload.orderInfo;
        state.products = action.payload.products;
        state.loading = false;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order detail';
      });
  }
});

export const { clearOrderDetail } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
