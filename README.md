# Habity

> Your daily habit companion — build streaks, track progress, stay consistent.

Habity is a cross-platform mobile app (iOS & Android) built with **React Native / Expo** and **Firebase**. It helps you build and maintain daily habits through streaks, monthly goals, step tracking, focus sessions, badges, and a full offline-first architecture.

---

## Features

| Area | Details |
|------|---------|
| **Habits** | Create, edit, delete habits with custom icons, colours, and monthly goals |
| **Daily tracking** | One-tap checkbox with streak counter and monthly progress text |
| **Monthly goals** | Set a target number of completions per month; checkbox locks automatically once goal is met |
| **Calendar** | Month-view calendar with per-day breakdown — Completed / Monthly Goal Reached / Not Completed |
| **Steps** | Live pedometer ring, daily history, distance and calories |
| **Focus mode** | Pomodoro timer (25 / 45 / 60 min) with face-down auto-start; completed sessions saved to Firestore |
| **Badges** | 20+ achievement badges across streak, completion, step, and special categories |
| **Analytics** | Completion rates, streaks, trends, and focus session summaries |
| **Offline-first** | All writes queue locally in SQLite and sync to Firestore automatically when back online |
| **Notifications** | Scheduled habit reminders via Expo Notifications |
| **Auth** | Email/password and Google Sign-In via Firebase Authentication |
| **Error resilience** | Root-level error boundary; all screens recover gracefully from render errors |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 55 / React Native 0.83 / Expo Router |
| Language | TypeScript |
| Cloud backend | Firebase Firestore + Firebase Auth |
| Local cache | Expo SQLite (offline queue) |
| Server state | TanStack React Query v5 |
| Client state | Zustand |
| UI | Custom components, Expo Linear Gradient, Expo Vector Icons |
| Sensors | Expo Sensors (pedometer / accelerometer) |
| Charts | React Native Chart Kit |

---

## Project Structure

```
app/
  (auth)/          Login, register, onboarding
  (tabs)/          Home, Habits, Calendar, Analytics, Badges, Settings
  habit/[id].tsx   Habit detail / edit modal
  habit/new.tsx    New habit modal
  focus.tsx        Focus mode (Pomodoro timer)
components/
  habits/          HabitCard, HabitCheckbox, HabitStats, HabitForm
  calendar/        MonthCalendar
  badges/          BadgeUnlockModal, BadgeDetailModal
  home/            AchievementPreview, FocusHighlights, MetricHighlights
  shared/          EmptyState, LoadingState
  ui/              Button, LoadingSpinner, OfflineBanner, InAppNotification
  ErrorBoundary    Root error boundary
hooks/             useHabits, useCompletions, useBadges, useAdvancedFeatures, ...
services/
  storage/         LocalStorageService (SQLite cache + sync queue)
  sync/            SyncService (offline -> Firestore replay)
  badges/          BadgeChecker
  notifications/   NotificationService
  health/          PedometerService
types/             Shared TypeScript interfaces
utils/             dateHelpers, streakCalculator, iconHelpers
constants/         theme, badge definitions
lib/               Firebase client, SQLite initialisation
firestore.rules    Firestore security rules
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A Firebase project with **Firestore** and **Authentication** (Email/Password + Google) enabled

### 1. Clone and install

```bash
git clone https://github.com/Aravinthan-J/habity.git
cd habity
npm install
```

### 2. Configure Firebase

Copy the example env file and fill in your Firebase project values:

```bash
cp .env.example .env
```

Then open `lib/firebase.ts` and replace the `GOOGLE_WEB_CLIENT_ID` placeholder with your **Web client ID** from:
Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration.

### 3. Deploy Firestore security rules

```bash
firebase deploy --only firestore:rules
```

### 4. Run the app

```bash
npm start        # Expo dev server (scan QR with Expo Go)
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

> **Note:** Step tracking and face-down focus mode require a **physical device** — they will not work in simulators.

---

## Building for Production

Builds are managed with [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
npm install -g eas-cli
eas login

# Before building, set extra.eas.projectId in app.json to your real EAS project ID
eas init

eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## Offline Support

When the device has no connectivity:
- Habits and completions are served from the local SQLite cache
- Writes (create, update, delete, toggle) are queued in the `sync_queue` table with up to 3 retry attempts
- When connectivity is restored, the sync queue is replayed against Firestore automatically

---

## License

MIT © 2024 [Aravinthan J](https://github.com/Aravinthan-J)
