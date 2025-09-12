/*
  Warnings:

  - Changed the type of `orderNumber` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "orderNumber",
ADD COLUMN     "orderNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");
