/*
  Warnings:

  - You are about to drop the column `is_used` on the `user_coupons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_coupons" DROP COLUMN "is_used",
ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1;
