You are a senior full-stack developer building Phase 1 of the "Ultimate Monthly Habit Tracker" application. Generate complete, production-ready code for a monorepo containing a Node.js backend API and React Native mobile app with user authentication and core habit tracking features.

# PROJECT OVERVIEW

Build a monorepo with:
1. **Backend API** - Node.js + Express + Prisma + PostgreSQL + JWT authentication
2. **Mobile App** - React Native + TypeScript + offline-first architecture
3. **Shared Packages** - Types, utilities, and API client

# TECH STACK

**Backend:**
- Node.js 20+, Express.js, TypeScript
- Prisma ORM, PostgreSQL
- JWT authentication, bcrypt
- Zod validation, cors, helmet

**Mobile:**
- React Native 0.74+, TypeScript
- React Navigation 6, React Query (TanStack Query)
- Zustand, AsyncStorage, SQLite (offline cache)
- Axios, React Native Vector Icons

**Shared:**
- TypeScript, shared types/utils, API client

# MONOREPO STRUCTURE

Generate this complete folder structure:
```
habit-tracker/
├── package.json (root workspace with Turborepo)
├── turbo.json
├── tsconfig.json
├── .gitignore
├── README.md
│
├── apps/
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.tsx (bottom tabs: Home, Calendar, Habits, Settings)
│   │   │   │   └── AuthNavigator.tsx (stack: Login, Register, Onboarding)
│   │   │   ├── screens/
│   │   │   │   ├── auth/ (LoginScreen, RegisterScreen, OnboardingScreen)
│   │   │   │   ├── home/ (HomeScreen - today's habits with checkboxes)
│   │   │   │   ├── habits/ (HabitsListScreen, AddHabitScreen, HabitDetailScreen)
│   │   │   │   ├── calendar/ (CalendarScreen - monthly view)
│   │   │   │   └── settings/ (SettingsScreen - profile, preferences)
│   │   │   ├── components/ (HabitCard, CheckboxGrid, MonthYearPicker, Button, Input, LoadingSpinner)
│   │   │   ├── services/
│   │   │   │   ├── storage/ (LocalStorageService, SecureStorageService)
│   │   │   │   ├── sync/ (SyncService - offline queue management)
│   │   │   │   └── notifications/ (NotificationService)
│   │   │   ├── hooks/ (useAuth, useHabits, useCompletions, useOfflineSync)
│   │   │   ├── store/ (authStore, offlineStore - Zustand)
│   │   │   ├── types/ (navigation.types.ts)
│   │   │   ├── utils/ (helpers.ts)
│   │   │   ├── constants/ (theme.ts - colors, fonts, spacing)
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── metro.config.js
│   │   └── babel.config.js
│   │
│   └── backend/
│       ├── src/
│       │   ├── routes/ (auth.routes, habits.routes, completions.routes, index.ts)
│       │   ├── controllers/ (AuthController, HabitController, CompletionController)
│       │   ├── services/ (AuthService, HabitService, CompletionService, TokenService)
│       │   ├── middleware/ (auth.middleware, validation.middleware, errorHandler.middleware)
│       │   ├── validators/ (auth.validator, habit.validator - using Zod)
│       │   ├── utils/ (AppError, catchAsync, response)
│       │   ├── config/ (database.ts, env.ts)
│       │   ├── types/ (express.d.ts, index.ts)
│       │   ├── server.ts
│       │   └── app.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
└── packages/
    ├── shared-types/
    │   ├── src/ (user.types, habit.types, completion.types, api.types, index.ts)
    │   ├── package.json
    │   └── tsconfig.json
    ├── shared-utils/
    │   ├── src/ (dateHelpers, streakCalculator, validators, index.ts)
    │   ├── package.json
    │   └── tsconfig.json
    └── api-client/
        ├── src/
        │   ├── services/ (ApiService, AuthApiService, HabitApiService, CompletionApiService)
        │   ├── config/ (axios.config.ts)
        │   └── index.ts
        ├── package.json
        └── tsconfig.json
```

