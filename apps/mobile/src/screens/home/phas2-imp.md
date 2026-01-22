You are a senior Expo React Native developer building Phase 2 of the "Ultimate Monthly Habit Tracker" mobile application. Generate complete, production-ready code for advanced features using **Expo SDK 50+** (NOT bare React Native).

# WHAT YOU'RE BUILDING IN PHASE 2


# PHASE 2 STRUCTURE OVERVIEW

## File Organization
```
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                   [ENHANCE] Add celebrations
│   │   ├── calendar.tsx                [ENHANCE] Add heatmap
│   │   ├── analytics.tsx               [NEW] Analytics dashboard
│   │   ├── badges.tsx                  [NEW] Badge showcase
│   │   └── settings.tsx                [ENHANCE] Add notification settings
│   ├── badge/[id].tsx                  [NEW] Badge detail screen
│   └── _layout.tsx                     [ENHANCE] Add notification listeners
│
├── components/
│   ├── analytics/                      [NEW FOLDER]
│   │   ├── LineChart.tsx
│   │   ├── DonutChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── HeatmapCalendar.tsx
│   │   ├── StatsCard.tsx
│   │   └── InsightCard.tsx
│   ├── badges/                         [NEW FOLDER]
│   │   ├── BadgeCard.tsx
│   │   ├── BadgeUnlockModal.tsx
│   │   ├── ConfettiAnimation.tsx
│   │   └── BadgeProgressBar.tsx
│   ├── steps/                          [NEW FOLDER]
│   │   ├── StepProgressRing.tsx
│   │   ├── StepChart.tsx
│   │   └── StepStats.tsx
│   └── celebrations/                   [NEW FOLDER]
│       └── CompletionAnimation.tsx
│
├── services/
│   ├── health/                         [NEW FOLDER]
│   │   ├── PedometerService.ts
│   │   └── ManualStepService.ts
│   ├── notifications/                  [NEW FOLDER]
│   │   ├── ExpoNotificationService.ts
│   │   └── NotificationScheduler.ts
│   ├── badges/                         [NEW FOLDER]
│   │   ├── BadgeService.ts
│   │   └── BadgeChecker.ts
│   └── analytics/                      [NEW FOLDER]
│       └── AnalyticsService.ts
│
├── hooks/
│   ├── useBadges.ts                    [NEW]
│   ├── useSteps.ts                     [NEW]
│   ├── useAnalytics.ts                 [NEW]
│   ├── useNotifications.ts             [NEW]
│   ├── useHaptics.ts                   [NEW]
│   └── useCelebration.ts               [NEW]
│
├── store/
│   ├── badgeStore.ts                   [NEW]
│   ├── stepStore.ts                    [NEW]
│   └── notificationStore.ts            [NEW]
│
├── constants/
│   ├── badges.ts                       [NEW]
│   ├── notifications.ts                [NEW]
│   └── milestones.ts                   [NEW]
│
└── assets/
    └── lottie/                         [NEW FOLDER]
        ├── confetti.json
        ├── fire.json
        └── checkmark.json
```

---

# PART 1: BACKEND ADDITIONS

## Step 1: Database Schema Updates

Add these 3 new models to `apps/backend/prisma/schema.prisma`:

### Model 1: Badge (Badge Definitions)
```prisma
model Badge {
  id          String   @id @default(uuid())
  name        String   @unique            // "21-Day Warrior"
  description String                      // "Complete habit 21 days in a row"
  type        String                      // 'streak' | 'completion' | 'step' | 'special'
  tier        String                      // 'bronze' | 'silver' | 'gold' | 'platinum'
  requirement Int                         // 21, 45, 100, etc.
  iconName    String                      // 'fire', 'trophy', 'star'
  
  userBadges  UserBadge[]
}
```

**Purpose:** Defines all possible badges users can earn (30 total)

### Model 2: UserBadge (User's Earned Badges)
```prisma
model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id])
  habitId   String?                       // Optional: which habit earned this badge
  earnedAt  DateTime @default(now())
  
  @@unique([userId, badgeId])            // Can't earn same badge twice
  @@index([userId])
}
```

**Purpose:** Tracks which badges each user has unlocked

