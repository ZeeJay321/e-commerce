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
  { products: Product[]; total: number },
  {
    skip?: number;
    limit?: number;
    query?: string;
    sortOption?: string | null;
  }
>(
  'products/fetchProducts',
  async ({
    skip, limit, query, sortOption
  }) => {
    const params = new URLSearchParams();
    if (skip) params.append('skip', skip.toString());
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');

    return res.json();
  }
);

export const fetchNextProducts = createAsyncThunk<
  { products: Product[]; total: number },
  {
    skip: number;
    limit: number;
    query?: string;
    sortOption?: string | null;
  }
>(
  'products/fetchNextProducts',
  async ({
    skip, limit, query, sortOption
  }) => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (sortOption) params.append('sortOption', sortOption);

    const res = await fetch(`/api/products/get-products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch next products');

    return res.json();
  }
);

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('products/deleteProduct', async (productId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/products/delete-product/${productId}`, {
      method: 'DELETE',
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
  Product, // return type
  { id: string; formData: FormData }, // arg type
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
      state.hasMore = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (
        state,
        action: PayloadAction<{ products: Product[]; total: number }>
      ) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.hasMore = action.payload.products.length !== 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })

      .addCase(fetchNextProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNextProducts.fulfilled, (
        state,
        action: PayloadAction<{ products: Product[]; total: number }>
      ) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload.products];
        state.total = action.payload.total;
        state.hasMore = action.payload.products.length !== 0;
      })
      .addCase(fetchNextProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });

    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((p) => p.id !== action.payload); // remove from state
        state.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      });

    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.items = state.items.map((p) => (p.id === action.payload.id ? action.payload : p));
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      });

    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.items = [action.payload, ...state.items]; // add new product to top of list
        state.total += 1;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add product';
      });
  }
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
