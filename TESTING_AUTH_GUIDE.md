# Authentication Testing Guide

## What's Been Implemented

### Components Created
1. **Button Component** (`src/components/common/Button.tsx`)
   - Primary, secondary, outline, and text variants
   - Loading states with spinner
   - Disabled states
   - Fully customizable

2. **Input Component** (`src/components/common/Input.tsx`)
   - Email, password, and text inputs
   - Icon support
   - Error validation display
   - Show/hide password toggle
   - Focus states

3. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Login mutation with React Query
   - Register mutation with React Query
   - Logout functionality
   - Auth state hydration from storage
   - Error handling

4. **LoginScreen** (`src/screens/auth/LoginScreen.tsx`)
   - Email and password inputs
   - Form validation
   - Error messages
   - Loading states
   - Navigation to register

5. **RegisterScreen** (`src/screens/auth/RegisterScreen.tsx`)
   - Name, email, password, and confirm password inputs
   - Real-time password requirements validation
   - Visual indicators for password strength
   - Form validation
   - Navigation to login

## How to Test in Expo

### Step 1: Start the Backend

```bash
# Navigate to the backend directory
cd apps/backend

# Make sure PostgreSQL is running
pg_isready

# If database doesn't exist, create it
createdb habit_tracker

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database with test data
npx prisma db seed

# Start the backend server
npm run dev
```

The backend should now be running on `http://localhost:3000`

### Step 2: Get Your Local IP Address

The mobile app needs to connect to your backend. Find your computer's local IP:

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your IP address (something like `192.168.1.xxx` or `192.168.29.xxx`)

### Step 3: Update API URL in Mobile App

Edit `apps/mobile/src/utils/apiClient.ts` and update the IP address:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:3000/api'  // Replace with your IP
  : 'https://your-production-api.com/api';
```

For example:
```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:3000/api'
  : 'https://your-production-api.com/api';
```

### Step 4: Start Expo

```bash
# Navigate to the mobile directory
cd apps/mobile

# Start Expo
npx expo start
```

### Step 5: Run on Device/Simulator

**For iOS Simulator (Mac only):**
- Press `i` in the Expo terminal
- Or run: `npx expo start --ios`

**For Android Emulator:**
- Press `a` in the Expo terminal
- Or run: `npx expo start --android`

**For Physical Device:**
1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in the terminal
3. Make sure your phone is on the same WiFi network as your computer

## Testing the Authentication Flow

### Test Case 1: Registration

1. You should see the **Login Screen** first
2. Tap "Sign Up" at the bottom
3. Fill in the registration form:
   - **Name**: John Doe
   - **Email**: test@example.com
   - **Password**: Test1234
   - **Confirm Password**: Test1234

4. Watch the password requirements update in real-time:
   - ✓ At least 8 characters
   - ✓ One uppercase letter
   - ✓ One number

5. Tap "Create Account"
6. You should see a loading spinner
7. If successful, you'll be logged in automatically

### Test Case 2: Login

1. If you're logged in, you need to log out first (we'll implement this later)
2. On the **Login Screen**, enter:
   - **Email**: test@example.com
   - **Password**: Test1234

3. Tap "Login"
4. You should see a loading spinner
5. If successful, you'll be redirected to the app

### Test Case 3: Validation Errors

**Invalid Email:**
1. Enter: `notanemail`
2. Tab to the next field
3. You should see: "Invalid email address" in red

**Password Too Short:**
1. In Register screen, enter a password like "Test1"
2. Watch the requirements:
   - ✓ At least 8 characters (not met)
   - ✓ One uppercase letter (met)
   - ✓ One number (met)

**Passwords Don't Match:**
1. Password: Test1234
2. Confirm Password: Test123
3. You should see: "Passwords do not match"

### Test Case 4: API Errors

**Duplicate Email:**
1. Try registering with an email that already exists
2. You should see an alert: "Email already registered" or similar

**Wrong Password:**
1. Try logging in with the wrong password
2. You should see an alert: "Invalid email or password"

## Expected Behavior

### ✅ What Should Work

1. **Form Validation**
   - Email format validation
   - Password requirements validation
   - Confirm password matching
   - Real-time validation feedback

2. **Loading States**
   - Button shows spinner while loading
   - Button is disabled while loading
   - Form is disabled while submitting

3. **Error Display**
   - Validation errors show below inputs
   - API errors show in alerts
   - Errors are red and easy to see

4. **Navigation**
   - Login → Register
   - Register → Login
   - Auto-navigate after successful login/register

5. **Password Visibility**
   - Eye icon to show/hide password
   - Works on both password fields

6. **Keyboard Handling**
   - Keyboard doesn't cover inputs
   - Tap outside to dismiss keyboard
   - Tab to next field works

### ❌ Known Limitations

1. **No "Forgot Password" yet** - This will be implemented in Phase 2
2. **No onboarding tutorial** - Planned for later
3. **No logout button on screens** - Will be in Settings screen
4. **Backend must be running locally** - Not deployed yet

## Troubleshooting

### Backend Connection Issues

**Error: "Network request failed"**
- Check if backend is running: `curl http://localhost:3000/api/auth/me`
- Verify your IP address in `apiClient.ts`
- Make sure your phone/emulator can reach your computer

**Error: "Connection refused"**
- Backend might not be running
- Wrong port (should be 3000)
- Firewall blocking connections

### Database Issues

**Error: "Database connection failed"**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (Mac with Homebrew)
brew services start postgresql@14

# Or on Linux
sudo systemctl start postgresql
```

**Error: "Table doesn't exist"**
```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
```

### Expo Issues

**Metro bundler errors:**
```bash
# Clear cache
npx expo start -c

# Or
rm -rf node_modules
npm install
```

**iOS Simulator not opening:**
```bash
# Make sure Xcode is installed
xcode-select --install

# Run again
npx expo start --ios
```

## Next Steps

After authentication is working, we'll implement:

1. **HomeScreen** - Display today's habits
2. **HabitCard Component** - Show habit with checkbox
3. **useHabits Hook** - Fetch and manage habits
4. **useCompletions Hook** - Mark habits complete
5. **AddHabitScreen** - Create new habits

## Test Credentials

If you used the seed script, you can use:
- **Email**: test@example.com
- **Password**: Test1234

Or register a new account through the app!

## Notes

- The app uses AsyncStorage for token storage (secure enough for development)
- JWT tokens expire after 7 days
- React Query automatically handles caching and refetching
- All forms have proper TypeScript types
- Components are reusable across the app

Happy testing! 🎉
