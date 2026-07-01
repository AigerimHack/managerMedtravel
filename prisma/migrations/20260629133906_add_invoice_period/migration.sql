-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "num" TEXT NOT NULL DEFAULT '',
    "clinic" TEXT NOT NULL DEFAULT '',
    "sum" TEXT NOT NULL DEFAULT '',
    "recv" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "file" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Invoice" ("clinic", "createdAt", "date", "file", "fileName", "fileType", "id", "note", "num", "recv", "sum", "updatedAt") SELECT "clinic", "createdAt", "date", "file", "fileName", "fileType", "id", "note", "num", "recv", "sum", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
