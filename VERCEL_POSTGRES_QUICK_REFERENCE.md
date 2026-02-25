# 🚀 Vercel Postgres Deployment - Quick Reference

## Updated Code

### **prisma/schema.prisma** ✅

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

## Environment Variables

### **.env (Local Development)**

```env
# After creating Vercel Postgres database, add these:
POSTGRES_PRISMA_URL="postgresql://user:password@host.postgres.vercel.sh:5432/verceldb?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host.postgres.vercel.sh:5432/verceldb?schema=public"
```

### **Vercel Dashboard Settings → Environment Variables**

Add the same two variables for **Production, Preview, Development**:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

---

## Step-by-Step Deployment Process

### **Phase 1: Create Vercel Postgres (5 minutes)**

```
1. Go to https://vercel.com
2. Create or select your project
3. Click "Storage" tab
4. Click "Create Database" → "Postgres"
5. Choose region (closest to users)
6. Click database → copy both connection strings
```

### **Phase 2: Add Environment Variables (2 minutes)**

```
1. In Vercel: Settings → Environment Variables
2. Paste POSTGRES_PRISMA_URL
3. Paste POSTGRES_URL_NON_POOLING
4. Apply to: Production, Preview, Development
5. Save
```

### **Phase 3: Run Migration Locally (2 minutes)**

```powershell
# Navigate to project
cd "c:\Users\Thinal jayamanna\Videos\test\shop-billing"

# Pull env variables
vercel env pull

# Run migration
npx prisma migrate dev --name "switch_to_postgres"

# Verify
npx prisma migrate status
```

### **Phase 4: Deploy (2 minutes)**

```powershell
# Push to GitHub
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push origin main

# Vercel auto-deploys, OR manually:
vercel --prod
```

### **Phase 5: Verify (5 minutes)**

```
1. Open your Vercel URL
2. Go to /inventory
3. Add a test product
4. Go to / (POS screen)
5. Verify product appears
6. Create a test sale
7. Check Vercel logs for errors
```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Can't reach database" | Env vars must be in Vercel Dashboard + redeploy |
| "Connection pool exhausted" | Use POSTGRES_PRISMA_URL in app, only POSTGRES_URL_NON_POOLING for migrations |
| "Migration failed" | Run `npx prisma migrate status` to see what went wrong |
| "No schema found" | Connection string must include `?schema=public` |
| "Password auth failed" | Special chars must be URL-encoded (`@` = `%40`, `:` = `%3A`) |

---

## Important: Two Different Connection Strings

**Why TWO URLs?**

### POSTGRES_PRISMA_URL (Pooled)
- **Used by:** Your app (serverless functions)
- **Purpose:** Manages connection pooling for better resource usage
- **Contains:** Pool proxy endpoint
- **Example:** `postgresql://user:pass@host.pooling.postgres.vercel.sh/db?schema=public`

### POSTGRES_URL_NON_POOLING (Direct)
- **Used by:** Prisma migrations only
- **Purpose:** Direct connection without pooling for reliable migrations
- **Contains:** Direct database endpoint
- **Example:** `postgresql://user:pass@host.postgres.vercel.sh/db?schema=public`

**Rule:** Always set BOTH in environment variables. Prisma knows which to use automatically.

---

## Command Cheat Sheet

```powershell
# Pull latest env variables from Vercel
vercel env pull

# Create a new migration
npx prisma migrate dev --name "migration_name"

# View migration status
npx prisma migrate status

# Open database viewer UI
npx prisma studio

# Deploy to Vercel
vercel --prod

# View Vercel logs
vercel logs --prod

# Check your project
vercel info
```

---

## What Changed vs What Didn't

### ✅ Changed
- Database provider: SQLite → PostgreSQL
- Connection URL format: file path → connection string
- Environment variables: DATABASE_URL → POSTGRES_PRISMA_URL + POSTGRES_URL_NON_POOLING

### ❌ NOT Changed (100% Compatible)
- Your Prisma models (Product, Sale, SaleItem)
- Your server actions (addProduct, createSale)
- Your React components (POSScreen, InventoryManager)
- Your API routes and business logic
- Database field types work the same way

**No code changes needed in your app!** ✨

---

## Final Checklist Before Deploying

- [ ] Created Vercel Postgres database
- [ ] Have both connection strings from Vercel
- [ ] Added both env vars to Vercel Dashboard (3 environments)
- [ ] Ran `npx prisma migrate dev --name "switch_to_postgres"` locally
- [ ] Verified migration with `npx prisma migrate status`
- [ ] Tested with `npx prisma studio`
- [ ] Committed and pushed code to GitHub
- [ ] Vercel deployment shows "Ready" status
- [ ] Tested app: inventory page + POS screen + sale creation all work
- [ ] Checked Vercel logs - no errors

---

## Success Indicators

After deployment, you should see:
```
✓ New product can be added via /inventory
✓ Products appear in POS screen at /
✓ Creating a sale works
✓ Stock decrements correctly
✓ No database errors in Vercel logs
✓ App loads instantly (no local database calls)
```

---

**You're ready to go live! 🎉**

For detailed step-by-step instructions, see `DEPLOYMENT_GUIDE.md`