# PHASE 1 FEATURES

## 1. USER AUTHENTICATION

**Database Schema (Prisma):**
Create User, Habit, Completion models with:
- User: id, email, password (hashed), name, preferences (stepGoal, reminderTime, timezone, theme), isEmailVerified, isActive, timestamps
- Habit: id, userId, title, monthlyGoal, color, icon, notificationsEnabled, reminderTime, createdAt, updatedAt, archivedAt
- Completion: id, habitId, userId, date (db.Date), completedAt, unique constraint on [habitId, date]

**Backend Auth Endpoints:**
- POST /api/auth/register (email, password, name) → {user, token}
- POST /api/auth/login (email, password) → {user, token}
- GET /api/auth/me (protected) → {user}
- POST /api/auth/logout (protected) → success message
- PATCH /api/auth/profile (protected) → update preferences
- POST /api/auth/change-password (protected)

**Security Requirements:**
- bcrypt password hashing (10 rounds)
- JWT tokens (7-day expiry)
- Authentication middleware (verify token, attach user to req.user)
- Email validation, password strength (min 8 chars, 1 uppercase, 1 number)
- Rate limiting on auth routes (5 attempts per 15 min)
- Helmet.js security headers, CORS

## 2. HABIT MANAGEMENT (CRUD)

**Backend Habit Endpoints:**
- POST /api/habits (protected) - create habit
- GET /api/habits (protected, query: archived) - get all user habits
- GET /api/habits/:id (protected) - get single habit
- PATCH /api/habits/:id (protected) - update habit
- DELETE /api/habits/:id (protected) - soft delete (set archivedAt)
- GET /api/habits/:id/stats (protected) - get currentStreak, longestStreak, completionRate, totalCompletions

