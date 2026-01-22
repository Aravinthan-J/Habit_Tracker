# Phase 2 - Ultimate Habit Tracker - Work Checklist

Based on your `phase2.md` requirements

---

## 🎯 Phase 2 Goals

Transform the basic habit tracker into an **engaging, gamified experience** with:

1. 🏆 Badge System (30 different badges)
2. 📊 Analytics Dashboard (5 types of charts)
3. 🚶 Step Tracking (daily pedometer)
4. 🔔 Smart Notifications (6 types)
5. 🎉 Celebrations (confetti + animations)
6. 📈 Enhanced Insights (AI-like insights)

---

## ✅ Phase 1 Status (COMPLETED)

### What's Already Working
- [x] Backend API with PostgreSQL
- [x] Expo mobile app (SDK 50+)
- [x] User authentication (login/register)
- [x] Basic habit CRUD (create, read, update, delete)
- [x] Daily completions with checkboxes
- [x] Calendar view with colored dots
- [x] Settings screen
- [x] Real-time API sync
- [x] Sample habits on registration
- [x] Bottom tab navigation (Today, Calendar, Habits, Settings)

---

## 🔧 Prerequisites - Expo Packages Installation

### Install Required Packages (DO THIS FIRST!)

```bash
cd apps/mobile

# Core Phase 2 packages
npx expo install expo-notifications
npx expo install expo-haptics
npx expo install expo-sensors
npx expo install expo-linear-gradient
npx expo install expo-sharing
npx expo install lottie-react-native

# Chart library
npm install react-native-chart-kit react-native-svg

# Confetti
npm install react-native-confetti-cannon
```

**IMPORTANT: Only use Expo-compatible packages!**

✅ Use: `expo-notifications`, `expo-haptics`, `expo-sensors`
❌ Don't use: `react-native-push-notification`, `@notifee/react-native`

---

## 📋 Feature Checklist

### 1. 🏆 Badge System (30 Badges)

#### Backend Work
- [ ] Create database models:
  - [ ] Create `Badge` model in Prisma schema
    ```prisma
    model Badge {
      id          String   @id @default(uuid())
      userId      String
      badgeType   String
      name        String
      description String
      icon        String
      unlockedAt  DateTime @default(now())
      milestone   Int
      user        User     @relation(fields: [userId], references: [id])
    }
    ```
  - [ ] Add badges relation to User model

- [ ] Create badge checking service:
  - [ ] `BadgeService.ts` with check logic
  - [ ] Check badges on every completion
  - [ ] Badge unlocking algorithm

- [ ] Badge API endpoints:
  - [ ] `GET /api/badges` - Get all user badges
  - [ ] `GET /api/badges/available` - Get badges to unlock
  - [ ] `POST /api/badges/check` - Check for new badges

#### Badge Types to Implement (30 total)

**Streak Badges:**
- [ ] 🔥 First Flame (1-day streak)
- [ ] 🔥 On Fire (3-day streak)
- [ ] 🔥 Hot Streak (7-day streak)
- [ ] 🔥 Unstoppable (14-day streak)
- [ ] 🔥 Legendary (21-day streak)
- [ ] 🔥 Phoenix (30-day streak)
- [ ] 🔥 Eternal Flame (60-day streak)
- [ ] 🔥 Century (100-day streak)

**Completion Badges:**
- [ ] ⭐ First Step (1st habit completed)
- [ ] ⭐ Getting Started (10 completions)
- [ ] ⭐ Committed (50 completions)
- [ ] ⭐ Dedicated (100 completions)
- [ ] ⭐ Champion (250 completions)
- [ ] ⭐ Master (500 completions)
- [ ] ⭐ Legend (1000 completions)

**Perfect Day Badges:**
- [ ] ✅ Perfect Day (all habits complete in one day)
- [ ] ✅ Perfect Week (7 perfect days)
- [ ] ✅ Perfect Month (30 perfect days)

**Habit Collection Badges:**
- [ ] 📝 Starter Pack (3 habits created)
- [ ] 📝 Collector (5 habits created)
- [ ] 📝 Enthusiast (10 habits created)
- [ ] 📝 Library (20 habits created)

