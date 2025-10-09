import bcrypt from 'bcrypt';
import moment from 'moment';
import { PrismaClient, Size } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const userPassword = await bcrypt.hash('user123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // ---- CLEAR EXISTING DATA ----
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
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
    Array.from({ length: 2 }).map((_, i) =>
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

  // ---- PRODUCT BASE DATA ----
  const baseImages = [
    '/images/pajamas.png',
    '/images/headphones.png',
    '/images/shelf.png',
    '/images/trouser.png',
  ];

  const colors = [
    { name: 'Red', code: '#FF0000' },
    { name: 'Green', code: '#00FF00' },
    { name: 'Blue', code: '#0000FF' },
    { name: 'Black', code: '#000000' },
  ];

  const sizes: Size[] = [Size.S, Size.M, Size.L, Size.XL];

  // ---- CREATE PRODUCTS ----
  const products = await Promise.all(
    Array.from({ length: 80 }).map((_, i) =>
      prisma.product.create({
        data: {
          title: `Product ${i + 1}`,
          isDeleted: false,
          metadata: {},
        },
      })
    )
  );

  // ---- CREATE VARIANTS ----
  const variants: any[] = [];
  for (const product of products) {
    for (const color of colors) {
      for (const size of sizes) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: color.name,
            colorCode: color.code,
            size,
            img: baseImages[Math.floor(Math.random() * baseImages.length)],
            price: Math.floor(Math.random() * 100) + 10,
            stock: Math.floor(Math.random() * 50) + 1,
            metadata: {},
          },
        });
        variants.push(variant);
      }
    }
  }

  // ---- CREATE ORDERS ----
  const orders = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) => {
      const user = users[i];
      const variant1 = variants[(i * 5) % variants.length];
      const variant2 = variants[(i * 5 + 1) % variants.length];

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          amount: 0, // will be updated later
          metadata: {},
          date: moment().subtract(i, 'days').format('DD MMM YYYY'),
          products: {
            create: [
              {
                variantId: variant1.id,
                productId: variant1.productId,
                quantity: 1,
                price: variant1.price,
                metadata: {},
              },
              {
                variantId: variant2.id,
                productId: variant2.productId,
                quantity: 2,
                price: variant2.price,
                metadata: {},
              },
            ],
          },
        },
        include: { products: true },
      });

      const total = order.products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return prisma.order.update({
        where: { id: order.id },
        data: { amount: total },
      });
    })
  );

  console.log(`
✅ Seed complete!
👤 ${users.length} users
👑 ${admins.length} admins
🛍️ ${products.length} products
🎨 ${variants.length} variants
📦 ${orders.length} orders
`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
