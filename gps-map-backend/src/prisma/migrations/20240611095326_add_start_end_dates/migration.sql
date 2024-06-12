/*
  Warnings:

  - Added the required column `endDate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `rentals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
