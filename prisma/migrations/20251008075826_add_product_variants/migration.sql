/*
  Warnings:

  - You are about to drop the column `color` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `colorCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "color",
DROP COLUMN "colorCode",
DROP COLUMN "price",
DROP COLUMN "size",
DROP COLUMN "stock",
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
