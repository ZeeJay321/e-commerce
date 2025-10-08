/*
  Warnings:

  - You are about to drop the column `color` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `colorCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "metadata" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "color",
DROP COLUMN "colorCode",
DROP COLUMN "price",
DROP COLUMN "size",
DROP COLUMN "stock",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "colorCode" TEXT,
    "size" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
