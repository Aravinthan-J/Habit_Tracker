# PHASE 3 FEATURES

## 1. WEB-SPECIFIC AUTHENTICATION

**Login Page (/login):**
- Clean, centered design
- Email input, password input (show/hide toggle)
- "Remember me" checkbox
- Login button (with loading state)
- "Don't have an account? Register" link
- "Forgot password?" link
- Form validation with React Hook Form + Zod
- Error messages below fields
- Social login placeholders (Google, Apple) for future

**Register Page (/register):**
- Name, email, password, confirm password inputs
- Password strength indicator (weak/medium/strong)
- Terms & Privacy checkbox
- Create Account button
- "Already have an account? Login" link
- Form validation
- Error display

**Auth Provider:**
- Check token in localStorage on mount
- Hydrate user from API
- Protect routes (redirect to /login if not authenticated)
- Auto-logout on 401 responses

## 2. RESPONSIVE DASHBOARD LAYOUT

**Desktop Layout (≥1024px):**
- Persistent sidebar on left (200px width)
- Navigation links: Home, Calendar, Habits, Analytics, Badges, Settings
- User profile section at bottom with avatar, name, logout
- Main content area with header
- Header: page title, search (future), notifications icon, theme toggle, user menu

**Tablet Layout (768px - 1023px):**
- Collapsible sidebar (hamburger menu)
- Full-width main content when sidebar collapsed

**Mobile Layout (<768px):**
- No sidebar
- Bottom navigation bar (fixed)
- 5 tabs: Home, Calendar, Habits, Badges, Settings
- Hamburger menu in header for additional options

**Theme Support:**
- Light/Dark mode toggle
- System preference detection
- Persist preference in localStorage
- Smooth transition between themes
- TailwindCSS dark: classes

## 3. HOME PAGE - TODAY'S HABITS

**Desktop View:**
- 2-3 column grid of habit cards
- Large, clickable checkboxes
- Each card shows:
  - Habit icon (colored circle)
  - Habit title
  - Checkbox (left or right side)
  - Current streak (🔥 5 days)
  - Monthly progress (12/20)
  - Progress bar
- Completed habits: checkmark, subtle opacity, strikethrough title
- Empty state: "No habits yet" with CTA button
- Quick stats at top: "3/8 completed today" with circular progress
- Date display: "Today • Sunday, January 18, 2026"
- Floating "+" button (bottom right) to add habit

**Mobile View:**
- Single column list
- Compact cards
- Same information, optimized for touch

**Interactions:**
- Click checkbox: mark complete/incomplete (optimistic update)
- Smooth animation on check (scale, color transition)
- Confetti animation on first completion of the day
- Click card (not checkbox): navigate to habit detail
- Pull-to-refresh (desktop: refresh button)

## 4. CALENDAR PAGE

**Desktop Layout:**
- Month selector at top (dropdown or arrows)
- Full month calendar grid (7 columns, 5-6 rows)
- Each day cell shows:
  - Day number (top-left)
  - Colored dots for completed habits (max 6 visible, "+2 more")
  - Different cell style for: today, selected day, other months
- Legend at top showing habit colors
- Click day: open modal/sidebar with all habits for that day
- Keyboard navigation: arrow keys to move, Enter to select

**Day Detail View:**
- Sidebar or modal shows selected date
- List of all habits with completion status
- Toggle completion from this view
- Show streak information
- "Complete all" button

**Month Navigation:**
- Previous/Next month buttons
- Month/Year dropdowns
- "Today" button to jump to current month
- Keyboard shortcuts: [ ] for prev/next month

**Heatmap View Toggle:**
- Switch between calendar and GitHub-style heatmap
- Heatmap shows intensity (0-100% completion)
- Tooltip on hover: "15/20 habits • 75%"

## 5. HABITS PAGE

