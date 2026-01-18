# Ultimate Monthly Habit Tracker

A full-stack habit tracking application built with React Native (mobile) and Node.js (backend) in a monorepo architecture.

## Project Overview

This is a **Phase 1** implementation featuring:
- User authentication with JWT
- Monthly habit tracking with goals
- Habit completion tracking with streak calculations
- Offline-first mobile architecture
- Cross-platform mobile app (iOS & Android)

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Language**: TypeScript

### Mobile App
- **Framework**: React Native 0.74+
- **Navigation**: React Navigation 6
- **State Management**: Zustand + React Query (TanStack Query)
- **Storage**: AsyncStorage (secure token storage)
- **API Client**: Axios
- **Icons**: React Native Vector Icons
- **Language**: TypeScript

### Shared Packages
- **shared-types**: TypeScript interfaces shared across backend and mobile
- **shared-utils**: Utility functions (date helpers, streak calculator, validators)
- **api-client**: Axios-based API client with service classes

### Monorepo
- **Build System**: Turborepo
- **Package Manager**: npm workspaces

## Getting Started

### Prerequisites

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **PostgreSQL**: 14+ installed and running
- **React Native Development Environment**:
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio with SDK

### Installation

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up PostgreSQL database**: `createdb habit_tracker`
4. **Configure environment variables**: Copy `apps/backend/.env.example` to `apps/backend/.env` and update values
5. **Run database migrations**: `cd apps/backend && npx prisma migrate dev && npx prisma generate`
6. **Seed the database** (optional): `npm run backend:seed`

### Running the Application

#### Backend API

```bash
npm run backend:dev
```

The API will be available at `http://localhost:3000`

#### Mobile App

```bash
npm run mobile:dev  # Start Metro bundler
npm run mobile:ios  # Run on iOS
npm run mobile:android  # Run on Android
```

## Project Structure

See the full directory structure in the codebase. Key directories:
- `apps/backend` - Express.js API server
- `apps/mobile` - React Native mobile app
- `packages/` - Shared packages (types, utils, api-client)

## API Documentation

### Base URL
- Development: `http://localhost:3000/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PATCH /api/auth/profile` - Update profile (protected)

### Habits
- `GET /api/habits` - Get all habits (protected)
- `POST /api/habits` - Create habit (protected)
- `GET /api/habits/:id/stats` - Get habit statistics (protected)
- `PATCH /api/habits/:id` - Update habit (protected)
- `DELETE /api/habits/:id` - Archive habit (protected)

### Completions
- `POST /api/completions` - Mark habit complete (protected)
- `DELETE /api/completions/:habitId/:date` - Unmark completion (protected)
- `GET /api/completions/calendar/:year/:month` - Get monthly calendar (protected)

## Environment Variables

Create `apps/backend/.env` with:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/habit_tracker
JWT_SECRET=your-secret-key-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

## Test Credentials

After seeding:
- **Email**: test@example.com
- **Password**: Test1234

## Features Implemented (Phase 1)

- ✅ User authentication
- ✅ Habit CRUD operations
- ✅ Completion tracking
- ✅ Streak calculations
- ✅ Backend API with validation
- ✅ Mobile app navigation structure
- ✅ Shared packages architecture

## Next Steps

- Complete mobile UI screens
- Implement offline sync
- Add push notifications
- Build data visualizations
- Add comprehensive tests

## License

MIT

---

Built with Node.js, React Native, and TypeScript
