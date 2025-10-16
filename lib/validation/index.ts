
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signupSchema
} from './auth-schemas';

import {
  getDetailSchema,
  getOrderSchema,
  placeOrderSchema
} from './order-schemas';

import {
  addProductSchema,
  addVariantSchema,
  disableSchema,
  getProductSchema,
  updateProductVariantSchema
} from './product-schemas';

export const routeSchemas = {
  '/api/products/get-products': { method: 'GET', schema: getProductSchema },
  '/api/products/add-product': { method: 'POST', schema: addProductSchema },
  '/api/products/add-product-variant': { method: 'POST', schema: addVariantSchema },
  '/api/products/edit-product-variant': { method: 'PUT', schema: updateProductVariantSchema },
  '/api/products/delete-product': { method: 'DELETE', schema: disableSchema },
  '/api/products/delete-variant': { method: 'DELETE', schema: disableSchema },
  '/api/orders/place-orders': { method: 'POST', schema: placeOrderSchema },
  '/api/orders/get-orders': { method: 'GET', schema: getOrderSchema },
  '/api/orders/get-detail': { method: 'GET', schema: getDetailSchema },
  '/api/auth/signup': { method: 'POST', schema: signupSchema },
  '/api/auth/forget-password': { method: 'POST', schema: forgotPasswordSchema },
  '/api/auth/reset-password': { method: 'POST', schema: resetPasswordSchema }

};