**List View:**
- Search bar at top (filter by title)
- Habit cards in grid (desktop: 2-3 columns, mobile: 1 column)
- Each card shows:
  - Icon, title, color indicator
  - Monthly progress: "15/20 this month" with progress bar
  - Current streak
  - Completion percentage (this month)
  - Edit/Delete buttons (show on hover on desktop)
- Sort options: Alphabetical, Most completed, Longest streak, Recently added
- Filter: Active, Archived, All
- Bulk actions: Select multiple, archive, delete

**Add/Edit Habit Form:**
- Modal or full page
- Fields:
  - Title (required, max 100 chars)
  - Monthly goal (number input, 1-31, default 20)
  - Color picker (8 preset colors + custom hex input)
  - Icon picker (grid of 20+ icons: workout, book, meditation, coffee, water, etc.)
  - Notifications toggle
  - Reminder time (time picker, only if notifications enabled)
  - Category (optional, for organization)
- Save/Cancel buttons
- Delete button (edit only, with confirmation dialog)
- Real-time validation
- Preview card showing how it will look

**Habit Detail Page:**
- Large stats card:
  - Current streak, longest streak
  - Total completions
  - Completion rate (last 30 days, last 90 days, all time)
- Monthly calendar showing completions for this habit only
- Line chart: completions over time (last 3 months)
- Achievements earned with this habit
- Edit/Delete buttons

## 6. ANALYTICS PAGE

**Overview Stats (Top):**
- 4 stat cards:
  - Total habits tracked
  - Current active habits
  - Total completions
  - Average completion rate
- Date range selector: Last 7 days, 30 days, 90 days, This year, All time

**Charts Section:**

**Line Chart - Daily Consistency:**
- X-axis: dates
- Y-axis: % of habits completed
- Shows trend over selected date range
- Hover: tooltip with exact percentage and date
- Smooth curved line

**Donut Chart - Overall Completion:**
- Center: large percentage (e.g., 73%)
- Ring: completed vs. not completed
- Legend: "18 completed • 7 missed"

**Bar Chart - Weekly Comparison:**
- Compare last 4 weeks
- X-axis: Week 1, 2, 3, 4
- Y-axis: completion count
- Different color for each week
- Hover: show exact numbers

**Heatmap Calendar - Contribution Style:**
- GitHub-style heatmap
- Last 12 months of data
- Color intensity: light (0%) to dark (100%)
- Hover: "Jan 18: 5/8 habits • 62%"
- Click: navigate to that day's detail

**Top Habits Leaderboard:**
- Ranked list (1-10)
- Shows: rank, habit name, completion rate, streak
- Visual bars for comparison

**Insights Section:**
- AI-generated or calculated insights:
  - "Your best day is Monday (85% completion)"
  - "You've completed meditation 21 days in a row! 🔥"
  - "Your completion rate increased 15% this month"
  - "You're most consistent in the morning"

**Export Options:**
- Export charts as PNG
- Export data as CSV
- Export full report as PDF (with all charts and stats)

## 7. BADGES PAGE

**Badge Showcase Grid:**
- Card-based layout (3-4 columns on desktop)
- Each badge shows:
  - Large badge icon (with tier color: bronze, silver, gold, platinum)
  - Badge name
  - Description
  - Requirement (e.g., "Complete 21 days in a row")
  - Earned date (if unlocked) or progress bar (if locked)
  - Rarity: "Earned by 12% of users"
- Unlocked badges: full color, glow effect
- Locked badges: grayscale, "locked" icon overlay

**Badge Categories Tabs:**
- All
- Streak Badges (21, 45, 100, 365 days)
- Completion Badges (Perfect Week, Perfect Month, Comeback Kid, Early Bird, Night Owl)
- Volume Badges (100, 500, 1000, 5000 completions)
- Step Badges (10K Walker, Marathon Month, Distance milestones)
- Special Badges (unique achievements)

**Badge Detail Modal:**
- Large badge icon with animation
- Full description
- Unlock requirements
- Tips on how to earn it
- Related habits that count toward it
- Progress tracker (if not yet earned)

