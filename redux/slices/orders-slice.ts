import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  Order,
  OrderInfo,
  OrderItem,
  PlaceOrderInput,
  ProductItem
} from '@/models';

interface OrdersResponse {
  user?: string;
  totalOrders?: number;
  totalAmount?: number;
  totalProducts?: number;
  totalPagination?: number;
  orders: Order[];
  limit?: number;
  skip?: number;
}

interface OrdersState {
  items: Order[];
  total: number;
  totalAmount: number;
  totalProducts: number;
  totalPagination: number;

  orderInfo: OrderInfo | null;
  products: ProductItem[];

  loading: boolean;
  loadTable: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  totalAmount: 0,
  totalProducts: 0,
  totalPagination: 0,
  orderInfo: null,
  products: [],
  loading: false,
  loadTable: true,
  error: null
};

export const placeOrder = createAsyncThunk<Order, PlaceOrderInput, { rejectValue: string }>(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/orders/place-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Order placement failed');

      return data as Order;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { limit?: number; skip?: number; query?: string }
>('orders/fetchOrders', async ({ limit = 0, skip = 0, query = '' }) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('skip', String(skip));
  if (query) params.set('query', query);

  const res = await fetch(`/api/orders/get-orders?${params.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch user orders');

  return res.json();
});

export const fetchOrderDetail = createAsyncThunk<
  { orderInfo: OrderInfo; products: ProductItem[] },
  { orderId: number }
>('orders/fetchOrderDetail', async ({ orderId }) => {
  const res = await fetch(`/api/orders/get-detail/${orderId}`);
  if (!res.ok) throw new Error('Failed to fetch order details');

  const order: {
    id: string;
    userId: string;
    user: { fullname: string };
    amount: number;
    date: string;
    createdAt: string;
    updatedAt: string;
    products: OrderItem[];
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
    fullname: order.user.fullname,
    amount: order.amount,
    date: order.date,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };

  return { orderInfo, products };
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.items = [];
      state.total = 0;
      state.totalAmount = 0;
      state.totalProducts = 0;
      state.error = null;
      state.loading = false;
    },
    clearOrderDetail: (state) => {
      state.orderInfo = null;
      state.products = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrdersResponse>) => {
        state.items = action.payload.orders;
        state.total = action.payload.totalOrders || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        state.totalProducts = action.payload.totalProducts || 0;
        state.totalPagination = action.payload.totalPagination || 0;
        state.loading = false;
        state.loadTable = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load user orders';
      });

    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        const order = action.payload;
        state.total += 1;
        state.totalAmount += order.amount;
        state.totalProducts += order.productsCount || 0;
        state.loading = false;
        state.loadTable = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to place order';
      });

    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrderDetail.fulfilled,
        (state, action: PayloadAction<{ orderInfo: OrderInfo; products: ProductItem[] }>) => {
          state.orderInfo = action.payload.orderInfo;
          state.products = action.payload.products;
          state.loading = false;
        }
      )
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order detail';
      });
  }
});

export const { clearOrders, clearOrderDetail } = ordersSlice.actions;
export default ordersSlice.reducer;
