-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "status" "CouponStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "user_coupons" ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false;
