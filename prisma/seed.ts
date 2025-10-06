import bcrypt from 'bcrypt';
import moment from 'moment';

// eslint-disable-next-line import/no-relative-packages
import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const userPassword = await bcrypt.hash('user123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ---- USERS ----
  const users = await Promise.all(
    Array.from({ length: 4 }).map((_, i) =>
      prisma.user.create({
        data: {
          fullname: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          phoneNumber: `+123456789${i}`,
          password: userPassword,
          role: 'user',
          metadata: {},
        },
      })
    )
  );

  // ---- ADMINS ----
  const admins = await Promise.all(
    Array.from({ length: 4 }).map((_, i) =>
      prisma.user.create({
        data: {
          fullname: `Admin ${i + 1}`,
          email: `admin${i + 1}@example.com`,
          phoneNumber: `+987654321${i}`,
          password: adminPassword,
          role: 'admin',
          metadata: {},
        },
      })
    )
  );

  // ---- PRODUCTS ----
  const productImages = [
    '/images/pajamas.png',
    '/images/headphones.png',
    '/images/shelf.png',
    '/images/trouser.png',
  ];

  const products = await Promise.all(
    Array.from({ length: 24 }).map((_, i) =>
      prisma.product.create({
        data: {
          title: `Product ${i + 1}`,
          price: Math.floor(Math.random() * 100) + 10,
          img: productImages[i % productImages.length],
          colorCode: ['#000000', '#FF0000', '#00FF00', '#0000FF'][i % 4],
          color: ['Black', 'Red', 'Green', 'Blue'][i % 4],
          size: ['S', 'M', 'L', 'XL'][i % 4],
          stock: Math.floor(Math.random() * 50) + 1,
          isDeleted: true,
          metadata: {},
        },
      })
    )
  );

  // ---- ORDERS ----
  const orders = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) => {
      const order = await prisma.order.create({
        data: {
          userId: users[i].id, // UUID now
          amount: 0, // will update later
          metadata: {},
          date: moment().subtract(i, 'days').format('DD MMM YYYY'),
          products: {
            create: [
              {
                productId: products[(i * 2) % products.length].id,
                quantity: 1,
                price: products[(i * 2) % products.length].price,
                metadata: {},
              },
              {
                productId: products[(i * 2 + 1) % products.length].id,
                quantity: 2,
                price: products[(i * 2 + 1) % products.length].price,
                metadata: {},
              },
            ],
          },
        },
        include: { products: true },
      });

      const total = order.products.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0
      );

      return prisma.order.update({
        where: { id: order.id },
        data: { amount: total },
      });
    })
  );

  console.log(
    `✅ Seed complete: ${users.length} users, ${admins.length} admins, ${products.length} products, ${orders.length} orders`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