**Validation:**
- Title: required, 1-100 chars
- MonthlyGoal: 1-31
- Color: valid hex (#RRGGBB)
- ReminderTime: HH:MM format

## 3. HABIT COMPLETIONS

**Backend Completion Endpoints:**
- POST /api/completions (protected, body: {habitId, date}) - mark complete (idempotent)
- DELETE /api/completions/:habitId/:date (protected) - unmark
- GET /api/completions (protected, query: habitId, startDate, endDate) - get filtered completions
- GET /api/completions/calendar/:year/:month (protected) - get monthly view with all completions

**Streak Calculation:**
Implement algorithm to calculate current streak and longest streak from completion dates array.

## 4. MOBILE APP - AUTHENTICATION FLOW

**Navigation:**
- Root: Conditionally render AuthNavigator or AppNavigator based on auth state
- AuthNavigator: Stack with LoginScreen, RegisterScreen, OnboardingScreen
- AppNavigator: Bottom tabs - Home, Calendar, Habits, Settings

**Auth Screens:**

**LoginScreen:**
- Email input, password input (show/hide toggle)
- Login button (call useAuth().login())
- "Register" link, "Forgot Password" link
- Loading state, error display, form validation

**RegisterScreen:**
- Name, email, password (with strength indicator), confirm password inputs
- Create Account button (call useAuth().register())
- "Already have account? Login" link
- Loading state, error display, validation

**OnboardingScreen (optional):**
- 3-4 welcome slides, "Get Started" button, skip option

**Auth State Management (Zustand):**
- authStore: user, token, isAuthenticated, isLoading
- Methods: setAuth, clearAuth, setLoading, hydrate (from AsyncStorage)
- useAuth hook: login mutation, register mutation, logout function

**Secure Token Storage:**
- SecureStorageService using @react-native-async-storage/async-storage
- Methods: saveToken, getToken, removeToken, saveUser, getUser, removeUser

## 5. MOBILE APP - HABIT TRACKING UI

**HomeScreen (Today's Habits):**
- Display current date
- List all active habits with checkboxes
- Tap checkbox to mark complete/incomplete (optimistic update)
- Visual indicators: green checkmark, strikethrough for completed
- Show current streak badge (🔥 5 days)
- Empty state message
- Floating "+" button to add habit
- Pull-to-refresh (sync with server)

**HabitsListScreen:**
- Search bar (filter by title)
- List all habits with: title, icon, color, monthly progress (15/20), progress bar
- Edit/delete buttons (with confirmation)
- Floating "+" button
- Pull-to-refresh

**AddHabitScreen / EditHabitScreen:**
- Form: title (required), monthly goal (1-31, default 20), color picker (6-8 presets), icon picker (10-20 icons), notifications toggle, reminder time picker
- Save/Cancel buttons, Delete (edit only)
- Validation errors below fields

**CalendarScreen:**
- Month/Year selector at top
- Calendar grid for selected month
- Each date shows: day number, colored dots for completed habits (max 5 visible)
- Tap date to see all habits
- Previous/Next month navigation
- Auto-fetch completions on month change

**Components:**

**HabitCard:**
- Icon (colored circle), title, large checkbox, streak badge, monthly progress text
- Tap card (not checkbox) to navigate to HabitDetailScreen

**CheckboxGrid:**
- Unchecked: empty circle (border), Checked: filled circle with checkmark (animated)
- Haptic feedback, loading/disabled states

**MonthYearPicker:**
- Month dropdown (Jan-Dec), Year dropdown (±5 years from current)
- onChange callback to reload data

## 6. OFFLINE-FIRST FUNCTIONALITY

**Local Database (SQLite):**
- LocalStorageService with methods:
  - Habits: saveHabits, getHabits, getHabit, updateHabit, deleteHabit
  - Completions: saveCompletion, deleteCompletion, getCompletions, getMonthlyCompletions
  - Sync queue: queueOperation, getPendingOperations, clearOperation

**Sync Strategy:**
- Offline: save to SQLite immediately, queue sync operation, update UI instantly, show "offline" indicator
- Online: process sync queue, push to server, pull latest, resolve conflicts (server wins), update local DB, clear indicator
- Auto-sync every 5 minutes when online
- Network listener to trigger sync on reconnect

**Sync Operations Queue:**
Store operations like: {id, type: 'CREATE_HABIT' | 'UPDATE_HABIT' | 'MARK_COMPLETE' | 'MARK_INCOMPLETE', data, timestamp}

## 7. API CLIENT LAYER

**Axios Configuration:**
- Base URL from env
- Request interceptor: attach JWT from SecureStorageService
- Response interceptor: handle 401 (clear token, navigate to login)
- 10s timeout

**API Service Classes:**
- AuthApiService: register, login, logout, getCurrentUser, updateProfile
- HabitApiService: getAll, getById, create, update, delete, getStats
- CompletionApiService: create, delete, getAll, getMonthlyCalendar

All using axios instance with proper error handling.

## 8. SHARED PACKAGES

**shared-types:**
- User, RegisterData, LoginCredentials, AuthResponse, ProfileUpdates
- Habit, CreateHabitData, UpdateHabitData, HabitStats, MonthlyProgress
- Completion, CreateCompletionData, CompletionFilters, MonthlyCalendar, DayCompletion
- ApiError, ValidationError, ApiResponse, PaginationParams, PaginatedResponse

**shared-utils:**
- dateHelpers: formatDate, getToday, getMonthDates, isToday, isSameDay, getDaysInMonth, getMonthName, addDays, subtractDays, daysBetween
- streakCalculator: calculateStreak (returns currentStreak, longestStreak), calculateCompletionRate, calculateMonthlyProgress
- validators: validateEmail, validatePassword, validateHabitTitle, validateMonthlyGoal, validateHexColor, validateDate

## 9. BACKEND IMPLEMENTATION DETAILS

**Error Handling:**
- AppError class: statusCode, code, isOperational
- Specific errors: ValidationError (400), UnauthorizedError (401), NotFoundError (404), ConflictError (409)
- catchAsync utility wrapper
- Global errorHandler middleware (handle Prisma errors, AppErrors, default 500)

**Middleware:**
- authenticate: verify JWT, attach user to req.user, throw 401 if invalid
- validate: Zod schema validation, return 400 with field errors
- errorHandler: centralized error response formatting

**Service Layer:**
- AuthService: register (check existing, hash password, create user, generate token), login (find user, verify password, generate token), getCurrentUser, updateProfile, changePassword
- HabitService: create, getAll (filter archived), getById (verify ownership), update (verify ownership), delete (soft delete), getStats (calculate streaks using shared utils)
- CompletionService: create (upsert, idempotent), delete, getAll (with filters), getMonthlyCalendar (group by date)
- TokenService: generateToken (7d expiry), verifyToken, generateRefreshToken (30d)

**Controllers:**
- AuthController: register, login, getCurrentUser, updateProfile, changePassword, logout
- HabitController: create, getAll, getById, update, delete, getStats
- CompletionController: create, delete, getAll, getMonthlyCalendar
All using catchAsync wrapper

**Routes:**
- auth.routes: /register, /login, /me, /logout, /profile, /change-password
- habits.routes: All protected, /, /:id, /:id/stats
- completions.routes: All protected, /, /:habitId/:date, /calendar/:year/:month
- index.ts: combine all routes under /api prefix

**Validation Schemas (Zod):**
- registerSchema: email (email format), password (min 8, uppercase, number), name (optional)
- loginSchema: email, password
- updateProfileSchema: name, stepGoal (1000-50000), reminderTime (HH:MM), timezone, theme (light/dark)
- createHabitSchema: title (1-100), monthlyGoal (1-31), color (hex), icon, notificationsEnabled, reminderTime
- updateHabitSchema: same as create but all optional
- createCompletionSchema: habitId (uuid), date (YYYY-MM-DD)

# CODE GENERATION INSTRUCTIONS

Generate complete, production-ready code with:

1. **Root package.json** with workspace configuration (Turborepo)
2. **turbo.json** with build pipeline
3. **Backend:**
   - prisma/schema.prisma with all models
   - Complete Express app setup (app.ts, server.ts)
   - All routes, controllers, services, middleware, validators
   - Error handling, JWT auth, database config
   - .env.example with required variables
   - README with setup instructions

4. **Mobile App:**
   - Complete navigation setup
   - All screens with full UI implementation
   - All components (HabitCard, CheckboxGrid, etc.)
   - Services (storage, sync, notifications)
   - Hooks (useAuth, useHabits, useCompletions)
   - Zustand stores
   - App.tsx with providers
   - package.json with all dependencies

5. **Shared Packages:**
   - Complete TypeScript types
   - All utility functions with implementations
   - API client services with error handling
   - Proper package.json and tsconfig for each

# CODE QUALITY STANDARDS

- TypeScript strict mode
- Comprehensive JSDoc comments
- Try-catch blocks for async operations
- Loading states for all async UI actions
- Empty states with helpful messages
- Proper useEffect cleanup
- useMemo/useCallback for optimization
- Accessibility props (accessibilityLabel, accessibilityHint)
- No placeholder comments or TODO in critical logic
- Consistent error handling patterns
- Proper HTTP status codes
- Validation on both client and server

# DELIVERABLES

Provide complete code for:
1. Root workspace configuration
2. Backend API (all files)
3. Mobile app (all files)
4. All 3 shared packages
5. Setup/installation README
6. Database migration instructions
7. Environment variable documentation

Start with the Prisma schema and backend structure, then move to shared packages, then mobile app. Generate working, tested code with no placeholders.

# EXECUTION

Begin code generation now. Start with:
1. Root package.json and turbo.json
2. Prisma schema
3. Backend core (app.ts, server.ts, database config)
4. Then proceed systematically through all modules.

Generate complete files with proper imports, exports, and error handling.