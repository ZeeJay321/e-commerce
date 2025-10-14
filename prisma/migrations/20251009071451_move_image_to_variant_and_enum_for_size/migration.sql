/*
  Warnings:

  - You are about to drop the column `img` on the `Product` table. All the data in the column will be lost.
  - Added the required column `img` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `size` on the `ProductVariant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Size" AS ENUM ('S', 'M', 'L', 'XL');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "img";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "img" TEXT NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" "Size" NOT NULL;
