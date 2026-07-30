/*
  Warnings:

  - You are about to drop the column `subscription_date` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_plan` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "subscription_date",
DROP COLUMN "subscription_plan";

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" "SubscriptionPlan" NOT NULL,
    "price_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_price_id_key" ON "plans"("price_id");
