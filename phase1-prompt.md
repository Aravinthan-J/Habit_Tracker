# **PHASE 1 DETAILED BREAKDOWN**

Let me give you a comprehensive overview of everything included in Phase 1, what each part does, and how it all fits together.

---

## 📋 **PHASE 1 OVERVIEW**

Phase 1 builds the **foundation** of your habit tracker app:
- ✅ Complete backend API with database
- ✅ Expo mobile app with authentication
- ✅ Basic habit management (create, read, update, delete)
- ✅ Daily habit completion tracking
- ✅ Offline-first architecture
- ✅ Shared code packages

**Timeline:** 2-3 weeks for full implementation  
**Complexity:** Medium  
**Output:** Production-ready MVP

---

## 🏗️ **PROJECT ARCHITECTURE**

### Monorepo Structure

```
habit-tracker/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── backend/         # Node.js API server
└── packages/
    ├── shared-types/    # TypeScript types shared across all apps
    ├── shared-utils/    # Utility functions (dates, calculations)
    └── api-client/      # API service layer (network calls)
```

**Why Monorepo?**
- Share code between mobile and web (Phase 3)
- Single source of truth for types
- Easier dependency management
- Coordinated versioning

---

## 🗄️ **1. BACKEND API (Node.js + Express + PostgreSQL)**

### Purpose
Central server that handles all business logic, data storage, and user authentication.

### Tech Stack
- **Node.js 20+** - JavaScript runtime
- **Express.js** - Web framework for API routes
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication tokens
- **bcrypt** - Password hashing
- **Zod** - Request validation

### Database Schema (3 Tables)

#### **Users Table**
Stores user accounts and preferences.

```
Users:
├── id (UUID, primary key)
├── email (unique, for login)
├── password (hashed with bcrypt)
├── name (optional display name)
├── Preferences:
│   ├── stepGoal (default: 10,000)
│   ├── reminderTime (default: "20:00")
│   ├── timezone (default: "UTC")
│   └── theme ("light" or "dark")
├── isEmailVerified (boolean)
├── isActive (boolean)
├── createdAt (timestamp)
└── updatedAt (timestamp)
```

#### **Habits Table**
Stores all habits created by users.

```
Habits:
├── id (UUID, primary key)
├── userId (foreign key → Users)
├── title (e.g., "Morning Workout")
├── monthlyGoal (1-31, how many days per month)
├── color (hex code like "#6C63FF")
├── icon (emoji or name like "💪")
├── notificationsEnabled (boolean)
├── reminderTime (optional, "09:00")
├── createdAt (timestamp)
├── updatedAt (timestamp)
└── archivedAt (null if active, timestamp if deleted)
```

#### **Completions Table**
Tracks which habits were completed on which dates.

```
Completions:
├── id (UUID, primary key)
├── habitId (foreign key → Habits)
├── userId (foreign key → Users)
├── date (just the date, like "2026-01-18")
├── completedAt (timestamp when marked complete)
└── UNIQUE constraint on (habitId, date) - can't complete same habit twice per day
```

### API Endpoints

#### **Authentication Routes** (`/api/auth`)
```
POST   /register
       Input: { email, password, name? }
       Output: { user, token }
       Purpose: Create new account

POST   /login
       Input: { email, password }
       Output: { user, token }
       Purpose: Sign in

GET    /me (requires auth token)
       Output: { user }
       Purpose: Get current user info

POST   /logout (requires auth token)
       Output: { message }
       Purpose: Sign out

PATCH  /profile (requires auth token)
       Input: { name?, stepGoal?, reminderTime?, timezone?, theme? }
       Output: { user }
       Purpose: Update user settings

POST   /change-password (requires auth token)
       Input: { currentPassword, newPassword }
       Output: { message }
       Purpose: Change password
```

