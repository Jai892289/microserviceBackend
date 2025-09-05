/*
  Warnings:

  - Added the required column `empId` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."subscription" ADD COLUMN     "empId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_empId_fkey" FOREIGN KEY ("empId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