**Special Badges:**
- [ ] 🌅 Early Bird (complete before 8 AM)
- [ ] 🦉 Night Owl (complete after 10 PM)
- [ ] 🎯 Focused (complete same habit 7 days straight)
- [ ] 🌈 Colorful (use all habit colors)
- [ ] 🎨 Creative (use all habit icons)
- [ ] 💪 Persistent (never miss more than 2 days in a month)
- [ ] 🏆 Overachiever (exceed monthly goal 3 months in row)
- [ ] 🎊 Party (unlock 10 badges)

#### Mobile Work
- [ ] Create BadgesScreen:
  - [ ] Add new tab in navigation (5th tab - Badges)
  - [ ] Grid layout for badges
  - [ ] Locked state (grayscale + lock icon)
  - [ ] Unlocked state (colorful + unlocked date)
  - [ ] Badge details modal
  - [ ] Progress indicators

- [ ] Badge unlock animation:
  - [ ] Use `lottie-react-native` for animations
  - [ ] Confetti when badge unlocks
  - [ ] Modal showing new badge
  - [ ] Haptic feedback
  - [ ] Share badge option

- [ ] Badge notifications:
  - [ ] Push notification when badge unlocks
  - [ ] In-app banner notification

- [ ] Display badges:
  - [ ] Latest badge on Home screen
  - [ ] Badge count in Settings
  - [ ] Badge showcase in profile

---

### 2. 📊 Analytics Dashboard (5 Chart Types)

#### Backend Work
- [ ] Analytics API endpoints:
  - [ ] `GET /api/analytics/overview` - Total stats
  - [ ] `GET /api/analytics/trends` - Weekly/monthly trends
  - [ ] `GET /api/analytics/heatmap/:year` - Yearly heatmap
  - [ ] `GET /api/analytics/habits/:id/performance` - Individual habit stats

- [ ] Calculate analytics:
  - [ ] Total completions
  - [ ] Completion rate (percentage)
  - [ ] Best streak
  - [ ] Most productive day of week
  - [ ] Average completions per day
  - [ ] Monthly comparison

#### Mobile Work
- [ ] Install chart library: `react-native-chart-kit`

- [ ] Create AnalyticsScreen:
  - [ ] Add new screen (can be in Settings or new tab)
  - [ ] Tab selector: Overview | Trends | Habits

- [ ] Implement 5 chart types:

  1. **Line Chart - Weekly Trends**
     - [ ] Show completions over last 7/14/30 days
     - [ ] Smooth curves
     - [ ] Interactive tooltips

  2. **Bar Chart - Monthly Comparison**
     - [ ] Compare last 6 months
     - [ ] Completion count per month
     - [ ] Color-coded bars

  3. **Pie Chart - Habit Distribution**
     - [ ] Show which habits you complete most
     - [ ] Percentage for each habit
     - [ ] Habit colors

  4. **Heatmap - Yearly View (GitHub-style)**
     - [ ] 365-day grid
     - [ ] Color intensity based on completions
     - [ ] Tap to see details

  5. **Progress Rings - Current Status**
     - [ ] Today's completion ring
     - [ ] Weekly average ring
     - [ ] Monthly goal ring

- [ ] Stats cards:
  - [ ] Total habits: X
  - [ ] Total completions: X
  - [ ] Current streak: X days 🔥
  - [ ] Longest streak: X days
  - [ ] Completion rate: X%
  - [ ] Most productive day: Monday
  - [ ] Average per day: X.X

- [ ] Date range selector:
  - [ ] Last 7 days
  - [ ] Last 30 days
  - [ ] Last 3 months
  - [ ] This year
  - [ ] All time

---

### 3. 🚶 Step Tracking

#### Backend Work
- [ ] Update Completion model:
  - [ ] Add `stepCount: Int?` field
  - [ ] Run migration

- [ ] Update completion endpoints:
  - [ ] Accept stepCount in POST /api/completions
  - [ ] Return step data in responses

- [ ] Add step goal to User preferences:
  - [ ] `stepGoal: Int` (default 10,000)

#### Mobile Work
- [ ] Install Expo Sensors: `expo-sensors`

- [ ] Create StepTrackerService:
  - [ ] Use `Pedometer` from expo-sensors
  - [ ] Request motion permissions
  - [ ] Track steps in background
  - [ ] Save to local storage
  - [ ] Sync with server