### Model 3: StepData (Daily Step Counts)
```prisma
model StepData {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date          DateTime @db.Date          // Just the date (2026-01-18)
  steps         Int                        // Number of steps
  distance      Float                      // Kilometers walked
  calories      Int?                       // Estimated calories burned
  activeMinutes Int?                       // Minutes of activity
  source        String   @default("manual") // 'pedometer' | 'manual'
  
  @@unique([userId, date])                // One record per user per day
  @@index([userId, date])
}
```

**Purpose:** Stores daily step counts from phone's pedometer or manual entry

### Update User Model
Add these relationships to existing User model:
```prisma
model User {
  // ... existing fields
  badges        UserBadge[]
  stepData      StepData[]
}
```

### Create Migration
After updating schema, generate migration:
```bash
cd apps/backend
npx prisma migrate dev --name add_badges_and_steps
```

---

## Step 2: Badge Endpoints

Create `apps/backend/src/routes/badges.routes.ts`:

### GET /api/badges
**Purpose:** Get all 30 badge definitions  
**Auth:** Required  
**Response:**
```json
{
  "badges": [
    {
      "id": "uuid",
      "name": "21-Day Warrior",
      "description": "Complete any habit for 21 consecutive days",
      "type": "streak",
      "tier": "bronze",
      "requirement": 21,
      "iconName": "fire"
    },
    // ... 29 more badges
  ]
}
```

### GET /api/badges/user
**Purpose:** Get user's earned badges  
**Auth:** Required  
**Response:**
```json
{
  "badges": [
    {
      "id": "uuid",
      "badge": { /* badge details */ },
      "earnedAt": "2026-01-18T10:30:00Z",
      "habitId": "habit-uuid"
    }
  ]
}
```

### POST /api/badges/check
**Purpose:** Check if user unlocked any new badges (called after completing a habit)  
**Auth:** Required  
**Body:** `{ "habitId": "uuid" }` (optional)  
**Response:**
```json
{
  "newBadges": [
    {
      "badge": { /* badge details */ },
      "message": "You've completed Meditation for 21 days straight!"
    }
  ]
}
```

### GET /api/badges/progress
**Purpose:** Get progress toward all unearned badges  
**Auth:** Required  
**Response:**
```json
{
  "progress": [
    {
      "badge": { /* badge details */ },
      "current": 15,
      "required": 21,
      "percentage": 71,
      "daysRemaining": 6
    }
  ]
}
```

---

## Step 3: Step Data Endpoints

Create `apps/backend/src/routes/steps.routes.ts`:

### POST /api/steps
**Purpose:** Log step data for a day  
**Auth:** Required  
**Body:**
```json
{
  "date": "2026-01-18",
  "steps": 12543,
  "distance": 9.8,
  "calories": 450,
  "source": "pedometer"
}
```
**Response:** `{ "stepData": { /* saved data */ } }`

### GET /api/steps
**Purpose:** Get step data for date range  
**Auth:** Required  
**Query:** `?startDate=2026-01-01&endDate=2026-01-31`  
**Response:**
```json
{
  "stepData": [
    { "date": "2026-01-01", "steps": 8234, "distance": 6.4 },
    { "date": "2026-01-02", "steps": 12543, "distance": 9.8 }
  ]
}
```

### GET /api/steps/today
**Purpose:** Get today's steps  
**Auth:** Required  
**Response:**
```json
{
  "stepData": {
    "date": "2026-01-18",
    "steps": 7234,
    "distance": 5.6,
    "calories": 320,
    "goalReached": false
  }
}
```

### GET /api/steps/stats
**Purpose:** Get lifetime step statistics  
**Auth:** Required  
**Response:**
```json
{
  "totalSteps": 234567,
  "totalDistance": 189.4,
  "averageStepsPerDay": 8234,
  "bestDay": { "date": "2026-01-15", "steps": 18432 },
  "currentStreak": 5,
  "longestStreak": 12
}
```

---

## Step 4: Analytics Endpoints

Create `apps/backend/src/routes/analytics.routes.ts`:

### GET /api/analytics/overview
**Purpose:** Overall statistics  
**Auth:** Required  
**Response:**
```json
{
  "totalHabits": 8,
  "activeHabits": 8,
  "totalCompletions": 234,
  "averageCompletionRate": 73,
  "currentStreaks": 3,
  "totalBadges": 5
}
```