**Badge Unlock Celebration:**
- Modal with confetti animation (react-confetti)
- Large badge icon with shine/glow effect
- "Congratulations! Badge Unlocked!" message
- Badge details
- Social share buttons (Twitter, LinkedIn, copy link)
- "View Badge Collection" button

**Progress Section:**
- "Badges in Progress" at top
- Shows closest badges to unlocking
- Progress bars: "15/21 days • 71%"
- Motivational message: "Keep going! 6 more days to unlock 21-Day Warrior"

## 8. STEP TRACKING INTEGRATION

**Step Dashboard (in Analytics or separate tab):**
- Large daily step counter with circular progress ring
- Daily goal: 10,000 steps (customizable)
- Current steps: "7,234 steps • 72% of goal"
- Distance: "5.8 km"
- Calories estimate: "~350 kcal"

**Step Input Methods:**
- Manual entry: number input, save button
- Auto-sync: Connect Google Fit / Apple Health (future, show placeholder)
- Import: CSV upload with date, steps columns

**Step Charts:**
- Weekly bar chart: steps per day (last 7 days)
- Monthly line chart: average steps per day
- Heatmap calendar: color intensity by step count

**Step Statistics:**
- Total lifetime steps
- Total distance (km/miles toggle)
- Average steps per day (last 30 days)
- Best day (max steps)
- Current streak (days above goal)

**Habit-Step Correlation:**
- Insight card: "On days with 10K+ steps, you complete 85% more habits"
- Scatter plot: X-axis steps, Y-axis habit completion %
- Encouragement to stay active

## 9. ADVANCED EXPORT FEATURES

**PDF Export:**
- Generate comprehensive monthly/yearly reports
- Include:
  - Cover page with date range, user name
  - Summary statistics (completions, streaks, badges earned)
  - All charts (line, donut, bar, heatmap)
  - Top habits table
  - Calendar view with completions
  - Achievements list
- Professional styling with habit tracker branding
- Download as "Habit-Report-Jan-2026.pdf"

**CSV Export:**
- Export all habits with metadata (title, goal, created date)
- Export all completions with dates
- Export daily summary (date, total habits, completed, percentage)
- Excel-compatible format
- Download as "habits-export-2026-01-18.csv"

**JSON Export:**
- Full data backup
- Includes: user profile, all habits, all completions, badges, settings
- Can be imported for restore
- Download as "habit-tracker-backup-2026-01-18.json"

**Excel Export (XLSX):**
- Multi-sheet workbook:
  - Sheet 1: Summary stats
  - Sheet 2: Habits list
  - Sheet 3: Daily completions (pivot table style)
  - Sheet 4: Monthly progress
- Formatted with colors, conditional formatting
- Charts embedded
- Download as "habit-tracker-2026.xlsx"

**Print-Friendly Views:**
- CSS print styles for any page
- Clean, optimized layouts
- Remove nav, buttons, keep essential content
- Black & white friendly

**Calendar Integration Export:**
- Export habits to Google Calendar (ICS format)
- Each habit as recurring event
- Completion marked as completed event
- Download as "habits.ics"

## 10. KEYBOARD SHORTCUTS

**Global Shortcuts:**
- `Cmd/Ctrl + K`: Open command palette (search habits, navigate)
- `Cmd/Ctrl + N`: Create new habit
- `Cmd/Ctrl + /`: Show keyboard shortcuts help
- `Cmd/Ctrl + D`: Toggle dark mode
- `Esc`: Close modals/dialogs

**Navigation Shortcuts:**
- `G then H`: Go to Home
- `G then C`: Go to Calendar
- `G then B`: Go to Habits (Browse)
- `G then A`: Go to Analytics
- `G then S`: Go to Settings

**Home Page Shortcuts:**
- `1-9`: Toggle habit completion (first 9 habits)
- `Spacebar`: Toggle selected habit
- `Up/Down arrows`: Navigate habit list
- `Enter`: View habit detail

