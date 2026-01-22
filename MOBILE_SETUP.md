# Mobile App Setup Guide

Complete guide to run the Expo mobile app and connect it to the backend.

## ✅ Prerequisites

Before starting, ensure you have:
- ✅ Backend API running on http://localhost:3000
- ✅ Node.js 20+ installed
- ✅ npm 9+ installed

## 📱 Step 1: Install Expo CLI (Optional)

```bash
npm install -g expo-cli
```

> **Note**: Not required! You can use `npx expo` instead.

## 📦 Step 2: Install Dependencies

From the **root** of the monorepo:

```bash
cd /Users/aravinthan/Documents/Habit_Tracker
npm install
```

This installs dependencies for all packages including the mobile app.

## 🔧 Step 3: Configure API URL

The mobile app needs to know where your backend is running.

**Option A: Running on iOS Simulator (Recommended for Mac)**

No changes needed! The default `localhost:3000` works.

**Option B: Running on Android Emulator**

Edit `apps/mobile/src/services/api/apiClient.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'  // Android emulator
  : 'https://your-production-api.com/api';
```

**Option C: Running on Physical Device**

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig
   ```

2. Update `apps/mobile/src/services/api/apiClient.ts`:
   ```typescript
   const API_BASE_URL = __DEV__
     ? 'http://192.168.1.XXX:3000/api'  // Your computer's IP
     : 'https://your-production-api.com/api';
   ```

3. Make sure your phone and computer are on the **same WiFi network**.

## 🚀 Step 4: Start the Mobile App

```bash
cd apps/mobile
npx expo start
```

You should see:
```
 › Metro waiting on exp://192.168.x.x:8081
 › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

 › Press a │ open Android
 › Press i │ open iOS simulator
 › Press w │ open web

 › Press r │ reload app
 › Press m │ toggle menu
```

## 📲 Step 5: Run the App

### Option A: iOS Simulator (Mac only)

1. Press `i` in the terminal
2. Wait for iOS Simulator to open
3. App will load automatically

### Option B: Android Emulator

1. Start Android Emulator first:
   - Open Android Studio
   - Tools → AVD Manager → Start emulator

2. Press `a` in the Expo terminal
3. App will load automatically

### Option C: Physical Device (Easiest!)

1. **Install Expo Go**:
   - iOS: [App Store](https://apps.apple.com/app/apple-store/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR Code**:
   - iOS: Open Camera app, point at QR code
   - Android: Open Expo Go app, tap "Scan QR Code"

3. App will load on your phone!

## 🧪 Step 6: Test the App

### Test Login

If you seeded your backend database:
- **Email**: test@example.com
- **Password**: Test1234

### Test Registration

1. Tap "Don't have an account? Sign Up"
2. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Password: Test1234
   - Confirm Password: Test1234
3. Tap "Create Account"

You should be logged in and see the Home screen!

## 🔍 Troubleshooting

### "Network request failed"

**Cause**: App can't connect to backend

**Solutions**:
1. **Verify backend is running**:
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"success":true,"message":"API is running"}`

2. **Check API URL** in `apps/mobile/src/services/api/apiClient.ts`

3. **For physical device**: Use your computer's IP, not localhost

4. **Firewall**: Make sure port 3000 is not blocked

### "Unable to resolve module"

**Cause**: Dependencies not installed or cache issue

**Solution**:
```bash
# Clear cache and reinstall
cd apps/mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### "Error loading auth state"

**Cause**: SecureStore permission issue

**Solution**: Delete and reinstall the app. This happens sometimes on first install.

### Android emulator can't connect

**Solution**: Use `10.0.2.2` instead of `localhost` or `127.0.0.1`

```typescript
// In apps/mobile/src/services/api/apiClient.ts
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### Metro bundler cache issues

**Solution**:
```bash
npx expo start --clear
```

## 🎯 What's Working

- ✅ **User Registration**: Create new account
- ✅ **User Login**: Sign in with credentials
- ✅ **Secure Storage**: Tokens stored securely
- ✅ **Form Validation**: Email and password validation
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading States**: Loading indicators during API calls
- ✅ **Auto Login**: Stays logged in after app restart

## 🚧 Coming Next

- Home screen with habit list
- Add/Edit habit functionality
- Habit completion tracking
- Calendar view
- Offline-first SQLite storage
- Sync queue

## 📝 API Endpoints Being Used

Current screens use these endpoints:

**Registration**:
```
POST http://localhost:3000/api/auth/register
Body: { email, password, name }
```

**Login**:
```
POST http://localhost:3000/api/auth/login
Body: { email, password }
```

**Logout**:
```
POST http://localhost:3000/api/auth/logout
Headers: Authorization: Bearer <token>
```

## 🎨 App Structure

```
Mobile App
├── Auth Flow (Not Logged In)
│   ├── Login Screen
│   └── Register Screen
│
└── Main App (Logged In)
    └── Home Screen (placeholder)
```

## ✅ Verification Checklist

- [ ] Backend running on port 3000
- [ ] Dependencies installed (`npm install`)
- [ ] API URL configured correctly
- [ ] Expo server started (`npx expo start`)
- [ ] App loaded on simulator/device
- [ ] Can register new user
- [ ] Can login
- [ ] Can logout
- [ ] Token persists after app restart

## 🎉 Success!

If you can:
1. Register a new account
2. See the home screen
3. Logout
4. Login again
5. Still be logged in after closing and reopening the app

**Congratulations!** Your mobile app is working correctly!

---

**Need Help?** Check:
- Mobile README: `apps/mobile/README.md`
- Backend README: `apps/backend/README.md`
- Setup Guide: `SETUP_GUIDE.md`