### GET /api/analytics/trends
**Purpose:** Completion trends over time  
**Auth:** Required  
**Query:** `?period=30` (days)  
**Response:**
```json
{
  "trends": [
    { "date": "2026-01-01", "completionRate": 65 },
    { "date": "2026-01-02", "completionRate": 78 },
    // ... 28 more days
  ]
}
```

### GET /api/analytics/insights
**Purpose:** Generated insights about habits  
**Auth:** Required  
**Response:**
```json
{
  "insights": [
    {
      "type": "best_day",
      "message": "Your best day is Monday with 85% completion",
      "icon": "trophy"
    },
    {
      "type": "streak",
      "message": "You've maintained a 21-day streak on Meditation! 🔥",
      "icon": "fire"
    },
    {
      "type": "improvement",
      "message": "Your completion rate increased 15% this month",
      "icon": "trending-up"
    }
  ]
}
```

---

## Step 5: Backend Services Implementation

### BadgeService.ts
Location: `apps/backend/src/services/BadgeService.ts`

**Methods to implement:**
```typescript
class BadgeService {
  // Get all 30 badge definitions
  async getAllBadges(): Promise<Badge[]>
  
  // Get badges user has earned
  async getUserBadges(userId: string): Promise<UserBadge[]>
  
  // Check if user unlocked new badges (main logic)
  async checkAndUnlockBadges(userId: string, habitId?: string): Promise<Badge[]>
  
  // Calculate progress toward unearned badges
  async getBadgeProgress(userId: string): Promise<BadgeProgress[]>
  
  // Award a badge to user
  private async unlockBadge(userId: string, badgeId: string, habitId?: string): Promise<UserBadge>
}
```

**Badge Checking Logic (detailed):**

When to check: After every habit completion
```typescript
async checkAndUnlockBadges(userId: string, habitId?: string): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  
  // 1. CHECK STREAK BADGES (21, 45, 100, 365 days)
  const streakBadges = await this.checkStreakBadges(userId, habitId);
  newBadges.push(...streakBadges);
  
  // 2. CHECK COMPLETION BADGES (Perfect Week, Perfect Month, etc.)
  const completionBadges = await this.checkCompletionBadges(userId);
  newBadges.push(...completionBadges);
  
  // 3. CHECK VOLUME BADGES (100, 500, 1000, 5000 total completions)
  const volumeBadges = await this.checkVolumeBadges(userId);
  newBadges.push(...volumeBadges);
  
  // 4. CHECK STEP BADGES (10K Walker, Marathon Month, etc.)
  const stepBadges = await this.checkStepBadges(userId);
  newBadges.push(...stepBadges);
  
  // 5. CHECK SPECIAL BADGES (Comeback Kid, Early Bird, Night Owl)
  const specialBadges = await this.checkSpecialBadges(userId);
  newBadges.push(...specialBadges);
  
  return newBadges;
}

// Example: Check streak badges
private async checkStreakBadges(userId: string, habitId?: string): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  
  // Get all user's habits
  const habits = habitId 
    ? [await prisma.habit.findUnique({ where: { id: habitId } })]
    : await prisma.habit.findMany({ where: { userId } });
  
  for (const habit of habits) {
    // Get all completions for this habit
    const completions = await prisma.completion.findMany({
      where: { habitId: habit.id },
      orderBy: { date: 'asc' }
    });
    
    // Calculate current streak
    const streak = calculateStreak(completions.map(c => c.date));
    
    // Check against badge requirements
    if (streak.currentStreak >= 21) {
      const badge = await this.awardBadgeIfNew(userId, '21-Day Warrior', habit.id);
      if (badge) newBadges.push(badge);
    }
    if (streak.currentStreak >= 45) {
      const badge = await this.awardBadgeIfNew(userId, '45-Day Champion', habit.id);
      if (badge) newBadges.push(badge);
    }
    if (streak.currentStreak >= 100) {
      const badge = await this.awardBadgeIfNew(userId, '100-Day Legend', habit.id);
      if (badge) newBadges.push(badge);
    }
    if (streak.currentStreak >= 365) {
      const badge = await this.awardBadgeIfNew(userId, '365-Day Master', habit.id);
      if (badge) newBadges.push(badge);
    }
  }
  
  return newBadges;
}

// Example: Check Perfect Week badge
private async checkCompletionBadges(userId: string): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  
  // Get last 7 days
  const last7Days = getLast7Days();
  
  // Get all active habits
  const habits = await prisma.habit.findMany({
    where: { userId, archivedAt: null }
  });
  
  // Check if ALL habits were completed for ALL 7 days
  let perfectWeek = true;
  for (const day of last7Days) {
    for (const habit of habits) {
      const completion = await prisma.completion.findUnique({
        where: {
          habitId_date: {
            habitId: habit.id,
            date: day
          }
        }
      });
      if (!completion) {
        perfectWeek = false;
        break;
      }
    }
    if (!perfectWeek) break;
  }
  
  if (perfectWeek) {
    const badge = await this.awardBadgeIfNew(userId, 'Perfect Week');
    if (badge) newBadges.push(badge);
  }
  
  return newBadges;
}
```