**Calendar Page Shortcuts:**
- `Left/Right arrows`: Previous/Next day
- `Up/Down arrows`: Previous/Next week
- `[` / `]`: Previous/Next month
- `T`: Go to today
- `Enter`: Open selected day detail

**Habits Page Shortcuts:**
- `/`: Focus search
- `N`: New habit
- `E`: Edit selected habit
- `Delete/Backspace`: Delete selected habit (with confirmation)

**Keyboard Shortcuts Help Modal:**
- Triggered by `Cmd/Ctrl + /`
- Shows all available shortcuts organized by section
- Searchable list

## 11. PROGRESSIVE WEB APP (PWA)

**PWA Setup:**
- Service Worker with Workbox
- Offline functionality (cache API responses)
- Install prompt: "Install Habit Tracker" banner
- App-like experience when installed

**Manifest Configuration:**
- App name: "Ultimate Habit Tracker"
- Short name: "Habits"
- Icons: 192x192, 512x512 (maskable and any)
- Theme color: #6C63FF
- Background color: #FFFFFF (light) / #1A1A2E (dark)
- Display: standalone
- Start URL: /
- Scope: /

**Offline Strategy:**
- Cache-first for static assets (JS, CSS, images)
- Network-first for API calls (with cache fallback)
- Background sync for failed requests
- Show offline indicator in UI
- Queue mutations (habit creation, completions) when offline
- Sync queue when back online

**Web Push Notifications:**
- Request permission on login or first habit creation
- Daily reminder at set time (8 PM default)
- Badge unlock notifications
- Streak milestone notifications
- Settings to enable/disable, set time
- Notification clicks: deep link to relevant page

**Install Prompt:**
- Custom UI (not browser default)
- Show after 3 visits or 1 week of use
- "Install Habit Tracker for quick access"
- Can be dismissed and won't show again for 30 days
- Shows benefits: "Access offline, faster loading, desktop icon"

## 12. SETTINGS PAGE

**Profile Section:**
- Avatar upload (future, show placeholder)
- Name (editable)
- Email (display only)
- Member since date

**Preferences:**
- Daily step goal (1000-50000, default 10000)
- Default reminder time (time picker)
- Timezone (dropdown)
- Theme (Light, Dark, System)
- Start of week (Sunday/Monday)
- Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Language (English only for Phase 3, show dropdown for future)

**Notifications:**
- Enable/disable web push notifications
- Daily reminder toggle
- Reminder time
- Badge unlock notifications
- Weekly summary email (future, show toggle)

**Data & Privacy:**
- Export data button (CSV, JSON, Excel options)
- Import data (JSON backup restore)
- Delete account (with confirmation, explains data loss)

**Account Security:**
- Change password form
- Email verification status
- Two-factor authentication (future, show placeholder)

**About:**
- App version
- Privacy Policy link
- Terms of Service link
- Contact Support
- Changelog/What's New

## 13. INDEXEDDB OFFLINE STORAGE

**Database Schema (Dexie.js):**
- `users` table: id, email, name, preferences
- `habits` table: id, userId, title, monthlyGoal, color, icon, settings, timestamps
- `completions` table: id, habitId, userId, date, completedAt, synced
- `badges` table: id, badgeType, earnedDate, synced
- `steps` table: id, userId, date, steps, distance, synced
- `sync_queue` table: id, operation, data, timestamp, retries

**Local Storage Service:**
- `saveHabit()`, `getHabits()`, `updateHabit()`, `deleteHabit()`
- `saveCompletion()`, `getCompletions()`, `deleteCompletion()`
- `saveBadge()`, `getBadges()`
- `saveSteps()`, `getSteps()`
- `queueSyncOperation()`, `getPendingSyncOperations()`, `clearSyncOperation()`

**Sync Strategy:**
- On user action: save to IndexedDB immediately, update UI
- Queue API call in sync_queue
- Background process: check queue every 30 seconds
- If online: send queued operations to API
- On success: clear from queue, mark as synced
- On failure: retry with exponential backoff (max 5 retries)
- Pull latest data from API every 5 minutes when online

