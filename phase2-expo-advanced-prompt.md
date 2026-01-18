You are a senior Expo React Native developer building Phase 2 of the "Ultimate Monthly Habit Tracker" mobile application. Generate complete, production-ready code for advanced features using **Expo SDK 50+** (NOT bare React Native) including badges system, step tracking, smart notifications, analytics dashboard, and celebration animations.

# PROJECT CONTEXT

Phase 1 is complete with:
- ✅ Backend API (Node.js + Express + Prisma + PostgreSQL)
- ✅ Expo mobile app with Expo Router and authentication
- ✅ Basic habit CRUD operations with Expo SQLite
- ✅ Daily habit completions
- ✅ Offline-first architecture (Expo SQLite + sync)
- ✅ Shared packages (types, utils, api-client)

Phase 2 adds these advanced features to the **Expo mobile app**:
- 🎯 Badge system with milestone tracking
- 📊 Advanced analytics dashboard with charts
- 🚶 Step count integration (expo-sensors Pedometer)
- 🔔 Smart notification system (expo-notifications)
- 🎉 Celebration animations (Lottie, haptics)
- 📈 Streak tracking and insights

# TECH STACK REQUIREMENTS

**CRITICAL RULES:**
1. **ONLY use Expo SDK modules** - NO bare React Native packages requiring native linking
2. **Use Expo Router** for navigation (file-based routing)
3. **Use expo-notifications** (NOT @notifee or react-native-push-notification)
4. **Use expo-haptics** (NOT react-native-haptic-feedback)
5. **Use expo-sqlite** (already from Phase 1)
6. **Use expo-sensors** (Pedometer for step tracking)
7. **Use lottie-react-native** via Expo for animations
8. **Use react-native-chart-kit** or victory-native (Expo-compatible) for charts

**New Expo Dependencies to Add:**
- `expo-notifications` - Push and local notifications
- `expo-haptics` - Haptic feedback
- `expo-sensors` - Pedometer for step tracking
- `expo-linear-gradient` - Gradient backgrounds
- `expo-av` - Sound effects (optional)
- `expo-file-system` - File operations
- `expo-sharing` - Share functionality
- `lottie-react-native` - Lottie animations (install via `npx expo install lottie-react-native`)
- `react-native-chart-kit` - Charts (Expo compatible)
- `react-native-svg` - SVG support (Expo compatible)
- `react-native-animatable` - Simple animations (Expo compatible)
- `react-native-reanimated` - Advanced animations (install via Expo)
- `react-native-calendars` - Enhanced calendar (Expo compatible)

**Keep from Phase 1:** Expo Router, React Query, Zustand, Expo SQLite, Axios, @expo/vector-icons

# UPDATED EXPO APP STRUCTURE

Add to existing `apps/mobile/`:
```
apps/mobile/
├── app/                                         # Expo Router
│   ├── (auth)/                                  # Existing from Phase 1
│   ├── (tabs)/
│   │   ├── _layout.tsx                          # UPDATE: Add analytics, badges, steps tabs
│   │   ├── index.tsx                            # ENHANCE: Add celebrations
│   │   ├── calendar.tsx                         # ENHANCE: Add heatmap
│   │   ├── habits.tsx                           # Existing
│   │   ├── analytics.tsx                        # NEW
│   │   ├── badges.tsx                           # NEW
│   │   ├── steps.tsx                            # NEW (if separate tab)
│   │   └── settings.tsx                         # ENHANCE: Add notification settings
│   ├── habit/[id].tsx                           # ENHANCE: Add detailed analytics
│   ├── badge/[id].tsx                           # NEW: Badge detail screen
│   ├── _layout.tsx                              # UPDATE: Add notification listeners
│   └── +not-found.tsx
│
├── components/
│   ├── analytics/
│   │   ├── LineChart.tsx
│   │   ├── DonutChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── HeatmapCalendar.tsx
│   │   ├── StatsCard.tsx
│   │   └── InsightCard.tsx
│   ├── badges/
│   │   ├── BadgeCard.tsx
│   │   ├── BadgeGrid.tsx
│   │   ├── BadgeUnlockModal.tsx
│   │   ├── BadgeProgressBar.tsx
│   │   └── ConfettiAnimation.tsx
│   ├── steps/
│   │   ├── StepProgressRing.tsx
│   │   ├── StepChart.tsx
│   │   ├── StepGoalSetter.tsx
│   │   └── StepStats.tsx
│   └── celebrations/
│       ├── StreakFireAnimation.tsx
│       └── CompletionAnimation.tsx
│
├── services/
│   ├── health/
│   │   ├── PedometerService.ts              # expo-sensors
│   │   └── ManualStepService.ts             # Fallback
│   ├── notifications/
│   │   ├── ExpoNotificationService.ts       # expo-notifications
│   │   ├── NotificationScheduler.ts
│   │   └── NotificationHandlers.ts
│   ├── badges/
│   │   ├── BadgeService.ts
│   │   └── BadgeChecker.ts
│   └── analytics/
│       ├── AnalyticsService.ts
│       └── StreakCalculator.ts
│
├── hooks/
│   ├── useBadges.ts
│   ├── useSteps.ts
│   ├── useAnalytics.ts
│   ├── useNotifications.ts
│   ├── useCelebration.ts
│   └── useHaptics.ts
│
├── store/
│   ├── badgeStore.ts
│   ├── stepStore.ts
│   └── notificationStore.ts
│
├── constants/
│   ├── badges.ts
│   ├── notifications.ts
│   └── milestones.ts
│
├── utils/
│   ├── badgeUtils.ts
│   ├── notificationUtils.ts
│   └── chartDataUtils.ts
│
├── assets/
│   └── lottie/                              # NEW
│       ├── confetti.json
│       ├── fire.json
│       └── checkmark.json
│
├── app.json                                 # UPDATE: Add notification permissions
└── package.json                             # ADD: New Expo dependencies
```