### StepService.ts
Location: `apps/backend/src/services/StepService.ts`
```typescript
class StepService {
  // Save/update step data for a date
  async logSteps(
    userId: string, 
    date: string, 
    steps: number, 
    distance: number, 
    source: string
  ): Promise<StepData>
  
  // Get step data for date range
  async getSteps(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<StepData[]>
  
  // Get today's steps
  async getTodaySteps(userId: string): Promise<StepData | null>
  
  // Calculate statistics
  async getStats(userId: string): Promise<StepStats> {
    // Calculate:
    // - Total steps all time
    // - Total distance
    // - Average steps per day
    // - Best day (max steps)
    // - Current streak (consecutive days hitting goal)
    // - Longest streak
  }
}
```

### AnalyticsService.ts
Location: `apps/backend/src/services/AnalyticsService.ts`
```typescript
class AnalyticsService {
  // Generate AI-like insights
  async generateInsights(userId: string): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Insight 1: Best day of week
    const bestDay = await this.calculateBestDayOfWeek(userId);
    insights.push({
      type: 'best_day',
      message: `Your best day is ${bestDay.name} with ${bestDay.rate}% completion`,
      icon: 'trophy'
    });
    
    // Insight 2: Longest streak
    const longestStreak = await this.getLongestStreak(userId);
    if (longestStreak.days > 7) {
      insights.push({
        type: 'streak',
        message: `You've maintained a ${longestStreak.days}-day streak on ${longestStreak.habitName}! 🔥`,
        icon: 'fire'
      });
    }
    
    // Insight 3: Month-over-month improvement
    const improvement = await this.calculateMonthlyImprovement(userId);
    if (improvement > 0) {
      insights.push({
        type: 'improvement',
        message: `Your completion rate increased ${improvement}% this month`,
        icon: 'trending-up'
      });
    }
    
    // Insight 4: Step-habit correlation
    const correlation = await this.calculateStepCorrelation(userId);
    if (correlation.isSignificant) {
      insights.push({
        type: 'correlation',
        message: `On days with 10K+ steps, you complete ${correlation.percentage}% more habits`,
        icon: 'activity'
      });
    }
    
    return insights;
  }
  
  private async calculateStepCorrelation(userId: string) {
    // Get all completions and step data
    // Group by days with 10K+ steps vs days with <10K
    // Calculate average habit completion for each group
    // Return difference as percentage
  }
}
```

---

## Step 6: Seed Badge Data

Create `apps/backend/prisma/seed.ts` to populate all 30 badges:
```typescript
const badges = [
  // STREAK BADGES (4 badges)
  {
    name: '21-Day Warrior',
    description: 'Complete any habit for 21 consecutive days',
    type: 'streak',
    tier: 'bronze',
    requirement: 21,
    iconName: 'fire-bronze'
  },
  {
    name: '45-Day Champion',
    description: 'Complete any habit for 45 consecutive days',
    type: 'streak',
    tier: 'silver',
    requirement: 45,
    iconName: 'fire-silver'
  },
  {
    name: '100-Day Legend',
    description: 'Complete any habit for 100 consecutive days',
    type: 'streak',
    tier: 'gold',
    requirement: 100,
    iconName: 'fire-gold'
  },
  {
    name: '365-Day Master',
    description: 'Complete any habit for an entire year',
    type: 'streak',
    tier: 'platinum',
    requirement: 365,
    iconName: 'fire-platinum'
  },
  
  // COMPLETION BADGES (5 badges)
  {
    name: 'Perfect Week',
    description: 'Complete all active habits for 7 consecutive days',
    type: 'completion',
    tier: 'bronze',
    requirement: 7,
    iconName: 'calendar-check'
  },
  {
    name: 'Perfect Month',
    description: 'Achieve monthly goal for all habits in one month',
    type: 'completion',
    tier: 'silver',
    requirement: 1,
    iconName: 'calendar-star'
  },
  {
    name: 'Comeback Kid',
    description: 'Restart a habit within 3 days of breaking a streak',
    type: 'completion',
    tier: 'bronze',
    requirement: 1,
    iconName: 'refresh'
  },
  {
    name: 'Early Bird',
    description: 'Complete 7 check-ins before 9 AM',
    type: 'completion',
    tier: 'bronze',
    requirement: 7,
    iconName: 'sunrise'
  },
  {
    name: 'Night Owl',
    description: 'Complete 7 check-ins after 9 PM',
    type: 'completion',
    tier: 'bronze',
    requirement: 7,
    iconName: 'moon'
  },
  
  // VOLUME BADGES (4 badges)
  {
    name: '100 Completions Club',
    description: 'Total 100 habit completions across all habits',
    type: 'volume',
    tier: 'bronze',
    requirement: 100,
    iconName: 'trophy-bronze'
  },
  {
    name: '500 Completions Club',
    description: 'Total 500 habit completions',
    type: 'volume',
    tier: 'silver',
    requirement: 500,
    iconName: 'trophy-silver'
  },
  {
    name: '1000 Completions Club',
    description: 'Total 1000 habit completions',
    type: 'volume',
    tier: 'gold',
    requirement: 1000,
    iconName: 'trophy-gold'
  },
  {
    name: '5000 Completions Club',
    description: 'Total 5000 habit completions',
    type: 'volume',
    tier: 'platinum',
    requirement: 5000,
    iconName: 'trophy-platinum'
  },
  
  // STEP BADGES (8 badges)
  {
    name: '10K Walker',
    description: 'Hit 10,000 steps in a single day',
    type: 'step',
    tier: 'bronze',
    requirement: 10000,
    iconName: 'walk'
  },
  {
    name: 'Marathon Month',
    description: 'Average 10,000+ steps for 30 consecutive days',
    type: 'step',
    tier: 'silver',
    requirement: 30,
    iconName: 'run'
  },
  {
    name: 'Step Streak - Week',
    description: '7 consecutive days hitting step goal',
    type: 'step',
    tier: 'bronze',
    requirement: 7,
    iconName: 'footsteps-bronze'
  },
  {
    name: 'Step Streak - 2 Weeks',
    description: '14 consecutive days hitting step goal',
    type: 'step',
    tier: 'silver',
    requirement: 14,
    iconName: 'footsteps-silver'
  },
  {
    name: 'Step Streak - Month',
    description: '30 consecutive days hitting step goal',
    type: 'step',
    tier: 'gold',
    requirement: 30,
    iconName: 'footsteps-gold'
  },
  {
    name: '100km Milestone',
    description: 'Walk 100 kilometers total',
    type: 'step',
    tier: 'bronze',
    requirement: 100,
    iconName: 'map-bronze'
  },
  {
    name: '500km Milestone',
    description: 'Walk 500 kilometers total',
    type: 'step',
    tier: 'silver',
    requirement: 500,
    iconName: 'map-silver'
  },
  {
    name: '1000km Milestone',
    description: 'Walk 1000 kilometers total',
    type: 'step',
    tier: 'gold',
    requirement: 1000,
    iconName: 'map-gold'
  },
  
  // SPECIAL BADGES (9 more badges - customize as needed)
  {
    name: 'Habit Collector',
    description: 'Create 10 different habits',
    type: 'special',
    tier: 'bronze',
    requirement: 10,
    iconName: 'collection'
  },
  {
    name: 'Weekend Warrior',
    description: 'Complete all habits on 4 consecutive weekends',
    type: 'special',
    tier: 'silver',
    requirement: 4,
    iconName: 'weekend'
  },
  // ... add 7 more creative badges
];

