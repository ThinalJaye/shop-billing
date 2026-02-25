# 📋 SQLite → PostgreSQL Migration - Before & After

## 🔄 What Changed

### **1. Database Provider**

```
BEFORE (SQLite - Local File)
┌─────────────────────────────────┐
│  Your Computer                  │
│  ┌────────────────┐             │
│  │  dev.db file   │ (ephemeral) │
│  └────────────────┘             │
│         ↓                       │
│  Vercel (doesn't persist)       │
└─────────────────────────────────┘

AFTER (PostgreSQL - Cloud Managed)
┌─────────────────────────────────┐
│  Vercel Postgres                │
│  ┌────────────────────────────┐ │
│  │  PostgreSQL Database       │ │
│  │  - Persistent Storage      │ │
│  │  - Connection Pooling      │ │
│  │  - Automatic Backups       │ │
│  │  - Scalable                │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 📝 Schema Changes

### **File: prisma/schema.prisma**

```diff
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
-   provider = "sqlite"
-   url      = env("DATABASE_URL")
+   provider  = "postgresql"
+   url       = env("POSTGRES_PRISMA_URL")
+   directUrl = env("POSTGRES_URL_NON_POOLING")
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

## 🔐 Environment Variables

### **File: .env (Local Development)**

```diff
# BEFORE - SQLite
- DATABASE_URL="file:./dev.db"

# AFTER - PostgreSQL
+ POSTGRES_PRISMA_URL="postgresql://user:password@host/db?schema=public"
+ POSTGRES_URL_NON_POOLING="postgresql://user:password@host/db?schema=public"
```

### **Vercel Dashboard Settings**

```
Location: Settings → Environment Variables

Add 2 Variables (all 3 environments):

Variable 1: POSTGRES_PRISMA_URL
Value: postgresql://user:password@host.pooling.postgres.vercel.sh/db?schema=public
Apply to: Production, Preview, Development ✓

Variable 2: POSTGRES_URL_NON_POOLING
Value: postgresql://user:password@host.postgres.vercel.sh/db?schema=public
Apply to: Production, Preview, Development ✓
```

---

## 🔗 Connection Architecture

### **How Connections Work**

```
Your App (Serverless Functions)
         ↓
    Prisma Client
         ↓
POSTGRES_PRISMA_URL (Pooled Connection)
         ↓
PgBouncer (Connection Pool)
         ↓
Vercel Postgres Database

---

Migrations (One-time Setup)
         ↓
Prisma Migrate
         ↓
POSTGRES_URL_NON_POOLING (Direct Connection)
         ↓
Vercel Postgres Database
```

---

## 📊 Key Differences

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| **Storage** | Local file (`dev.db`) | Cloud database (Vercel) |
| **Persistence** | ❌ Lost on redeploy | ✅ Permanent |
| **Concurrent Connections** | ⚠️ Limited | ✅ Multiple (with pooling) |
| **Scalability** | ⚠️ Single file | ✅ Enterprise-ready |
| **Backups** | ❌ Manual | ✅ Automatic |
| **Connection Pooling** | ❌ No | ✅ Yes (POSTGRES_PRISMA_URL) |
| **Best For** | Development | Production |

---

## 🚀 Deployment Timeline

```
Phase 1: Create Database (5 min)
  ├─ Open Vercel Dashboard
  ├─ Create Postgres Database
  └─ Copy connection strings

Phase 2: Add Environment Variables (2 min)
  ├─ Add POSTGRES_PRISMA_URL to Vercel
  ├─ Add POSTGRES_URL_NON_POOLING to Vercel
  └─ Save all 3 environments

Phase 3: Local Migration (2 min)
  ├─ Run: vercel env pull
  ├─ Run: npx prisma migrate dev --name "switch_to_postgres"
  └─ Verify: npx prisma migrate status

Phase 4: Deploy (2 min)
  ├─ git add, commit, push
  └─ Vercel auto-deploys

Phase 5: Test (5 min)
  ├─ Open live URL
  ├─ Test /inventory
  ├─ Test / (POS)
  └─ Create test sale

Total Time: ~15 minutes
```

---

## ✨ What Stays The Same

### Your Application Code
```typescript
// src/app/actions.ts - NO CHANGES
export async function addProduct(product: ProductInput) {
    // This works exactly the same with PostgreSQL
}

export async function createSale(items: SaleItemInput[]) {
    // This works exactly the same with PostgreSQL
}
```

### Your Components
```tsx
// src/components/InventoryManager.tsx - NO CHANGES
// src/components/POSScreen.tsx - NO CHANGES
// All React code works unchanged
```

### Your Database Models
```
Product  → Still works
Sale     → Still works
SaleItem → Still works
```

**Prisma handles all database differences automatically!** 🎉

---

## 🎯 Critical: Two URLs Explained

### Why do you need TWO connection strings?

**POSTGRES_PRISMA_URL** (Pooled)
```
✓ For: Serverless app runtime
✓ Has: PgBouncer proxy for connection pooling
✓ Benefits: Efficient resource usage, auto-scaling
✓ Example: ...pooling.postgres.vercel.sh...
```

**POSTGRES_URL_NON_POOLING** (Direct)
```
✓ For: Prisma migrations only
✓ Direct: Straight to database (no proxy)
✓ Needed: For schema changes to work reliably
✓ Example: ...postgres.vercel.sh...
```

**Both must be present in environment variables!**

---

## 📋 Pre-Migration Checklist

- [ ] Backed up any important SQLite data
- [ ] Have GitHub account and Vercel account
- [ ] Your project is in a Git repository
- [ ] Node.js and npm installed locally
- [ ] Vercel CLI installed: `npm i -g vercel`

---

## 🔍 Files Modified

```
📁 shop-billing/
├── prisma/
│   └── schema.prisma          ✏️ MODIFIED (datasource provider)
├── .env                        ✏️ MODIFIED (new env variables)
├── DEPLOYMENT_GUIDE.md         ✨ NEW (detailed steps)
├── MIGRATION_SUMMARY.md        ✨ NEW (overview)
├── VERCEL_POSTGRES_QUICK_REFERENCE.md  ✨ NEW (quick ref)
└── [All other files unchanged]
```

---

## ✅ Verification Checklist Post-Deployment

```
After deployment, verify:

✓ Can add products at https://your-app.vercel.app/inventory
✓ Products appear in POS at https://your-app.vercel.app/
✓ Can create sales and stock decrements
✓ No "Cannot connect to database" errors
✓ No console errors in browser DevTools
✓ Vercel logs show no database errors
✓ Page loads are fast (no timeout waiting for DB)
```

---

## 🆘 If Something Goes Wrong

```powershell
# Check migration status
npx prisma migrate status

# View all migrations
ls prisma/migrations

# Check Vercel logs
vercel logs --prod

# Test database connection
npx prisma studio

# Redeploy if you added env vars
vercel --prod

# Check env vars are set in Vercel
vercel env list
```

---

## 📚 Key Commands

```powershell
# Initial setup
vercel env pull                                    # Get Vercel env vars
npx prisma migrate dev --name "switch_to_postgres" # Create migration
npx prisma migrate status                          # Check status

# Local testing
npx prisma studio                                  # View database UI
npx prisma db push                                 # Push schema changes

# Deployment
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push origin main                               # Auto-deploys

# Or manual deploy
vercel --prod                                      # Deploy immediately
vercel logs --prod                                 # View logs
```

---

**You're all set! The migration is straightforward because Prisma handles all the database differences. Your application code doesn't need to change at all!** ✨
