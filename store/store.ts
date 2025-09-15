import { configureStore } from '@reduxjs/toolkit';

import orderDetailReducer from './detailSlice';
import ordersReducer from './ordersSlice';
import productsReducer from './productsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    orderDetail: orderDetailReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
