import Joi from 'joi';

export const getProductSchema = Joi.object({
  skip: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'skip must be a number',
      'number.min': 'skip must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'limit must be a number',
      'number.min': 'limit must be at least 1'
    }),
  query: Joi.string().allow('').optional(),
  sortOption: Joi.string()
    .valid('priceLowHigh', 'priceHighLow', 'nameAZ', 'nameZA')
    .optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  price: Joi.number().positive(),
  quantity: Joi.number().integer().min(0),
  color: Joi.string(),
  colorCode: Joi.string().pattern(/^#([0-9A-Fa-f]{6})$/),
  size: Joi.string()
}).min(1);

export const disableSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] })
    .required()
    .messages({
      'string.guid': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    })
});

export const addProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Name is required',
      'any.required': 'Name is required'
    }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'any.required': 'Price is required'
  }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
  color: Joi.string().required().messages({
    'string.empty': 'Color is required',
    'any.required': 'Color is required'
  }),
  colorCode: Joi.string().pattern(/^#([0-9A-Fa-f]{6})$/).required().messages({
    'string.pattern.base': 'ColorCode must be a valid hex code',
    'any.required': 'ColorCode is required'
  }),
  size: Joi.string().required().messages({
    'string.empty': 'Size is required',
    'any.required': 'Size is required'
  })
});

export const stockSchema = Joi.object({
  productIds: Joi.array()
    .items(Joi.string().uuid().message('Each productId must be a valid UUID'))
    .min(1)
    .required()
    .messages({
      'array.base': 'productIds must be an array',
      'array.min': 'At least one productId is required',
      'any.required': 'productIds field is required'
    })
});