# BACKEND API ADDITIONS

Add to existing backend (`apps/backend/`):

## Prisma Schema Updates

Add these models to `prisma/schema.prisma`:
```prisma
model Badge {
  id          String   @id @default(uuid())
  name        String   @unique
  description String
  type        String   // 'streak', 'completion', 'step', 'special'
  tier        String   // 'bronze', 'silver', 'gold', 'platinum'
  requirement Int
  iconName    String
  userBadges  UserBadge[]
}

model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id])
  habitId   String?
  earnedAt  DateTime @default(now())
  @@unique([userId, badgeId])
  @@index([userId])
}

model StepData {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date          DateTime @db.Date
  steps         Int
  distance      Float
  calories      Int?
  activeMinutes Int?
  source        String   @default("manual") // 'pedometer', 'manual'
  @@unique([userId, date])
  @@index([userId, date])
}
```

## New API Endpoints

Create these routes in backend:

**Badge Routes (`/api/badges`):**
- GET `/` - Get all available badges
- GET `/user` - Get user's earned badges  
- POST `/check` - Check and unlock badges
- GET `/:id` - Get badge details
- GET `/progress` - Get progress toward all badges

**Step Routes (`/api/steps`):**
- POST `/` - Log step data
- GET `/` - Get step data (query: startDate, endDate)
- GET `/today` - Get today's steps
- GET `/stats` - Get lifetime step statistics
- PATCH `/:date` - Update step data for date
- DELETE `/:date` - Delete step data

**Analytics Routes (`/api/analytics`):**
- GET `/overview` - Overall stats (habits, completions, rates)
- GET `/habits/:id` - Per-habit analytics
- GET `/trends` - Trend data over time
- GET `/insights` - Generated insights
- GET `/correlation` - Steps vs habits correlation

## Backend Services

Create these service files:

**BadgeService.ts:**
- getAllBadges() - Return badge definitions
- getUserBadges(userId) - Get earned badges
- checkAndUnlockBadges(userId, habitId?) - Check all conditions, unlock if met
- getBadgeProgress(userId) - Calculate progress toward each
- unlockBadge(userId, badgeId, habitId?) - Create UserBadge record

**StepService.ts:**
- logSteps(userId, date, steps, distance, source) - Create/update
- getSteps(userId, startDate, endDate) - Get range
- getTodaySteps(userId) - Get today
- getStats(userId) - Calculate totals, averages, streaks

**AnalyticsService.ts:**
- getOverview(userId) - Summary stats
- getHabitAnalytics(habitId, userId) - Per-habit details
- getTrends(userId, period) - Completion trends
- generateInsights(userId) - AI-like insights
- getStepCorrelation(userId) - Steps vs habits analysis