async function seed() {
  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }
}
```

Run seed: `npx prisma db seed`

---

# PART 2: MOBILE APP - BADGE SYSTEM

## Step 1: Badge Constants

Create `apps/mobile/constants/badges.ts`:
```typescript
export const BADGE_ICONS = {
  'fire-bronze': '🔥',
  'fire-silver': '🔥',
  'fire-gold': '🔥',
  'fire-platinum': '🔥',
  'calendar-check': '✅',
  'calendar-star': '⭐',
  'refresh': '🔄',
  'sunrise': '🌅',
  'moon': '🌙',
  'trophy-bronze': '🥉',
  'trophy-silver': '🥈',
  'trophy-gold': '🥇',
  'trophy-platinum': '🏆',
  'walk': '🚶',
  'run': '🏃',
  'footsteps-bronze': '👣',
  'footsteps-silver': '👣',
  'footsteps-gold': '👣',
  'map-bronze': '🗺️',
  'map-silver': '🗺️',
  'map-gold': '🗺️',
  'collection': '📚',
  'weekend': '🎉'
};

export const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2'
};

export const BADGE_CATEGORIES = [
  { id: 'all', name: 'All Badges', icon: '🏆' },
  { id: 'streak', name: 'Streaks', icon: '🔥' },
  { id: 'completion', name: 'Completions', icon: '✅' },
  { id: 'volume', name: 'Volume', icon: '📊' },
  { id: 'step', name: 'Steps', icon: '🚶' },
  { id: 'special', name: 'Special', icon: '⭐' }
];
```

---

## Step 2: BadgesScreen Implementation

Create `apps/mobile/app/(tabs)/badges.tsx`:

**Visual Layout:**
```
┌─────────────────────────────┐
│ Badge Collection            │
│ 5/30 badges earned          │
│                             │
│ [All] [Streaks] [Steps]...  │ ← Filter tabs
│                             │
│ ┌─────────┐ ┌─────────┐    │
│ │  🔥     │ │  🏆     │    │
│ │ 21-Day  │ │ 100     │    │
│ │ Warrior │ │ Club    │    │
│ │ EARNED  │ │ LOCKED  │    │
│ │ Jan 18  │ │ 45/100  │    │
│ └─────────┘ └─────────┘    │
│                             │
│ ┌─────────┐ ┌─────────┐    │
│ │  🏃     │ │  ⭐     │    │
│ │Marathon │ │ Perfect │    │
│ │ Month   │ │ Month   │    │
│ │ EARNED  │ │ LOCKED  │    │
│ │ Jan 10  │ │ 18/20   │    │
│ └─────────┘ └─────────┘    │
└─────────────────────────────┘
```

**Code Structure:**
```typescript
// app/(tabs)/badges.tsx
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useBadges } from '../../hooks/useBadges';
import { BadgeCard } from '../../components/badges/BadgeCard';
import { BADGE_CATEGORIES } from '../../constants/badges';

