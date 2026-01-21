# HomeScreen Testing Guide

## ✅ What's Been Implemented

### New Components Created

1. **LoadingSpinner** (`src/components/common/LoadingSpinner.tsx`)
   - Full screen and inline variants
   - Optional loading message
   - Customizable spinner size

2. **EmptyState** (`src/components/common/EmptyState.tsx`)
   - Icon display
   - Title and message
   - Optional action button
   - Used when no habits exist

3. **HabitCard** (`src/components/habits/HabitCard.tsx`)
   - Displays habit icon and title
   - Interactive checkbox for completion
   - Progress bar showing monthly progress
   - Streak badge (🔥 X day streak)
   - Visual feedback when completed (opacity + strikethrough)
   - Custom color theming per habit

### New Hooks Created

1. **useHabits** (Updated) (`src/hooks/useHabits.ts`)
   - Fetches all habits from API
   - Fetches habit stats (current streak, longest streak, etc.)
   - Fetches today's completions
   - Fetches month's completions
   - Combines data into `HabitWithCompletion` interface
   - CRUD operations (create, update, delete)
   - Optimized with React Query caching

2. **useCompletions** (New) (`src/hooks/useCompletions.ts`)
   - Mark habit as complete
   - Unmark habit completion
   - Toggle completion (smart function)
   - Optimistic UI updates (instant feedback)
   - Automatic cache invalidation
   - Error rollback handling

### HomeScreen Features

The HomeScreen (`src/screens/home/HomeScreen.tsx`) now includes:

#### Header Section
- **Today's Date**: "Wednesday, Jan 21, 2026"
- **Page Title**: "Today's Habits"

#### Stats Card
- **Completed**: Shows "3/8" (completed vs total)
- **Progress**: Shows "38%" percentage
- **Streaks**: Shows "🔥 5" active streaks
- **Motivational Message**: Dynamic message based on progress

#### Habit List
- **HabitCard** for each habit with:
  - Habit icon (emoji)
  - Habit title
  - Monthly progress: "12/20 this month • 60%"
  - Interactive checkbox (tap to complete/uncomplete)
  - Progress bar (colored based on habit color)
  - Streak badge (if streak > 0)
  - Strike-through and opacity when completed

#### Features
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Empty state (when no habits)
- ✅ Floating Action Button (+ icon) to add habits
- ✅ Optimistic UI updates (instant checkbox feedback)
- ✅ Automatic data refetching

## 🚀 How to Test

### Prerequisites

1. **Backend running** on http://localhost:3000
2. **Database seeded** with test habits
3. **Mobile app** configured with correct API URL

### Step 1: Seed the Backend with Test Data

```bash
cd apps/backend

# Make sure you're logged in with a test user
# Run this query in your PostgreSQL database or use Prisma Studio

npx prisma studio
```

Or manually add some habits via API:

```bash
# Login first to get a token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' \
  | jq -r '.token')

# Create habit 1: Morning Workout
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Workout",
    "monthlyGoal": 20,
    "color": "#6366F1",
    "icon": "💪"
  }'

# Create habit 2: Read 30 Minutes
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Read 30 Minutes",
    "monthlyGoal": 25,
    "color": "#10B981",
    "icon": "📚"
  }'

# Create habit 3: Meditation
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meditation",
    "monthlyGoal": 30,
    "color": "#8B5CF6",
    "icon": "🧘"
  }'
```

### Step 2: Start the App

```bash
cd apps/mobile
npx expo start
```

Press `i` for iOS or `a` for Android.

### Step 3: Test Scenarios

#### Scenario 1: View Habits (With Data)

1. Login with your test account
2. You should see the **HomeScreen** with:
   - Today's date at the top
   - Stats card showing 0/3 completed, 0%, 0 streaks
   - List of 3 habits
3. Each habit card should show:
   - Icon (💪, 📚, 🧘)
   - Title
   - Progress: "0/20 this month • 0%"
   - Empty checkbox (unchecked)
   - Progress bar (empty)

#### Scenario 2: Mark Habit Complete

1. Tap the **checkbox** on "Morning Workout"
2. You should see **INSTANT** feedback:
   - Checkbox fills with color and shows checkmark ✓
   - Card becomes slightly transparent (opacity 0.7)
   - Title gets strikethrough
3. Stats card updates:
   - "1/3 completed"
   - "33%"
4. Progress updates:
   - "1/20 this month • 5%"
   - Progress bar shows small amount of color

#### Scenario 3: Unmark Habit

1. Tap the checkbox again on "Morning Workout"
2. You should see:
   - Checkbox becomes empty
   - Card opacity returns to normal
   - Title strikethrough removed
3. Stats card updates back to "0/3 completed"

#### Scenario 4: Complete Multiple Habits

1. Mark "Morning Workout" complete
2. Mark "Read 30 Minutes" complete
3. Mark "Meditation" complete
4. Stats should show:
   - "3/3 completed"
   - "100%"
   - Motivational message: "Amazing! All done for today! 🎉"

#### Scenario 5: Build a Streak

To test streaks, you need to mark habits complete on consecutive days. Since we can't travel through time, we can:

1. Use the backend API to create completions for previous days
2. Or modify your device date (Settings → Date & Time)

Example API call to create past completions:

```bash
# Mark "Morning Workout" complete for yesterday
curl -X POST http://localhost:3000/api/completions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "habitId": "YOUR_HABIT_ID",
    "date": "2026-01-20"
  }'
```