- [ ] UI Components:
  - [ ] Step counter card on Home screen
  - [ ] Circular progress indicator (0-10000 steps)
  - [ ] Step goal setting in Settings
  - [ ] Step history in Analytics

- [ ] Step features:
  - [ ] Real-time step updates
  - [ ] Daily step goal achievement notification
  - [ ] Step streak tracking
  - [ ] Weekly step average

---

### 4. 🔔 Smart Notifications (6 Types)

#### Backend Work
- [ ] Install expo-server-sdk for backend

- [ ] Create PushToken model:
  ```prisma
  model PushToken {
    id         String   @id @default(uuid())
    userId     String
    token      String   @unique
    deviceType String
    createdAt  DateTime @default(now())
    user       User     @relation(fields: [userId], references: [id])
  }
  ```

- [ ] Notification endpoints:
  - [ ] `POST /api/notifications/register` - Save push token
  - [ ] `POST /api/notifications/send` - Send notification
  - [ ] `GET /api/notifications/settings` - Get preferences
  - [ ] `PATCH /api/notifications/settings` - Update preferences

- [ ] Notification scheduler (background job):
  - [ ] Daily reminder notifications
  - [ ] Streak preservation alerts
  - [ ] Badge unlock notifications

#### Mobile Work
- [ ] Setup expo-notifications

- [ ] Request permissions:
  - [ ] Ask for notification permission on first launch
  - [ ] Handle permission denied gracefully

- [ ] Implement 6 notification types:

  1. **Daily Reminder** ⏰
     - [ ] Remind at user's reminder time
     - [ ] "Time to check off your habits!"

  2. **Streak Preservation** 🔥
     - [ ] Alert if about to break streak
     - [ ] "Don't break your 5-day streak!"

  3. **Badge Unlocked** 🏆
     - [ ] Instant notification when badge earned
     - [ ] "You unlocked: Hot Streak badge!"

  4. **Perfect Day Achieved** 🎉
     - [ ] When all habits completed
     - [ ] "Perfect day! All habits complete!"

  5. **Milestone Reached** 🎯
     - [ ] 100th completion, 30-day streak, etc.
     - [ ] "Milestone: 100 completions!"

  6. **Motivation Boost** 💪
     - [ ] Random motivational messages
     - [ ] "You've got this! Keep going!"

