import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { User } from 'next-auth';
import { getSession, signIn } from 'next-auth/react';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk<
  User,
  {
    email: string;
    password: string;
    remember: boolean
  },
  { rejectValue: string }
>('user/login', async ({
  email,
  password,
  remember
}, { rejectWithValue }) => {
  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      remember
    });

    if (result?.error) {
      return rejectWithValue(result.error);
    }

    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json().catch(() => ({}));

    if (!sessionData?.user) {
      return rejectWithValue('Session not found');
    }

    return sessionData.user as User;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
  }
});

export const signupUser = createAsyncThunk<
  User,
  {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  },
  { rejectValue: string }
>('user/signup', async (userData, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return rejectWithValue(data.error || 'Signup failed');
    }

    if (res.status === 201) {
      return {
        id: data.userId,
        name: userData.fullName,
        email: userData.email
      } as User;
    }

    return data.user as User;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Something went wrong');
  }
});

export const forgotPassword = createAsyncThunk<
  string,
  { email: string },
  { rejectValue: string }
>('user/forgotPassword', async ({ email }, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/forget-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to send reset link');
    }

    return data.message || 'Reset instructions sent to your email.';
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Something went wrong');
  }
});

export const resetPassword = createAsyncThunk<
  string,
  {
    token: string;
    password: string;
    confirmPassword: string
  },
  { rejectValue: string }
>('user/resetPassword', async ({
  token,
  password,
  confirmPassword
}, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        password,
        confirmPassword
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return rejectWithValue(data.error || 'Password reset failed');
    }

    return data.message ?? 'Your password has been updated. You can now log in.';
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
  }
});

export const loginWithGoogle = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('user/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    const result = await signIn('google', { redirect: false });

    if (result?.error) {
      return rejectWithValue(result.error);
    }

    await getSession();

    return {} as User;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong with Google login');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });

    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Google login failed';
      });

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send reset link';
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Password reset failed';
      });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