# PHASE 2 FEATURES TO IMPLEMENT

## 1. BADGE SYSTEM

### Badge Definitions (constants/badges.ts)

Define these badge categories:

**STREAK_BADGES:**
- 21-Day Warrior (Bronze) - 21 consecutive days
- 45-Day Champion (Silver) - 45 consecutive days
- 100-Day Legend (Gold) - 100 consecutive days
- 365-Day Master (Platinum) - 365 consecutive days

**COMPLETION_BADGES:**
- Perfect Week - All habits 7 consecutive days
- Perfect Month - All habits hit monthly goal
- Comeback Kid - Restart within 3 days
- Early Bird - 7 check-ins before 9 AM
- Night Owl - 7 check-ins after 9 PM

**VOLUME_BADGES:**
- 100/500/1000/5000 Completions Club

**STEP_BADGES:**
- 10K Walker - 10,000 steps in a day
- Marathon Month - Average 10K+ for 30 days
- Step Streak - 7/14/30 days hitting goal
- Distance Milestones - 100km, 500km, 1000km, 5000km

### BadgesScreen (app/(tabs)/badges.tsx)

Implement with:
- Header: "Badge Collection" with earned count
- Filter tabs: All, Earned, Locked, By Category
- FlatList with 2-column grid (numColumns={2})
- Badge cards showing: icon, name, tier, status
- If earned: date earned, rarity percentage
- If locked: progress bar, requirement text
- Pull-to-refresh functionality
- Tap badge: navigate to badge detail screen using Expo Router

### Badge Detail Screen (app/badge/[id].tsx)

Dynamic route showing:
- Large badge icon with glow effect
- Full description
- Unlock requirements
- Tips to earn
- Progress tracker (if not earned)
- Related habits
- Back button

### Badge Unlock Celebration (BadgeUnlockModal)

Full-screen modal with:
- Confetti animation (Lottie JSON or custom)
- Large badge icon with scale animation
- "Congratulations! Badge Unlocked!" text
- Badge details (name, description, tier)
- Rarity stat: "Earned by X% of users"
- Share button (expo-sharing)
- View Collection button
- Haptic feedback: expo-haptics success notification
- Animated entrance (scale + fade)

## 2. STEP COUNT INTEGRATION

### Pedometer Service (expo-sensors)

Implement `services/health/PedometerService.ts`:

**Methods:**
- isAvailable() - Check if pedometer available on device
- getStepCountAsync(start, end) - Get steps for period
- watchStepCount(callback) - Real-time step updates
- startTracking() - Begin daily tracking
- stopTracking() - Stop tracking
- getDailySteps(date) - Get steps for specific date from local DB

**Implementation Strategy:**
1. Track steps throughout day using Pedometer sensor
2. Save to Expo SQLite at end of each day (midnight)
3. Sync to backend API hourly or when app opens
4. Reset counter at midnight for new day
5. Handle app restarts (read from SQLite, continue from last known)

**Limitations Handling:**
- Pedometer returns steps since device reboot
- Need to calculate delta for daily totals
- Store checkpoints in SQLite every hour
- If device reboots, show gap in data

### Manual Step Entry Fallback

Implement `services/health/ManualStepService.ts`:

**Features:**
- Number input for steps (0-100,000 validation)
- Date picker (default: today)
- Distance auto-calculator (steps × average stride)
- Save to SQLite with source='manual'
- Sync to backend

### StepsScreen (app/(tabs)/steps.tsx or section in analytics)

Layout:
- Large circular SVG progress ring showing: current steps / goal
- Percentage filled with gradient color
- Stats row: Distance (km), Calories estimate, Active minutes
- Step goal setter: Slider with haptic feedback (1,000 - 50,000)
- Weekly bar chart (last 7 days with react-native-chart-kit)
- Monthly average display
- Best day badge
- Current streak indicator
- Manual entry button
- Source indicator: "Tracked by: Pedometer" or "Manual"
- Last synced timestamp

### Step Progress Ring Component

Custom SVG implementation:
- Use react-native-svg Circle with strokeDasharray
- Animated.Value for smooth progress changes
- Gradient stroke (expo-linear-gradient colors)
- Center text: steps number, goal, percentage
- Size: 200×200 responsive
- Tap to see details

## 3. SMART NOTIFICATIONS (expo-notifications)

### Notification Service (ExpoNotificationService.ts)