**Conflict Resolution:**
- Server wins for conflicts
- Show warning if local changes will be overwritten
- Option to keep local or accept server (future)

## 14. RESPONSIVE DESIGN BREAKPOINTS

**Mobile (<768px):**
- Single column layouts
- Bottom navigation (fixed)
- Full-width cards
- Touch-optimized buttons (min 44px height)
- Simplified charts (smaller legends)

**Tablet (768px - 1023px):**
- 2-column grids
- Collapsible sidebar
- Medium-sized cards
- Adapted charts

**Desktop (≥1024px):**
- 3-column grids
- Persistent sidebar
- Hover states everywhere
- Full-featured charts
- Keyboard shortcuts active

**Large Desktop (≥1440px):**
- 4-column grids for cards
- Wider sidebar (240px)
- More whitespace
- Larger charts

## 15. PERFORMANCE OPTIMIZATIONS

**Code Splitting:**
- Route-based code splitting (Next.js automatic)
- Dynamic imports for heavy components (charts, confetti)
- Lazy load images

**Data Fetching:**
- React Query with stale-while-revalidate
- Prefetch on hover (habit detail, calendar month)
- Infinite scroll for long lists (if >100 habits)
- Pagination for completions

**Caching:**
- React Query cache: 5 minutes for habits, 1 minute for completions
- Service Worker cache: 1 week for static assets
- IndexedDB: indefinite until cleared

**Rendering:**
- Use React.memo for expensive components
- useMemo for complex calculations (streak, stats)
- useCallback for event handlers
- Virtual scrolling for very long lists (if needed)
- Debounce search inputs (300ms)

**Bundle Size:**
- Tree-shaking (Next.js automatic)
- Remove unused Shadcn components
- Optimize images (WebP format, responsive sizes)
- Use SVG for icons (not icon fonts)

**Lighthouse Targets:**
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 90+
- PWA: 100 (when installed)

## 16. ACCESSIBILITY (WCAG 2.1 AA)

**Keyboard Navigation:**
- All interactive elements focusable
- Focus indicators (visible outline)
- Tab order logical
- Skip to main content link
- Arrow key navigation in calendar

**Screen Reader Support:**
- Semantic HTML (header, nav, main, article, aside, footer)
- ARIA labels on icons, buttons
- ARIA live regions for dynamic content (toast notifications)
- Alt text for images
- Form labels properly associated

**Color Contrast:**
- Minimum 4.5:1 for normal text
- 3:1 for large text (18px+)
- Color not sole indicator (use icons + text)

**Responsive Text:**
- Minimum 16px base font size
- Scalable fonts (rem units)
- Supports browser zoom up to 200%

**Form Accessibility:**
- Clear error messages
- Error summary at top of form
- Focus on first error field
- Inline validation (not just on submit)

## 17. ERROR HANDLING & EDGE CASES

**API Errors:**
- Network errors: Show "Can't connect. Check internet." with retry button
- 401 Unauthorized: Auto-logout, redirect to login
- 403 Forbidden: Show "Access denied" message
- 404 Not Found: Show "Resource not found"
- 500 Server Error: Show "Something went wrong. Try again later."
- Timeout: Show "Request took too long. Try again."

**Form Errors:**
- Required fields highlighted
- Validation messages below fields
- Prevent submit if errors
- Clear errors on input change

**Edge Cases:**
- No habits: Empty state with "Create your first habit" CTA
- No completions: Empty calendar, empty charts with message
- Deleted habit: Remove from UI immediately, queue API call
- Offline: Show banner "You're offline. Changes will sync when online."
- Failed sync: Show notification "Some changes couldn't sync. Retrying..."
- Long habit titles: Truncate with ellipsis, show full on hover
- Many habits (99): Virtual scrolling, pagination, or lazy load
- Leap years: Handle Feb 29 correctly
- Timezone changes: Recalculate streaks