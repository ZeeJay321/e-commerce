import Joi from 'joi';

export const getDetailSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Order number must be a number',
      'number.integer': 'Order number must be an integer',
      'number.positive': 'Order number must be positive',
      'any.required': 'Order number is required'
    })
});

export const getOrderSchema = Joi.object({
  limit: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'limit must be a number',
      'number.min': 'limit must be at least 0'
    }),
  skip: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'skip must be a number',
      'number.min': 'skip must be at least 0'
    }),
  query: Joi.string().optional().allow('', null)
});

export const placeOrderSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'userId is required',
    'string.base': 'userId must be a string',
    'string.guid': 'userId must be a valid UUID'
  }),
  amount: Joi.number().precision(2).min(0).optional()
    .messages({
      'number.base': 'amount must be a number',
      'number.min': 'amount cannot be negative'
    }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required().messages({
          'any.required': 'productId is required',
          'string.base': 'productId must be a string',
          'string.guid': 'productId must be a valid UUID'
        }),
        quantity: Joi.number().integer().min(1).required()
          .messages({
            'any.required': 'quantity is required',
            'number.base': 'quantity must be a number',
            'number.min': 'quantity must be at least 1'
          }),
        price: Joi.number().precision(2).min(0).required()
          .messages({
            'any.required': 'price is required',
            'number.base': 'price must be a number',
            'number.min': 'price cannot be negative'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'items are required',
      'array.min': 'at least one item is required'
    })
});
