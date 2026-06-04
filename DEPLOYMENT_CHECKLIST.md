# Deployment Checklist

## Files Modified

1. **prisma/schema.prisma**
   - Changed datasource provider from `sqlite` to `postgresql`
   - Changed URL from hardcoded connection string to `env("DATABASE_URL")`

2. **package.json**
   - Updated build script: `"build": "prisma generate && next build"`
   - Kept postinstall script: `"postinstall": "prisma generate"`

3. **.env.example** (new file)
   - Added template for DATABASE_URL environment variable

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (format: `postgresql://user:password@host:port/database?sslmode=require`)

## Local Development Commands

1. **Set up environment variables**
   ```bash
   # Copy .env.example to .env and add your DATABASE_URL
   cp .env.example .env
   # Edit .env with your actual Neon PostgreSQL connection string
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Push schema to database**
   ```bash
   npx prisma db push
   ```

5. **Seed database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

## Pre-Deployment Commands

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Test production build locally**
   ```bash
   npm start
   ```

## Vercel Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Refactor for Vercel deployment with PostgreSQL"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure environment variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with your Neon PostgreSQL connection string

4. **Deploy**
   - Vercel will automatically deploy on push
   - Or click "Deploy" button in Vercel dashboard

## Database Setup

### Using Neon PostgreSQL
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env` locally and Vercel environment variables

### Using Vercel Postgres
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string
4. Add to environment variables

## Verification Checklist

- [ ] `.env` file created with DATABASE_URL
- [ ] `prisma/schema.prisma` uses `env("DATABASE_URL")`
- [ ] `src/lib/prisma.ts` uses singleton pattern
- [ ] All server actions import from `@/lib/prisma`
- [ ] No hardcoded database URLs in codebase
- [ ] `npx prisma generate` runs successfully
- [ ] `npx prisma db push` runs successfully
- [ ] Local development server runs without errors
- [ ] Production build runs without errors
- [ ] DATABASE_URL added to Vercel environment variables
- [ ] Application deploys successfully to Vercel

## Compatibility

- ✅ Next.js 15 App Router
- ✅ Prisma ORM
- ✅ Neon PostgreSQL
- ✅ Vercel deployment
- ✅ Singleton Prisma Client pattern
- ✅ Environment variable configuration

## Notes

- The seed file (`prisma/seed.ts`) creates a direct PrismaClient instance, which is acceptable for seed scripts
- All application code uses the shared singleton client from `src/lib/prisma.ts`
- The `.env` file is gitignored for security
- `.env.example` is provided as a template for other developers
