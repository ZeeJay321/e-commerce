/*
  Warnings:

  - The values [COMPLETED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('PENDING', 'FAILED', 'FULFILLED');
ALTER TABLE "public"."Order" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "public"."Order" ALTER COLUMN "orderStatus" TYPE "public"."OrderStatus_new" USING ("orderStatus"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."Order" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING';
COMMIT;
