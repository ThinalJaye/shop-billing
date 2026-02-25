# 📄 Updated Prisma Schema for Vercel PostgreSQL

## Full Updated Schema

### File: `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model Product {
  id        Int        @id @default(autoincrement())
  name      String
  price     Float
  stock     Float
  saleItems SaleItem[]
}

model Sale {
  id          Int        @id @default(autoincrement())
  totalAmount Float
  createdAt   DateTime   @default(now())
  items       SaleItem[]
}

model SaleItem {
  id        Int     @id @default(autoincrement())
  quantity  Float
  price     Float
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  saleId    Int
  sale      Sale    @relation(fields: [saleId], references: [id])
}
```

---

## Key Changes Explained

### **1. Provider Change**
```prisma
# BEFORE
provider = "sqlite"

# AFTER
provider = "postgresql"
```
- Tells Prisma to use PostgreSQL instead of SQLite
- Prisma will generate PostgreSQL-specific SQL queries

---

### **2. Connection URL Changes**
```prisma
# BEFORE
url = env("DATABASE_URL")

# AFTER
url       = env("POSTGRES_PRISMA_URL")
directUrl = env("POSTGRES_URL_NON_POOLING")
```

**POSTGRES_PRISMA_URL:**
- Connection string WITH pooling
- Used by: Your app (serverless functions)
- Format: `postgresql://user:password@host.pooling.postgres.vercel.sh/dbname?schema=public`

**POSTGRES_URL_NON_POOLING:**
- Connection string WITHOUT pooling
- Used by: Prisma migrations
- Format: `postgresql://user:password@host.postgres.vercel.sh/dbname?schema=public`

---

### **3. Models (No Changes)**

All your models remain the same:

```prisma
model Product {
  id        Int                    # Auto-incrementing ID
  name      String                 # Product name
  price     Float                  # Decimal price
  stock     Float                  # Can be fractional
  saleItems SaleItem[]             # One-to-many relation
}

model Sale {
  id          Int        @id @default(autoincrement())
  totalAmount Float      # Sum of all items
  createdAt   DateTime   @default(now())  # Current timestamp
  items       SaleItem[] # One-to-many relation
}

model SaleItem {
  id        Int
  quantity  Float      # Can be fractional (kg, liter, etc.)
  price     Float      # Price at time of sale
  productId Int        # Foreign key
  product   Product    @relation(...)  # Link to Product
  saleId    Int        # Foreign key
  sale      Sale       @relation(...)  # Link to Sale
}
```

---

## What Prisma Does With This Schema

When you run `npx prisma migrate dev`, Prisma:

1. **Reads** your schema
2. **Generates** PostgreSQL CREATE TABLE statements
3. **Creates** migration file in `prisma/migrations/`
4. **Applies** migration to Vercel Postgres database
5. **Generates** TypeScript types for your code

---

## PostgreSQL Equivalents

Here's what gets created in PostgreSQL:

```sql
-- Product Table
CREATE TABLE "Product" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "stock" DOUBLE PRECISION NOT NULL
);

-- Sale Table
CREATE TABLE "Sale" (
  "id" SERIAL PRIMARY KEY,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SaleItem Table
CREATE TABLE "SaleItem" (
  "id" SERIAL PRIMARY KEY,
  "quantity" DOUBLE PRECISION NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "productId" INTEGER NOT NULL,
  "saleId" INTEGER NOT NULL,
  FOREIGN KEY ("productId") REFERENCES "Product"("id"),
  FOREIGN KEY ("saleId") REFERENCES "Sale"("id")
);

-- Indexes for performance
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
```

Prisma generates all this automatically! You don't need to write SQL.

---

## Type Mappings

Prisma field types → PostgreSQL data types:

| Prisma | PostgreSQL | Notes |
|--------|-----------|-------|
| Int | SERIAL / INTEGER | Auto-incrementing |
| String | TEXT | Variable length text |
| Float | DOUBLE PRECISION | 64-bit floating point |
| DateTime | TIMESTAMP | Date and time |
| Boolean | BOOLEAN | true/false |
| Decimal | NUMERIC(p,s) | Fixed precision (not used here) |

---

## Environment Variables Required

### **For Local Development**
Create `.env.local` after `vercel env pull`:
```env
POSTGRES_PRISMA_URL="postgresql://user:pwd@host.pooling.postgres.vercel.sh/db?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://user:pwd@host.postgres.vercel.sh/db?schema=public"
```

### **For Vercel Production**
Set in Vercel Dashboard → Settings → Environment Variables:
```
POSTGRES_PRISMA_URL=<same value>
POSTGRES_URL_NON_POOLING=<same value>
```

Both must be set in both places!

---

## Why This Schema Is Perfect

✅ **Simple:** Only the models you need
✅ **Efficient:** Proper indexes and foreign keys
✅ **Flexible:** Supports decimal quantities (kg, liters, etc.)
✅ **Scalable:** PostgreSQL handles growth
✅ **Maintainable:** Clear relationships between models
✅ **Prisma-friendly:** All field types are well-supported

---

## Common Questions

### Q: Can I add more fields later?
**A:** Yes! Just update the schema, then run `npx prisma migrate dev --name "add_field_name"` again.

### Q: What about encryption for passwords?
**A:** You don't need encrypted passwords in this schema. This is a product inventory system, not a user auth system.

### Q: Can I add timestamps to all tables?
**A:** Yes, add `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` to any model.

### Q: Why Float instead of Decimal for prices?
**A:** For a billing app, you might want `Decimal` for precise money handling. Change `price Float` to `price Decimal` if needed.

---

## Migration Command

After setting environment variables:

```powershell
npx prisma migrate dev --name "switch_to_postgres"
```

This:
- Creates `prisma/migrations/[timestamp]_switch_to_postgres/migration.sql`
- Runs the migration on your Vercel Postgres database
- Updates your local Prisma Client
- Generates TypeScript types

---

## Verification

Check your migration worked:

```powershell
# See migration status
npx prisma migrate status

# Open database viewer
npx prisma studio

# View generated SQL
cat prisma/migrations/[date]_switch_to_postgres/migration.sql
```

---

## Next Step

→ Go to `START_HERE_DEPLOYMENT.md` for step-by-step deployment instructions

This schema is now ready for production! 🚀
