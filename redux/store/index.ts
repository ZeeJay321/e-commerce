import { configureStore } from '@reduxjs/toolkit';

import orderDetailReducer from '../slices/detail-slice';
import ordersReducer from '../slices/orders-slice';
import productsReducer from '../slices/products-slice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    orderDetail: orderDetailReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
