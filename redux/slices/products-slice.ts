import {
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';

import { Product } from '@/models';

type ProductsState = {
  items: Product[];
  total: number;
  loading: boolean;
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  total: 0,
  loading: false,
  error: null
};

export const fetchProducts = createAsyncThunk<
  { products: Product[]; total: number },
  {
    skip?: number;
    limit?: number;
    query?: string;
    sortOption?: string | null
  },
  { rejectValue: string }
>('products/fetchProducts', async ({
  skip,
  limit,
  query,
  sortOption
}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (skip) params.append('skip', skip.toString());
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to fetch products');
    }

    return data as { products: Product[]; total: number };
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const fetchPrevProducts = createAsyncThunk<
  { products: Product[]; total: number },
  {
    skip: number;
    limit: number;
    query?: string;
    sortOption?: string | null
  },
  { rejectValue: string }
>('products/fetchPrevProducts', async ({
  skip,
  limit,
  query,
  sortOption
}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to fetch next products');
    }

    return data as { products: Product[]; total: number };
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const fetchNextProducts = createAsyncThunk<
  { products: Product[]; total: number },
  {
    skip: number;
    limit: number;
    query?: string;
    sortOption?: string | null
  },
  { rejectValue: string }
>('products/fetchNextProducts', async ({
  skip,
  limit,
  query,
  sortOption
}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to fetch next products');
    }

    return data as { products: Product[]; total: number };
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('products/deleteProduct', async (productId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/products/delete-product/${productId}`, {
      method: 'PUT',
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to delete product');
    }

    return productId;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; formData: FormData },
  { rejectValue: string }
>('products/updateProduct', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/products/edit-product/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to update product');
    }

    return data as Product;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const addProduct = createAsyncThunk<
  Product,
  FormData,
  { rejectValue: string }
>('products/addProduct', async (formData, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/products/add-product', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to add product');
    }

    return data as Product;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.total = 0;
      state.error = null;
      state.loading = false;
    },
    removeProducts: (
      state,
      action: {
        payload: {
          count: number;
          from: 'start' | 'end'
        }
      }
    ) => {
      const { count, from } = action.payload;
      if (from === 'start') {
        state.items = state.items.slice(count);
      } else {
        state.items = state.items.slice(0, -count);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Something went wrong';
      })

      .addCase(fetchPrevProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrevProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...action.payload.products, ...state.items];
        state.total = action.payload.total;
      })
      .addCase(fetchPrevProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Something went wrong';
      })

      .addCase(fetchNextProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNextProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload.products];
        state.total = action.payload.total;
      })
      .addCase(fetchNextProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Something went wrong';
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      })

      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add product';
      });
  }
});

export const { clearProducts, removeProducts } = productsSlice.actions;
export default productsSlice.reducer;
