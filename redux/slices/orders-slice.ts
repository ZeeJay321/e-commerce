import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Order, PlaceOrderInput } from '@/models';

// === Types ===
interface OrdersResponse {
  user?: string;
  totalOrders?: number;
  totalAmount?: number;
  totalProducts?: number;
  orders: Order[];
  limit?: number;
  skip?: number;
}

interface OrdersState {
  items: Order[];
  total: number;
  totalAmount: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  totalAmount: 0,
  totalProducts: 0,
  loading: false,
  error: null
};

export const placeOrder = createAsyncThunk<
  Order,
  PlaceOrderInput,
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
  {
    limit?: number;
    skip?: number;
    query?: string;
  }
>('orders/fetchOrders', async ({ limit = 0, skip = 0, query = '' }) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('skip', String(skip));
  if (query) params.set('query', query);

  const res = await fetch(`/api/orders/get-orders?${params.toString()}`, {
    credentials: 'include'
  });

  if (!res.ok) throw new Error('Failed to fetch user orders');

  return res.json();
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrdersResponse>) => {
        const { orders } = action.payload;

        state.items = orders;
        state.total = action.payload.totalOrders || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        state.totalProducts = action.payload.totalProducts || 0;
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
        const order = action.payload;

        state.loading = false;
        state.items = [order, ...state.items];
        state.total += 1;
        state.totalAmount += order.amount;
        state.totalProducts += order.products.reduce(
          (sum, product) => sum + product.quantity,
          0
        );
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to place order';
      });
  }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
