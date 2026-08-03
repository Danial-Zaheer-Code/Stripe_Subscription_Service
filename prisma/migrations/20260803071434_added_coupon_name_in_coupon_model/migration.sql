/*
  Warnings:

  - A unique constraint covering the columns `[coupon_name]` on the table `coupons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coupon_name` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "coupon_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "coupons_coupon_name_key" ON "coupons"("coupon_name");
