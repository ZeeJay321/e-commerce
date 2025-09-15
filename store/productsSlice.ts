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
};

const initialState: ProductsState = {
  items: [],
  loading: false,
  hasMore: false,
  error: null
};

export const fetchProducts = createAsyncThunk<Product[], {
  segment?: number;
  slice?: number;
  query?: string;
  sortOption?: string | null;
}>(
  'products/fetchProducts',
  async ({
    segment, slice, query, sortOption
  }) => {
    // build query string
    const params = new URLSearchParams();
    if (segment) params.append('segment', segment.toString());
    if (slice) params.append('slice', slice.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products?${params.toString()}`, {
      method: 'GET'
    });

    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }
);

export const fetchNextProducts = createAsyncThunk<Product[], {
  segment: number;
  slice: number;
  query?: string;
  sortOption?: string | null;
}>(
  'products/fetchNextProducts',
  async ({
    segment, slice, query, sortOption
  }) => {
    // build query string
    const params = new URLSearchParams();
    params.append('segment', segment.toString());
    params.append('slice', slice.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products?${params.toString()}`, {
      method: 'GET'
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
