import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Order } from '@/models';

interface OrdersResponse {
  userId: string;
  totalOrders: number;
  orders: Order[];
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

export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { slice?: number; segment?: number }
>('orders/fetch', async ({ slice = 0, segment = 0 }) => {
  const res = await fetch(
    `/api/orders/get-orders?slice=${slice}&segment=${segment}`,
    { credentials: 'include' }
  );

  if (!res.ok) throw new Error('Failed to fetch orders');

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
        state.error = action.error.message || 'Failed to load orders';
      });
  }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
