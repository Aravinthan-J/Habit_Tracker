# Habity - Your Friendly Habit Tracking Companion

Build lasting routines, visualize your progress, and celebrate every win with badges and streaks.

A full-stack habit tracking application built with modern technologies and offline-first architecture.

## 🏗️ Project Structure

```
habit-tracker/
├── apps/
│   ├── backend/          # Node.js + Express + Prisma + PostgreSQL
│   └── mobile/           # Expo + React Native + TypeScript
└── packages/
    ├── shared-types/     # Shared TypeScript types
    ├── shared-utils/     # Utility functions
    └── api-client/       # API service layer
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Language**: TypeScript

### Mobile
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Zustand + React Query
- **Offline Storage**: SQLite (expo-sqlite)
- **Secure Storage**: Expo SecureStore

### Shared
- **Monorepo**: npm workspaces + Turborepo
- **Language**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier

## ✨ Features

- ✅ Track unlimited habits with custom icons and colors
- ✅ Beautiful calendar view to visualize your progress
- ✅ Unlock 30+ achievement badges
- ✅ Streak tracking with fire 🔥
- ✅ Step counter integration
- ✅ Monthly goal tracking
- ✅ User authentication (register, login, logout)
- ✅ Offline-first architecture with real-time sync
- ✅ Dark mode support
- ✅ Smart daily reminders

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm 9+
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up the backend:
```bash
cd apps/backend
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma generate
```

4. Start development servers:
```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Mobile
npm run mobile:dev
```

## 📱 Mobile App Development

```bash
cd apps/mobile
npx expo start

# Then:
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for web (if configured)
```

## 🗄️ Database

### Run migrations:
```bash
cd apps/backend
npx prisma migrate dev
```

### View database:
```bash
npx prisma studio
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific workspace
npm test --workspace=apps/backend
```

## 📦 Building

```bash
# Build all packages
npm run build

# Build specific workspace
npm run build --workspace=packages/shared-types
```

## 📄 License

MIT

## 👥 Team

Built with ❤️ for habit tracking enthusiasts
