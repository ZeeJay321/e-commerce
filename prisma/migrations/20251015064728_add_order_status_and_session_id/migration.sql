/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'FAILED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_sessionId_key" ON "public"."Order"("sessionId");