Implement complete notification system:

**Setup:**
- Configure Notifications.setNotificationHandler() for behavior
- Request permissions (check Device.isDevice first)
- iOS: Set up notification categories with actions
- Android: Create notification channels

**Methods to implement:**
- requestPermissions() - Ask user permission, handle iOS provisional
- scheduleDailyReminder(hour, minute) - Repeating daily notification
- cancelDailyReminder() - Cancel scheduled
- scheduleWeeklySummary() - Sunday 8 PM repeating
- sendBadgeUnlock(badgeName, badgeId) - Immediate notification
- sendStepGoalAchieved(steps) - Immediate notification
- scheduleStreakMilestone(daysLeft) - When close to milestone
- sendMissedHabitsAlert() - Morning after incomplete day
- cancelAll() - Cancel all scheduled

**Notification Types:**

**Daily Reminder (8 PM default):**
- Title: "Time to check in! 🎯"
- Body: "You have X habits to complete today"
- Actions: "Open App", "Snooze 1 hour"
- Badge count: number of incomplete habits
- Deep link: home screen

**Missed Habits (9 AM next day):**
- Title: "You missed some habits yesterday"
- Body: "Don't break your streak! You can still catch up"
- Deep link: home screen

**Weekly Summary (Sunday 8 PM):**
- Title: "Weekly Check-in 📊"
- Body: "You're behind on X habits. Need Y more completions"
- Deep link: analytics screen

**Badge Unlock (immediate):**
- Title: "🏆 Badge Unlocked: [Name]"
- Body: Badge description
- Deep link: badge detail screen

**Step Goal (when reached):**
- Title: "🚶 Goal Reached! 10,000 steps"
- Body: "Great job staying active today!"
- Deep link: steps screen

### Notification Handlers (NotificationHandlers.ts)

Set up in root layout `app/_layout.tsx`:

**Listeners:**
- addNotificationReceivedListener - Handle foreground notifications
- addNotificationResponseReceivedListener - Handle taps

**Deep Linking:**
- Parse notification data.type
- Use Expo Router to navigate: router.push(path)
- Handle: badge-unlock, daily-reminder, weekly-summary, step-goal

**Action Handling:**
- "Snooze" button: reschedule for 1 hour later
- "Open App" button: navigate to relevant screen

### Notification Settings (in SettingsScreen)

Add section with:
- Master enable/disable toggle
- Daily reminder toggle + time picker
- Weekly summary toggle
- Badge unlock notifications toggle
- Step goal notifications toggle
- Missed habits alert toggle
- Quiet hours: start/end time pickers
- Test notification button
- Permission status indicator with deep link to system settings

## 4. ANALYTICS DASHBOARD

### AnalyticsScreen (app/(tabs)/analytics.tsx)

Implement comprehensive analytics:

**Top Stats Cards (2×2 grid):**
- Total Active Habits (number)
- Total Completions This Month (number, % change)
- Active Streaks (count)
- Avg Completion Rate (%, last 30 days)

**Charts (use react-native-chart-kit):**

**LineChart - Daily Consistency:**
- Last 30 days completion percentage
- Bezier curve, gradient fill
- X-axis: dates, Y-axis: 0-100%
- Tap point: show tooltip
- Trend indicator: arrow + % change

**PieChart - Overall Completion (Donut style):**
- Center: large percentage
- Ring: completed vs missed
- Legend: counts
- Animated fill

**BarChart - Weekly Comparison:**
- Last 4 weeks
- X-axis: Week 1-4, Y-axis: completions
- Different colors per week
- Tap: show details
- Goal line overlay

**Heatmap Calendar (Custom SVG):**
- GitHub-style contribution graph
- 12 months, 7 rows (days of week)
- Color intensity: white (0%) to dark green (100%)
- Tap square: show date, habits, percentage
- Horizontal ScrollView

**Top Habits Leaderboard:**
- Ranked list (top 5)
- Rank badges (gold/silver/bronze)
- Habit icon, name
- Completion rate: "18/20 • 90%"
- Mini progress bar
- Current streak
- Tap: navigate to habit detail

**Insights Section:**
- Cards with AI-generated insights:
  - "Your best day is Monday (85% completion)"
  - "You've maintained a 21-day streak! 🔥"
  - "Completion rate increased 15% this month"
  - "Most consistent in the morning"
  - "On 10K+ step days, you complete 85% more habits"
