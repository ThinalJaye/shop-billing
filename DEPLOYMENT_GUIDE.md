# 🚀 Deployment Guide: SQLite → Vercel Postgres

This guide walks you through migrating your billing app from SQLite to PostgreSQL and deploying it to Vercel.

---

## 📋 Why PostgreSQL on Vercel?

- **Ephemeral Filesystem**: Vercel doesn't persist local files between deployments
- **Scalability**: PostgreSQL handles concurrent requests better than SQLite
- **Managed Service**: Vercel Postgres is fully managed and includes backups
- **Connection Pooling**: Built-in support for Prisma Data Proxy

---

## ✅ Changes Made (Already Applied)

### 1. **prisma/schema.prisma** - Updated Provider

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

**Key points:**
- `provider = "postgresql"` - Uses Vercel Postgres
- `POSTGRES_PRISMA_URL` - Connection string WITH pooling (for serverless functions)
- `POSTGRES_URL_NON_POOLING` - Connection string WITHOUT pooling (for migrations)

**Why two URLs?**
- Serverless functions need a pooling connection string to manage connections
- Prisma migrations need the direct URL to avoid pool exhaustion
- Vercel Postgres provides both automatically

### 2. **.env File** - Updated with Postgres Variables

The `.env` file now has placeholders for your Postgres credentials. After creating your Vercel Postgres database, you'll add:

```env
POSTGRES_PRISMA_URL="postgresql://user:password@host/dbname?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host/dbname?schema=public"
```

### 3. **No Schema Changes Needed**

Your data models (Product, Sale, SaleItem) remain exactly the same! PostgreSQL supports the same field types.

---

## 🔧 Step-by-Step Deployment

### **Step 1: Create Vercel Postgres Database**

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create an account
3. Create a **New Project**
   - Choose "Other" → "Continue without a framework" → "Clone Template"
   - Or connect your GitHub repository
4. Once project is created, go to **Storage** tab
5. Click **Create Database** → **Postgres**
   - Choose a region close to your users
   - Accept the terms and create
6. Click on the created database to view credentials
7. Copy both connection strings:
   - `POSTGRES_PRISMA_URL` (with pooling - starts with `postgres://user:...@...`)
   - `POSTGRES_URL_NON_POOLING` (direct connection)

#### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create and link Postgres database
vercel env pull
```

---

### **Step 2: Add Environment Variables to Vercel**

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add two new variables:
   ```
   POSTGRES_PRISMA_URL = <your_pooling_connection_string>
   POSTGRES_URL_NON_POOLING = <your_direct_connection_string>
   ```
3. Make sure they apply to: **Production, Preview, and Development**

---

### **Step 3: Generate Prisma Migration for PostgreSQL**

Since you're switching from SQLite to PostgreSQL, you need to create a new migration:

```powershell
# Navigate to your project folder
cd "c:\Users\Thinal jayamanna\Videos\test\shop-billing"

# Pull the latest environment variables
vercel env pull

# Create a new migration for PostgreSQL
npx prisma migrate dev --name "switch_to_postgres"
```

This will:
1. ✅ Create a new migration file in `prisma/migrations/`
2. ✅ Apply the migration to your Vercel Postgres database
3. ✅ Regenerate the Prisma Client

---

### **Step 4: Verify Database Schema**

After migration, verify the tables exist in your Vercel Postgres:

```powershell
# Open Prisma Studio (interactive DB viewer)
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Insert test data
- Query the database

---

### **Step 5: Deploy to Vercel**

#### Option A: Via Git Push (Recommended)

1. Commit your changes:
```powershell
git add .
git commit -m "Switch to PostgreSQL for Vercel deployment"
git push origin main
```

2. Vercel automatically deploys on push
3. Monitor deployment in Vercel Dashboard

#### Option B: Via Vercel CLI

```powershell
# Deploy immediately
vercel --prod
```

---

### **Step 6: Verify Deployment**