After creating completions for 3 consecutive days, you should see:
- Streak badge appears: "🔥 3 day streak"
- Stats card shows active streaks count

#### Scenario 6: Pull to Refresh

1. Pull down on the habit list
2. You should see a loading spinner
3. Data refreshes from the server
4. Any changes are reflected

#### Scenario 7: Empty State

1. Delete all habits (via backend or API)
2. Restart the app
3. You should see:
   - Empty state icon (trophy)
   - "No habits yet"
   - Message explaining what to do
   - "Create Your First Habit" button

#### Scenario 8: Loading State

1. On first load (or after login)
2. You should see:
   - Full-screen loading spinner
   - "Loading habits..." message
3. After data loads, transitions to habit list

#### Scenario 9: Floating Action Button

1. Tap the **+ button** in bottom-right corner
2. You should see console log: "Navigate to add habit screen"
3. (In future, this will navigate to AddHabitScreen)

## 🎨 Visual Features to Verify

### HabitCard

- [ ] Icon displayed correctly (emoji)
- [ ] Title readable and properly styled
- [ ] Color theme applied (icon background, progress bar, checkbox)
- [ ] Checkbox interactive and responsive
- [ ] Progress bar animates smoothly
- [ ] Streak badge only shows when streak > 0
- [ ] Completed state (opacity + strikethrough) works
- [ ] Card has proper shadow and elevation
- [ ] Tapping card logs "Navigate to habit detail"

### Stats Card

- [ ] Shows correct completion count (e.g., "3/8")
- [ ] Shows correct percentage (e.g., "38%")
- [ ] Shows correct streak count (e.g., "🔥 5")
- [ ] Motivational message changes based on progress
- [ ] Stats update in real-time when habits are completed
- [ ] Has white background with shadow

### Empty State

- [ ] Trophy icon displayed
- [ ] Title and message centered
- [ ] Button styled correctly
- [ ] Button navigates (console log for now)

### Floating Action Button

- [ ] Positioned in bottom-right corner
- [ ] Circular with shadow
- [ ] Primary color background
- [ ] White + icon
- [ ] Tappable and responsive
- [ ] Shows touch feedback

## ⚡ Performance Features

### Optimistic Updates

When you tap a checkbox, the UI updates **immediately** before the API call completes. This makes the app feel instant and responsive.

**How it works:**
1. Tap checkbox
2. UI updates instantly (optimistic)
3. API call happens in background
4. If API succeeds: UI stays updated
5. If API fails: UI rolls back to previous state

### React Query Caching

- Habits are cached for 5 minutes
- If you leave and return to HomeScreen, data loads instantly from cache
- Background refetch happens to ensure data is fresh
- Pull-to-refresh forces immediate refetch

### Automatic Refetching

- When you complete a habit, React Query automatically refetches:
  - Habit list
  - Habit stats
  - Completions
- This ensures all data stays in sync

## 🐛 Troubleshooting

### "No habits displayed"

**Solution:**
1. Check if backend is running: `curl http://localhost:3000/api/habits -H "Authorization: Bearer YOUR_TOKEN"`
2. Check API URL in `apiClient.ts` matches your local IP
3. Create some habits via API or Prisma Studio

### "Checkboxes don't work"

**Solution:**
1. Check console for errors
2. Verify completions API is working: `curl http://localhost:3000/api/completions -H "Authorization: Bearer YOUR_TOKEN"`
3. Check React Query DevTools (if installed)

### "Stats not updating"

**Solution:**
1. Pull to refresh
2. Check if React Query is refetching after mutations
3. Verify habit stats API: `curl http://localhost:3000/api/habits/HABIT_ID/stats -H "Authorization: Bearer YOUR_TOKEN"`

### "Progress bar not showing"

**Solution:**
- Install `react-native-progress` if not already installed:
  ```bash
  cd apps/mobile
  npm install react-native-progress
  ```

### "App crashes on load"

**Solution:**
1. Check if `date-fns` is installed
2. Clear Expo cache: `npx expo start -c`
3. Check console for specific error messages

## 📊 Test Data Examples

Here are good test habits to create:

1. **Morning Workout**
   - Goal: 20 days/month
   - Color: #6366F1 (indigo)
   - Icon: 💪

2. **Read 30 Minutes**
   - Goal: 25 days/month
   - Color: #10B981 (green)
   - Icon: 📚

3. **Meditation**
   - Goal: 30 days/month
   - Color: #8B5CF6 (purple)
   - Icon: 🧘

4. **Drink Water**
   - Goal: 31 days/month
   - Color: #06B6D4 (cyan)
   - Icon: 💧

5. **Exercise**
   - Goal: 15 days/month
   - Color: #F97316 (orange)
   - Icon: 🏃

## 🎯 What's Next?

After the HomeScreen is working, we'll implement:

1. **AddHabitScreen** - Create and edit habits
2. **HabitDetailScreen** - View detailed stats
3. **CalendarScreen** - Monthly completion view
4. **Settings Screen** - User preferences

## 💡 Tips for Testing

1. **Use multiple habits** - Create 5-8 habits to see how the list looks when scrolled
2. **Test on different screen sizes** - iOS and Android, different devices
3. **Test with slow network** - Use Chrome DevTools network throttling
4. **Test offline mode** - Turn off WiFi and see error handling (future feature)
5. **Test with long habit names** - Ensure text truncation works
6. **Test with many completions** - Create habits with high completion counts

Happy testing! 🎉
