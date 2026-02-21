/*
  Warnings:

  - You are about to alter the column `precio_venta_sugerido` on the `productos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.

*/
-- AlterTable
ALTER TABLE `productos` MODIFY `precio_venta_sugerido` INTEGER NOT NULL;