#### **Habit Routes** (`/api/habits`) - All require authentication
```
POST   /
       Input: { title, monthlyGoal, color?, icon?, notificationsEnabled?, reminderTime? }
       Output: { habit }
       Purpose: Create new habit

GET    /
       Query: { archived?: boolean }
       Output: { habits: Habit[] }
       Purpose: Get all user's habits

GET    /:id
       Output: { habit }
       Purpose: Get single habit details

PATCH  /:id
       Input: { title?, monthlyGoal?, color?, icon?, ... }
       Output: { habit }
       Purpose: Update habit

DELETE /:id
       Output: { message }
       Purpose: Delete habit (soft delete - just sets archivedAt)

GET    /:id/stats
       Output: { currentStreak, longestStreak, completionRate, totalCompletions }
       Purpose: Get habit statistics
```

#### **Completion Routes** (`/api/completions`) - All require authentication
```
POST   /
       Input: { habitId, date } (date format: "2026-01-18")
       Output: { completion }
       Purpose: Mark habit complete for specific date
       Note: Idempotent (calling twice = same result)

DELETE /:habitId/:date
       Output: { message }
       Purpose: Unmark completion (remove checkmark)

GET    /
       Query: { habitId?, startDate?, endDate? }
       Output: { completions: Completion[] }
       Purpose: Get completions with optional filters

GET    /calendar/:year/:month
       Output: { completions: [{ date, habitIds: [] }], habits: [] }
       Purpose: Get all completions for a month (for calendar view)
```

### Security Features

**Password Security:**
- Hashed with bcrypt (10 salt rounds)
- Minimum 8 characters
- Requires: 1 uppercase letter, 1 number
- Never stored in plain text

**JWT Tokens:**
- 7-day expiration
- Signed with secret key
- Stateless (no session storage)
- Sent in Authorization header: `Bearer <token>`

**Rate Limiting:**
- Max 5 login attempts per 15 minutes per IP
- Prevents brute force attacks

**Input Validation:**
- Zod schemas validate all requests
- Sanitize inputs to prevent SQL injection
- Email format validation

**Headers:**
- helmet.js for security headers
- CORS configured for specific origins
- XSS protection

### Error Handling

**Custom Error Classes:**
- `ValidationError` (400) - Bad request data
- `UnauthorizedError` (401) - Invalid/missing token
- `NotFoundError` (404) - Resource doesn't exist
- `ConflictError` (409) - Duplicate (e.g., email already exists)

**Error Response Format:**
```json
{
  "success": false,
  "message": "Email already registered",
  "code": "CONFLICT",
  "statusCode": 409
}
```

---

## 📱 **2. EXPO MOBILE APP**

### Purpose
User-facing application where people track their habits daily.

### Tech Stack
- **Expo SDK 50+** - React Native framework
- **Expo Router** - File-based routing (like Next.js)
- **TypeScript** - Type safety
- **Expo SQLite** - Local offline database
- **Expo SecureStore** - Encrypted token storage
- **React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP requests
- **@expo/vector-icons** - Icon library

### App Structure

#### **Routing (Expo Router File-Based)**

```
app/
├── (auth)/                    # Authentication flow (no tabs)
│   ├── _layout.tsx            # Auth-specific layout
│   ├── login.tsx              # Login screen
│   ├── register.tsx           # Register screen
│   └── onboarding.tsx         # First-time user tutorial (optional)
│
├── (tabs)/                    # Main app (bottom tabs)
│   ├── _layout.tsx            # Tab bar with 4 tabs
│   ├── index.tsx              # Home: Today's habits
│   ├── calendar.tsx           # Calendar: Monthly view
│   ├── habits.tsx             # Habits: All habits list
│   └── settings.tsx           # Settings: Profile & preferences
│
├── habit/
│   ├── new.tsx                # Create new habit screen
│   └── [id].tsx               # Dynamic route: View/edit habit by ID
│
├── _layout.tsx                # Root layout (providers, auth check)
└── +not-found.tsx             # 404 screen
```

