import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Order, PlaceOrderInput } from '@/models';

// === Types ===
interface OrdersResponse {
  user?: string; // returned in user-specific API
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

export const placeOrder = createAsyncThunk<
  Order, // return type
  PlaceOrderInput, // argument type
  { rejectValue: string }
>('orders/placeOrder', async (orderData, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/orders/place-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.error || 'Order placement failed');
    }

    return data as Order;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { slice?: number; segment?: number; query?: string }
>('orders/fetchOrders', async ({ slice = 0, segment = 0, query = '' }) => {
  const params = new URLSearchParams();
  params.set('slice', String(slice));
  params.set('segment', String(segment));
  if (query) params.set('query', query);

  const res = await fetch(`/api/orders/get-orders?${params.toString()}`, {
    credentials: 'include'
  });

  if (!res.ok) throw new Error('Failed to fetch user orders');

  return res.json();
});

// === Slice ===
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
    // 🔹 Fetch orders
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

    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        // push new order to list
        state.items = [action.payload, ...state.items];
        state.total += 1;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to place order';
      });
  }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
