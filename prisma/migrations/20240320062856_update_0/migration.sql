/*
  Warnings:

  - Changed the type of `expireDate` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "expireDate",
ADD COLUMN     "expireDate" VARCHAR(5) NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProfileContent" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" DROP NOT NULL;