**How Routing Works:**
- File names = Routes
- `(parentheses)` = Route groups (don't add to URL)
- `[brackets]` = Dynamic segments (like habit ID)
- `_layout.tsx` = Layout wrapper for child routes
- No manual navigation config needed!

### Screen Details

#### **1. Login Screen** (`app/(auth)/login.tsx`)

**UI Elements:**
```
┌─────────────────────────────┐
│   [Logo]                    │
│                             │
│   Welcome Back!             │
│                             │
│   [Email Input]             │
│   [Password Input] [👁️]     │
│                             │
│   ☐ Remember Me             │
│                             │
│   [Login Button]            │
│                             │
│   Don't have account?       │
│   Register →                │
│                             │
│   Forgot Password? →        │
└─────────────────────────────┘
```

**Functionality:**
- Form validation (email format, required fields)
- Show/hide password toggle
- Loading spinner on submit
- Error messages below fields
- Navigate to home on success
- Store token in SecureStore

#### **2. Register Screen** (`app/(auth)/register.tsx`)

**UI Elements:**
```
┌─────────────────────────────┐
│   Create Account            │
│                             │
│   [Name Input]              │
│   [Email Input]             │
│   [Password Input] [👁️]     │
│   [Confirm Password] [👁️]   │
│                             │
│   Password Requirements:    │
│   ✓ 8+ characters           │
│   ✓ 1 uppercase             │
│   ✓ 1 number                │
│                             │
│   [Create Account Button]   │
│                             │
│   Already have account?     │
│   Login →                   │
└─────────────────────────────┘
```

**Functionality:**
- Real-time password strength indicator
- Confirm password match validation
- Show all password requirements
- Navigate to home on success

#### **3. Home Screen (Today's Habits)** (`app/(tabs)/index.tsx`)

**UI Layout:**
```
┌─────────────────────────────┐
│ Today • Wed, Jan 18, 2026   │
│                             │
│ ┌─────────────────────────┐ │
│ │  3/8 completed • 38%    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💪 Morning Workout      │ │
│ │ 12/20 this month    [✓] │ │
│ │ ▓▓▓▓░░░░░░  60%         │ │
│ │ 🔥 5 days streak        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📚 Read 30 Minutes      │ │
│ │ 8/20 this month     [ ] │ │
│ │ ▓▓▓░░░░░░░  40%         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🧘 Meditation           │ │
│ │ 15/20 this month    [✓] │ │
│ │ ▓▓▓▓▓▓▓░░░  75%         │ │
│ │ 🔥 21 days streak       │ │
│ └─────────────────────────┘ │
│                             │
│              [+]            │ (Floating button)
└─────────────────────────────┘
```

**Features:**
- Shows today's date
- Quick stats at top (X/Y completed)
- List of all active habits
- Large, easy-to-tap checkboxes
- Visual feedback: completed habits are grayed out, have checkmark
- Shows current streak (fire emoji + number)
- Monthly progress bar
- Pull-to-refresh
- Tap checkbox: Mark complete/incomplete instantly
- Tap card: Navigate to habit detail
- Floating + button: Add new habit
- Empty state: "No habits yet. Tap + to get started!"

**Data Flow:**
1. useHabits() hook fetches habits from local SQLite
2. useCompletions() fetches today's completions
3. User taps checkbox
4. Optimistic update: UI changes immediately
5. Save to SQLite
6. Queue sync operation
7. When online: Sync to server

#### **4. Calendar Screen** (`app/(tabs)/calendar.tsx`)

**UI Layout:**
```
┌─────────────────────────────┐
│  [<] January 2026    [>]    │
│                             │
│  Su  Mo  Tu  We  Th  Fr  Sa │
│              1   2   3   4  │
│   5   6   7  🟢 🟢 10  11  │
│              🔵 🔵           │
│  12  13  14  15  16  17 🟢 │
│                          🔵 │
│  19  20  21  22  23  24  25 │
│  26  27  28  29  30  31     │
│                             │
│  Legend:                    │
│  🟢 Workout  🔵 Reading     │
│  🟡 Meditation              │
└─────────────────────────────┘
```

**Features:**
- Month/year navigation (arrows or dropdowns)
- Each date shows colored dots for completed habits
- Max 5 dots visible, "+2 more" if more habits
- Tap date: Opens modal with all habits for that day
- Modal allows toggling completions
- Today is highlighted
- Weekend dates in different color (optional)

#### **5. Habits List Screen** (`app/(tabs)/habits.tsx`)

**UI Layout:**
```
┌─────────────────────────────┐
│  [Search habits...]         │
│                             │
│  Sort: ▼  Filter: ▼         │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💪 Morning Workout      │ │
│ │ Goal: 20 days/month     │ │
│ │ ▓▓▓▓▓▓▓░░░  60%         │ │
│ │ Current: 12/20          │ │
│ │ Streak: 🔥 5 days      │ │
│ │           [Edit] [Del]  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📚 Read 30 Minutes      │ │
│ │ Goal: 20 days/month     │ │
│ │ ▓▓▓▓░░░░░░  40%         │ │
│ │ Current: 8/20           │ │
│ │           [Edit] [Del]  │ │
│ └─────────────────────────┘ │
│                             │
│              [+]            │
└─────────────────────────────┘
```

**Features:**
- Search bar (filters by title)
- Sort options: Alphabetical, Most completed, Longest streak
- Filter: Active habits, Archived habits, All
- Each card shows full habit details
- Edit button: Opens edit screen
- Delete button: Confirmation dialog
- Tap card: Navigate to detail screen
- Pull-to-refresh

#### **6. Add/Edit Habit Screen** (`app/habit/new.tsx` and `app/habit/[id].tsx`)

**UI Layout:**
```
┌─────────────────────────────┐
│  [←] New Habit              │
│                             │
│  Title                      │
│  [Morning Workout_______]   │
│                             │
│  Monthly Goal               │
│  [20____________] days      │
│                             │
│  Color                      │
│  ⚪ 🔴 🟢 🔵 🟡 🟣 🟤 ⚫  │
│  (Selected: 🟣)             │
│                             │
│  Icon                       │
│  💪 📚 🧘 ☕ 💧 🏃 🎯 ✍️  │
│  (Selected: 💪)             │
│                             │
│  Notifications              │
│  Enable reminders  [ON/OFF] │
│                             │
│  Reminder Time              │
│  [09:00 AM________] ▼       │
│                             │
│  [Save Habit Button]        │
│  [Cancel]                   │
│                             │
│  (On edit screen only:)     │
│  [Delete Habit Button]      │
└─────────────────────────────┘
```

**Features:**
- Title input (max 100 chars)
- Monthly goal: Number picker (1-31)
- Color picker: Grid of 6-8 colors
- Icon picker: Grid of 15-20 emoji icons
- Notifications toggle
- Time picker (only visible if notifications on)
- Validation:
  - Title required
  - Goal must be 1-31
  - Show errors below fields
- Save button disabled if invalid
- Delete with confirmation dialog

#### **7. Settings Screen** (`app/(tabs)/settings.tsx`)

**UI Layout:**
```
┌─────────────────────────────┐
│  Profile                    │
│  ┌───────────────────────┐  │
│  │  [Avatar]             │  │
│  │  John Doe             │  │
│  │  john@example.com     │  │
│  │  Member since Jan 2026│  │
│  └───────────────────────┘  │
│                             │
│  Preferences                │
│  Daily Step Goal  [10000__] │
│  Reminder Time    [08:00 PM]│
│  Timezone         [UTC____▼]│
│  Theme       [Light/Dark___]│
│                             │
│  Account                    │
│  Change Password →          │
│  Logout →                   │
│                             │
│  Data                       │
│  Export Data →              │
│  Delete Account →           │
│                             │
│  About                      │
│  Version 1.0.0              │
│  Privacy Policy →           │
│  Terms of Service →         │
└─────────────────────────────┘
```

---

## 💾 **3. OFFLINE-FIRST ARCHITECTURE**

### Why Offline-First?
- App works without internet (planes, subways, no data)
- Instant UI response (no loading spinners)
- Sync when connection returns
- Better user experience

### How It Works

#### **Local Database (Expo SQLite)**

**3 Tables in Local Database:**
```sql
-- Mirror of server habits table
habits (
  id, userId, title, monthlyGoal, color, icon,
  notificationsEnabled, reminderTime,
  createdAt, updatedAt, archivedAt
)

-- Mirror of server completions table
completions (
  id, habitId, userId, date, completedAt, synced
)

-- Queue for offline operations
sync_queue (
  id, operation, data, timestamp, retries
)
```

#### **Sync Flow**

**When User Takes Action (Offline):**
```
User marks habit complete
  ↓
1. Save to SQLite immediately (instant UI update)
  ↓
2. Add to sync_queue:
   { 
     id: "uuid",
     operation: "MARK_COMPLETE",
     data: { habitId: "123", date: "2026-01-18" },
     timestamp: "2026-01-18T10:30:00Z",
     retries: 0
   }
  ↓
3. Show "offline" indicator in UI
  ↓
4. Wait for connection...
```

**When Connection Returns:**
```
Internet connected
  ↓
1. Get all operations from sync_queue (FIFO order)
  ↓
2. For each operation:
   - Send API request
   - If success: Remove from queue
   - If fail: Increment retries, try again later
  ↓
3. Pull latest data from server (get any changes from other devices)
  ↓
4. Update local SQLite with server data
  ↓
5. Remove "offline" indicator
```

#### **Conflict Resolution (Phase 1)**
- **Server wins** - If conflict, server data overwrites local
- Example: You mark habit complete offline, but server says it was already completed from web → Server version kept
- Phase 2 will add smarter conflict resolution

#### **Sync Frequency**
- **Auto-sync:** Every 5 minutes when online
- **Manual sync:** Pull-to-refresh on any screen
- **On app open:** Immediate sync if online
- **On connection change:** Sync when WiFi/data connects

---

## 📦 **4. SHARED PACKAGES**

### Purpose
Code shared between mobile app, web app (Phase 3), and backend.

### A. shared-types

**What:** TypeScript interfaces and types

**Example:**
```typescript
// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  stepGoal: number;
  reminderTime: string;
  timezone: string;
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

// Habit types
export interface Habit {
  id: string;
  userId: string;
  title: string;
  monthlyGoal: number;
  color: string;
  icon: string | null;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

// API request/response types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
```

**Why:** Ensures mobile, web, and backend all use same data structure.

### B. shared-utils

**What:** Utility functions for common tasks

**Example:**
```typescript
// Date helpers
export function getToday(): string {
  return new Date().toISOString().split('T')[0]; // "2026-01-18"
}

export function formatDate(date: Date, format: 'short' | 'long'): string {
  // Formats dates consistently across app
}

// Streak calculator
export function calculateStreak(completedDates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  // Algorithm to calculate current and longest streaks
  // Works same way on mobile, web, and server
}

// Validators
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors = [];
  if (password.length < 8) errors.push('Min 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Need uppercase');
  if (!/[0-9]/.test(password)) errors.push('Need number');
  return { isValid: errors.length === 0, errors };
}
```

**Why:** Write once, use everywhere. Ensures consistency.

### C. api-client

**What:** Service layer for API calls

**Example:**
```typescript
// AuthApiService.ts
class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
  
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }
  
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  }
}

// HabitApiService.ts
class HabitApiService {
  async getAll(): Promise<Habit[]> {
    const response = await api.get('/habits');
    return response.data.habits;
  }
  
  async create(data: CreateHabitData): Promise<Habit> {
    const response = await api.post('/habits', data);
    return response.data.habit;
  }
  
  async update(id: string, updates: Partial<Habit>): Promise<Habit> {
    const response = await api.patch(`/habits/${id}`, updates);
    return response.data.habit;
  }
  
  async delete(id: string): Promise<void> {
    await api.delete(`/habits/${id}`);
  }
}
```

**Why:** 
- Centralized API logic
- Easy to mock for testing
- Used by both mobile and web

---

## 🔐 **5. AUTHENTICATION FLOW**

### Complete User Journey

**1. First Time User:**
```
Open app
  ↓
See onboarding (3 slides explaining app)
  ↓
Tap "Get Started"
  ↓
Register screen
  ↓
Enter name, email, password
  ↓
Tap "Create Account"
  ↓
API creates user + returns token
  ↓
Token saved to SecureStore
  ↓
Navigate to home screen
  ↓
See empty state: "Create your first habit!"
```

**2. Returning User:**
```
Open app
  ↓
Root layout runs hydrate()
  ↓
Load token from SecureStore
  ↓
Verify token with API (GET /auth/me)
  ↓
If valid: Navigate to home
If invalid: Navigate to login
```

**3. Login:**
```
Enter email and password
  ↓
Tap "Login"
  ↓
API verifies credentials
  ↓
If correct: Return user + token
If wrong: Return error "Invalid credentials"
  ↓
Token saved to SecureStore
  ↓
Navigate to home screen
```

**4. Logout:**
```
Tap "Logout" in settings
  ↓
Confirmation dialog: "Are you sure?"
  ↓
Tap "Yes"
  ↓
Call API /auth/logout
  ↓
Delete token from SecureStore
  ↓
Clear local SQLite database (optional)
  ↓
Navigate to login screen
```

### Token Management

**JWT Token Structure:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1705564800,  // Issued at timestamp
  "exp": 1706169600   // Expires 7 days later
}
```

**Token Storage:**
- Mobile: Expo SecureStore (encrypted, OS keychain)
- Never in AsyncStorage (not secure enough)
- Never in plain text

**Token Usage:**
- Every API request includes: `Authorization: Bearer <token>`
- Backend verifies token on every protected route
- If expired: 401 response → App logs user out automatically

---

## 🔄 **6. DATA FLOW EXAMPLES**

### Example 1: Creating a New Habit

**User Action → API → Local Storage → UI Update**

```
1. User taps "+" button on home screen
   ↓
