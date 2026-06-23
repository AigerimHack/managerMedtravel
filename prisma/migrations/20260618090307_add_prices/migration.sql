-- CreateTable
CREATE TABLE "PriceCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "diagnosis" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicName" TEXT NOT NULL,
    "treatment" TEXT NOT NULL DEFAULT '',
    "price" TEXT NOT NULL DEFAULT '',
    "cardId" TEXT NOT NULL,
    CONSTRAINT "PriceEntry_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PriceCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
