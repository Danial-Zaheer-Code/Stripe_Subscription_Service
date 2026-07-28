/*
  Warnings:

  - You are about to drop the column `stripe_id` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripe_id",
ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "subscription_id" TEXT,
ADD COLUMN     "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';
