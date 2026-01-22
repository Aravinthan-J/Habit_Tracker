# Habit Tracker - Setup Guide

Complete setup guide for Phase 1 backend and shared packages.

## 📦 What We've Built So Far

### ✅ Backend (Complete)
- 28 files created
- Express + Prisma + PostgreSQL
- 15+ API endpoints
- JWT authentication
- Full CRUD for habits and completions

### ✅ Shared Packages (Complete)
- **shared-types**: TypeScript interfaces for User, Habit, Completion, API
- **shared-utils**: Date helpers, streak calculator, validators
- **api-client**: Axios-based API service layer

## 🚀 Installation Steps

### 1. Install Root Dependencies

```bash
cd /Users/aravinthan/Documents/Habit_Tracker
npm install
```

This installs dependencies for the root workspace and all packages.

### 2. Setup PostgreSQL Database

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL (if not already installed)
brew install postgresql@14
brew services start postgresql@14

# Create database
psql postgres
CREATE DATABASE habit_tracker;
\q
```

**Option B: Docker PostgreSQL**

```bash
docker run --name habit-tracker-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Configure Backend Environment

```bash
cd apps/backend

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

Update these values in `.env`:
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/habit_tracker?schema=public"
JWT_SECRET=your-super-secret-change-this-in-production
PORT=3000
NODE_ENV=development
```

### 4. Build Shared Packages

```bash
# Go back to root
cd ../..

# Build all packages
npm run build
```

This compiles TypeScript for all shared packages.

### 5. Setup Database Schema

```bash
cd apps/backend

# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate

# Seed test data (optional)
npm run seed
```

### 6. Start Backend Server

```bash
# From apps/backend
npm run dev
```

You should see:
```
✅ Database connected successfully
╔═══════════════════════════════════════╗
║   🚀 Habit Tracker API Server Running ║
║   Port: 3000                          ║
╚═══════════════════════════════════════╝
```

### 7. Test the API

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

## 📁 Project Structure

```
habit-tracker/
├── apps/
│   └── backend/          ✅ Complete (28 files)
│       ├── prisma/       ✅ Schema + migrations + seed
│       └── src/          ✅ All routes, controllers, services
│
├── packages/
│   ├── shared-types/     ✅ Complete (6 files)
│   ├── shared-utils/     ✅ Complete (4 files)
│   └── api-client/       ✅ Complete (6 files)
│
├── package.json          ✅ Root workspace config
├── turbo.json           ✅ Build pipeline
└── tsconfig.json        ✅ TypeScript config
```

## 🧪 Testing

### Test Credentials (after seed)
- **Email**: test@example.com
- **Password**: Test1234

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile (protected)
- `POST /api/auth/logout` - Logout (protected)
- `PATCH /api/auth/profile` - Update profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

**Habits:**
- `POST /api/habits` - Create habit (protected)
- `GET /api/habits` - Get all habits (protected)
- `GET /api/habits/:id` - Get habit (protected)
- `PATCH /api/habits/:id` - Update habit (protected)
- `DELETE /api/habits/:id` - Delete habit (protected)
- `GET /api/habits/:id/stats` - Get stats (protected)

**Completions:**
- `POST /api/completions` - Mark complete (protected)
- `DELETE /api/completions/:habitId/:date` - Unmark (protected)
- `GET /api/completions` - Get completions (protected)
- `GET /api/completions/calendar/:year/:month` - Calendar view (protected)

## 🔧 Development Commands

```bash
# Root commands
npm run dev          # Run all workspaces in dev mode
npm run build        # Build all packages
npm run clean        # Clean all build artifacts

# Backend commands
npm run backend:dev  # Start backend dev server
npm run mobile:dev   # Start mobile app (coming next)

# Backend-specific (from apps/backend)
npm run dev          # Start with hot-reload
npm run migrate      # Run migrations
npm run generate     # Generate Prisma Client
npm run studio       # Open Prisma Studio
npm run seed         # Seed test data
```

## 🐛 Troubleshooting

**Database connection error:**
- Check PostgreSQL is running: `brew services list`
- Verify DATABASE_URL in .env
- Test connection: `psql -h localhost -U your_username -d habit_tracker`

**Migration errors:**
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npm run generate`

**Port already in use:**
- Change PORT in .env
- Kill process: `lsof -ti:3000 | xargs kill`

**Build errors:**
- Clean and rebuild: `npm run clean && npm run build`
- Delete node_modules: `rm -rf node_modules && npm install`

## ✅ Current Status

- ✅ Backend API: **100% Complete**
- ✅ Shared Types: **100% Complete**
- ✅ Shared Utils: **100% Complete**
- ✅ API Client: **100% Complete**
- ⏳ Mobile App: **Not Started** (coming next!)

## 📝 Next Steps

Ready to create the **Expo mobile app**! The mobile app will:
- Use Expo (not Metro)
- Connect to this backend
- Use shared packages
- Implement offline-first with SQLite
- Have all Phase 1 screens

Would you like me to start building the mobile app now?

---

**Need Help?** Check:
- Backend README: `apps/backend/README.md`
- Phase 1 Requirements: `Phase1.md`
- Phase 1 Implementation: `Phase1-imp.md`
