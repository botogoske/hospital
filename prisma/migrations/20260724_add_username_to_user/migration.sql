-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Update existing users with default usernames
UPDATE "User" SET "username" = LOWER(REPLACE("email", '@', '_at_')) WHERE "username" IS NULL;

-- Make username NOT NULL after populating
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