2. Navigate to "New Habit" screen
   ↓
3. User fills form:
   - Title: "Morning Workout"
   - Goal: 20 days/month
   - Color: Purple (#6C63FF)
   - Icon: 💪
   - Notifications: ON
   - Time: 7:00 AM
   ↓
4. Tap "Save"
   ↓
5. Frontend validation passes
   ↓
6. useCreateHabit() mutation called
   ↓
7. If online:
   a. Send POST /api/habits to server
   b. Server validates, saves to PostgreSQL
   c. Server returns created habit with ID
   d. Save habit to local SQLite
   e. Navigate back to home
   f. New habit appears in list
   
   If offline:
   a. Generate temporary ID (UUID)
   b. Save to local SQLite immediately
   c. Add to sync_queue: { operation: "CREATE_HABIT", data: {...} }
   d. Navigate back to home
   e. New habit appears in list (with "syncing..." indicator)
   f. When online: Sync to server, update with real ID
```

### Example 2: Marking Habit Complete

**Instant UI + Background Sync**

```
1. User sees habit card with empty checkbox
   ↓
2. Tap checkbox
   ↓
3. IMMEDIATELY (optimistic update):
   - Checkbox shows checkmark
   - Card opacity changes to 0.7
   - Title gets strikethrough
   - Haptic feedback (tiny vibration)
   ↓
4. Background (async):
   a. Save to local SQLite:
      INSERT INTO completions (habitId, date, completedAt)
   b. If online:
      - Send POST /api/completions
      - Mark as synced in SQLite
   c. If offline:
      - Add to sync_queue
      - Show offline indicator
   ↓
5. Update today's stats:
   - "3/8 completed" → "4/8 completed"
   - Progress percentage updates
   ↓
6. Check if this triggers any milestones:
   - First completion of day → Small confetti (Phase 2)
   - All habits complete → Big confetti (Phase 2)
   - 21-day streak → Badge unlock (Phase 2)
```

### Example 3: Viewing Calendar

**Efficient Data Loading**

```
1. User taps "Calendar" tab
   ↓
2. useCompletions() hook runs:
   a. Calculate current month (January 2026)
   b. Check SQLite first:
      SELECT * FROM completions 
      WHERE date >= '2026-01-01' 
      AND date <= '2026-01-31'
   c. If online and data might be stale:
      - Fetch from API: GET /api/completions/calendar/2026/1
      - Update SQLite with any changes
   d. Return completion data to component
   ↓
3. Render calendar:
   - Generate grid (7 columns × 5 rows)
   - For each date:
     - Check if any completions exist
     - Show colored dots (one per completed habit)
     - Max 5 dots, show "+2 more" if needed
   ↓
4. User taps Jan 18:
   - Filter completions for "2026-01-18"
   - Show modal with all habits
   - Checkboxes reflect completion status
   - User can toggle from modal
```

---

## 📊 **7. PERFORMANCE CONSIDERATIONS**

### Mobile App Performance

**Fast App Launch:**
- Show splash screen immediately
- Load token from SecureStore in background
- Hydrate auth state (check if logged in)
- If logged in: Pre-load today's habits from SQLite
- Show UI as soon as local data loads (< 500ms)
- Sync with server in background

**Smooth Scrolling:**
- Use FlatList for habit lists (virtualized rendering)
- Only render visible items
- Optimize re-renders with React.memo
- Use useCallback for event handlers

**Instant Interactions:**
- Optimistic updates (UI changes before API responds)
- Local data always loads first
- Network requests happen in background

**Memory Management:**
- Clean up event listeners (network, SQLite)
- Cancel pending API requests on screen unmount
- Limit cached images

### Backend Performance

**Database Optimization:**
- Indexes on frequently queried columns:
  - users.email (for login)
  - habits.userId (for user's habits)
  - completions (habitId, date) (for calendar queries)
- Use connection pooling
- Limit query results (pagination for large datasets)

**API Response Times:**
- Target: < 200ms for most requests
- Use async/await properly
- Minimize database round-trips
- Cache frequently accessed data

---

## 🧪 **8. TESTING STRATEGY**

### Backend Tests

**Unit Tests:**
- AuthService.register()
- AuthService.login()
- TokenService.generateToken()
- TokenService.verifyToken()
- calculateStreak() algorithm

**Integration Tests:**
- POST /api/auth/register flow
- POST /api/auth/login flow
- Protected routes require valid token
- CRUD operations for habits
- Completion tracking

### Mobile Tests

**Component Tests:**
- HabitCard renders correctly
- Checkbox toggles state
- Forms validate input
- Error messages display

**Integration Tests:**
- Login flow end-to-end
- Create habit flow
- Mark complete flow
- Offline sync flow

**Manual Tests:**
- App works offline
- Sync works when reconnecting
- All screens navigate correctly
- Pull-to-refresh works

---

## 🚀 **9. DEPLOYMENT**

### Backend Deployment

**Options:**
1. **Railway** (Recommended for beginners)
   - Easy PostgreSQL database
   - Auto-deploy from GitHub
   - Free tier available
   - One-click setup

2. **Render**
   - Similar to Railway
   - Free tier
   - PostgreSQL included

3. **Fly.io**
   - More control
   - Global edge deployment

**Steps:**
```
1. Push code to GitHub
2. Create Railway project
3. Add PostgreSQL database
4. Set environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - NODE_ENV=production
5. Deploy from GitHub
6. Run migrations: npx prisma migrate deploy
7. Get API URL (e.g., https://your-app.railway.app)
```

### Mobile App Deployment

**TestFlight (iOS) / Internal Testing (Android):**
```
1. Configure app.json with app name, bundle ID
2. Create Expo account
3. Install EAS CLI: npm install -g eas-cli
4. Login: eas login
5. Configure: eas build:configure
6. Build: eas build --platform all
7. Wait 15-30 minutes for cloud build
8. Download IPA (iOS) and APK (Android)
9. Upload to TestFlight / Google Play Console
```

**Production (App Stores):**
```
1. Prepare assets:
   - App icon (1024×1024)
   - Screenshots (various sizes)
   - App description
   - Privacy policy
2. Submit for review:
   - iOS: 1-7 days review time
   - Android: 1-3 days review time
3. Go live!
```

---

## 📈 **10. SUCCESS METRICS**

After Phase 1 is complete, you'll have:

**Backend:**
- ✅ Working API with 15+ endpoints
- ✅ PostgreSQL database with 3 tables
- ✅ JWT authentication
- ✅ Full CRUD for habits and completions
- ✅ Deployed and accessible via HTTPS

**Mobile App:**
- ✅ Login and registration working
- ✅ Create, view, edit, delete habits
- ✅ Mark habits complete daily
- ✅ View calendar of completions
- ✅ Works offline, syncs when online
- ✅ Deployed to TestFlight/Internal Testing

**User Can:**
- ✅ Create account
- ✅ Add unlimited habits
- ✅ Track daily completions
- ✅ See completion history
- ✅ Use app offline
- ✅ See streaks
- ✅ Edit preferences

**What's NOT Included in Phase 1:**
- ❌ Badge system (Phase 2)
- ❌ Step tracking (Phase 2)
- ❌ Push notifications (Phase 2)
- ❌ Analytics charts (Phase 2)
- ❌ Celebrations/confetti (Phase 2)
- ❌ Web app (Phase 3)
- ❌ Advanced exports (Phase 3)

---

## 🛠️ **11. DEVELOPMENT WORKFLOW**

### Setup Time Estimate

**First-Time Setup:**
- Backend: 2-3 hours (install Node, PostgreSQL, create database)
- Mobile: 1 hour (install Expo CLI, create project)
- Total: 3-4 hours

**Daily Development:**
```
Morning:
1. Pull latest code: git pull
2. Start backend: cd apps/backend && npm run dev
3. Start mobile: cd apps/mobile && npx expo start
4. Open on phone/simulator
5. Start coding!
```

### Typical Development Day

**Backend Work:**
```
1. Define new route in routes/
2. Create controller in controllers/
3. Add service logic in services/
4. Test with Postman/Insomnia
5. Fix bugs
6. Commit to Git
```

**Mobile Work:**
```
1. Create new screen in app/
2. Add components in components/
3. Create hooks in hooks/
4. Test on device/simulator
5. Fix styling
6. Test offline mode
7. Commit to Git
```

---

## 📚 **12. LEARNING RESOURCES**

If you're new to any of these technologies:

**Expo:**
- Official docs: https://docs.expo.dev
- Expo Router guide: https://docs.expo.dev/router/introduction

**Prisma:**
- Quickstart: https://www.prisma.io/docs/getting-started/quickstart
- Schema reference: https://www.prisma.io/docs/concepts/components/prisma-schema

**React Query:**
- Tutorial: https://tanstack.com/query/latest/docs/react/quick-start

**TypeScript:**
- Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

---

## ❓ **13. COMMON QUESTIONS**

**Q: How long does Phase 1 take to build?**
A: 2-3 weeks full-time, 4-6 weeks part-time

**Q: Can I use MySQL instead of PostgreSQL?**
A: Yes, just change Prisma datasource provider

**Q: Do I need a Mac for iOS development?**
A: No! Expo cloud builds work on any computer

**Q: What if I want to add a feature not in Phase 1?**
A: Phase 2 and 3 add tons more features. Or modify the prompt!

**Q: Can I skip the offline functionality?**
A: Yes, but users will be frustrated when they have no signal

**Q: How much does deployment cost?**
A: Can be free (Railway/Render free tiers) or ~$5-20/month for production

**Q: What if my API URL changes?**
A: Use environment variables (EXPO_PUBLIC_API_URL)

---

## ✅ **PHASE 1 CHECKLIST**

Before moving to Phase 2, verify:

**Backend:**
- [ ] PostgreSQL database created
- [ ] Prisma schema defined with 3 models
- [ ] Migration run successfully
- [ ] All 15+ API endpoints working
- [ ] JWT authentication tested
- [ ] Deployed to hosting provider
- [ ] Environment variables configured
- [ ] API accessible via HTTPS

**Mobile:**
- [ ] Expo project created
- [ ] Login/Register screens working
- [ ] Home screen shows habits
- [ ] Can create new habits
- [ ] Can mark habits complete
- [ ] Calendar view works
- [ ] Settings screen functional
- [ ] Offline mode tested
- [ ] Sync to server working
- [ ] App runs on physical device
- [ ] TestFlight/Internal Testing setup

**Code Quality:**
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Git repository initialized
- [ ] README with setup instructions
- [ ] Environment variables documented

---

That's the complete Phase 1 breakdown!

