import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Order } from '@/models';

interface OrdersResponse {
  userId?: string; // returned in user-specific API
  totalOrders: number;
  orders: Order[];
  slice?: number;
  segment?: number;
}

interface OrdersState {
  items: Order[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  loading: false,
  error: null
};

// ✅ Fetch current user's orders
export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { slice?: number; segment?: number }
>('orders/fetch', async ({ slice = 0, segment = 0 }) => {
  const res = await fetch(
    `/api/orders/get-orders?slice=${slice}&segment=${segment}`,
    { credentials: 'include' }
  );

  if (!res.ok) throw new Error('Failed to fetch user orders');

  return res.json();
});

// ✅ Fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk<
  OrdersResponse,
  { slice?: number; segment?: number }
>('orders/fetchAll', async ({ slice = 0, segment = 0 }) => {
  const res = await fetch(
    `/api/orders/get-all-orders?slice=${slice}&segment=${segment}`,
    { credentials: 'include' }
  );

  if (!res.ok) throw new Error('Failed to fetch all orders (admin only)');

  return res.json();
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.items = [];
      state.total = 0;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    // 🔹 user orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrdersResponse>) => {
        state.items = action.payload.orders;
        state.total = action.payload.totalOrders;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load user orders';
      });

    // 🔹 admin all orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action: PayloadAction<OrdersResponse>) => {
        state.items = action.payload.orders;
        state.total = action.payload.totalOrders;
        state.loading = false;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load all orders';
      });
  }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
