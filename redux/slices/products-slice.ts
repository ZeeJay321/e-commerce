import {
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';

import { Product, ProductVariant } from '@/models';

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
  { success: boolean; message: string; id: string },
  string,
  { rejectValue: string }
>(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/delete-product/${productId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to delete product');
      }

      return {
        success: data.success ?? true,
        message: data.message ?? 'Product deleted successfully',
        id: productId
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const toggleVariant = createAsyncThunk<
  { success: boolean; message: string; variantId: string },
  string,
  { rejectValue: string }
>(
  'products/toggleVariant',
  async (variantId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/toggle-variant/${variantId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to delete product variant');
      }

      return {
        success: data.success ?? true,
        message: data.message ?? 'Variant updated successfully',
        variantId
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const updateProductVariant = createAsyncThunk<
  Product,
  {
    id: string;
    productId: string;
    formData: FormData;
  },
  { rejectValue: string }
>('products/updateProduct', async ({
  id,
  productId,
  formData
}, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/products/edit-product-variant/${id}/${productId}`, {
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

    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
  }
});

export const addVariant = createAsyncThunk<
  ProductVariant,
  { productId: string; formData: FormData },
  { rejectValue: string }
>(
  'products/addVariant',
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/add-product-variant?productId=${productId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to add variant');
      }

      return data;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }
);

export const importProductsCsv = createAsyncThunk<
  { message: string },
  File,
  { rejectValue: string }
>(
  'products/importProductsCsv',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading CSV:', file.name);

      const response = await fetch('http://127.0.0.1:8000/products/import-csv', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('✅ Upload successful:', data);

      if (!response.ok) {
        return rejectWithValue(data.error || 'Upload failed');
      }

      return data;
    } catch (err) {
      console.error('❌ Upload error:', err);
      return rejectWithValue(
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }
);

export const editProductTitle = createAsyncThunk<
  {
    status: string;
    message: string;
    product: Product;
  },
  { id: string; title: string },
  { rejectValue: string }
>(
  'products/editProductTitle',
  async ({ id, title }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/edit-product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to update title');
      }

      return {
        status: data.status,
        message: data.message,
        product: data.product
      };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Error updating title'
      );
    }
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
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.loading = false;
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
        state.items = [
          ...action.payload.products.filter(
            (p) => !state.items.some((existing) => existing.id === p.id)
          ),
          ...state.items
        ];
        state.total = action.payload.total;
        state.loading = false;
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
        state.items = [
          ...state.items,
          ...action.payload.products.filter(
            (p) => !state.items.some((existing) => existing.id === p.id)
          )
        ];
        state.total = action.payload.total;
        state.loading = false;
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

      .addCase(toggleVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleVariant.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      })

      .addCase(updateProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductVariant.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProductVariant.rejected, (state, action) => {
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
      })

      .addCase(addVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVariant.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add product';
      })

      .addCase(editProductTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProductTitle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((p) => p.id === action.payload.product.id);
        if (index !== -1) {
          state.items[index].title = action.payload.product.title;
        }
      })
      .addCase(editProductTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product title';
      })

      .addCase(importProductsCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importProductsCsv.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(importProductsCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'CSV import failed';
      });
  }
});

export const { clearProducts, removeProducts } = productsSlice.actions;
export default productsSlice.reducer;
