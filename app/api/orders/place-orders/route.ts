import { NextResponse } from 'next/server';

import Joi from 'joi';
import moment from 'moment';

import { PrismaClient } from '@/app/generated/prisma';
import { OrderItemInput } from '@/models';

const prisma = new PrismaClient();

const schema = Joi.object({
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error, value } = schema.validate(body, { abortEarly: false, convert: true });

    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { userId, items } = value as { userId: string; items: OrderItemInput[] };

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const { validItems, outOfStock } = items.reduce(
      (acc, item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          acc.outOfStock.push({
            productId: item.productId,
            title: 'Unknown product',
            availableStock: 0,
            requested: item.quantity
          });
          return acc;
        }

        if (product.stock < item.quantity) {
          acc.outOfStock.push({
            productId: product.id,
            title: product.title,
            availableStock: product.stock,
            requested: item.quantity
          });
          return acc;
        }

        acc.validItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        });

        return acc;
      },
      {
        validItems: [] as { productId: string; quantity: number; price: number }[],
        outOfStock: [] as {
          productId: string;
          title: string;
          availableStock: number;
          requested: number;
        }[]
      }
    );

    if (outOfStock.length > 0) {
      return NextResponse.json(
        { error: 'Some products are out of stock', outOfStock },
        { status: 400 }
      );
    }

    let total = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    total += total * 0.1;

    const order = await prisma.$transaction(async (tx) => {
      await Promise.all(
        validItems.map((item) => tx.product.update({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        }))
      );

      return tx.order.create({
        data: {
          userId,
          amount: total,
          date: moment().toDate().toString(),
          products: { create: validItems },
          metadata: {}
        },
        include: { products: true }
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || 'Failed to create an order' },
      { status: 500 }
    );
  }
}
