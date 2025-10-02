import Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?=.{8,})/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
    }),
  confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword');

export const signupSchema = Joi.object({
  fullName: Joi.string().min(3).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 3 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Enter a valid email address',
    'string.empty': 'Email is required'
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in international format (e.g., +123456789)',
      'string.empty': 'Phone number is required'
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?=.{8,})/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      'string.empty': 'Password is required'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password',
    'string.empty': 'Confirm password is required'
  })
});
