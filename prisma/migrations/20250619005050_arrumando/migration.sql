-- DropForeignKey
ALTER TABLE "CoffeeTag" DROP CONSTRAINT "CoffeeTag_coffeeId_fkey";

-- AddForeignKey
ALTER TABLE "CoffeeTag" ADD CONSTRAINT "CoffeeTag_coffeeId_fkey" FOREIGN KEY ("coffeeId") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