- [ ] Notification settings screen:
  - [ ] Toggle for each notification type
  - [ ] Reminder time picker
  - [ ] Quiet hours (don't disturb)
  - [ ] Test notification button

- [ ] Deep linking:
  - [ ] Tap notification → Open specific habit
  - [ ] Tap badge notification → Open badges screen

---

### 5. 🎉 Celebrations & Animations

#### Mobile Work
- [ ] Install packages:
  - [ ] `react-native-confetti-cannon`
  - [ ] `lottie-react-native`
  - [ ] `expo-haptics`

- [ ] Create CelebrationService:
  - [ ] Trigger confetti
  - [ ] Play haptic feedback
  - [ ] Show celebration modal

- [ ] Implement celebrations:

  1. **Small Confetti** 🎊
     - [ ] First habit completed today
     - [ ] Short burst
     - [ ] Light haptic feedback

  2. **Big Confetti** 🎉
     - [ ] All habits completed
     - [ ] Longer celebration
     - [ ] Strong haptic feedback
     - [ ] Success sound (optional)

  3. **Fireworks** 🎆
     - [ ] New streak milestone (7, 21, 30 days)
     - [ ] Multiple confetti bursts
     - [ ] Celebration modal

  4. **Badge Animation** ✨
     - [ ] Lottie animation
     - [ ] Badge reveal animation
     - [ ] Particle effects

- [ ] Animations:
  - [ ] Checkbox bounce (on tap)
  - [ ] Habit card slide in
  - [ ] Progress bar fill animation
  - [ ] Streak fire animation (🔥 bounces)
  - [ ] Number count-up animations

- [ ] Settings:
  - [ ] Toggle celebrations on/off
  - [ ] Toggle haptic feedback
  - [ ] Toggle sounds

---

### 6. 📈 Enhanced Insights (AI-like)

#### Backend Work
- [ ] Create insights generator service:
  - [ ] Analyze user data
  - [ ] Generate personalized insights
  - [ ] Store insights in cache

- [ ] Insight types to generate:
  - [ ] Best performing habit
  - [ ] Most consistent day of week
  - [ ] Suggested optimal reminder time
  - [ ] Streak predictions
  - [ ] Habits that pair well together

- [ ] Insights endpoint:
  - [ ] `GET /api/insights` - Get personalized insights

#### Mobile Work
- [ ] Create InsightsCard component:
  - [ ] Icon + title + description
  - [ ] Swipeable carousel

- [ ] Display insights on Home screen:
  - [ ] At top or bottom of screen
  - [ ] Refresh daily
  - [ ] Dismissible

- [ ] Insight examples:
  - [ ] "💪 Morning Workout is your most consistent habit!"
  - [ ] "📚 You're 80% more likely to complete habits on Mondays"
  - [ ] "🔥 You're on track for a 30-day streak by Feb 15th!"
  - [ ] "⏰ Your best completion time is between 8-10 AM"
  - [ ] "🎯 You complete 3.2 habits per day on average"

---

## 🎨 Design & UI Enhancements

### Color Themes
- [ ] Keep existing light theme
- [ ] Optional: Add dark mode support

### Animations Library
- [ ] Use `react-native-reanimated` for smooth animations
- [ ] Entrance animations for screens
- [ ] Exit animations
- [ ] Gesture-based animations

### Haptic Feedback
- [ ] Light impact: checkbox tap
- [ ] Medium impact: habit complete
- [ ] Heavy impact: all habits complete
- [ ] Success: badge unlock
- [ ] Warning: streak at risk

---

## 📱 New Screens to Create

1. **BadgesScreen** (new tab)
   - [ ] Badge grid (locked/unlocked)
   - [ ] Badge details modal
   - [ ] Badge categories tabs
   - [ ] Share badge feature

2. **AnalyticsScreen** (new screen)
   - [ ] Overview tab (stats cards)
   - [ ] Charts tab (5 chart types)
   - [ ] Insights tab (AI-like insights)
   - [ ] Date range selector

3. **NotificationsSettingsScreen**
   - [ ] Notification type toggles
   - [ ] Reminder time picker
   - [ ] Test notification button
   - [ ] Quiet hours settings

4. **InsightsScreen** (optional dedicated screen)
   - [ ] All insights in one place
   - [ ] Historical insights
   - [ ] Insight explanations

---

## 🧪 Testing Checklist

- [ ] Badge unlocking works correctly
- [ ] All 30 badges can be unlocked
- [ ] Charts display data accurately
- [ ] Step counter updates in real-time
- [ ] Notifications arrive on time
- [ ] Confetti triggers correctly
- [ ] Haptic feedback feels right
- [ ] Insights are personalized and accurate
- [ ] Deep linking from notifications works
- [ ] Offline mode still works
- [ ] Performance: no lag with animations
- [ ] Battery: step tracking doesn't drain battery

---

## 📦 Package Installation Summary

```bash
# Phase 2 Required Packages
npx expo install expo-notifications expo-haptics expo-sensors
npx expo install expo-linear-gradient expo-sharing
npx expo install lottie-react-native
npm install react-native-chart-kit react-native-svg
npm install react-native-confetti-cannon
```

---

## 🎯 Implementation Priority

### Week 1: Foundation
1. Install all packages
2. Create database models (Badge, PushToken)
3. Run migrations

### Week 2: Badge System
1. Backend badge logic
2. Badge API endpoints
3. BadgesScreen UI
4. Badge unlock animations

### Week 3: Analytics
1. Analytics API endpoints
2. AnalyticsScreen UI
3. Implement all 5 charts
4. Stats cards

### Week 4: Notifications & Steps
1. Setup notifications
2. Implement 6 notification types
3. Step tracking integration
4. Notification settings

### Week 5: Polish
1. Celebrations & confetti
2. Haptic feedback
3. Insights feature
4. Animations everywhere
5. Testing & bug fixes

---

## 🚀 Ready to Start?

Pick a feature and let's build it!

**Recommended Start**: Badge System (most impactful, medium complexity)

Which feature do you want to build first? 🎯
