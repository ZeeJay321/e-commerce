-- CreateTable
CREATE TABLE "OrderSummary" (
    "id" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "totalProductsInOrders" INTEGER NOT NULL,
    "totalOrderAmount" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "OrderSummary_pkey" PRIMARY KEY ("id")
);