1. Open your Vercel project URL
2. Test the app:
   - ✅ Navigate to `/inventory`
   - ✅ Add a new product
   - ✅ Go to POS screen and verify products appear
   - ✅ Create a sale
3. Check Vercel logs for errors:
   - Dashboard → **Deployments** → Click latest → **Logs**

---

## 📝 Migration File Structure

After running the migration, you'll have:

```
prisma/
├── schema.prisma (Updated)
├── migrations/
│   ├── 20260217105929_init/
│   ├── 20260217112341_add_sale_items/
│   ├── 20260217112655_decimal_quantities/
│   └── 20260218000000_switch_to_postgres/  ← New!
│       └── migration.sql
└── seed.ts
```

---

## 🔄 Troubleshooting

### **Issue: "Can't reach database server"**

**Solution:**
- Verify `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are correct
- Check that both environment variables are set in Vercel Dashboard
- Redeploy after adding environment variables: `vercel --prod`

### **Issue: "No database selected"**

**Solution:**
```powershell
# Ensure your connection strings include schema
# Should look like: postgresql://user:pass@host/dbname?schema=public

# If missing, update in Vercel Dashboard
```

### **Issue: "Relation does not exist"**

**Solution:**
- Verify migration ran successfully: `npx prisma migrate status`
- If stuck, create a new migration:
```powershell
npx prisma migrate resolve --rolled-back "switch_to_postgres"
npx prisma migrate dev --name "switch_to_postgres_fix"
```

### **Issue: Connection pool exhausted**

**Solution:**
- Ensure you're using `POSTGRES_PRISMA_URL` (with pooling) in your app
- Only use `POSTGRES_URL_NON_POOLING` for migrations
- Increase pool size in Vercel Postgres settings if needed

---

## 📊 Data Migration (Optional)

If you have existing data in SQLite and need to migrate it:

### **Export from SQLite:**
```powershell
# Using sqlite3 CLI
sqlite3 dev.db ".mode csv" ".output products.csv" "SELECT * FROM Product;"
sqlite3 dev.db ".mode csv" ".output sales.csv" "SELECT * FROM Sale;"
```

### **Import to PostgreSQL:**
```powershell
# Using Prisma Studio or direct SQL
# (Vercel Postgres doesn't have built-in CSV import)
# Recommended: Use Vercel's Data Inspector or connect via pgAdmin
```

---

## 🎯 Quick Commands Reference

```powershell
# Pull Vercel env variables
vercel env pull

# Run migrations
npx prisma migrate dev --name "migration_name"

# View database
npx prisma studio

# Check migration status
npx prisma migrate status

# Deploy to Vercel
vercel --prod

# View Vercel logs
vercel logs --prod
```

---

## ✨ Final Checklist

- [ ] Created Vercel Postgres database
- [ ] Added `POSTGRES_PRISMA_URL` to `.env` and Vercel
- [ ] Added `POSTGRES_URL_NON_POOLING` to `.env` and Vercel
- [ ] Ran `npx prisma migrate dev` for PostgreSQL
- [ ] Verified migration completed: `npx prisma migrate status`
- [ ] Tested database with `npx prisma studio`
- [ ] Pushed code to Git
- [ ] Deployed to Vercel (automatic or manual)
- [ ] Verified app works: Added product, checked POS screen
- [ ] Checked Vercel logs for any errors

---

## 📚 Additional Resources

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Vercel Logs:**
   ```powershell
   vercel logs --prod
   ```

2. **Test Locally First:**
   ```powershell
   npx prisma studio
   ```

3. **Verify Connection String:**
   - Format: `postgresql://user:password@host:5432/dbname?schema=public`
   - Ask: Does it have `schema=public`?
   - Ask: Is the password URL-encoded? (special chars like `@` → `%40`)

4. **Redeploy:**
   ```powershell
   vercel --prod --force
   ```

---

Good luck with your deployment! 🚀
