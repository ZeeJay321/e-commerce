import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Product = {
  id: number;
  title: string;
  price: number;
  img: string;
  color: string;
  colorCode: string;
  size: string;
};

type ProductsState = {
  items: Product[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  segment: number;
};

const initialState: ProductsState = {
  items: [],
  loading: false,
  hasMore: false,
  error: null
};

// Thunks
export const fetchProducts = createAsyncThunk<Product[], {
  segment?: number;
  slice?: number;
  query?: string;
  sortOption?: string;
}>(
  'products/fetchProducts',
  async ({
    segment, slice, query, sortOption
  }) => {
    const res = await fetch('/api/products', {
      method: segment && slice ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segment, slice, query, sortOption
      })
    });

    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }
);

export const fetchNextProducts = createAsyncThunk<Product[], {
  segment: number; // ✅ always required for next
  slice: number;
  query?: string;
  sortOption?: string;
}>(
  'products/fetchNextProducts',
  async ({
    segment, slice, query, sortOption
  }) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segment, slice, query, sortOption
      })
    });

    if (!res.ok) throw new Error('Failed to fetch next products');
    return res.json();
  }
);

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.error = null;
      state.loading = false;
      state.hasMore = false;
    }
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
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
      });

    // fetchNextProducts
    builder
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
      });
  }
});

export const { clearProducts } = productsSlice.actions;

export default productsSlice.reducer;