- Icons for each insight type
- Rotate weekly

**Date Range Selector:**
- Dropdown: Last 7/30/90 days, This Year, All Time
- Updates all charts

### Habit Detail Analytics (app/habit/[id].tsx)

Enhance existing screen with:
- Large streak badge: "🔥 Current: 15 days"
- Stats grid: longest streak, total completions, rates
- Calendar view: this habit only (green dots)
- Line chart: last 3 months completion
- Best/worst months
- Badges earned with this habit
- Edit/Delete buttons

## 5. CELEBRATION ANIMATIONS

### Confetti Animation (Lottie Recommended)

**File: components/badges/ConfettiAnimation.tsx**

Implementation options:

**Option 1 (Recommended): Lottie**
- Use LottieView from lottie-react-native
- Load confetti.json from assets/lottie/
- autoPlay, loop={false}
- Full-screen absolute positioning
- onAnimationFinish callback to dismiss

**Option 2: Custom SVG**
- Multiple Animated circles with random colors
- Animate Y position (fall from top)
- Animate opacity (fade out)
- Random X positions and sizes

**Triggers:**
- Badge unlocked: Full screen, 3 seconds
- First habit today: Small burst, 1 second
- All habits completed: Full screen, 2 seconds
- Streak milestone: Full screen, 3 seconds

### Haptic Feedback (expo-haptics)

**File: hooks/useHaptics.ts**

Wrapper hook with methods:
- light() - ImpactFeedbackStyle.Light
- medium() - ImpactFeedbackStyle.Medium
- heavy() - ImpactFeedbackStyle.Heavy
- success() - NotificationFeedbackType.Success
- warning() - NotificationFeedbackType.Warning
- error() - NotificationFeedbackType.Error

**Usage triggers:**
- Checkbox tap: light
- Badge unlock: success notification
- All habits complete: success
- Streak milestone: medium
- Delete habit: warning
- Slider adjustment: light (on value change)

### Checkbox Animation

Smooth animated checkbox:
- Scale effect: 1 → 1.2 → 1 on tap
- Color transition: border → filled
- Checkmark path animation (draw-in effect)
- Use Animated API or react-native-animatable
- Haptic feedback on tap

### Streak Fire Animation (Lottie)

Next to streak numbers:
- Load fire.json from assets
- Continuous loop animation
- 30×30 size
- Scale pulse on streak increase

## 6. ENHANCED EXISTING SCREENS

### HomeScreen Enhancements (app/(tabs)/index.tsx)

Add:
- Today's Stats Card: circular progress "3/8 completed • 38%"
- Motivational message based on progress
- Streak summary: "🔥 2 active streaks"
- Filter: All, Active Streaks Only, Not Completed
- Sort: Time of day, Alphabetical, Custom order
- Celebration triggers:
  - First completion: Small confetti + light haptic
  - All complete: Full confetti + success haptic + modal
  - Reaching monthly goal: Badge celebration

### Calendar Enhancements (app/(tabs)/calendar.tsx)

Add:
- Heatmap view toggle (switch between calendar and heatmap)
- Each date: colored dots for completed habits (max 5, show "+X more")
- Tap date: bottom sheet with all habits for that day
- Long press: quick "complete all" for that day
- Streak highlighting (border/background for streak dates)
- Month navigation: arrows + dropdowns
- "Today" quick jump button

### Settings Enhancements (app/(tabs)/settings.tsx)

Add sections:
- **Step Tracking:**
  - Permission status
  - Daily step goal slider
  - Manual sync button
  - Last synced timestamp
- **Notifications:** (all toggles and settings listed above)
- **Data Management:**
  - Export: CSV, JSON buttons
  - Import: JSON restore
  - Clear cache
  - Delete account (triple confirmation)
- **About:**
  - App version
  - Privacy/Terms links
  - Contact support
  - Rate app

## 7. APP CONFIGURATION

### app.json Updates

