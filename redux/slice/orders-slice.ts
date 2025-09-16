import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Order } from '@/models';

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

// ✅ Fetch all orders
export const fetchOrdersAll = createAsyncThunk<Order[], number>(
  'orders/fetchAll',
  async (userId) => {
    const res = await fetch(`/api/orders/get-orders?userId=${userId}&slice=0&segment=0`);
    if (!res.ok) throw new Error('Failed to fetch orders');

    return res.json();
  }
);

export const fetchOrdersPaginated = createAsyncThunk<
  Order[],
  {
    userId: number;
    slice: number;
    segment: number
  }
>('orders/fetchPaginated', async ({ userId, slice, segment }) => {
  const res = await fetch(
    `/api/orders/get-orders?userId=${userId}&slice=${slice}&segment=${segment}`
  );
  if (!res.ok) throw new Error('Failed to fetch paginated orders');

  return res.json();
});

// ✅ Fetch total count
export const fetchOrdersCount = createAsyncThunk<number, number>(
  'orders/fetchCount',
  async (userId) => {
    const res = await fetch(`/api/orders/total-orders?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch order count');

    const data = await res.json();
    return data.totalOrders;
  }
);

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
      // fetchOrdersAll
      .addCase(fetchOrdersAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersAll.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrdersAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load orders';
      })

      // fetchOrdersPaginated
      .addCase(fetchOrdersPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersPaginated.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrdersPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load orders';
      })

      // fetchOrdersCount
      .addCase(fetchOrdersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.total = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrdersCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load order count';
      });
  }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
