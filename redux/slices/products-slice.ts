import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Product } from '@/models';

type ProductsState = {
  items: Product[];
  total: number;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  total: 0,
  loading: false,
  hasMore: false,
  error: null
};

export const fetchProducts = createAsyncThunk<
  Product[],
  {
    segment?: number;
    slice?: number;
    query?: string;
    sortOption?: string | null;
  }
>(
  'products/fetchProducts',
  async ({
    segment, slice, query, sortOption
  }) => {
    const params = new URLSearchParams();
    if (segment) params.append('segment', segment.toString());
    if (slice) params.append('slice', slice.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');

    return res.json();
  }
);

export const fetchNextProducts = createAsyncThunk<
  Product[],
  {
    segment: number;
    slice: number;
    query?: string;
    sortOption?: string | null;
  }
>(
  'products/fetchNextProducts',
  async ({
    segment, slice, query, sortOption
  }) => {
    const params = new URLSearchParams();
    params.append('segment', segment.toString());
    params.append('slice', slice.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch next products');

    return res.json();
  }
);

export const fetchProductsWithTotal = createAsyncThunk<
  { products: Product[]; total: number },
  {
    segment?: number;
    slice?: number;
    query?: string;
    sortOption?: string | null;
  }
>(
  'products/fetchProductsWithTotal',
  async ({
    segment, slice, query, sortOption
  }) => {
    const params = new URLSearchParams();
    if (segment) params.append('segment', segment.toString());
    if (slice) params.append('slice', slice.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-total-and-products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products with total');

    return res.json();
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.total = 0;
      state.error = null;
      state.loading = false;
      state.hasMore = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // === fetchProducts (old)
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.items = action.payload; // replace
        state.hasMore = action.payload.length !== 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })

      // === fetchNextProducts (old)
      .addCase(fetchNextProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNextProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload]; // append
        state.hasMore = action.payload.length !== 0;
      })
      .addCase(fetchNextProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })

      // === fetchProductsWithTotal (new)
      .addCase(fetchProductsWithTotal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductsWithTotal.fulfilled,
        (state, action: PayloadAction<{ products: Product[]; total: number }>) => {
          state.loading = false;
          state.items = action.payload.products;
          state.total = action.payload.total;
          state.hasMore = action.payload.products.length !== 0;
        }
      )
      .addCase(fetchProductsWithTotal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  }
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
