/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `plans` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "plan_name" TEXT NOT NULL DEFAULT 'FREE';

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_plan_name_fkey" FOREIGN KEY ("plan_name") REFERENCES "plans"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
