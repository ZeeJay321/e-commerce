import { configureStore } from '@reduxjs/toolkit';

import orderDetailReducer from '../slice/detail-slice';
import ordersReducer from '../slice/orders-slice';
import productsReducer from '../slice/products-slice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    orderDetail: orderDetailReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