Add permissions and configuration:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#6C63FF",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#6C63FF",
      "androidMode": "default",
      "androidCollapsedTitle": "Habit Tracker"
    },
    "ios": {
      "infoPlist": {
        "NSMotionUsageDescription": "We use your motion data to track daily steps and encourage activity."
      }
    },
    "android": {
      "permissions": [
        "ACTIVITY_RECOGNITION",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6C63FF"
      }
    }
  }
}
```

## 8. OFFLINE SYNC ENHANCEMENTS

Update existing SyncService:

**Badge Sync:**
- Pull badge definitions on first launch (cache in SQLite)
- Sync badge unlocks to server
- Queue unlocks if offline
- Show celebration even offline (sync when online)

**Step Sync:**
- Sync step data every hour (background task)
- Queue manual entries if offline
- Batch sync multiple days
- Show last synced timestamp

**Conflict Resolution:**
- Server wins for badge unlocks (avoid duplicates)
- Pedometer data wins for steps (source of truth)
- Completions: last write wins (timestamp based)

## 9. PERFORMANCE & OPTIMIZATION

**Chart Rendering:**
- Lazy load charts (only render when screen visible)
- Cache chart data with React Query
- Debounce data updates (300ms)
- Use memo for expensive calculations

**Animation Performance:**
- Use native driver: useNativeDriver: true
- Avoid layout animations (use transform/opacity only)
- Limit confetti particles on lower-end devices
- Cleanup timers and listeners on unmount

**Data Fetching:**
- Prefetch analytics data in background
- Cache badge definitions indefinitely
- Incremental loading for long lists (FlatList optimization)
- Pull-to-refresh on all screens

**Memory Management:**
- Unsubscribe from Pedometer when not needed
- Clear chart data on screen unmount
- Clean up notification listeners
- Remove animation references

# CODE GENERATION INSTRUCTIONS

Generate complete, production-ready code with:

## 1. Backend Updates
- Prisma schema additions (Badge, UserBadge, StepData models)
- Migration file
- API routes (badges, steps, analytics)
- Service classes with full implementation
- Controllers with error handling
- Validation schemas

## 2. Expo Mobile App
- All new screens (analytics, badges, steps if separate)
- All new components (charts, badges, celebrations)
- Enhanced existing screens (home, calendar, settings)
- Pedometer service with expo-sensors
- Notification service with expo-notifications
- Badge unlock logic
- Lottie animations setup
- Haptic feedback integration
- All hooks implementation
- Zustand stores

## 3. Shared Packages Updates
- New types (Badge, StepData, AnalyticsData, etc.)
- Badge utility functions
- Analytics calculation helpers

## 4. Configuration Files
- app.json with permissions and plugins
- package.json with all new Expo dependencies
- Installation instructions for Expo modules
- Asset files (Lottie JSON files)

## 5. Documentation
- Setup guide for Expo modules
- Notification testing guide
- Pedometer calibration notes
- Badge unlock conditions reference
- API integration guide

# CODE QUALITY STANDARDS

- TypeScript strict mode throughout
- Comprehensive error handling (try-catch blocks)
- Loading states for all async operations
- Optimistic UI updates where appropriate
- Haptic feedback on all meaningful interactions
- Accessibility labels (accessibilityLabel, accessibilityHint)
- Performance optimizations (useMemo, useCallback, React.memo)
- Proper cleanup (useEffect return functions)
- Offline-first architecture maintained
- Consistent styling with Phase 1
- Expo best practices (no bare React Native modules)

# DELIVERABLES

Provide complete code for:
1. Backend schema migrations and API endpoints (all files)
2. All new Expo mobile screens with Expo Router
3. All new components with proper TypeScript types
4. Pedometer service implementation
5. Notification service with expo-notifications
6. Badge system with unlock logic
7. Analytics calculations and chart components
8. Celebration animations (Lottie + custom)
9. Haptic feedback integration
10. Updated app.json configuration
11. package.json with dependencies
12. Setup/testing instructions
13. Lottie animation JSON files (or instructions to download free ones)

# EXECUTION COMMAND

Begin code generation now. Generate in this order:

1. Backend schema updates and migrations
2. Backend API routes and services (badges, steps, analytics)
3. Expo app constants (badge definitions, notification templates)
4. Pedometer service with expo-sensors
5. Notification service with expo-notifications
6. Badge service and components
7. Analytics screen and chart components
8. Steps screen and components
9. Celebration animations (Lottie + haptics)
10. Enhanced home and calendar screens
11. Settings screen updates
12. app.json configuration
13. Documentation

Generate complete, working, production-ready code with proper error handling, animations, offline support, and Expo best practices. No placeholders or TODO comments in critical functionality. All code must use ONLY Expo SDK modules.
