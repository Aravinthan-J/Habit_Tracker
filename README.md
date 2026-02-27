# Habity 🎯

A production-ready habit tracking mobile app built with **Expo** + **Supabase**.

## Features

- ✅ Email/password authentication
- ✅ Unlimited habit creation and tracking
- ✅ Daily completion marking with streak calculations
- ✅ Calendar view with monthly visualization
- ✅ 30 achievement badges system
- ✅ Step tracking via phone pedometer
- ✅ Smart notifications and reminders
- ✅ Analytics dashboard with charts
- ✅ Offline-first with SQLite cache
- ✅ Real-time sync across devices
- ✅ Celebration animations + haptic feedback

---

## Quick Start

### 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to initialize (~2 minutes)
3. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key

4. Go to **SQL Editor** → **New Query**, paste the contents of `supabase/schema.sql`, and click **Run**

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase values:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install dependencies

```bash
npm install
```

### 4. Install `babel-plugin-module-resolver`

```bash
npm install --save-dev babel-plugin-module-resolver
```

### 5. Start the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS Simulator / `a` for Android Emulator.

---

## Project Structure

```
habity/
├── app/              # Expo Router screens
│   ├── (auth)/       # Login, register, onboarding
│   ├── (tabs)/       # Home, calendar, habits, analytics, badges, settings
│   ├── habit/        # Create & detail screens
│   └── badge/        # Badge detail screens
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # Business logic (sync, notifications, pedometer)
├── store/            # Zustand state management
├── lib/              # Supabase client, SQLite setup
├── constants/        # Theme, badges, notifications
├── types/            # TypeScript type definitions
├── utils/            # Date helpers, streak calculator, validators
└── supabase/
    └── schema.sql    # Database schema — run this in Supabase
```

---

## Step Tracking

Step tracking uses the device pedometer (`expo-sensors`). This requires a **physical device** — it won't work in iOS Simulator. The app gracefully hides the step ring on devices where the pedometer is unavailable.

## Offline Support

The app uses **Expo SQLite** as a local cache. When offline:
- Habits and completions are read from local SQLite
- New operations are queued in the `sync_queue` table
- When connectivity is restored, the queue is synced to Supabase automatically

## Notifications

Notifications require a physical device and user permission. Grant notification permission in Settings when prompted.

---

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |

---

## Tech Stack

- **Expo SDK 55** + Expo Router
- **TypeScript** (strict mode)
- **Supabase** (auth, database, realtime)
- **TanStack Query v5** (data fetching)
- **Zustand** (state management)
- **Expo SQLite** (offline cache)
- **React Native Chart Kit** (analytics)
- **Expo Sensors** (pedometer)
- **Expo Notifications**
- **Expo Haptics**
