import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { updateCartStockOnly } from '@/helper/cart-updater';
import {
  Order,
  OrderInfo,
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
  cartItems: ProductItem[];

  loading: boolean;
  detailLoading: boolean;
  loadTable: boolean;
  error: string | null;
}

interface OrderErrorPayload {
  error: string;
  outOfStock?: { productId: string; availableStock: number }[];
}

export interface PlaceOrderResponse {
  status: 'success' | 'error';
  url?: string;
  message?: string;
  error?: string;
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  totalAmount: 0,
  totalProducts: 0,
  totalPagination: 0,
  orderInfo: null,
  cartItems: [],
  products: [],
  loading: false,
  detailLoading: false,
  loadTable: true,
  error: null
};

export const placeOrder = createAsyncThunk<
  PlaceOrderResponse,
  PlaceOrderInput,
  { rejectValue: OrderErrorPayload }
>(
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

      if (!res.ok) {
        return rejectWithValue(data as OrderErrorPayload);
      }

      return data as PlaceOrderResponse;
    } catch (err) {
      return rejectWithValue({
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
);

export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  {
    limit?: number;
    skip?: number;
    query?: string
  },
  { rejectValue: string }
>(
  'orders/fetchOrders',
  async ({
    limit = 0,
    skip = 0,
    query = ''
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('skip', String(skip));
      if (query) params.set('query', query);

      const res = await fetch(`/api/orders/get-orders?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return rejectWithValue(errorData.error || 'Failed to fetch user orders');
      }

      return (await res.json()) as OrdersResponse;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const fetchOrderDetail = createAsyncThunk<
  { orderInfo: OrderInfo; products: ProductItem[] },
  { orderId: number },
  { rejectValue: string }
>(
  'orders/fetchOrderDetail',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/orders/get-detail/${orderId}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return rejectWithValue(errorData.error || 'Failed to fetch order details');
      }

      const order: {
        id: string;
        userId: string;
        user: { fullname: string };
        amount: number;
        date: string;
        orderStatus: string;
        createdAt: string;
        updatedAt: string;
        products: {
          id: string;
          productId: string;
          variantId: string;
          price: number;
          quantity: number;
          product: { title: string };
          variant: {
            img: string;
            stock: number;
            color?: string;
            colorCode?: string;
            size?: string;
          };
        }[];
      } = await res.json();

      const products: ProductItem[] = order.products.map((item, index) => ({
        key: index + 1,
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        img: item.variant.img,
        title: item.product.title,
        price: item.price,
        quantity: item.quantity,
        stock: item.variant.stock,
        color: item.variant.color || '',
        colorCode: item.variant.colorCode || '',
        size: item.variant.size || ''
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
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const fulfillOrder = createAsyncThunk<
  { message: string },
  { orderId: number },
  { rejectValue: string }
>(
  'orders/fulfillOrder',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/orders/fulfill-order/${orderId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to fulfill order');
      }

      return data as { message: string };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }
);

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
        state.error = action.payload || action.error.message || 'Failed to load user orders';
      });

    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
        state.loadTable = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        let errorMessage = 'Failed to place order';

        if (action.payload && typeof action.payload === 'object' && 'error' in action.payload) {
          errorMessage = action.payload.error;
          if (action.payload.outOfStock) {
            updateCartStockOnly(action.payload.outOfStock);
          }
        } else if (typeof action.payload === 'string') {
          errorMessage = action.payload;
        } else if (action.error.message) {
          errorMessage = action.error.message;
        }

        state.error = errorMessage;
        state.loading = false;
      });

    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(
        fetchOrderDetail.fulfilled,
        (state, action: PayloadAction<{ orderInfo: OrderInfo; products: ProductItem[] }>) => {
          state.orderInfo = action.payload.orderInfo;
          state.products = action.payload.products;
          state.detailLoading = false;
        }
      )
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || action.error.message || 'Failed to fetch order detail';
      });

    builder
      .addCase(fulfillOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fulfillOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fulfillOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to fulfill order';
      });
  }
});

export const { clearOrders, clearOrderDetail } = ordersSlice.actions;
export default ordersSlice.reducer;