export default function BadgesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { allBadges, earnedBadges, progress, isLoading } = useBadges();
  
  // Filter badges by category
  const filteredBadges = selectedCategory === 'all'
    ? allBadges
    : allBadges.filter(b => b.type === selectedCategory);
  
  // Combine earned and unearned badges with progress
  const badgesWithStatus = filteredBadges.map(badge => {
    const earned = earnedBadges.find(eb => eb.badgeId === badge.id);
    const prog = progress.find(p => p.badge.id === badge.id);
    
    return {
      ...badge,
      isEarned: !!earned,
      earnedAt: earned?.earnedAt,
      progress: prog ? {
        current: prog.current,
        required: prog.required,
        percentage: prog.percentage
      } : null
    };
  });
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Badge Collection</Text>
        <Text style={styles.subtitle}>
          {earnedBadges.length}/{allBadges.length} badges earned
        </Text>
      </View>
      
      {/* Category Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
      >
        {BADGE_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              selectedCategory === category.id && styles.tabActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.tabIcon}>{category.icon}</Text>
            <Text style={[
              styles.tabText,
              selectedCategory === category.id && styles.tabTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Badge Grid */}
      <FlatList
        data={badgesWithStatus}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <BadgeCard
            badge={item}
            onPress={() => router.push(`/badge/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />
    </View>
  );
}
```

---

## Step 3: BadgeCard Component

Create `apps/mobile/components/badges/BadgeCard.tsx`:
```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BADGE_ICONS, TIER_COLORS } from '../../constants/badges';

interface BadgeCardProps {
  badge: Badge & {
    isEarned: boolean;
    earnedAt?: string;
    progress?: { current: number; required: number; percentage: number };
  };
  onPress: () => void;
}

export function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const tierColor = TIER_COLORS[badge.tier];
  const icon = BADGE_ICONS[badge.iconName];
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {badge.isEarned ? (
        // EARNED BADGE - Full color with glow
        <LinearGradient
          colors={[tierColor + 'AA', tierColor + 'FF']}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.iconLarge}>{icon}</Text>
            <View style={[styles.glowRing, { borderColor: tierColor }]} />
          </View>
          
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.tier}>{badge.tier.toUpperCase()}</Text>
          
          <Text style={styles.earnedDate}>
            Earned {formatDate(badge.earnedAt)}
          </Text>
          
          {/* Checkmark overlay */}
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </LinearGradient>
      ) : (
        // LOCKED BADGE - Grayscale with progress
        <View style={[styles.card, styles.cardLocked]}>
          <View style={styles.iconContainer}>
            <Text style={[styles.iconLarge, styles.iconGray]}>
              {icon}
            </Text>
            {/* Lock icon overlay */}
            <View style={styles.lockIcon}>
              <Text>🔒</Text>
            </View>
          </View>
          
          <Text style={[styles.badgeName, styles.textGray]}>
            {badge.name}
          </Text>
          <Text style={[styles.tier, styles.textGray]}>
            {badge.tier.toUpperCase()}
          </Text>
          
          {/* Progress bar */}
          {badge.progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${badge.progress.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {badge.progress.current}/{badge.progress.required}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 0.75,
    marginBottom: 16,
    marginHorizontal: '1%',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardLocked: {
    backgroundColor: '#E0E0E0',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  iconLarge: {
    fontSize: 48,
  },
  iconGray: {
    opacity: 0.3,
  },
  glowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  lockIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  tier: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  earnedDate: {
    fontSize: 12,
    color: '#666',
  },
  textGray: {
    color: '#999',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00D9A3',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#DDD',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  progressText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});
```

---

## Step 4: Badge Unlock Modal (Celebration)

Create `apps/mobile/components/badges/BadgeUnlockModal.tsx`:

**Visual:**
```
┌─────────────────────────────┐
│  (Confetti raining down)    │
│                             │
│         🏆                  │
│     (Large, glowing)        │
│                             │
│   Congratulations!          │
│   Badge Unlocked!           │
│                             │
│   🔥 21-Day Warrior         │
│                             │
│   "You've completed         │
│    Meditation for 21        │
│    days straight!"          │
│                             │
│   Earned by 12% of users    │
│                             │
│   [Share] [View Collection] │
│                             │
│   (Tap anywhere to close)   │
└─────────────────────────────┘
```

**Implementation:**
```typescript
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { ConfettiAnimation } from './ConfettiAnimation';
import { BADGE_ICONS, TIER_COLORS } from '../../constants/badges';

interface BadgeUnlockModalProps {
  visible: boolean;
  badge: Badge;
  onClose: () => void;
  onShare: () => void;
  onViewCollection: () => void;
}

export function BadgeUnlockModal({
  visible,
  badge,
  onClose,
  onShare,
  onViewCollection
}: BadgeUnlockModalProps) {
  
  // Trigger haptic on show
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Confetti Animation */}
      <ConfettiAnimation visible={visible} duration={3000} />
      
      {/* Overlay */}
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal Content */}
        <View style={styles.modal}>
          {/* Badge Icon with glow */}
          <View style={styles.badgeContainer}>
            <View style={[
              styles.glowCircle, 
              { backgroundColor: TIER_COLORS[badge.tier] + '40' }
            ]} />
            <Text style={styles.badgeIcon}>
              {BADGE_ICONS[badge.iconName]}
            </Text>
          </View>
          
          {/* Congratulations Text */}
          <Text style={styles.congratsText}>Congratulations!</Text>
          <Text style={styles.unlockText}>Badge Unlocked!</Text>
          
          {/* Badge Details */}
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
          
          {/* Rarity */}
          <Text style={styles.rarity}>
            Earned by {badge.rarityPercentage || 15}% of users
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.button}
              onPress={onShare}
            >
              <Text style={styles.buttonText}>Share 📱</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => {
                onViewCollection();
                onClose();
              }}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                View Collection
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Close hint */}
          <Text style={styles.closeHint}>Tap anywhere to close</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    // Animated glow effect
  },
  badgeIcon: {
    fontSize: 80,
    // Scale animation on mount
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 8,
  },
  unlockText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  rarity: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  buttonPrimary: {
    backgroundColor: '#6C63FF',
  },
  buttonText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: 'white',
  },
  closeHint: {
    fontSize: 12,
    color: '#999',
  },
});
```

---

## Step 5: Confetti Animation

Create `apps/mobile/components/celebrations/ConfettiAnimation.tsx`:

**Option 1: Using Lottie (Recommended)**
```typescript
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface ConfettiAnimationProps {
  visible: boolean;
  duration?: number;
}

export function ConfettiAnimation({ visible, duration = 2000 }: ConfettiAnimationProps) {
  if (!visible) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        source={require('../../assets/lottie/confetti.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        speed={1.2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
```

**Note:** You'll need a confetti.json Lottie file. Get free ones from:
- https://lottiefiles.com/search?q=confetti&category=animations
- Download and place in `apps/mobile/assets/lottie/confetti.json`

**Option 2: Custom SVG Animation (if no Lottie file)**
```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function ConfettiAnimation({ visible }: { visible: boolean }) {
  const [particles] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: new Animated.Value(-20),
      size: Math.random() * 10 + 5,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)]
    }))
  );
  
  useEffect(() => {
    if (visible) {
      particles.forEach((particle, index) => {
        Animated.timing(particle.y, {
          toValue: 120,
          duration: 2000 + Math.random() * 1000,
          delay: index * 20,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="100%" height="100%">
        {particles.map(particle => (
          <AnimatedCircle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
          />
        ))}
      </Svg>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
```

---

## Step 6: useBadges Hook

Create `apps/mobile/hooks/useBadges.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeApiService } from '@habit-tracker/api-client';
import { useState } from 'react';

export function useBadges() {
  const queryClient = useQueryClient();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  
  // Fetch all badge definitions
  const { data: allBadges = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: () => BadgeApiService.getAll(),
  });
  
  // Fetch user's earned badges
  const { data: earnedBadges = [], isLoading: isLoadingEarned } = useQuery({
    queryKey: ['badges', 'earned'],
    queryFn: () => BadgeApiService.getUserBadges(),
  });
  
  // Fetch badge progress
  const { data: progress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ['badges', 'progress'],
    queryFn: () => BadgeApiService.getProgress(),
  });
  
  // Check for badge unlocks
  const checkBadgesMutation = useMutation({
    mutationFn: (habitId?: string) => BadgeApiService.checkUnlocks(habitId),
    onSuccess: (data) => {
      if (data.newBadges && data.newBadges.length > 0) {
        // Show unlock modal for first badge
        setUnlockedBadge(data.newBadges[0].badge);
        setShowUnlockModal(true);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['badges'] });
      }
    },
  });
  
  return {
    allBadges,
    earnedBadges,
    progress,
    isLoading: isLoadingAll || isLoadingEarned || isLoadingProgress,
    checkBadges: checkBadgesMutation.mutate,
    showUnlockModal,
    unlockedBadge,
    hideUnlockModal: () => setShowUnlockModal(false),
  };
}
```

---

## Step 7: Integrate Badge Checking into Habit Completion

Update `apps/mobile/hooks/useCompletions.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CompletionApiService } from '@habit-tracker/api-client';
import { useBadges } from './useBadges';
import { useHaptics } from './useHaptics';

export function useCompletions() {
  const queryClient = useQueryClient();
  const { checkBadges } = useBadges();
  const { success } = useHaptics();
  
  const markCompleteMutation = useMutation({
    mutationFn: (data: { habitId: string; date: string }) =>
      CompletionApiService.create(data),
    onSuccess: (data, variables) => {
      // Haptic feedback
      success();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      
      // CHECK FOR BADGE UNLOCKS!
      checkBadges(variables.habitId);
    },
  });
  
  return {
    markComplete: markCompleteMutation.mutate,
    // ... other methods
  };
}
```

This is getting very long. Would you like me to:

1. **Continue with the remaining Phase 2 sections** (Step Tracking, Notifications, Analytics, etc.) in the same detailed format?
2. **Provide a condensed version** that covers all features but with less detail?
3. **Focus on specific features** you're most interested in?
